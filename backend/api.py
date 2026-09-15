from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ece_climate_thermal_model.live_climate import get_climate_data
from backend.design_generator import generate_shelter_design


app = FastAPI(
    title="Smart Shelter API",
    version="2.0.0",
)


# -------------------------------------------------------------------
# CORS
# -------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# Request model
# -------------------------------------------------------------------

class DesignRequest(BaseModel):
    location: str
    building_type: str
    size_category: str


# -------------------------------------------------------------------
# Root endpoint
# -------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Smart Shelter API is running"
    }


# -------------------------------------------------------------------
# Climate endpoint
# -------------------------------------------------------------------

@app.get("/api/climate")
def climate(location: str):

    data = get_climate_data(location)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    return data


# -------------------------------------------------------------------
# AI shelter design endpoint
# -------------------------------------------------------------------

@app.post("/api/generate-design")
def generate_design(request: DesignRequest):

    # ---------------------------------------------------------------
    # Get live climate data
    # ---------------------------------------------------------------

    climate_data = get_climate_data(
        request.location
    )

    if not climate_data:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    # ---------------------------------------------------------------
    # Generate optimized shelter
    # ---------------------------------------------------------------

    try:

        result = generate_shelter_design(
            climate=climate_data,
            building_type=request.building_type,
            size_category=request.size_category,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    # ---------------------------------------------------------------
    # Return complete result
    # ---------------------------------------------------------------

    return {
        "location": climate_data,
        "building_type": request.building_type,
        "size_category": request.size_category,
        "design": result["best_design"],
        "recommendations": result["recommendations"],
        "area_range": result["area_range"],
    }