export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code?: string;
  timezone: string;
  country?: string;
  admin1?: string;
  admin2?: string;
}

export interface LocationSelection {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  admin1?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  weatherCode: number[];
  precipitationProbability: number[];
}

export interface DailyForecast {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  uvIndexMax: number[];
  precipitationProbability: number[];
}

export interface AirQuality {
  aqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
}

export interface WeatherData {
  city: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  airQuality?: AirQuality;
}

export interface WeatherCondition {
  label: string;
  iconName: string;
  bgClass: string;
  cardBgClass: string;
  accentColor: string;
  textColor: string;
}

export interface SearchBarProps {
  onCitySelect: (city: LocationSelection) => void;
  isLoading: boolean;
}

export interface AQIInfo {
  label: string;
  color: string;
  desc: string;
}
