from typing import Any, Dict, List

TOPICS_EN: List[Dict[str, str]] = [
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
        "source": "Central Pollution Control Board (CPCB) Standard Operating Procedures",
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
        "source": "World Health Organization (WHO) Guidelines on Ambient Particulate Matter",
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
        "source": "India Meteorological Department (IMD) & Atmospheric Boundary Layer Research",
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
        "source": "US EPA Indoor Air Division & Lancet Planetary Health",
    },
]

TOPICS_ML: List[Dict[str, str]] = [
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
        "source": "കേന്ദ്ര മലിനീകരണ നിയന്ത്രണ ബോർഡ് (CPCB)",
    },
    {
        "id": "pm25-vs-pm10",
        "title": "PM2.5-ഉം PM10-ഉം: വലിപ്പവും ആരോഗ്യ ആഘാതവും",
        "category": "ആരോഗ്യ ശാസ്ത്രം",
        "summary": "2.5 മൈക്രോണിൽ താഴെയുള്ള സൂക്ഷ്മ കണികകൾ രക്തധമനികളിലേക്ക് എങ്ങനെ പ്രവേശിക്കുന്നു?",
        "content": (
            "വായുവിലെ പൊടിപടലങ്ങളെ അവയുടെ വലിപ്പം അനുസരിച്ച് രണ്ടായി തിരിക്കുന്നു:\n\n"
            "- **PM10 (2.5 - 10 µm):** നിർമ്മാണ പൊടി, റോഡ് പൊടി എന്നിവ മൂക്കിലെ രോമങ്ങളിലും തൊണ്ടയിലും തടയപ്പെടുന്നു.\n"
            "- **PM2.5 (< 2.5 µm):** വാഹന പുകയിൽ നിന്നും മാലിന്യം കത്തിക്കുന്നതിൽ നിന്നും ഉണ്ടാകുന്ന അതിസൂക്ഷ്മ കണികകൾ ശ്വാസകോശത്തിലെ ആൽവിയോളി വഴി നേരിട്ട് രക്തത്തിൽ കലരുന്നു."
        ),
        "source": "ലോകാരോഗ്യ സംഘടന (WHO) മാർഗ്ഗനിർദ്ദേശങ്ങൾ",
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
        "source": "ഇന്ത്യൻ കാലാവസ്ഥാ വകുപ്പ് (IMD)",
    },
    {
        "id": "indoor-air-secrets",
        "title": "വീട്ടിനുള്ളിലെ അദൃശ്യ വായുമലിനീകരണം",
        "category": "ഗാർഹിക സുരക്ഷ",
        "summary": "അടുക്കള പുക, കൊതുകുതിരി, ചന്ദനത്തിരി എന്നിവ മുറിക്കുള്ളിലെ വായു എങ്ങനെ മലിനമാക്കുന്നു?",
        "content": (
            "ദിവസത്തിന്റെ 85 ശതമാനത്തിലധികം സമയം നമ്മൾ ചെലവഴിക്കുന്നത് വീട്ടിനുള്ളിലാണ്.\n\n"
            "- **പാചക പുക:** എക്സോസ്റ്റ് ഫാൻ ഇല്ലാതെ വറുക്കുമ്പോഴും താളിക്കുമ്പോഴും PM2.5 അളവ് പെട്ടെന്ന് ഉയരുന്നു.\n"
            "- **കൊതുകുതിരി:** ഒരു കൊതുകുതിരി കത്തിക്കുന്നത് 75-100 സിഗരറ്റുകൾക്ക് തുല്യമായ സൂക്ഷ്മ പുക പുറത്തുവിടുന്നു.\n"
            "- **പരിഹാരം:** അടുക്കളയിൽ ചിമ്മിനി/എക്സോസ്റ്റ് ഉപയോഗിക്കുക, ഉച്ചസമയത്ത് ജനലുകൾ തുറന്ന് വായുസഞ്ചാരം ഉറപ്പാക്കുക."
        ),
        "source": "യുഎസ് ഇപിഎ & ലാൻസെറ്റ് പ്ലാനറ്ററി ഹെൽത്ത്",
    },
]

QUIZ_QUESTIONS_EN: List[Dict[str, Any]] = [
    {
        "id": 1,
        "question": "Which particulate matter size is considered the most dangerous because it enters directly into the human bloodstream?",
        "options": [
            "PM10 (Coarse dust)",
            "PM2.5 (Fine combustion particles)",
            "Visible smoke particles",
            "Beach sand grains",
        ],
        "correct_index": 1,
        "explanation": "PM2.5 particles are under 2.5 micrometers in diameter. Their tiny size allows them to bypass nasal filtering and penetrate deep into pulmonary alveoli and the circulatory bloodstream.",
    },
    {
        "id": 2,
        "question": "Why is outdoor morning smog usually more severe than midday air pollution during winter months?",
        "options": [
            "Trees stop producing oxygen at night",
            "Thermal inversion traps pollutants under a cold surface ceiling",
            "Sunlight produces heavy dust particles",
            "Wind speeds are highest in the morning",
        ],
        "correct_index": 1,
        "explanation": "Cold overnight temperatures create a thermal inversion layer where cold air is trapped below warm air, preventing vertical dispersion until midday solar heating breaks the inversion.",
    },
    {
        "id": 3,
        "question": "What is the equivalent particulate emission of burning a single mosquito repellent coil indoors without ventilation?",
        "options": [
            "Approximately 1-2 cigarettes",
            "Roughly equal to boiling a cup of water",
            "Approximately 75 to 100 cigarettes worth of PM2.5",
            "Zero emissions",
        ],
        "correct_index": 2,
        "explanation": "Environmental health studies in the Lancet and Chest journal demonstrated that burning one slow-smoldering mosquito coil produces particulate matter equivalent to smoking up to 75-100 cigarettes.",
    },
    {
        "id": 4,
        "question": "Which mode of transportation has the lowest tailpipe greenhouse gas emissions per passenger-kilometer?",
        "options": [
            "Electric Metro Rail or Active Cycling",
            "Single-occupant SUV",
            "Diesel Two-Wheeler",
            "Shared Auto-Rickshaw",
        ],
        "correct_index": 0,
        "explanation": "Electric mass transit (Metro) and active human-powered cycling generate near-zero direct tailpipe greenhouse emissions per passenger kilometer.",
    },
]

DAILY_FACTS_EN: List[str] = [
    "According to the WHO, 9 out of 10 people worldwide breathe air containing high levels of pollutants.",
    "A mature leafy tree can absorb up to 22 kilograms of carbon dioxide and filter fine particulate matter every year.",
    "Replacing short 2-kilometer car trips with walking or cycling removes up to 70% of cold-engine start emissions.",
    "A true HEPA H13 filter captures 99.97% of airborne particles as small as 0.3 microns, including virus carriers, pollen, and winter soot.",
]

DAILY_FACTS_ML: List[str] = [
    "ലോകാരോഗ്യ സംഘടനയുടെ കണക്കനുസരിച്ച് ലോകത്തിലെ 10-ൽ 9 പേരും ഉയർന്ന അളവിൽ മലിനമായ വായുവാണ് ശ്വസിക്കുന്നത്.",
    "വളർച്ചയെത്തിയ ഒരു മരം പ്രതിവർഷം 22 കിലോഗ്രാം വരെ കാർബൺ ഡയോക്സൈഡ് ആഗിരണം ചെയ്യുന്നു.",
    "ചെറിയ ദൂര യാത്രകൾക്ക് കാറിന് പകരം നടത്തമോ സൈക്കിളോ തിരഞ്ഞെടുക്കുന്നത് കോൾഡ്-സ്റ്റാർട്ട് വാഹന പുക 70% വരെ കുറയ്ക്കുന്നു.",
    "യഥാർത്ഥ HEPA H13 ഫിൽട്ടർ 0.3 മൈക്രോൺ വരെയുള്ള 99.97% സൂക്ഷ്മ മാലിന്യങ്ങളെയും ഫിൽട്ടർ ചെയ്യുന്നു.",
]


def get_topics_by_language(lang: str) -> List[Dict[str, str]]:
    return TOPICS_ML if lang == "ml" else TOPICS_EN


def get_quiz_questions() -> List[Dict[str, Any]]:
    return QUIZ_QUESTIONS_EN


def get_daily_facts_by_language(lang: str) -> List[str]:
    return DAILY_FACTS_ML if lang == "ml" else DAILY_FACTS_EN
