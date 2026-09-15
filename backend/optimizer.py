from .materials import (
    WALL_MATERIALS,
    ROOF_MATERIALS,
    INSULATION_LEVELS,
    ORIENTATION_FACTORS,
)


def calculate_design(
    climate,
    length,
    width,
    height,
    wall,
    roof,
    insulation,
    orientation,
):
    # ------------------------------------------------------------
    # Basic geometry
    # ------------------------------------------------------------

    floor_area = length * width
    volume = length * width * height

    wall_area = (
        2 * (length * height)
        + 2 * (width * height)
    )

    roof_area = floor_area

    # ------------------------------------------------------------
    # Material properties
    # ------------------------------------------------------------

    wall_u = WALL_MATERIALS[wall]["u_value"]
    roof_u = ROOF_MATERIALS[roof]["u_value"]

    # More insulation -> lower effective U-value
    insulation_factor = 50 / insulation

    effective_wall_u = wall_u * insulation_factor
    effective_roof_u = roof_u * insulation_factor

    # ------------------------------------------------------------
    # Temperature difference
    # ------------------------------------------------------------

    indoor_temperature = 20
    outdoor_temperature = climate["temperature"]

    delta_t = abs(
        indoor_temperature - outdoor_temperature
    )

    # ------------------------------------------------------------
    # Heat loss calculations
    # ------------------------------------------------------------

    wall_heat_loss = (
        effective_wall_u
        * wall_area
        * delta_t
    )

    roof_heat_loss = (
        effective_roof_u
        * roof_area
        * delta_t
    )

    # Assume moderate floor insulation
    floor_u = 0.45 * insulation_factor

    floor_heat_loss = (
        floor_u
        * floor_area
        * delta_t
    )

    total_heat_loss_w = (
        wall_heat_loss
        + roof_heat_loss
        + floor_heat_loss
    )

    heat_loss_kw = total_heat_loss_w / 1000

    # ------------------------------------------------------------
    # Solar gain
    # ------------------------------------------------------------

    orientation_factor = ORIENTATION_FACTORS[orientation]

    solar_gain_w = (
        climate["solar_radiation"]
        * floor_area
        * orientation_factor
        * 0.30
    )

    # ------------------------------------------------------------
    # Energy estimate
    # ------------------------------------------------------------

    daily_energy_kwh = heat_loss_kw * 24

    # ------------------------------------------------------------
    # Thermal performance score
    # ------------------------------------------------------------

    thermal_score = max(
        0,
        min(
            100,
            100
            - (heat_loss_kw * 10)
            + (solar_gain_w / 1000),
        ),
    )

    # ------------------------------------------------------------
    # Heat-loss breakdown
    # ------------------------------------------------------------

    breakdown = [
        {
            "name": "Walls",
            "value": round(wall_heat_loss / 1000, 2),
        },
        {
            "name": "Roof",
            "value": round(roof_heat_loss / 1000, 2),
        },
        {
            "name": "Floor",
            "value": round(floor_heat_loss / 1000, 2),
        },
    ]

    # ------------------------------------------------------------
    # Return complete design result
    # ------------------------------------------------------------

    return {
        "wall": wall,
        "roof": roof,
        "insulation": insulation,
        "orientation": orientation,

        "floor_area": round(floor_area, 2),
        "volume": round(volume, 2),

        "heat_loss_kw": round(heat_loss_kw, 3),
        "daily_energy_kwh": round(daily_energy_kwh, 2),
        "solar_gain_w": round(solar_gain_w, 1),

        "thermal_score": round(thermal_score, 1),

        "breakdown": breakdown,
    }


def optimize_design(
    climate,
    length,
    width,
    height,
):
    results = []

    # Try every available combination
    for wall in WALL_MATERIALS:

        for roof in ROOF_MATERIALS:

            for insulation in INSULATION_LEVELS:

                for orientation in ORIENTATION_FACTORS:

                    result = calculate_design(
                        climate=climate,
                        length=length,
                        width=width,
                        height=height,
                        wall=wall,
                        roof=roof,
                        insulation=insulation,
                        orientation=orientation,
                    )

                    results.append(result)

    # Lower heat loss = better.
    # Higher thermal score breaks ties.
    results.sort(
        key=lambda x: (
            x["heat_loss_kw"],
            -x["thermal_score"],
        )
    )

    # Return Top 3
    recommendations = []

    for rank, result in enumerate(
        results[:3],
        start=1,
    ):
        result["rank"] = rank
        recommendations.append(result)

    return recommendations
 