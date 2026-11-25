from datetime import date
from typing import Any, Dict, List, Sequence
from app.models.models import FamilyMember
from app.schemas.schemas import FamilyDailyPlanResponse, FamilyPlanActivity


def _member_morning_note(age_group: str, sensitivity: str, high_smog: bool) -> str:
    if high_smog:
        if age_group in ("infant", "child"):
            return "Keep young lungs indoors during cold morning inversion; use a kid-sized KF94/N95 mask at school bus stops."
        if age_group == "senior" or sensitivity == "cardiovascular_sensitive":
            return "Postpone early morning walks until midday solar mixing; check blood pressure and stay warm indoors."
        if sensitivity == "respiratory_sensitive":
            return "Avoid cold morning smog triggers; keep prescribed bronchodilator accessible and exercise in a HEPA-filtered room."
        if sensitivity == "outdoor_athlete":
            return "Shift high-ventilation cardio indoors; aerobic hyperventilation triples alveolar PM2.5 deposition."
        return "Replace outdoor jogging/sports with 30-min indoor functional exercise in a HEPA-filtered room."

    if age_group in ("infant", "child"):
        return "Safe for supervised morning park play away from arterial bus/truck corridors."
    if sensitivity == "outdoor_athlete":
        return "Favorable dispersion window for outdoor tempo runs or cycling along green corridors."
    return "Enjoy outdoor morning walk or light sports in a nearby green park or tree-lined street."


def _member_afternoon_note(age_group: str, sensitivity: str, curr_aqi: int) -> str:
    if curr_aqi > 150:
        if sensitivity == "outdoor_worker":
            return "Wear a valve-free N95/FFP2 respirator during outdoor shifts and take 10-min clean-air hydration breaks indoors."
        if sensitivity == "student" or age_group in ("child", "teen"):
            return "Prefer metro/covered transit home from school or college; avoid lingering near idling traffic junctions."
        return "Travel via metro or air-conditioned bus; wear an N95 respirator if walking on arterial streets."
    return "Open opposing windows for 25 minutes to flush indoor CO2 and cooking vapors while convective mixing peaks."


def build_family_daily_plan(
    members: Sequence[FamilyMember],
    aqi_data: Dict[str, Any],
    city: str,
) -> FamilyDailyPlanResponse:
    """Generate personalized morning/afternoon/evening guidance grounded in live AQI and member profiles."""
    curr_aqi = int(aqi_data["current"]["aqi_in"])
    category = str(aqi_data["current"]["category_in"])
    pm25 = float(aqi_data["current"]["pm2_5"])

    activities: List[FamilyPlanActivity] = []
    profiles: List[tuple[str, str, str]] = (
        [(m.name, m.age_group, m.sensitivity_profile) for m in members]
        if members
        else [("Household", "adult", "standard")]
    )

    high_smog = curr_aqi > 150

    for name, age_group, sensitivity in profiles:
        morning_rec = _member_morning_note(age_group, sensitivity, high_smog)
        afternoon_rec = _member_afternoon_note(age_group, sensitivity, curr_aqi)

        if high_smog:
            activities.append(
                FamilyPlanActivity(
                    period="Morning (07:00 - 10:00)",
                    target_member=name,
                    recommendation=morning_rec,
                    reason=(
                        f"Morning thermal inversion traps {pm25:.1f} µg/m³ PM2.5 near ground level "
                        f"(profile: {age_group}, {sensitivity.replace('_', ' ')})."
                    ),
                    expected_benefit="Prevents airway hyper-reactivity, coughing spells, and acute vascular strain.",
                    estimated_cost="₹0 (Indoor shift)",
                    difficulty="Low",
                    environmental_impact="Reduces cold-engine tailpipe emissions when avoiding morning gym drives.",
                    source="WHO Global Air Quality Guidelines 2021",
                )
            )
            activities.append(
                FamilyPlanActivity(
                    period="Afternoon (12:00 - 15:30)",
                    target_member=name,
                    recommendation=afternoon_rec,
                    reason="Solar convection provides partial atmospheric lifting, though roadside diesel soot persists.",
                    expected_benefit="Filters up to 95% of fine combustion soot and ultrafine particulate matter.",
                    estimated_cost="₹30 - ₹50 (Reusable N95)",
                    difficulty="Low",
                    environmental_impact="Public transit reduces per-passenger tailpipe emissions by ~78%.",
                    source="Central Pollution Control Board (CPCB) Advisories",
                )
            )
            activities.append(
                FamilyPlanActivity(
                    period="Evening (18:00 - 22:00)",
                    target_member=name,
                    recommendation=(
                        "Seal bedroom windows before dusk; run HEPA H13 purifier on continuous medium mode "
                        "and avoid incense or unvented frying."
                    ),
                    reason="Radiative ground cooling drops the planetary boundary layer, causing nocturnal smog spikes.",
                    expected_benefit="Lowers indoor nighttime PM2.5 exposure toward < 15 µg/m³ for restorative sleep.",
                    estimated_cost="~₹4/day in HEPA fan electricity",
                    difficulty="Easy",
                    environmental_impact="Eliminates indoor combustion smoke and preserves thermal insulation.",
                    source="US EPA Indoor Air Quality Guidelines",
                )
            )
        else:
            activities.append(
                FamilyPlanActivity(
                    period="Morning (07:00 - 09:30)",
                    target_member=name,
                    recommendation=morning_rec,
                    reason=f"Current AQI is {curr_aqi} ({category}) with PM2.5 at {pm25:.1f} µg/m³.",
                    expected_benefit="Supports cardiovascular endurance, vitamin D synthesis, and respiratory wellness.",
                    estimated_cost="₹0",
                    difficulty="Easy",
                    environmental_impact="Active walking/play generates zero tailpipe emissions.",
                    source="WHO Physical Activity & Air Quality Directives",
                )
            )
            activities.append(
                FamilyPlanActivity(
                    period="Afternoon (11:30 - 15:00)",
                    target_member=name,
                    recommendation=afternoon_rec,
                    reason="Atmospheric boundary layer mixing is highest midday with low ambient particulate density.",
                    expected_benefit="Flushes indoor CO2 and volatile organic compounds naturally.",
                    estimated_cost="₹0",
                    difficulty="Easy",
                    environmental_impact="Zero energy consumption for natural cross-ventilation.",
                    source="ASHRAE Standard 62.1 Indoor Air Quality",
                )
            )
            activities.append(
                FamilyPlanActivity(
                    period="Evening (17:30 - 20:30)",
                    target_member=name,
                    recommendation="Combine neighborhood errands into a single walking or cycling trip instead of a car.",
                    reason="Short cold-start motor trips emit disproportionate unburned hydrocarbons and CO.",
                    expected_benefit="Saves fuel expense and reduces street-level congestion.",
                    estimated_cost="Saves ₹40 - ₹80 in fuel",
                    difficulty="Easy",
                    environmental_impact="Avoids ~0.85 kg CO2 and 0.08 g PM2.5 per 5 km roundtrip.",
                    source="ARAI Automotive Environmental Emission Study",
                )
            )

    overview = (
        f"Customized daily protection and lifestyle roadmap for {len(profiles)} household profile(s) "
        f"based on live {category} conditions (AQI {curr_aqi}, PM2.5 {pm25:.1f} µg/m³) in {city}."
    )

    return FamilyDailyPlanResponse(
        date=date.today().isoformat(),
        aqi_context=curr_aqi,
        aqi_category=category,
        activities=activities,
        overview=overview,
    )
