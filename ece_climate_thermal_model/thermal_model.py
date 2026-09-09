def calculate_heat_loss(temperature_inside, temperature_outside, U_value, area):

    heat_loss = U_value * area * (
        temperature_inside - temperature_outside
    )

    return heat_loss


def calculate_solar_heat_gain(solar_radiation, area, absorptivity=0.7):

    solar_gain = solar_radiation * area * absorptivity

    return solar_gain


def calculate_thermal_load(heat_loss, solar_gain):

    thermal_load = abs(heat_loss) + solar_gain

    return thermal_load