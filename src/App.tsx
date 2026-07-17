/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Navigation,
  X,
  MapPin,
  Clock,
  Sparkles,
  Info,
  Thermometer,
  Wind,
  Droplets,
  ChevronRight,
  Calendar,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  CloudSun,
  CloudMoon,
  CloudLightning,
  Snowflake,
  Sun,
  Moon,
} from "lucide-react";

interface GeocodingResult {
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

interface LocationSelection {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  admin1?: string;
}

interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
}

interface HourlyForecast {
  time: string[];
  temperature: number[];
  weatherCode: number[];
  precipitationProbability: number[];
}

interface DailyForecast {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  uvIndexMax: number[];
  precipitationProbability: number[];
}

interface AirQuality {
  aqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
}

interface WeatherData {
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

interface WeatherCondition {
  label: string;
  iconName: string;
  bgClass: string;
  cardBgClass: string;
  accentColor: string;
  textColor: string;
}

interface SearchBarProps {
  onCitySelect: (city: LocationSelection) => void;
  isLoading: boolean;
}

const WeatherIcon: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className = "", size = 24 }) => {
  const icons: { [key: string]: React.ComponentType<any> } = {
    Sun,
    Moon,
    Cloud,
    CloudRain,
    CloudDrizzle,
    CloudFog,
    CloudSun,
    CloudMoon,
    CloudLightning,
    Snowflake,
    Wind,
    Droplets,
    Thermometer,
    Search,
    Navigation,
    X,
    MapPin,
    ChevronRight,
    Calendar,
    Clock,
    Sparkles,
    Info,
  };

  const IconComponent = icons[name] || Cloud;
  return <IconComponent className={className} size={size} />;
};

const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect, isLoading }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
        );
        if (!response.ok) throw new Error("Geocoding failed");
        const data = await response.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error("Geocoding fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setInputError("Please enter a city, country, or region.");
      setSuggestions([]);
      return;
    }

    setInputError(null);
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const bestMatch = data.results[0];
        const selectedCity: LocationSelection = {
          name: bestMatch.name,
          lat: bestMatch.latitude,
          lon: bestMatch.longitude,
          country: bestMatch.country,
          admin1: bestMatch.admin1,
        };
        onCitySelect(selectedCity);
        setIsFocused(false);
        setQuery("");
      } else {
        setSuggestions([]);
        setGeoError("No matching city was found. Please try a nearby town or country.");
        setTimeout(() => setGeoError(null), 4000);
      }
    } catch (err) {
      setSuggestions([]);
      setGeoError("Failed to search city. Please try again.");
      setTimeout(() => setGeoError(null), 4000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setTimeout(() => setGeoError(null), 4000);
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          let cityName = "Your Location";
          let countryName = "";
          let adminArea = "";

          if (response.ok) {
            const data = await response.json();
            cityName = data.city || data.locality || data.principalSubdivision || "Current Location";
            countryName = data.countryName || "";
            adminArea = data.principalSubdivision || "";
          }

          const resolvedLoc: LocationSelection = {
            name: cityName,
            lat: latitude,
            lon: longitude,
            country: countryName,
            admin1: adminArea,
          };
          onCitySelect(resolvedLoc);
          setIsFocused(false);
        } catch (err) {
          onCitySelect({ name: "My Location", lat: latitude, lon: longitude });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Location permission denied. Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setGeoError("Request for location timed out.");
            break;
          default:
            setGeoError("An unknown error occurred getting location.");
        }
        setTimeout(() => setGeoError(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto z-50 px-2 sm:px-0" ref={searchContainerRef} id="search-bar-container">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setGeoError(null);
              setInputError(null);
              if (e.target.value.trim().length > 0) setIsFocused(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setGeoError(null);
              setInputError(null);
            }}
            placeholder="Search city, country, or region..."
            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-full py-4 pl-14 pr-12 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/40 placeholder:text-slate-400 backdrop-blur-md transition-all duration-300 shadow-xl"
            style={{ color: "#f8fafc" }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setInputError(null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-slate-700/50"
            >
              <X size={15} />
            </button>
          )}

          {inputError && (
            <p className="mt-2 text-xs text-rose-300 font-semibold">{inputError}</p>
          )}

          {(query.trim().length > 0 || isFocused) && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950/95 shadow-2xl backdrop-blur-xl text-slate-100 max-h-[320px] overflow-y-auto">
              {isSearching ? (
                <div className="p-5 text-sm text-slate-300">Searching for matching cities...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <button
                    key={`${item.latitude}-${item.longitude}`}
                    type="button"
                    onClick={() => {
                      const selected: LocationSelection = {
                        name: item.name,
                        lat: item.latitude,
                        lon: item.longitude,
                        country: item.country,
                        admin1: item.admin1,
                      };
                      onCitySelect(selected);
                      setQuery("");
                      setSuggestions([]);
                      setIsFocused(false);
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-slate-900/90 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold">{item.name}</span>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Location</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {[item.admin1, item.country].filter(Boolean).join(", ") || item.timezone}
                    </p>
                  </button>
                ))
              ) : (
                <div className="p-5 text-sm text-slate-400">No search suggestions found. Try a different spelling or nearby city.</div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleGeoLocation}
          disabled={isLocating}
          title="Use current location"
          className="p-4 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/80 active:scale-95 text-slate-300 hover:text-sky-400 transition-all shadow-xl backdrop-blur-md flex items-center justify-center disabled:opacity-50"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation size={18} className="rotate-45" />
          )}
        </button>
      </form>

      <AnimatePresence>
        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-14 bg-red-100/95 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2 mt-1 z-50"
          >
            <X size={14} />
            <span>{geoError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CurrentWeatherCard: React.FC<{
  data: WeatherData;
  condition: WeatherCondition;
  tempUnit: "C" | "F";
}> = ({ data, condition, tempUnit }) => {
  const formatTempNumber = (tempC: number) => {
    const converted = tempUnit === "C" ? tempC : (tempC * 9) / 5 + 32;
    return Math.round(converted);
  };

  const formatTemp = (tempC: number) => `${formatTempNumber(tempC)}°`;
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const aqiInfo = data.airQuality ? getAQIInfo(data.airQuality.aqi) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`transform-gpu hover:-translate-y-1 hover:shadow-[0_35px_120px_rgba(15,23,42,0.45)] transition-all duration-500 w-full mx-auto max-w-full xl:max-w-[1800px] p-5 sm:p-7 md:p-8 bg-gradient-to-br ${condition.bgClass} rounded-[42px] border-0 shadow-2xl flex flex-col md:flex-row md:items-stretch justify-between gap-5 relative overflow-hidden text-white`}
      id="current-weather-card"
    >
      <div className="absolute -top-14 -right-14 w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72 bg-white/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="flex-1 flex flex-col justify-between z-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            LIVE UPDATES
          </div>
          <h2 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
            {data.city}
            {data.country && (
              <span className="text-sky-200 opacity-80 block text-2xl sm:text-4xl font-extrabold mt-1">
                {data.country}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-sky-100/70 mt-3 flex items-center gap-1.5">
            <Clock className="text-sky-300" size={13} />
            {formattedDate} {data.admin1 ? `| ${data.admin1}` : ""}
          </p>
        </div>

<div className="mt-8 flex flex-col gap-4">
          <div className="flex items-start gap-4 md:gap-5 flex-wrap">
            <span className="text-[50px] sm:text-[62px] md:text-[72px] lg:text-[82px] xl:text-[86px] font-black leading-none tracking-tighter" id="current-temperature">
              {formatTempNumber(data.current.temperature)}
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.7rem] xl:text-[3rem] font-light mt-3 sm:mt-4 opacity-80">
              °{tempUnit}
            </span>
          </div>

          <p className="text-xl sm:text-2xl font-bold text-sky-100/90 mt-1">{condition.label}</p>
          <div className="mt-2 flex items-center gap-x-3 text-xs sm:text-sm font-semibold text-sky-200/65">
            <span>
              Feels like <strong className="font-extrabold text-white">{formatTemp(data.current.apparentTemperature)}</strong>
            </span>
            <span>•</span>
            <span>
              H: {formatTemp(data.daily.temperatureMax[0])} L: {formatTemp(data.daily.temperatureMin[0])}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-end md:items-end text-center md:text-right z-10 gap-3 min-w-[160px] sm:min-w-[180px]">
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: condition.iconName === "Sun" ? [0, 5, -5, 0] : 0,
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-linear-to-tr from-white/15 to-white/5 rounded-full shadow-[0_0_80px_rgba(255,255,255,0.15)] border border-white/20 flex items-center justify-center"
        >
          <WeatherIcon name={condition.iconName} size={76} className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]" />
        </motion.div>

        <div className="mt-2">
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase bg-black/15 px-3.5 py-1.5 rounded-full border border-white/10 inline-block text-sky-100">
            Precipitation: {data.current.precipitation} mm
          </span>
        </div>

        {aqiInfo && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-sky-100/70">Air Quality:</span>
            <span className={`text-xs px-3 py-1 rounded-full border border-green-400/20 bg-green-400/10 text-green-300 font-bold`} title={aqiInfo.desc}>
              {aqiInfo.label} (AQI {data.airQuality?.aqi})
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const HourlyForecastList: React.FC<{
  data: WeatherData;
  tempUnit: "C" | "F";
  condition: WeatherCondition;
}> = ({ data, tempUnit, condition }) => {
  const formatTemp = (tempC: number) => {
    const converted = tempUnit === "C" ? tempC : (tempC * 9) / 5 + 32;
    return `${Math.round(converted)}°`;
  };

  const now = new Date();
  const currentHourISO = now.toISOString().slice(0, 13) + ":00";
  let startIndex = data.hourly.time.findIndex((t) => t.startsWith(currentHourISO));
  if (startIndex === -1) {
    const nowEpoch = now.getTime();
    let minDiff = Infinity;
    startIndex = 0;
    data.hourly.time.forEach((t, idx) => {
      const diff = Math.abs(new Date(t).getTime() - nowEpoch);
      if (diff < minDiff) {
        minDiff = diff;
        startIndex = idx;
      }
    });
  }

  const hourlyItems = [] as Array<{
    time: string;
    temp: number;
    code: number;
    pop: number;
    condition: WeatherCondition;
  }>;

  for (let i = startIndex; i < startIndex + 24 && i < data.hourly.time.length; i++) {
    const hourDate = new Date(data.hourly.time[i]);
    const isDay = hourDate.getHours() >= 6 && hourDate.getHours() < 18;
    const itemCondition = getWeatherCondition(data.hourly.weatherCode[i], isDay);

    hourlyItems.push({
      time: data.hourly.time[i],
      temp: data.hourly.temperature[i],
      code: data.hourly.weatherCode[i],
      pop: data.hourly.precipitationProbability[i],
      condition: itemCondition,
    });
  }

  return (
    <div className="w-full p-5 rounded-4xl bg-slate-950/95 border border-slate-800/80 shadow-2xl" id="hourly-forecast-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="text-slate-400" size={18} />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-100">Hourly Forecast</h2>
            <p className="text-xs text-slate-400 font-medium">Next 24 Hours</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-400 font-bold border border-slate-700/80">
          Updated Hourly
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800 scroll-smooth snap-x snap-mandatory">
        {hourlyItems.map((item, index) => {
          const isCurrentHour = index === 0;
          return (
            <motion.div
              key={item.time}
              whileHover={{ y: -4, scale: 1.02, rotateX: 2 }}
              className={`transform-gpu flex-none min-w-[5.5rem] sm:min-w-[7rem] md:min-w-[8rem] lg:min-w-[9rem] p-4 rounded-3xl flex flex-col items-center justify-between text-center snap-start transition-all duration-300 ${
                isCurrentHour ? "bg-sky-500/20 border border-sky-500/40 text-sky-200 shadow-md" : `${condition.cardBgClass} hover:bg-slate-700/50`
              }`}
              id={`hourly-item-${index}`}
            >
              <span className={`text-xs font-semibold ${isCurrentHour ? "text-sky-300 font-bold" : "text-slate-300"}`}>
                {isCurrentHour ? "Now" : formatHourTime(item.time)}
              </span>

              <div className="my-3 p-1.5 rounded-full bg-black/10">
                <WeatherIcon name={item.condition.iconName} size={28} className="text-sky-400" />
              </div>

              <span className="text-base font-bold tracking-tight text-slate-100">{formatTemp(item.temp)}</span>

              <div className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-sky-400">
                <Droplets size={10} />
                <span>{item.pop}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const DailyForecastList: React.FC<{
  data: WeatherData;
  tempUnit: "C" | "F";
  condition: WeatherCondition;
}> = ({ data, tempUnit, condition }) => {
  const formatTemp = (tempC: number) => {
    const converted = tempUnit === "C" ? tempC : (tempC * 9) / 5 + 32;
    return `${Math.round(converted)}°`;
  };

  const weeklyMin = Math.min(...data.daily.temperatureMin);
  const weeklyMax = Math.max(...data.daily.temperatureMax);
  const weeklySpan = weeklyMax - weeklyMin;

  const dailyItems = data.daily.time.map((time, idx) => {
    const dayCondition = getWeatherCondition(data.daily.weatherCode[idx], true);
    const min = data.daily.temperatureMin[idx];
    const max = data.daily.temperatureMax[idx];
    const leftPercent = weeklySpan > 0 ? ((min - weeklyMin) / weeklySpan) * 100 : 0;
    const widthPercent = weeklySpan > 0 ? ((max - min) / weeklySpan) * 100 : 100;

    return {
      time,
      min,
      max,
      pop: data.daily.precipitationProbability[idx],
      uv: data.daily.uvIndexMax[idx],
      condition: dayCondition,
      leftPercent,
      widthPercent,
    };
  });

  return (
    <div className={`w-full p-6 rounded-4xl ${condition.cardBgClass} border border-slate-700/80 shadow-2xl flex flex-col`} id="daily-forecast-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="text-slate-400" size={18} />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-100">7-Day Forecast</h2>
            <p className="text-xs text-slate-500">Forecast for the coming week</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-400 font-bold border border-slate-700/80">
          UV 6
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {dailyItems.map((item, index) => {
          const isToday = index === 0;
          return (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -3, rotateX: 1 }}
              className="transform-gpu grid grid-cols-1 gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 md:grid-cols-[1.15fr_1fr_1fr] md:items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.35)]"
              id={`daily-item-${index}`}
            >
              <div>
                <p className={`text-sm font-bold ${isToday ? "text-sky-300" : "text-slate-200"}`}>
                  {isToday ? "Today" : formatDayName(item.time)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {new Date(item.time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-800/80">
                  <WeatherIcon name={item.condition.iconName} size={20} className="text-sky-300" />
                </div>
                <span className="text-sm font-semibold text-slate-200">{formatTemp(item.max)} / {formatTemp(item.min)}</span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <span className="text-[11px] font-semibold text-slate-400">{item.pop}%</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700/80">
                  UV {Math.round(item.uv)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const MetricsGrid: React.FC<{
  data: WeatherData;
  condition: WeatherCondition;
  windUnit: "kmh" | "mph";
}> = ({ data, condition, windUnit }) => {
  const formatWind = (speedKmh: number) => {
    const speed = windUnit === "kmh" ? speedKmh : speedKmh * 0.621371;
    const unitLabel = windUnit === "kmh" ? "km/h" : "mph";
    return `${Math.round(speed)} ${unitLabel}`;
  };

  const temp = data.current.temperature;
  const rh = data.current.relativeHumidity;
  const dewPoint = Math.round(temp - (100 - rh) / 5);

  const uvIndex = data.daily.uvIndexMax[0] || 0;
  let uvLabel = "Low";
  let uvAdvice = "No protection required.";
  let uvColor = "text-green-500 bg-green-500/10";

  if (uvIndex >= 8) {
    uvLabel = "Very High";
    uvAdvice = "Sun protection required. Avoid midday sun.";
    uvColor = "text-red-500 bg-red-500/10";
  } else if (uvIndex >= 6) {
    uvLabel = "High";
    uvAdvice = "Wear hat, sunglasses and SPF 30+.";
    uvColor = "text-orange-500 bg-orange-500/10";
  } else if (uvIndex >= 3) {
    uvLabel = "Moderate";
    uvAdvice = "Apply sunscreen if outdoors.";
    uvColor = "text-yellow-500 bg-yellow-500/10";
  }

  const cards = [
    {
      id: "metric-wind",
      title: "Wind Speed",
      value: formatWind(data.current.windSpeed),
      description: "Steady airflow velocity",
      icon: "Wind",
      accent: "sky-500",
      details: "Bearing: N/A • Local winds",
    },
    {
      id: "metric-humidity",
      title: "Humidity",
      value: `${data.current.relativeHumidity}%`,
      description: `Dew point is ${dewPoint}°C`,
      icon: "Droplets",
      accent: "cyan-500",
      details: "Relative moisture in air",
    },
    {
      id: "metric-uv",
      title: "UV Index",
      value: `${Math.round(uvIndex)}`,
      description: uvLabel,
      icon: "Sun",
      accent: "amber-500",
      details: uvAdvice,
      badge: { text: uvLabel, style: uvColor },
    },
    {
      id: "metric-precip",
      title: "Precipitation",
      value: `${data.current.precipitation} mm`,
      description: "Total precipitation today",
      icon: "CloudRain",
      accent: "blue-500",
      details: `${data.daily.precipitationProbability[0]}% chance of rain`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="metrics-grid">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ y: -3, rotateX: 1 }}
          className={`transform-gpu p-6 rounded-4xl ${condition.cardBgClass} border shadow-lg flex flex-col justify-between min-h-[12rem] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.35)]`}
          id={card.id}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</span>
            <div className="p-2 rounded-2xl bg-slate-700/30 border border-slate-600/30">
              <WeatherIcon name={card.icon} size={18} className="text-sky-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100" id={`${card.id}-val`}>
              {card.value}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 mt-1">{card.description}</span>
          </div>
          <div className="border-t border-slate-700/30 pt-2 mt-2 flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400 line-clamp-1">{card.details}</span>
            {card.badge && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${card.badge.style}`}>{card.badge.text}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const getWeatherCondition = (code: number, isDay: boolean): WeatherCondition => {
  const commonCardBg = "bg-slate-800/40 border border-slate-700/50 backdrop-blur-lg rounded-4xl text-slate-100 hover:border-sky-500/30 transition-all duration-300";

  if (!isDay) {
    switch (code) {
      case 0:
        return {
          label: "Clear Night",
          iconName: "Moon",
          bgClass: "from-[#0F172A] via-[#1E293B] to-[#334155]",
          cardBgClass: commonCardBg,
          accentColor: "sky-400",
          textColor: "text-slate-100",
        };
      case 1:
      case 2:
      case 3:
        return {
          label: "Partly Cloudy Night",
          iconName: "CloudMoon",
          bgClass: "from-[#0F172A] via-[#111827] to-[#1F2937]",
          cardBgClass: commonCardBg,
          accentColor: "blue-400",
          textColor: "text-slate-200",
        };
      case 45:
      case 48:
        return {
          label: "Foggy Night",
          iconName: "CloudFog",
          bgClass: "from-[#1E293B] via-[#334155] to-[#475569]",
          cardBgClass: commonCardBg,
          accentColor: "slate-400",
          textColor: "text-slate-300",
        };
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        return {
          label: "Rainy Night",
          iconName: "CloudRain",
          bgClass: "from-[#0F172A] via-[#1E1B4B] to-[#311042]",
          cardBgClass: commonCardBg,
          accentColor: "cyan-500",
          textColor: "text-blue-100",
        };
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return {
          label: "Snowy Night",
          iconName: "Snowflake",
          bgClass: "from-[#0F172A] via-[#1E293B] to-[#3B0764]",
          cardBgClass: commonCardBg,
          accentColor: "sky-300",
          textColor: "text-sky-100",
        };
      case 95:
      case 96:
      case 99:
        return {
          label: "Stormy Night",
          iconName: "CloudLightning",
          bgClass: "from-[#020617] via-[#0F172A] to-[#1E1B4B]",
          cardBgClass: commonCardBg,
          accentColor: "yellow-400",
          textColor: "text-slate-100",
        };
      default:
        return {
          label: "Cloudy Night",
          iconName: "CloudMoon",
          bgClass: "from-[#0F172A] via-[#1E293B] to-[#334155]",
          cardBgClass: commonCardBg,
          accentColor: "blue-400",
          textColor: "text-white",
        };
    }
  }

  switch (code) {
    case 0:
      return {
        label: "Sunny",
        iconName: "Sun",
        bgClass: "from-sky-400 via-blue-500 to-indigo-600",
        cardBgClass: commonCardBg,
        accentColor: "amber-400",
        textColor: "text-white",
      };
    case 1:
    case 2:
      return {
        label: "Partly Cloudy",
        iconName: "CloudSun",
        bgClass: "from-sky-400 via-sky-500 to-blue-600",
        cardBgClass: commonCardBg,
        accentColor: "sky-400",
        textColor: "text-white",
      };
    case 3:
      return {
        label: "Overcast",
        iconName: "Cloud",
        bgClass: "from-slate-500 via-slate-600 to-blue-700",
        cardBgClass: commonCardBg,
        accentColor: "slate-300",
        textColor: "text-white",
      };
    case 45:
    case 48:
      return {
        label: "Foggy",
        iconName: "CloudFog",
        bgClass: "from-slate-500 via-slate-600 to-slate-700",
        cardBgClass: commonCardBg,
        accentColor: "slate-300",
        textColor: "text-white",
      };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return {
        label: "Drizzle",
        iconName: "CloudDrizzle",
        bgClass: "from-sky-500 via-blue-600 to-indigo-700",
        cardBgClass: commonCardBg,
        accentColor: "cyan-300",
        textColor: "text-white",
      };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return {
        label: "Rainy",
        iconName: "CloudRain",
        bgClass: "from-blue-500 via-indigo-600 to-violet-800",
        cardBgClass: commonCardBg,
        accentColor: "sky-300",
        textColor: "text-white",
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        label: "Snowing",
        iconName: "Snowflake",
        bgClass: "from-sky-300 via-blue-500 to-indigo-600",
        cardBgClass: commonCardBg,
        accentColor: "sky-200",
        textColor: "text-white",
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm",
        iconName: "CloudLightning",
        bgClass: "from-slate-800 via-indigo-950 to-purple-950",
        cardBgClass: commonCardBg,
        accentColor: "yellow-400",
        textColor: "text-white",
      };
    default:
      return {
        label: "Clear Sky",
        iconName: "Sun",
        bgClass: "from-sky-400 via-blue-500 to-indigo-600",
        cardBgClass: commonCardBg,
        accentColor: "amber-400",
        textColor: "text-white",
      };
  }
};

const getAQIInfo = (aqi: number) => {
  if (aqi <= 50) {
    return { label: "Good", color: "text-green-500 bg-green-500/10 border-green-500/20", desc: "Air quality is satisfactory." };
  } else if (aqi <= 100) {
    return { label: "Moderate", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", desc: "Acceptable air quality." };
  } else if (aqi <= 150) {
    return { label: "Unhealthy for Sensitive Groups", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", desc: "Sensitive groups may feel effects." };
  } else if (aqi <= 200) {
    return { label: "Unhealthy", color: "text-red-500 bg-red-500/10 border-red-500/20", desc: "Everyone may begin to feel effects." };
  }
  return { label: "Very Unhealthy", color: "text-purple-500 bg-purple-500/10 border-purple-500/20", desc: "Health alert: serious effects." };
};

const formatDayName = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const formatHourTime = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
};

const DEFAULT_LOCATION: LocationSelection = {
  name: "London",
  lat: 51.5085,
  lon: -0.1257,
  country: "United Kingdom",
  admin1: "England",
};

export default function App() {
  const [activeLocation, setActiveLocation] = useState<LocationSelection>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [windUnit, setWindUnit] = useState<"kmh" | "mph">("kmh");
  const [theme, setTheme] = useState<"default" | "high-contrast">("default");

  // Load user unit and theme preferences from localStorage
  useEffect(() => {
    const savedTempUnit = localStorage.getItem("weather_temp_unit");
    const savedWindUnit = localStorage.getItem("weather_wind_unit");
    const savedTheme = localStorage.getItem("weather_theme");
    if (savedTempUnit === "C" || savedTempUnit === "F") setTempUnit(savedTempUnit);
    if (savedWindUnit === "kmh" || savedWindUnit === "mph") setWindUnit(savedWindUnit);
    if (savedTheme === "default" || savedTheme === "high-contrast") setTheme(savedTheme);
  }, []);

  const toggleTempUnit = () => {
    const next = tempUnit === "C" ? "F" : "C";
    setTempUnit(next);
    localStorage.setItem("weather_temp_unit", next);
  };

  const toggleWindUnit = () => {
    const next = windUnit === "kmh" ? "mph" : "kmh";
    setWindUnit(next);
    localStorage.setItem("weather_wind_unit", next);
  };

  const toggleTheme = () => {
    const next = theme === "default" ? "high-contrast" : "default";
    setTheme(next);
    localStorage.setItem("weather_theme", next);
  };

  // Fetch real-time weather and air quality from free Open-Meteo APIs
  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { lat, lon, name, country, admin1 } = activeLocation;

    try {
      // 1. Fetch Forecast & Current weather metrics using Open-Meteo's official params
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,precipitation_probability,weathercode,wind_speed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto&windspeed_unit=kmh`;
      
      // 2. Fetch Air Quality Index simultaneously (using US AQI standard)
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone`;

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(airQualityUrl).catch(() => null), // Allow failing gracefully if AQI server fails
      ]);

      if (!weatherRes.ok) throw new Error("Weather service returned an error status");

      const weatherJson = await weatherRes.json();
      let airQualityData = undefined;

      if (aqiRes && aqiRes.ok) {
        const aqiJson = await aqiRes.json();
        if (aqiJson.current) {
          airQualityData = {
            aqi: Math.round(aqiJson.current.us_aqi),
            pm2_5: Math.round(aqiJson.current.pm2_5),
            pm10: Math.round(aqiJson.current.pm10),
            ozone: Math.round(aqiJson.current.ozone),
          };
        }
      }

      // Use the current hour from the hourly arrays for supplemental metrics
      const currentHour = weatherJson.current_weather?.time;
      const hourIndex = weatherJson.hourly.time.findIndex((t: string) => t === currentHour);
      const currentHourlyIndex = hourIndex >= 0 ? hourIndex : 0;

      const consolidatedData: WeatherData = {
        city: name,
        country,
        admin1,
        latitude: lat,
        longitude: lon,
        current: {
          time: weatherJson.current_weather.time,
          temperature: weatherJson.current_weather.temperature,
          apparentTemperature: weatherJson.hourly.apparent_temperature[currentHourlyIndex],
          relativeHumidity: weatherJson.hourly.relativehumidity_2m[currentHourlyIndex],
          isDay: weatherJson.current_weather.is_day === 1,
          precipitation: weatherJson.hourly.precipitation[currentHourlyIndex],
          weatherCode: weatherJson.current_weather.weathercode,
          windSpeed: weatherJson.current_weather.windspeed,
        },
        hourly: {
          time: weatherJson.hourly.time,
          temperature: weatherJson.hourly.temperature_2m,
          weatherCode: weatherJson.hourly.weathercode,
          precipitationProbability: weatherJson.hourly.precipitation_probability,
        },
        daily: {
          time: weatherJson.daily.time,
          weatherCode: weatherJson.daily.weathercode,
          temperatureMax: weatherJson.daily.temperature_2m_max,
          temperatureMin: weatherJson.daily.temperature_2m_min,
          uvIndexMax: weatherJson.daily.uv_index_max,
          precipitationProbability: weatherJson.daily.precipitation_probability_max,
        },
        airQuality: airQualityData,
      };

      setWeatherData(consolidatedData);
    } catch (err: any) {
      console.error("Fetch weather metrics error:", err);
      setError("Unable to load real-time meteorological data. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  }, [activeLocation]);

  // Execute fetch loop on active location changes
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Determine current weather condition attributes to set immersive theme
  const currentCondition: WeatherCondition =
    weatherData && weatherData.current
      ? getWeatherCondition(weatherData.current.weatherCode, weatherData.current.isDay)
      : getWeatherCondition(0, true); // Fallback theme

  // Clothing / Activity suggestions based on active weather state
  const getWeatherRecommendation = () => {
    if (!weatherData) return "";
    const temp = weatherData.current.temperature;
    const code = weatherData.current.weatherCode;
    const isDay = weatherData.current.isDay;

    if (code >= 95) {
      return "Severe Thunderstorms active! Stay indoors, unplug sensitive equipment, and avoid travel until the storm clears.";
    }
    if (code >= 51 && code <= 82) {
      return "Rain showers occurring. Carry a compact umbrella, wear waterproof shoes, and check transit schedules for rain delays.";
    }
    if (code >= 71 && code <= 86) {
      return "Snow accumulation in progress. Wear insulated layers, heavy gloves, and anti-slip boots. Drive carefully.";
    }
    if (temp >= 30) {
      return "Extremely warm temperature! Wear light breathable fabrics, seek shade, and drink plentiful water to stay hydrated.";
    }
    if (temp <= 5) {
      return "Cold weather conditions. Bundle up in multiple warm layers, wear a scarf/beanie, and limit outdoor exposure.";
    }
    if (code === 0 && isDay) {
      return "Gorgeous clear sunny skies! Perfect day for outdoor walks, sports, or patio dining. Apply sunscreen.";
    }
    return "Weather is stable. Ideal for standard outdoor routines. Keep checking for hourly modifications.";
  };

  const pageBackground =
    theme === "high-contrast"
      ? "bg-black text-white high-contrast"
      : "bg-[#0F172A] text-slate-100";

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ease-in-out py-8 px-4 sm:px-6 lg:px-8 ${pageBackground}`}
      id="root-app-container"
    >
      <div className="w-full max-w-[1700px] xl:max-w-[1500px] mx-auto flex flex-col gap-6" id="dashboard-wrapper">
        
        {/* Top Header Row with settings toggles */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4" id="main-header">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-lg backdrop-blur-xl">
              <WeatherIcon name="Sun" className="text-amber-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">Atmosphere</h1>
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 mt-1">
                Real-time weather command center
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            <button
              type="button"
              onClick={toggleTempUnit}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-sky-500/40 hover:text-white"
            >
              °{tempUnit}
            </button>
            <button
              type="button"
              onClick={toggleWindUnit}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-sky-500/40 hover:text-white"
            >
              {windUnit === "kmh" ? "km/h" : "mph"}
            </button>
          </div>
        </header>

        {/* Unified Search Engine */}
        <section className="w-full max-w-6xl mx-auto flex justify-center px-2 sm:px-0" id="search-section">
          <SearchBar onCitySelect={setActiveLocation} isLoading={isLoading} />
        </section>

        {/* Primary content stage: single-page dashboard layout */}
        <main className="min-h-[70vh] flex flex-col justify-start relative" id="main-content-stage">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 gap-4"
                id="loading-spinner-wrapper"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin" />
                  <WeatherIcon name="Sun" className="absolute text-amber-400 animate-pulse" size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold tracking-wider text-slate-200">
                    Syncing Weather Data...
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Contacting global meteorological stations
                  </p>
                </div>
              </motion.div>
            )}

            {error && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto"
                id="error-display-wrapper"
              >
                <div className="p-4 rounded-4xl bg-red-950/20 text-red-400 mb-4 border border-red-900/30">
                  <WeatherIcon name="X" size={42} />
                </div>
                <h3 className="text-lg font-extrabold tracking-tight text-red-100">
                  Request Cycle Aborted
                </h3>
                <p className="text-sm text-slate-400 mt-2 font-medium">
                  {error}
                </p>
                <button
                  onClick={fetchWeather}
                  className="mt-6 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-xs shadow-lg transition-all"
                  id="retry-button"
                >
                  Force Connection Reload
                </button>
              </motion.div>
            )}

            {weatherData && !isLoading && !error && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-[2.3fr_1fr] gap-6 items-start"
                id="weather-dashboard-layout"
              >
                <div className="space-y-6 max-w-full xl:max-w-[980px]">
                  <CurrentWeatherCard data={weatherData} condition={currentCondition} tempUnit={tempUnit} />
                  <HourlyForecastList data={weatherData} tempUnit={tempUnit} condition={currentCondition} />
                  <MetricsGrid data={weatherData} condition={currentCondition} windUnit={windUnit} />
                </div>

                <div className="space-y-6">
                  <DailyForecastList data={weatherData} tempUnit={tempUnit} condition={currentCondition} />
                  <div className={`p-6 rounded-[34px] ${currentCondition.cardBgClass} border border-slate-800/70 shadow-xl`}>
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-2 rounded-full text-xs font-bold text-slate-100 mb-5">
                      <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                      Outlook Advice
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-100 mb-3">Outlook Advice</h2>
                    <p className="text-sm leading-relaxed text-slate-300 font-semibold">
                      {getWeatherRecommendation()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Elegant Minimal Footer */}
        <footer className="text-center py-8 border-t border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 mt-12" id="app-footer">
          <p>© 2026 DevRise Meteorological Network • Powered by Keyless Geocoding & Open-Meteo API</p>
        </footer>
      </div>
    </div>
  );
}
