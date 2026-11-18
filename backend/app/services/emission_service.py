from typing import Dict, Any, List

# Emission Factors (Well-to-Wheel / Direct tailpipe based on ARAI, IPCC & UK DEFRA conversion factors)
# Values per kilometer:
EMISSION_FACTORS = {
    "car_petrol": {
        "co2_kg_per_km": 0.171,
        "pm25_g_per_km": 0.015,
        "fuel_liters_per_km": 0.075, # ~13.3 km/L
        "cost_inr_per_km": 7.8,
    },
    "car_diesel": {
        "co2_kg_per_km": 0.192,
        "pm25_g_per_km": 0.045,
        "fuel_liters_per_km": 0.065, # ~15.4 km/L
        "cost_inr_per_km": 6.2,
    },
    "two_wheeler": {
        "co2_kg_per_km": 0.075,
        "pm25_g_per_km": 0.018,
        "fuel_liters_per_km": 0.025, # ~40 km/L
        "cost_inr_per_km": 2.6,
    },
    "bus": {
        "co2_kg_per_km": 0.038,
        "pm25_g_per_km": 0.004,
        "fuel_liters_per_km": 0.008,
        "cost_inr_per_km": 1.5,
    },
    "metro": {
        "co2_kg_per_km": 0.018,
        "pm25_g_per_km": 0.001,
        "fuel_liters_per_km": 0.0,
        "cost_inr_per_km": 2.0,
    },
    "bicycle": {
        "co2_kg_per_km": 0.0,
        "pm25_g_per_km": 0.0,
        "fuel_liters_per_km": 0.0,
        "cost_inr_per_km": 0.0,
    },
    "walk": {
        "co2_kg_per_km": 0.0,
        "pm25_g_per_km": 0.0,
        "fuel_liters_per_km": 0.0,
        "cost_inr_per_km": 0.0,
    }
}

# Grid electricity factor: ~0.71 kg CO2/kWh (India CEA standard average)
GRID_ELECTRICITY_CO2_PER_KWH = 0.71

# Open waste burning: ~1.2 kg CO2e and ~8.5 g PM2.5 per kg burned
WASTE_BURNING_PM25_G_PER_KG = 8.5
WASTE_BURNING_CO2_KG_PER_KG = 1.2

IMPACT_DISCLAIMER = (
    "Your estimated reduction represents emissions avoided through your recorded activities. "
    "It does not directly measure a change in neighborhood ambient air quality, which is governed by complex "
    "regional atmospheric dispersion, meteorological boundary layers, and basin-wide emissions."
)

def calculate_commute_emissions(mode: str, distance_km: float) -> Dict[str, float]:
    factors = EMISSION_FACTORS.get(mode, EMISSION_FACTORS["car_petrol"])
    return {
        "co2_kg": round(distance_km * factors["co2_kg_per_km"], 3),
        "pm25_g": round(distance_km * factors["pm25_g_per_km"], 3),
        "fuel_liters": round(distance_km * factors["fuel_liters_per_km"], 3),
        "cost_est": round(distance_km * factors["cost_inr_per_km"], 1)
    }

def generate_sustainable_routine_alternatives(
    current_mode: str, 
    daily_distance_km: float
) -> List[Dict[str, Any]]:
    curr = EMISSION_FACTORS.get(current_mode, EMISSION_FACTORS["car_petrol"])
    curr_monthly_km = daily_distance_km * 22 # 22 working days
    curr_co2 = curr_monthly_km * curr["co2_kg_per_km"]
    curr_pm25 = curr_monthly_km * curr["pm25_g_per_km"]
    curr_cost = curr_monthly_km * curr["cost_inr_per_km"]

    alternatives = []

    # Alternative 1: Public Transit (Metro / Train or Bus)
    alt_mode = "metro" if daily_distance_km > 5 else "bus"
    alt_factor = EMISSION_FACTORS[alt_mode]
    saved_co2_1 = max(0.0, curr_co2 - (curr_monthly_km * alt_factor["co2_kg_per_km"]))
    saved_pm25_1 = max(0.0, curr_pm25 - (curr_monthly_km * alt_factor["pm25_g_per_km"]))
    cost_diff_1 = (curr_monthly_km * alt_factor["cost_inr_per_km"]) - curr_cost

    alternatives.append({
        "current_habit": f"Driving individual {current_mode.replace('_', ' ')} for {daily_distance_km:.1f} km daily",
        "recommended_alternative": f"Switch to {alt_mode.capitalize()} network for daily commute",
        "cost_difference_monthly": f"Save approx ₹{abs(int(cost_diff_1)):,} / month" if cost_diff_1 < 0 else f"+₹{int(cost_diff_1)} / month",
        "emissions_avoided_kg_co2_monthly": round(saved_co2_1, 1),
        "pm25_avoided_g_monthly": round(saved_pm25_1, 1),
        "practical_difficulty": "Easy to Moderate",
        "long_term_benefit": f"Diverts ~{saved_co2_1*12:.0f} kg CO2 annually and reduces roadside particulate hotspots.",
        "calculation_assumptions": f"Based on 22 commuting days/month; {alt_mode} factor = {alt_factor['co2_kg_per_km']} kg CO2/km vs {curr['co2_kg_per_km']} kg CO2/km."
    })

    # Alternative 2: Active Transport for short trips or Carpooling
    if daily_distance_km <= 7:
        saved_co2_2 = curr_co2
        saved_pm25_2 = curr_pm25
        saved_cost_2 = curr_cost
        alternatives.append({
            "current_habit": f"Motor vehicle trip for short {daily_distance_km:.1f} km distance",
            "recommended_alternative": "Pedal bicycle or brisk walking where dedicated paths exist",
            "cost_difference_monthly": f"Save 100% fuel costs (₹{int(saved_cost_2):,} / month)",
            "emissions_avoided_kg_co2_monthly": round(saved_co2_2, 1),
            "pm25_avoided_g_monthly": round(saved_pm25_2, 1),
            "practical_difficulty": "Moderate",
            "long_term_benefit": "Zero tailpipe emissions, improved cardiovascular fitness, and zero noise pollution.",
            "calculation_assumptions": "Zero direct tailpipe emissions for human-powered mobility."
        })
    else:
        # Carpooling (sharing 3 passengers)
        saved_co2_2 = curr_co2 * 0.66
        saved_pm25_2 = curr_pm25 * 0.66
        saved_cost_2 = curr_cost * 0.60
        alternatives.append({
            "current_habit": f"Solo driving {current_mode.replace('_', ' ')}",
            "recommended_alternative": "Organize 3-person neighborhood or office carpool",
            "cost_difference_monthly": f"Save ~₹{int(saved_cost_2):,} / month (shared fuel)",
            "emissions_avoided_kg_co2_monthly": round(saved_co2_2, 1),
            "pm25_avoided_g_monthly": round(saved_pm25_2, 1),
            "practical_difficulty": "Easy",
            "long_term_benefit": "Removes 2 cars off the road per trip, significantly alleviating traffic bottleneck congestion.",
            "calculation_assumptions": "Assumes 3 riders sharing 1 vehicle, reducing personal share of emissions by 66%."
        })

    # Alternative 3: Waste and Household Combustion Elimination
    alternatives.append({
        "current_habit": "Occasional leaf/garden waste burning or non-segregated disposal",
        "recommended_alternative": "On-site composting of garden organics & municipal wet/dry segregation",
        "cost_difference_monthly": "Zero cost (saves fertilizer expense)",
        "emissions_avoided_kg_co2_monthly": 18.0,
        "pm25_avoided_g_monthly": 127.5,
        "practical_difficulty": "Easy",
        "long_term_benefit": "Eliminates toxic ground-level smoke plume containing carcinogens, PAHs, and dioxins.",
        "calculation_assumptions": "Assumes avoidance of burning ~15 kg biomass/month (factor 8.5g PM2.5/kg biomass)."
    })

    return alternatives

def run_what_if_simulation(
    participating_families: int, 
    avg_commute_km: float, 
    shift_mode: str
) -> Dict[str, Any]:
    # Shift mode analysis
    if shift_mode == "car_to_metro":
        co2_diff = EMISSION_FACTORS["car_petrol"]["co2_kg_per_km"] - EMISSION_FACTORS["metro"]["co2_kg_per_km"]
        pm_diff = EMISSION_FACTORS["car_petrol"]["pm25_g_per_km"] - EMISSION_FACTORS["metro"]["pm25_g_per_km"]
        fuel_diff = EMISSION_FACTORS["car_petrol"]["fuel_liters_per_km"]
        cost_diff = EMISSION_FACTORS["car_petrol"]["cost_inr_per_km"] - EMISSION_FACTORS["metro"]["cost_inr_per_km"]
        mode_desc = "switching from petrol cars to metro transit"
    elif shift_mode == "car_to_bus":
        co2_diff = EMISSION_FACTORS["car_petrol"]["co2_kg_per_km"] - EMISSION_FACTORS["bus"]["co2_kg_per_km"]
        pm_diff = EMISSION_FACTORS["car_petrol"]["pm25_g_per_km"] - EMISSION_FACTORS["bus"]["pm25_g_per_km"]
        fuel_diff = EMISSION_FACTORS["car_petrol"]["fuel_liters_per_km"] - EMISSION_FACTORS["bus"]["fuel_liters_per_km"]
        cost_diff = EMISSION_FACTORS["car_petrol"]["cost_inr_per_km"] - EMISSION_FACTORS["bus"]["cost_inr_per_km"]
        mode_desc = "switching from individual cars to city bus networks"
    elif shift_mode == "car_to_cycling":
        co2_diff = EMISSION_FACTORS["car_petrol"]["co2_kg_per_km"]
        pm_diff = EMISSION_FACTORS["car_petrol"]["pm25_g_per_km"]
        fuel_diff = EMISSION_FACTORS["car_petrol"]["fuel_liters_per_km"]
        cost_diff = EMISSION_FACTORS["car_petrol"]["cost_inr_per_km"]
        mode_desc = "replacing short vehicular trips with active cycling"
    elif shift_mode == "zero_waste_burning":
        # Based on household biomass waste
        daily_co2 = participating_families * (15.0 / 30.0) * WASTE_BURNING_CO2_KG_PER_KG
        annual_co2_tons = (daily_co2 * 365) / 1000.0
        annual_pm25_kg = (participating_families * (15.0 / 30.0) * WASTE_BURNING_PM25_G_PER_KG * 365) / 1000.0
        return {
            "participating_families": participating_families,
            "daily_co2_avoided_kg": round(daily_co2, 2),
            "annual_co2_avoided_tons": round(annual_co2_tons, 2),
            "annual_pm25_avoided_kg": round(annual_pm25_kg, 2),
            "annual_fuel_saved_liters": 0.0,
            "annual_community_cost_savings": round(participating_families * 1200.0, 1),
            "assumptions_explained": "Assumes each family completely eliminates open backyard/lane waste combustion (~15kg organic waste/month diverted to composting). Avoids 8.5g PM2.5 and 1.2kg CO2e per kg biomass.",
            "disclaimer": IMPACT_DISCLAIMER
        }
    else: # energy_conservation
        # 100 families reducing 3 kWh/day
        daily_kwh = participating_families * 3.0
        daily_co2 = daily_kwh * GRID_ELECTRICITY_CO2_PER_KWH
        annual_co2_tons = (daily_co2 * 365) / 1000.0
        return {
            "participating_families": participating_families,
            "daily_co2_avoided_kg": round(daily_co2, 2),
            "annual_co2_avoided_tons": round(annual_co2_tons, 2),
            "annual_pm25_avoided_kg": round(participating_families * 0.45, 2),
            "annual_fuel_saved_liters": 0.0,
            "annual_community_cost_savings": round(daily_kwh * 365 * 7.5, 1),
            "assumptions_explained": "Assumes 3 kWh saved per family daily via energy-efficient BLDC fans, LED lighting, and thermal insulation (grid factor 0.71 kg CO2/kWh; average electricity cost ₹7.5/kWh).",
            "disclaimer": IMPACT_DISCLAIMER
        }

    daily_km_total = participating_families * avg_commute_km
    working_days_year = 260

    daily_co2_kg = daily_km_total * co2_diff
    annual_co2_tons = (daily_co2_kg * working_days_year) / 1000.0
    annual_pm25_kg = (daily_km_total * pm_diff * working_days_year) / 1000.0
    annual_fuel_liters = daily_km_total * fuel_diff * working_days_year
    annual_cost_savings = daily_km_total * cost_diff * working_days_year

    return {
        "participating_families": participating_families,
        "daily_co2_avoided_kg": round(daily_co2_kg, 2),
        "annual_co2_avoided_tons": round(annual_co2_tons, 2),
        "annual_pm25_avoided_kg": round(annual_pm25_kg, 2),
        "annual_fuel_saved_liters": round(annual_fuel_liters, 1),
        "annual_community_cost_savings": round(annual_cost_savings, 1),
        "assumptions_explained": f"Assumes {participating_families} families each commuting {avg_commute_km:.1f} km over 260 working days/year {mode_desc}. Emissions calculated using standard ARAI/DEFRA factors.",
        "disclaimer": IMPACT_DISCLAIMER
    }
