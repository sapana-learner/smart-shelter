import requests


def get_location(location):

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": location + ", India",
        "format": "json",
        "limit": 1
    }

    headers = {
        "User-Agent": "ShelterProject/1.0"
    }

    response = requests.get(url, params=params, headers=headers)
    data = response.json()

    if not data:
        return None

    place = data[0]

    return {
        "name": place["display_name"],
        "latitude": float(place["lat"]),
        "longitude": float(place["lon"])
    }


def get_weather(latitude, longitude):

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
        "hourly": "shortwave_radiation",
        "daily": "sunshine_duration",
        "wind_speed_unit": "ms",
        "timezone": "auto"
    }

    response = requests.get(url, params=params)

    return response.json()


def get_climate_data(location):

    place = get_location(location)

    if not place:
        return None

    weather = get_weather(
        place["latitude"],
        place["longitude"]
    )

    current = weather["current"]

    solar = weather["hourly"]["shortwave_radiation"]

    sunshine = weather["daily"]["sunshine_duration"][0] / 3600

    return {
        "name": place["name"],
        "latitude": place["latitude"],
        "longitude": place["longitude"],
        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "wind_speed": current["wind_speed_10m"],
        "solar_radiation": solar[0],
        "sunshine_hours": round(sunshine, 2)
    }


# Test the climate data
if __name__ == "__main__":

    location = input("Enter any location: ")

    data = get_climate_data(location)

    if data:

        print("\n--- Location Found ---")
        print("Location:", data["name"])
        print("Latitude:", data["latitude"])
        print("Longitude:", data["longitude"])

        print("\n--- Climate Data ---")
        print("Temperature:", data["temperature"], "°C")
        print("Humidity:", data["humidity"], "%")
        print("Wind Speed:", data["wind_speed"], "m/s")
        print("Solar Radiation:", data["solar_radiation"], "W/m²")
        print("Sunshine Duration:", data["sunshine_hours"], "hours")

    else:

        print("\nLocation not found.")
        print("Try another location.")