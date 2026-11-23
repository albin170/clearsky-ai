from fastapi import APIRouter, Query
from app.schemas.schemas import PredictionResponse
from app.services.aqi_service import fetch_air_quality_and_weather
from app.services.prediction_service import analyze_pollution_prediction

router = APIRouter(prefix="/prediction", tags=["Smart Pollution Prediction"])

@router.get("/forecast", response_model=PredictionResponse)
async def get_pollution_prediction(
    lat: float = Query(28.6139, ge=-90.0, le=90.0, description="Latitude"),
    lon: float = Query(77.2090, ge=-180.0, le=180.0, description="Longitude"),
    city: str = Query("Delhi", description="City name")
):
    aqi_data = await fetch_air_quality_and_weather(lat, lon, city)
    curr_aqi = aqi_data["current"]["aqi_in"]
    pm25 = aqi_data["current"]["pm2_5"]
    w = aqi_data["weather"]

    prediction = analyze_pollution_prediction(
        current_aqi=curr_aqi,
        pm25=pm25,
        temp_c=w["temperature_c"],
        humidity=w["relative_humidity"],
        wind_speed=w["wind_speed_kmh"],
        hourly_forecast=aqi_data.get("hourly", [])
    )

    return prediction
