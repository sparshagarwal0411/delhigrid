export interface Ward {
  id: number;
  name: string;
  zone: string;
  population: number;
  area: number; // sq km
  pollutionScore: number;
  airQuality: number;
  waterQuality: number;
  wasteManagement: number;
  noiseLevel: number;
  trend7Days: number;
  trend30Days: number;
  sources: string[];
  coordinates: { lat: number; lng: number };
  aqi?: number; // Air Quality Index from WAQI API
  pm25?: number; // PM2.5 value in µg/m³
  lastUpdated?: string; // ISO timestamp of last update
  trafficStatus?: 'low' | 'moderate' | 'heavy' | 'severe';
}

export interface PollutionData {
  type: 'air' | 'water' | 'waste' | 'noise';
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'moderate' | 'unhealthy' | 'severe' | 'hazardous';
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: 'waste' | 'tree' | 'awareness' | 'water';
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  wardNumber: number;
  role: 'citizen' | 'admin';
  goals: Goal[];
  joinedAt: Date;
}
