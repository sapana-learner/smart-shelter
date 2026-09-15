WALL_MATERIALS = {
    "Insulated Panel": {
        "u_value": 0.30,
        "solar_absorptivity": 0.50,
    },
    "Brick with Cavity": {
        "u_value": 0.80,
        "solar_absorptivity": 0.60,
    },
    "Rammed Earth": {
        "u_value": 0.45,
        "solar_absorptivity": 0.65,
    },
    "Timber Frame": {
        "u_value": 0.40,
        "solar_absorptivity": 0.55,
    },
}

ROOF_MATERIALS = {
    "Insulated Roof": {
        "u_value": 0.25,
    },
    "Metal Sheet": {
        "u_value": 1.20,
    },
    "Flat Concrete": {
        "u_value": 1.50,
    },
}

INSULATION_LEVELS = [50, 75, 100, 125]

ORIENTATION_FACTORS = {
    "South": 0.90,
    "East": 0.70,
    "West": 0.70,
    "North": 0.40,
}