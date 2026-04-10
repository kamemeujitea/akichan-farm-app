import type { WeatherDaily, FarmAlert } from '@/types';

// 松本市内田 座標
const LAT = 36.17;
const LON = 137.94;

export interface WeatherResponse {
  daily: WeatherDaily[];
  fetchedAt: string;
  source: 'live' | 'mock';
}

// OpenWeatherMap 5日間/3時間予報を日別に集計
export async function fetchWeather(apiKey?: string): Promise<WeatherResponse> {
  if (!apiKey) return { daily: mockWeather(), fetchedAt: new Date().toISOString(), source: 'mock' };
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&lang=ja&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('weather fetch failed');
    const data = (await res.json()) as {
      list: Array<{
        dt_txt: string;
        main: { temp_min: number; temp_max: number };
        pop: number;
        wind: { speed: number };
        weather: Array<{ main: string; description: string; icon: string }>;
      }>;
    };

    const byDate: Record<string, WeatherDaily> = {};
    for (const item of data.list) {
      const date = item.dt_txt.slice(0, 10);
      const existing = byDate[date];
      if (!existing) {
        byDate[date] = {
          date,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          pop: item.pop,
          windSpeed: item.wind.speed,
          weatherMain: item.weather[0].main,
          weatherDesc: item.weather[0].description,
          icon: item.weather[0].icon,
        };
      } else {
        existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
        existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
        existing.pop = Math.max(existing.pop, item.pop);
        existing.windSpeed = Math.max(existing.windSpeed, item.wind.speed);
      }
    }
    const daily = Object.values(byDate).slice(0, 5);
    return { daily, fetchedAt: new Date().toISOString(), source: 'live' };
  } catch (e) {
    console.error(e);
    return { daily: mockWeather(), fetchedAt: new Date().toISOString(), source: 'mock' };
  }
}

function mockWeather(): WeatherDaily[] {
  const today = new Date();
  return Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      tempMin: 8 + Math.round(Math.random() * 5),
      tempMax: 18 + Math.round(Math.random() * 8),
      pop: Math.round(Math.random() * 10) / 10,
      windSpeed: 2 + Math.round(Math.random() * 6),
      weatherMain: 'Clouds',
      weatherDesc: '曇り',
      icon: '03d',
    };
  });
}

export function generateAlerts(daily: WeatherDaily[]): FarmAlert[] {
  const alerts: FarmAlert[] = [];
  if (daily.length === 0) return alerts;

  const today = daily[0];

  // 霜
  if (today.tempMin <= 5) {
    alerts.push({
      id: 'frost',
      level: 'danger',
      icon: '❄️',
      title: '霜注意',
      message: `最低気温 ${today.tempMin.toFixed(1)}℃。行灯・べたがけを確認してください。`,
    });
  }

  // 猛暑
  if (today.tempMax >= 35) {
    alerts.push({
      id: 'heat',
      level: 'danger',
      icon: '🔥',
      title: '猛暑',
      message: `最高気温 ${today.tempMax.toFixed(1)}℃。水やり必須（特にナス・トマト）。`,
    });
  }

  // 雨
  if (today.pop >= 0.6) {
    alerts.push({
      id: 'rain',
      level: 'info',
      icon: '☔',
      title: '雨予報',
      message: `降水確率 ${Math.round(today.pop * 100)}%。水やり不要。トマト雨よけ確認。`,
    });
  }

  // 乾燥（3日以上雨なし）
  const next3 = daily.slice(0, 3);
  const noRain3 = next3.every((d) => d.pop < 0.3);
  if (noRain3) {
    alerts.push({
      id: 'dry',
      level: 'warning',
      icon: '💧',
      title: '乾燥注意',
      message: '3日以上雨予報なし。ナス・オクラに水やりを。',
    });
  }

  // 強風
  if (today.windSpeed >= 10) {
    alerts.push({
      id: 'wind',
      level: 'warning',
      icon: '🌬️',
      title: '強風',
      message: `風速 ${today.windSpeed.toFixed(1)}m/s。支柱・誘引を確認してください。`,
    });
  }

  return alerts;
}
