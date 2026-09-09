
locations = {
    "Leh": {
        "temperature": -8,
        "humidity": 35,
        "solar_radiation": 620,
        "wind_speed": 7,
        "sunshine_hours": 8
    },

    "Rajasthan": {
        "temperature": 25,
        "humidity": 30,
        "solar_radiation": 700,
        "wind_speed": 5,
        "sunshine_hours": 9
    },

    "Bangalore": {
        "temperature": 24,
        "humidity": 65,
        "solar_radiation": 550,
        "wind_speed": 3,
        "sunshine_hours": 7
    }
     
}

def get_climate_data(location):
    if location in locations:
        return locations[location]
    else:
        return None