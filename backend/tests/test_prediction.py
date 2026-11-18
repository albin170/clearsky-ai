import pytest
from app.services.prediction_service import analyze_pollution_prediction

def test_pollution_prediction_windows():
    pred = analyze_pollution_prediction(
        current_aqi=180,
        pm25=75.0,
        temp_c=16.0,
        humidity=78.0,
        wind_speed=5.0,
        hourly_forecast=[]
    )
    assert pred["current_aqi"] == 180
    assert len(pred["windows"]) == 5
    assert "stagnation" in pred["weather_correlation_summary"].lower()
    assert "inversion" in pred["explanation"].lower()
    assert "disclaimer" in pred
