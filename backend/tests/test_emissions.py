import pytest
from app.services.emission_service import (
    calculate_commute_emissions,
    generate_sustainable_routine_alternatives,
    run_what_if_simulation,
    EMISSION_FACTORS
)

def test_commute_emissions_calculation():
    # 10 km petrol car
    res_petrol = calculate_commute_emissions("car_petrol", 10.0)
    assert res_petrol["co2_kg"] == 1.71
    assert res_petrol["pm25_g"] == 0.15
    assert res_petrol["cost_est"] == 78.0

    # 10 km bicycle (zero tailpipe)
    res_bike = calculate_commute_emissions("bicycle", 10.0)
    assert res_bike["co2_kg"] == 0.0
    assert res_bike["pm25_g"] == 0.0

def test_sustainable_alternatives_generation():
    alternatives = generate_sustainable_routine_alternatives("car_petrol", 15.0)
    assert len(alternatives) >= 2
    # Public transit or carpool should save CO2
    assert alternatives[0]["emissions_avoided_kg_co2_monthly"] > 0
    assert "Metro" in alternatives[0]["recommended_alternative"] or "Bus" in alternatives[0]["recommended_alternative"]

def test_what_if_simulator():
    sim = run_what_if_simulation(
        participating_families=100,
        avg_commute_km=15.0,
        shift_mode="car_to_metro"
    )
    assert sim["participating_families"] == 100
    assert sim["annual_co2_avoided_tons"] > 0
    assert sim["annual_pm25_avoided_kg"] > 0
    assert "Assumes 100 families" in sim["assumptions_explained"]
    assert "ambient air quality" in sim["disclaimer"]
