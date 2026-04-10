'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchWeather, generateAlerts } from '@/lib/weather';
import { getSettings, saveSettings, getTaskCompletions } from '@/lib/storage';
import { buildSchedule, categoryEmoji } from '@/lib/schedule';
import type { FarmAlert, WeatherDaily, ScheduleTask } from '@/types';

function weekdayStr(dateStr: string): string {
  const d = new Date(dateStr);
  return ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
}

const LEVEL_STYLE: Record<FarmAlert['level'], string> = {
  info: 'bg-sky/20 border-sky text-soil',
  warning: 'bg-sunset/20 border-sunset text-soil',
  danger: 'bg-red-200 border-red-500 text-red-900',
};

export default function WeatherPage() {
  const [daily, setDaily] = useState<WeatherDaily[]>([]);
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [source, setSource] = useState<'live' | 'mock'>('mock');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const load = async (apiKey?: string) => {
    setLoading(true);
    const res = await fetchWeather(apiKey);
    setDaily(res.daily);
    setAlerts(generateAlerts(res.daily));
    setSource(res.source);
    setLoading(false);
  };

  useEffect(() => {
    const s = getSettings();
    setApiKeyInput(s.weatherApiKey ?? '');
    load(s.weatherApiKey);
  }, []);

  const saveApiKey = () => {
    saveSettings({ weatherApiKey: apiKeyInput.trim() || undefined });
    setShowSettings(false);
    load(apiKeyInput.trim() || undefined);
  };

  // 今後1週間のタスクリマインダー
  const upcomingTasks = useMemo<ScheduleTask[]>(() => {
    const all = buildSchedule(new Date().getFullYear());
    const completed = new Set(getTaskCompletions().map((c) => c.taskId));
    const today = new Date().toISOString().slice(0, 10);
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    const limit = in7.toISOString().slice(0, 10);
    return all
      .filter((t) => !completed.has(t.id) && t.dueDate && t.dueDate >= today && t.dueDate <= limit)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  }, []);

  return (
    <div>
      <header className="px-4 pt-5 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">⛅ 天気・アラート</h1>
          <p className="text-xs text-soilLight mt-0.5">
            松本市内田 / {source === 'live' ? '実測値' : 'サンプルデータ'}
          </p>
        </div>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="text-xs bg-white border border-soil/15 rounded-md px-2 py-1"
        >
          ⚙️ 設定
        </button>
      </header>

      <div className="px-4 mt-2 space-y-4">
        {showSettings && (
          <div className="bg-white rounded-lg p-3 border border-soil/10 space-y-2">
            <div className="text-xs text-soilLight">
              OpenWeatherMap APIキー（無料枠）を入力するとリアル天気に切り替わります。
              未設定時はサンプルデータを表示します。
            </div>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="APIキー"
              className="w-full border border-soil/20 rounded px-2 py-1.5 text-sm"
            />
            <button onClick={saveApiKey} className="w-full bg-leafDark text-white rounded py-1.5 text-xs font-bold">
              保存
            </button>
          </div>
        )}

        {/* アラート */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-soilLight">アラート</div>
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`rounded-lg p-3 border-l-4 ${LEVEL_STYLE[a.level]}`}
              >
                <div className="font-bold text-sm">
                  {a.icon} {a.title}
                </div>
                <div className="text-xs mt-0.5">{a.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* 5日間予報 */}
        <div>
          <div className="text-xs font-bold text-soilLight mb-2">5日間予報</div>
          {loading ? (
            <div className="text-center text-soilLight text-xs py-4">読み込み中…</div>
          ) : (
            <div className="grid grid-cols-5 gap-1.5">
              {daily.map((d, i) => (
                <div
                  key={d.date}
                  className="bg-white rounded-lg p-2 border border-soil/10 text-center"
                >
                  <div className="text-[10px] text-soilLight">
                    {i === 0 ? '今日' : `${d.date.slice(5)}`}
                  </div>
                  <div className="text-[10px] text-soilLight">({weekdayStr(d.date)})</div>
                  <div className="text-xl my-1">
                    {d.weatherMain === 'Rain'
                      ? '🌧️'
                      : d.weatherMain === 'Clouds'
                      ? '☁️'
                      : d.weatherMain === 'Snow'
                      ? '❄️'
                      : '☀️'}
                  </div>
                  <div className="text-[10px]">
                    <span className="text-sunset">{Math.round(d.tempMax)}°</span>
                    {' / '}
                    <span className="text-sky">{Math.round(d.tempMin)}°</span>
                  </div>
                  <div className="text-[9px] text-soilLight mt-0.5">
                    ☔{Math.round(d.pop * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 週間リマインダー */}
        <div>
          <div className="text-xs font-bold text-soilLight mb-2">今週の作業リマインダー</div>
          {upcomingTasks.length === 0 ? (
            <div className="text-center text-soilLight text-xs py-4">
              直近のプリセットタスクはありません
            </div>
          ) : (
            <ul className="space-y-1.5">
              {upcomingTasks.map((t) => (
                <li
                  key={t.id}
                  className="bg-white rounded-lg p-2.5 border border-soil/10 text-sm flex items-start gap-2"
                >
                  <span className="text-lg shrink-0">
                    {t.category ? categoryEmoji[t.category] : '🌱'}
                  </span>
                  <div className="flex-1">
                    <div className="text-[11px] text-soilLight">{t.dueDate}</div>
                    <div className="text-xs">{t.title}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
