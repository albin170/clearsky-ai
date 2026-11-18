# ClearSky AI - Emission Calculation Methodology & Transparency Manifesto

## 1. Fundamental Principle

**ClearSky AI strictly adheres to the principle of scientific transparency:**
> "Estimated emissions reductions represent pollutants avoided through recorded individual and collective activities. They do not directly measure or imply a 1:1 change in ambient neighborhood AQI, which is dictated by basin-wide meteorology, boundary layer dynamics, and regional emission fluxes."

---

## 2. Vehicle & Transit Emission Factors

Emission factors are derived from standardized well-to-wheel and tailpipe benchmarking studies conducted by the **Automotive Research Association of India (ARAI)**, the **Intergovernmental Panel on Climate Change (IPCC)**, and the **UK Department for Environment, Food & Rural Affairs (DEFRA)**.

| Transport Mode | $CO_2$ Factor (kg / passenger-km) | $PM_{2.5}$ Factor (g / passenger-km) | Fuel Factor (liters / km) | Baseline Cost ($₹$ / km) |
|---|---|---|---|---|
| **Petrol Car (Average 1.2L-1.5L)** | 0.171 | 0.015 | 0.075 (~13.3 km/L) | ₹7.80 |
| **Diesel Car (Average 1.5L)** | 0.192 | 0.045 | 0.065 (~15.4 km/L) | ₹6.20 |
| **Two-Wheeler (100cc-150cc Scooter/Bike)** | 0.075 | 0.018 | 0.025 (~40.0 km/L) | ₹2.60 |
| **City Transit Bus (CNG / Clean Diesel)** | 0.038 | 0.004 | 0.008 per passenger | ₹1.50 |
| **Electric Metro Rail / Suburban Train** | 0.018 | 0.001 | 0.000 | ₹2.00 |
| **Bicycle / Human-Powered Walking** | 0.000 | 0.000 | 0.000 | ₹0.00 |

---

## 3. Waste Combustion Avoidance Factors

Open burning of municipal solid waste and garden biomass releases disproportionately large quantities of particulate matter directly at ground level in close proximity to residences:
- **Biomass / Garden Waste $PM_{2.5}$ Emission Factor:** $\approx 8.5\text{ g } PM_{2.5} \text{ per kg burned}$
- **Biomass $CO_2$ Equivalent Emission Factor:** $\approx 1.2\text{ kg } CO_2e \text{ per kg burned}$
- **Composting Alternative:** Composting eliminates toxic smoke plumes containing polycyclic aromatic hydrocarbons (PAHs), dioxins, and elemental carbon.

---

## 4. Household Grid Electricity Conservation

- **Grid Electricity Baseline (India CEA Standard):** $0.71\text{ kg } CO_2 \text{ per kWh}$
- **Calculated Cost Baseline:** ₹7.50 per kWh
- Energy conservation activities (switching to BLDC ceiling fans, inverter appliances, and turning off phantom loads) compute avoided emissions using direct power grid factors.

---

## 5. What-If Simulation Mathematical Model

For $N$ participating families commuting an average distance $D$ (in kilometers) over $W$ working days per year ($W = 260$):

$$\Delta \text{Annual } CO_2 \text{ (Metric Tons)} = \frac{N \times D \times (\text{Factor}_{\text{current}} - \text{Factor}_{\text{target}}) \times W}{1000}$$

$$\Delta \text{Annual } PM_{2.5} \text{ (kg)} = \frac{N \times D \times (\text{Factor}_{\text{current}} - \text{Factor}_{\text{target}}) \times W}{1000}$$

$$\Delta \text{Annual Cost Savings (INR)} = N \times D \times (\text{Cost}_{\text{current}} - \text{Cost}_{\text{target}}) \times W$$
