export interface CityHub {
  name: string;
  lat: number;
  lon: number;
}

export const MONITORING_CITIES: readonly CityHub[] = [
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Kochi', lat: 9.9312, lon: 76.2673 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
];
