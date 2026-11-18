from fastapi import APIRouter, Query
from typing import List, Dict, Any

router = APIRouter(prefix="/education", tags=["Educational Environmental Intelligence"])

TOPICS_EN = [
    {
        "id": "understanding-aqi",
        "title": "Demystifying AQI: How is it Really Calculated?",
        "category": "Fundamentals",
        "summary": "Learn the vital differences between Indian CPCB NAQI and US EPA AQI, and why raw PM2.5 matters more than a single index number.",
        "content": (
            "The Air Quality Index (AQI) converts complex pollutant concentrations into an easily understandable 0 to 500 scale.\n\n"
            "**Key Differences:**\n"
            "- **Indian National AQI (CPCB):** Tracks 8 key pollutants: PM2.5, PM10, NO2, SO2, CO, O3, NH3, and Lead. The overall AQI is the sub-index of the worst-performing pollutant (the dominant pollutant).\n"
            "- **US EPA AQI:** Has different concentration thresholds. For example, a PM2.5 concentration of 60 µg/m³ is considered 'Satisfactory' in Indian NAQI (score 100), but qualifies as 'Unhealthy for Sensitive Groups' in the US system.\n\n"
            "**Crucial Takeaway:** Never compare numbers across different countries without checking the underlying standard!"
        ),
        "source": "Central Pollution Control Board (CPCB) Standard Operating Procedures"
    },
    {
        "id": "pm25-vs-pm10",
        "title": "PM2.5 vs PM10: Size Dictates Health Impact",
        "category": "Health Science",
        "summary": "Why microscopic particles under 2.5 microns can enter your bloodstream, while PM10 gets trapped in the upper throat.",
        "content": (
            "Particulate Matter (PM) is classified strictly by aerodynamic diameter:\n\n"
            "- **PM10 (Coarse Particles, 2.5 to 10 µm):** Includes construction dust, pollen, road dust, and fly ash. These particles are largely filtered by nasal hairs and mucus membranes in the upper respiratory tract, causing coughing, sneezing, and eye irritation.\n\n"
            "- **PM2.5 (Fine Particles, < 2.5 µm):** 30 times thinner than a human hair! Originates primarily from vehicle combustion, biomass burning, and industrial emissions. Because of their microscopic size, PM2.5 particles bypass upper airway defenses, penetrating deep into lung alveoli and diffusing directly into the bloodstream, triggering systemic vascular inflammation and cardiovascular stress."
        ),
        "source": "World Health Organization (WHO) Guidelines on Ambient Particulate Matter"
    },
    {
        "id": "winter-smog-inversion",
        "title": "The Physics of Winter Smog: Temperature Inversions",
        "category": "Atmospheric Physics",
        "summary": "Why does air pollution suddenly skyrocket every winter even when local emissions remain roughly the same?",
        "content": (
            "During normal summer or windy days, warm air near the ground naturally rises, carrying smoke and vehicle emissions upward into the upper troposphere where they disperse safely.\n\n"
            "**The Winter Inversion Trap:**\n"
            "1. On cold winter nights, the ground loses radiant heat rapidly, cooling the ground-level air.\n"
            "2. A warmer layer of air forms directly above this chilled layer, acting like a giant atmospheric lid.\n"
            "3. Combined with calm winter wind speeds (< 5 km/h), all local emissions—exhaust from vehicles, brick kilns, construction dust, and biomass cooking—get physically trapped within a shallow 100-meter ceiling right where citizens breathe.\n\n"
            "This phenomenon is called **thermal inversion**, and it explains why morning and late evening air quality is drastically worse than midday."
        ),
        "source": "India Meteorological Department (IMD) & Atmospheric Boundary Layer Research"
    },
    {
        "id": "indoor-air-secrets",
        "title": "The Hidden Dangers of Indoor Air Pollution",
        "category": "Household Protection",
        "summary": "Indoor air can sometimes be 3 to 5 times more toxic than outdoor air due to unventilated cooking, incense, and VOCs.",
        "content": (
            "Most people spend 85-90% of their day indoors, believing they are completely safe from outdoor smog.\n\n"
            "**Key Indoor Emission Culprits:**\n"
            "- **Cooking Tadka / Frying:** Generates intense spikes of ultrafine particles (> 300 µg/m³) in minutes.\n"
            "- **Mosquito Coils & Incense Sticks (Agarbatti):** Burning one mosquito coil releases fine particulates equivalent to smoking 75-100 cigarettes!\n"
            "- **Paints, Cleaners & Scented Sprays:** Release volatile organic compounds (VOCs) that irritate mucous membranes.\n\n"
            "**The Remedy:** Always run kitchen exhaust hoods, use HEPA H13 purifiers in sealed sleeping areas, and ventilate during low-pollution midday hours."
        ),
        "source": "US EPA Indoor Air Division & Lancet Planetary Health"
    }
]

TOPICS_ML = [
    {
        "id": "understanding-aqi",
        "title": "എന്താണ് എക്യുഐ (AQI)? എങ്ങനെയാണ് കണക്കാക്കുന്നത്?",
        "category": "അടിസ്ഥാന വിവരങ്ങൾ",
        "summary": "വായുഗുണനിലവാര സൂചികയുടെ (AQI) പ്രാധാന്യവും കണക്കുകൂട്ടുന്ന രീതികളും മനസ്സിലാക്കാം.",
        "content": (
            "വിവിധ മലിനീകരണ വാതകങ്ങളുടെ അളവ് ലളിതമായ 0 മുതൽ 500 വരെയുള്ള ഒരു സംഖ്യയായി മാറ്റുന്നതിനെയാണ് എയർ ക്വാളിറ്റി ഇൻഡക്സ് (AQI) എന്ന് വിളിക്കുന്നത്.\n\n"
            "- **0-50 (നല്ലത് - Good):** ആരോഗ്യത്തിന് യാതൊരു ദോഷവുമില്ലാത്ത ശുദ്ധവായു.\n"
            "- **51-100 (തൃപ്തികരം - Satisfactory):** നേരിയ അസ്വസ്ഥത ഉണ്ടാകാം.\n"
            "- **101-200 (മിതമായത് - Moderate):** ആസ്ത്മയുള്ളവർക്കും കുട്ടികൾക്കും ബുദ്ധിമുട്ടുണ്ടാക്കാം.\n"
            "- **201-300 (മോശം - Poor):** കൂടുതൽ സമയം പുറത്തിരുന്നാൽ ശ്വാസതടസ്സം ഉണ്ടാകാം.\n"
            "- **301-400 (വളരെ മോശം - Very Poor):** ശ്വാസകോശ രോഗങ്ങൾക്ക് കാരണമാകാം.\n"
            "- **401-500 (ഗുരുതരം - Severe):** ആരോഗ്യവാന്മാരായ ആളുകൾക്കും അപകടകരം."
        ),
        "source": "കേന്ദ്ര മലിനീകരണ നിയന്ത്രണ ബോർഡ് (CPCB)"
    },
    {
        "id": "winter-smog-inversion",
        "title": "ശൈത്യകാല പുകമഞ്ഞും അന്തരീക്ഷ ഇൻവേർഷനും",
        "category": "പാരിസ്ഥിതിക ശാസ്ത്രം",
        "summary": "ശൈത്യകാലത്ത് വായുമലിനീകരണം പെട്ടെന്ന് കൂടുന്നത് എന്തുകൊണ്ട്?",
        "content": (
            "ശൈത്യകാലത്ത് ഭൂമിയിലെ തണുത്ത വായുവിനു മുകളിലായി ചൂടുള്ള വായുവിന്റെ ഒരു പാളി രൂപപ്പെടുന്നു (Thermal Inversion). ഇത് വാഹനങ്ങളിൽ നിന്നും ഫാക്ടറികളിൽ നിന്നുമുള്ള പുക അന്തരീക്ഷത്തിലേക്ക് ഉയർന്നുപോകാൻ അനുവദിക്കാതെ ഭൂമിക്ക് തൊട്ടുമുകളിൽ തടഞ്ഞുനിർത്തുന്നു.\n\n"
            "ഇതുകൊണ്ടാണ് അതിരാവിലെയും രാത്രിയും വായുമലിനീകരണം വളരെ കൂടുതലായി അനുഭവപ്പെടുന്നത്."
        ),
        "source": "ഇന്ത്യൻ കാലാവസ്ഥാ വകുപ്പ് (IMD)"
    }
]

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "Which particulate matter size is considered the most dangerous because it enters directly into the human bloodstream?",
        "options": [
            "PM10 (Coarse dust)",
            "PM2.5 (Fine combustion particles)",
            "Visible smoke particles",
            "Beach sand grains"
        ],
        "correct_index": 1,
        "explanation": "PM2.5 particles are under 2.5 micrometers in diameter. Their tiny size allows them to bypass nasal filtering and penetrate deep into pulmonary alveoli and the circulatory bloodstream."
    },
    {
        "id": 2,
        "question": "Why is outdoor morning smog usually more severe than midday air pollution during winter months?",
        "options": [
            "Trees stop producing oxygen at night",
            "Thermal inversion traps pollutants under a cold surface ceiling",
            "Sunlight produces heavy dust particles",
            "Wind speeds are highest in the morning"
        ],
        "correct_index": 1,
        "explanation": "Cold overnight temperatures create a thermal inversion layer where cold air is trapped below warm air, preventing vertical dispersion until midday solar heating breaks the inversion."
    },
    {
        "id": 3,
        "question": "What is the equivalent particulate emission of burning a single mosquito repellent coil indoors without ventilation?",
        "options": [
            "Approximately 1-2 cigarettes",
            "Roughly equal to boiling a cup of water",
            "Approximately 75 to 100 cigarettes worth of PM2.5",
            "Zero emissions"
        ],
        "correct_index": 2,
        "explanation": "Environmental health studies in the Lancet and Chest journal demonstrated that burning one slow-smoldering mosquito coil produces particulate matter equivalent to smoking up to 75-100 cigarettes."
    },
    {
        "id": 4,
        "question": "Which mode of transportation has the lowest tailpipe greenhouse gas emissions per passenger-kilometer?",
        "options": [
            "Electric Metro Rail or Active Cycling",
            "Single-occupant SUV",
            "Diesel Two-Wheeler",
            "Shared Auto-Rickshaw"
        ],
        "correct_index": 0,
        "explanation": "Electric mass transit (Metro) and active human-powered cycling generate near-zero direct tailpipe greenhouse emissions per passenger kilometer."
    }
]

DAILY_FACTS = [
    "According to the WHO, 9 out of 10 people worldwide breathe air containing high levels of pollutants.",
    "A mature leafy tree can absorb up to 22 kilograms of carbon dioxide and filter fine particulate matter every year.",
    "Replacing short 2-kilometer car trips with walking or cycling removes up to 70% of cold-engine start emissions.",
    "A true HEPA H13 filter captures 99.97% of airborne particles as small as 0.3 microns, including virus carriers, pollen, and winter soot."
]

@router.get("/topics")
async def get_educational_topics(lang: str = Query("en")):
    if lang == "ml":
        return TOPICS_ML
    return TOPICS_EN

@router.get("/quiz")
async def get_quiz():
    return QUIZ_QUESTIONS

@router.get("/daily-facts")
async def get_daily_facts():
    return DAILY_FACTS
