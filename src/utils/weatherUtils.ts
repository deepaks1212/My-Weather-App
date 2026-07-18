import { WeatherCondition, AQIInfo } from '../types';

export const getWeatherCondition = (code: number, isDay: boolean): WeatherCondition => {
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

export const getAQIInfo = (aqi: number): AQIInfo => {
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

export const formatDayName = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export const formatHourTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
};
