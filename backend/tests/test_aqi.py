import pytest
from app.services.aqi_service import (
    calculate_sub_index,
    get_indian_aqi_category,
    get_us_aqi_category,
    degrees_to_cardinal,
    weather_code_to_desc
)

def test_pm25_sub_index_calculation():
    # PM2.5 = 20 µg/m3 -> Good (0-50 range, approx 33)
    idx_good = calculate_sub_index(20.0, "pm2_5")
    assert 0 <= idx_good <= 50

    # PM2.5 = 50 µg/m3 -> Satisfactory (51-100 range)
    idx_sat = calculate_sub_index(50.0, "pm2_5")
    assert 51 <= idx_sat <= 100

    # PM2.5 = 110 µg/m3 -> Poor (201-300 range)
    idx_poor = calculate_sub_index(110.0, "pm2_5")
    assert 201 <= idx_poor <= 300

    # PM2.5 = 300 µg/m3 -> Severe (401-500 range)
    idx_sev = calculate_sub_index(300.0, "pm2_5")
    assert 401 <= idx_sev <= 500

def test_pm10_sub_index_calculation():
    # PM10 = 40 µg/m3 -> Good (0-50)
    idx_good = calculate_sub_index(40.0, "pm10")
    assert 0 <= idx_good <= 50

    # PM10 = 200 µg/m3 -> Moderate (101-200)
    idx_mod = calculate_sub_index(200.0, "pm10")
    assert 101 <= idx_mod <= 200

def test_indian_aqi_categories():
    cat, col, _ = get_indian_aqi_category(35)
    assert cat == "Good"
    assert col == "#10b981"

    cat, col, _ = get_indian_aqi_category(85)
    assert cat == "Satisfactory"

    cat, col, _ = get_indian_aqi_category(165)
    assert cat == "Moderate"

    cat, col, _ = get_indian_aqi_category(245)
    assert cat == "Poor"

    cat, col, _ = get_indian_aqi_category(350)
    assert cat == "Very Poor"

    cat, col, _ = get_indian_aqi_category(450)
    assert cat == "Severe"

def test_us_aqi_categories():
    cat, col = get_us_aqi_category(40)
    assert cat == "Good"

    cat, col = get_us_aqi_category(125)
    assert cat == "Unhealthy for Sensitive Groups"

    cat, col = get_us_aqi_category(350)
    assert cat == "Hazardous"

def test_wind_and_weather_helpers():
    assert degrees_to_cardinal(0) == "N"
    assert degrees_to_cardinal(90) == "E"
    assert degrees_to_cardinal(180) == "S"
    assert degrees_to_cardinal(270) == "W"

    assert "Clear" in weather_code_to_desc(0)
    assert "Fog" in weather_code_to_desc(45)
