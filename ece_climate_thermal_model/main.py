from live_climate import get_climate_data
from thermal_model import calculate_heat_loss, calculate_solar_heat_gain


# Ask for location
location = input("Enter any location: ")

# Get real climate data
data = get_climate_data(location)


if data:

    print("\n--- LOCATION ---")
    print("Location:", data["name"])
    print("Latitude:", data["latitude"])
    print("Longitude:", data["longitude"])

    print("\n--- ENVIRONMENTAL DATA ---")
    print("Outside Temperature:", data["temperature"], "°C")
    print("Humidity:", data["humidity"], "%")
    print("Wind Speed:", data["wind_speed"], "m/s")
    print("Solar Radiation:", data["solar_radiation"], "W/m²")
    print("Sunshine Duration:", data["sunshine_hours"], "hours")


    # Shelter parameters
    temperature_inside = 24
    area = 20


    # Different shelter designs
    designs = {
        "Concrete": 1.50,
        "Brick": 0.80,
        "Insulated Panel": 0.30,
        "Earth/Mud": 0.45
    }


    print("\n--- SHELTER DESIGN COMPARISON ---")

    best_design = None
    lowest_load = float("inf")


    for design, U_value in designs.items():

        heat_loss = calculate_heat_loss(
            temperature_inside,
            data["temperature"],
            U_value,
            area
        )

        solar_gain = calculate_solar_heat_gain(
            data["solar_radiation"],
            area
        )

        thermal_load = abs(heat_loss) + solar_gain


        print("\nDesign:", design)
        print("U-value:", U_value, "W/m²K")
        print("Heat Loss:", round(heat_loss, 2), "W")
        print("Solar Heat Gain:", round(solar_gain, 2), "W")
        print("Thermal Load:", round(thermal_load, 2), "W")


        # Find best design
        if thermal_load < lowest_load:

            lowest_load = thermal_load
            best_design = design


    print("\n==============================")
    print("🏆 RECOMMENDED SHELTER")
    print("==============================")

    print("Best Design:", best_design)
    print("Lowest Thermal Load:", round(lowest_load, 2), "W")


else:

    print("\nLocation not found.")