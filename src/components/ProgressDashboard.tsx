'use client';

import { useState, useEffect, useCallback } from 'react';
import { cropStepsByBed, stepMeta, type CropStep } from '@/lib/cropSteps';
import { getStepCompletions, toggleStepCompletion, syncAllBedStatuses, type StepCompletion } from '@/lib/storage';
import { beds } from '@/lib/farmData';

// --------------------------------------------------
// Month string parser
// --------------------------------------------------

function parseMonthString(monthStr: string, baseYear: number): Date {
  const isNext = monthStr.includes('翌');
  const cleaned = monthStr.replace('翌', '');

  // "X-Y月" pattern -> use X月15日
  const rangeMatch = cleaned.match(/(\d{1,2})-(\d{1,2})月/);
  if (rangeMatch) {
    const m = parseInt(rangeMatch[1], 10);
    const y = isNext ? baseYear + 1 : baseYear;
    return new Date(y, m - 1, 15);
  }

  // "X月上旬/中旬/下旬/〜" or just "X月"
  const monthMatch = cleaned.match(/(\d{1,2})月/);
  if (!monthMatch) return new Date(baseYear, 11, 31); // fallback end of year

  const m = parseInt(monthMatch[1], 10);
  const y = isNext ? baseYear + 1 : baseYear;

  if (cleaned.includes('上旬')) return new Date(y, m - 1, 5);
  if (cleaned.includes('中旬')) return new Date(y, m - 1, 15);
  if (cleaned.includes('下旬')) return new Date(y, m - 1, 25);
  // "X月〜" or just "X月"
  return new Date(y, m - 1, 15);
}

// --------------------------------------------------
// Types for internal use
// --------------------------------------------------

interface TaskItem {
  bedId: number;
  bedLabel: string;
  bedEmoji: string;
  stepIndex: number;
  step: CropStep;
  dueDate: Date;
  key: string; // "bed-{id}-{stepIndex}"
  completed: boolean;
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getBedEmoji(bedId: number): string {
  const bed = beds.find((b) => b.id === bedId);
  if (!bed) return '🌱';
  if (bed.main) return bed.main.emoji ?? '🌱';
  if (bed.north) return bed.north.emoji ?? '🌱';
  return '🌱';
}

function getBedLabel(bedId: number): string {
  const bed = beds.find((b) => b.id === bedId);
  return bed?.label ?? `${bedId}`;
}

function buildAllTasks(completions: Record<string, StepCompletion>, year: number): TaskItem[] {
  const tasks: TaskItem[] = [];
  for (const [bedIdStr, steps] of Object.entries(cropStepsByBed)) {
    const bedId = Number(bedIdStr);
    const bedLabel = getBedLabel(bedId);
    const bedEmoji = getBedEmoji(bedId);
    steps.forEach((step, idx) => {
      const key = `bed-${bedId}-${idx}`;
      tasks.push({
        bedId,
        bedLabel,
        bedEmoji,
        stepIndex: idx,
        step,
        dueDate: parseMonthString(step.month, year),
        key,
        completed: !!completions[key],
      });
    });
  }
  return tasks;
}

function daysDiff(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getWeekday(d: Date): string {
  return ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
}

// --------------------------------------------------
// Seasonal calendar milestones
// --------------------------------------------------

const MILESTONES = [
  { month: 4, label: '土づくり', emoji: '🪨' },
  { month: 5, label: '植え付け', emoji: '🌱' },
  { month: 6, label: '管理期', emoji: '✂️' },
  { month: 7, label: '収穫開始', emoji: '🧺' },
  { month: 8, label: '収穫最盛', emoji: '🌾' },
  { month: 9, label: '秋準備', emoji: '🍂' },
  { month: 10, label: '秋冬転用', emoji: '🔄' },
  { month: 11, label: '越冬管理', emoji: '❄️' },
];

// --------------------------------------------------
// Main component
// --------------------------------------------------

export default function ProgressDashboard() {
  const [completions, setCompletions] = useState<Record<string, StepCompletion>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getStepCompletions().then((c) => {
      setCompletions(c);
      setMounted(true);
    });
  }, []);

  const handleToggle = useCallback(async (key: string) => {
    await toggleStepCompletion(key);
    await syncAllBedStatuses();
    const updated = await getStepCompletions();
    setCompletions(updated);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-[#6B4F2A]">読み込み中...</span>
      </div>
    );
  }

  const now = new Date();
  const year = now.getFullYear();
  const allTasks = buildAllTasks(completions, year);

  // --- Alert section ---
  const overdue = allTasks
    .filter((t) => !t.completed && t.dueDate < now)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const next7 = new Date(now);
  next7.setDate(next7.getDate() + 7);
  const upcoming = allTasks
    .filter((t) => !t.completed && t.dueDate >= now && t.dueDate <= next7)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const endOfMonth = new Date(year, now.getMonth() + 1, 0);
  const thisMonth = allTasks
    .filter((t) => !t.completed && t.dueDate > next7 && t.dueDate <= endOfMonth)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // --- This week section ---
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  // Include overdue + this week incomplete tasks
  const weekTasks = allTasks
    .filter((t) => !t.completed && t.dueDate <= endOfWeek)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // Group by day
  const weekByDay: Record<string, TaskItem[]> = {};
  for (const t of weekTasks) {
    const key = t.dueDate < startOfWeek ? '期限超過' : `${t.dueDate.getMonth() + 1}/${t.dueDate.getDate()}(${getWeekday(t.dueDate)})`;
    if (!weekByDay[key]) weekByDay[key] = [];
    weekByDay[key].push(t);
  }

  // --- Bed progress ---
  const bedIds = Object.keys(cropStepsByBed).map(Number).sort((a, b) => a - b);

  // --- Season calendar ---
  const currentMonth = now.getMonth() + 1; // 1-12

  return (
    <div className="space-y-4">
      {/* ========== Alerts ========== */}
      <section>
        <h2 className="text-base font-bold text-[#3B2B12] mb-2">🚨 アラート（期限超過・直近）</h2>

        {overdue.length === 0 && upcoming.length === 0 && thisMonth.length === 0 && (
          <p className="text-sm text-[#6B4F2A] bg-white/60 rounded-lg px-3 py-3">
            未完了のアラートはありません 🎉
          </p>
        )}

        {overdue.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {overdue.map((t) => {
              const days = daysDiff(now, t.dueDate);
              return (
                <button
                  key={t.key}
                  onClick={() => handleToggle(t.key)}
                  className="w-full flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-left active:bg-red-100 transition-colors min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    checked={t.completed}
                    readOnly
                    className="w-7 h-7 flex-shrink-0 accent-[#6B8E23] pointer-events-none"
                  />
                  <span className="text-sm">{t.bedLabel}</span>
                  <span className="text-sm">{stepMeta[t.step.category]?.emoji}</span>
                  <span className="flex-1 text-sm text-[#3B2B12] truncate">{t.step.title}</span>
                  <span className="text-xs text-red-600 font-bold whitespace-nowrap">
                    {formatDate(t.dueDate)} ({days}日超過)
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {upcoming.map((t) => {
              const days = daysDiff(t.dueDate, now);
              return (
                <button
                  key={t.key}
                  onClick={() => handleToggle(t.key)}
                  className="w-full flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 text-left active:bg-yellow-100 transition-colors min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    checked={t.completed}
                    readOnly
                    className="w-7 h-7 flex-shrink-0 accent-[#6B8E23] pointer-events-none"
                  />
                  <span className="text-sm">{t.bedLabel}</span>
                  <span className="text-sm">{stepMeta[t.step.category]?.emoji}</span>
                  <span className="flex-1 text-sm text-[#3B2B12] truncate">{t.step.title}</span>
                  <span className="text-xs text-yellow-700 font-bold whitespace-nowrap">
                    {formatDate(t.dueDate)} (あと{days}日)
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {thisMonth.length > 0 && (
          <div className="space-y-1.5">
            {thisMonth.map((t) => {
              const days = daysDiff(t.dueDate, now);
              return (
                <button
                  key={t.key}
                  onClick={() => handleToggle(t.key)}
                  className="w-full flex items-center gap-2 bg-white/70 border border-[#e8d8a0] rounded-lg px-3 py-2.5 text-left active:bg-white/90 transition-colors min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    checked={t.completed}
                    readOnly
                    className="w-7 h-7 flex-shrink-0 accent-[#6B8E23] pointer-events-none"
                  />
                  <span className="text-sm">{t.bedLabel}</span>
                  <span className="text-sm">{stepMeta[t.step.category]?.emoji}</span>
                  <span className="flex-1 text-sm text-[#3B2B12] truncate">{t.step.title}</span>
                  <span className="text-xs text-[#6B4F2A] whitespace-nowrap">
                    {formatDate(t.dueDate)} (あと{days}日)
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ========== This Week ========== */}
      <section>
        <h2 className="text-base font-bold text-[#3B2B12] mb-2">📋 今週のやること</h2>

        {Object.keys(weekByDay).length === 0 && (
          <p className="text-sm text-[#6B4F2A] bg-white/60 rounded-lg px-3 py-3">
            今週のタスクはすべて完了です 🎉
          </p>
        )}

        {Object.entries(weekByDay).map(([dayLabel, tasks]) => (
          <div key={dayLabel} className="mb-2">
            <div className="text-xs font-bold text-[#6B4F2A] mb-1 pl-1">
              {dayLabel === '期限超過' ? '🔴 期限超過' : `📅 ${dayLabel}`}
            </div>
            <div className="space-y-1.5">
              {tasks.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleToggle(t.key)}
                  className="w-full flex items-center gap-2 bg-white/70 border border-[#e8d8a0] rounded-lg px-3 py-2.5 text-left active:bg-white/90 transition-colors min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    checked={t.completed}
                    readOnly
                    className="w-7 h-7 flex-shrink-0 accent-[#6B8E23] pointer-events-none"
                  />
                  <span className="text-sm">{t.bedLabel}</span>
                  <span className="text-sm">{t.bedEmoji}</span>
                  <span className="flex-1 text-sm text-[#3B2B12] truncate">
                    {t.step.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ========== Bed Progress ========== */}
      <section>
        <h2 className="text-base font-bold text-[#3B2B12] mb-2">📊 進捗サマリー（畝別）</h2>
        <div className="space-y-2">
          {bedIds.map((bedId) => {
            const steps = cropStepsByBed[bedId] ?? [];
            const total = steps.length;
            const done = steps.filter((_, idx) => completions[`bed-${bedId}-${idx}`]).length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            const bedLabel = getBedLabel(bedId);
            const bedEmoji = getBedEmoji(bedId);

            // Find current stage: last completed step
            let currentStage = '';
            let nextStage = '';
            let lastDoneIdx = -1;
            for (let i = steps.length - 1; i >= 0; i--) {
              if (completions[`bed-${bedId}-${i}`]) {
                lastDoneIdx = i;
                break;
              }
            }
            if (lastDoneIdx >= 0) {
              const cat = steps[lastDoneIdx].category;
              currentStage = `${stepMeta[cat]?.emoji ?? ''} ${stepMeta[cat]?.label ?? ''}済`;
            } else {
              currentStage = '未着手';
            }
            if (lastDoneIdx < total - 1) {
              const nextCat = steps[lastDoneIdx + 1].category;
              nextStage = `次: ${stepMeta[nextCat]?.emoji ?? ''} ${stepMeta[nextCat]?.label ?? ''}`;
            } else if (done === total && total > 0) {
              nextStage = '完了 🎉';
            }

            return (
              <div key={bedId} className="bg-white/70 border border-[#e8d8a0] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm font-bold text-[#3B2B12]">{bedLabel}</span>
                  <span className="text-sm">{bedEmoji}</span>
                  <span className="flex-1 text-xs text-[#6B4F2A] truncate">
                    {currentStage} {nextStage && `→ ${nextStage}`}
                  </span>
                  <span className="text-xs text-[#6B4F2A] font-bold">{done}/{total}</span>
                </div>
                {/* Progress bar */}
                <div className="h-3 bg-[#e8d8a0]/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct === 100 ? '#4A6B16' : '#6B8E23',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== Season Calendar Bar ========== */}
      <section>
        <h2 className="text-base font-bold text-[#3B2B12] mb-2">🗓️ 季節カレンダー</h2>
        <div className="bg-white/70 border border-[#e8d8a0] rounded-lg px-3 py-3">
          {/* Month labels */}
          <div className="flex justify-between mb-1 px-0.5">
            {MILESTONES.map((m) => (
              <div
                key={m.month}
                className="flex flex-col items-center"
                style={{ width: `${100 / MILESTONES.length}%` }}
              >
                <span className="text-sm">{m.emoji}</span>
                <span
                  className={`text-xs ${
                    currentMonth === m.month
                      ? 'font-bold text-[#E07A3C]'
                      : 'text-[#6B4F2A]'
                  }`}
                >
                  {m.month}月
                </span>
              </div>
            ))}
          </div>
          {/* Bar */}
          <div className="relative h-4 bg-gradient-to-r from-[#A0D468] via-[#6B8E23] to-[#8B6914] rounded-full overflow-hidden">
            {/* Current position marker */}
            {currentMonth >= 4 && currentMonth <= 11 && (
              <div
                className="absolute top-0 h-full w-0.5 bg-[#E07A3C]"
                style={{
                  left: `${((currentMonth - 4) / (11 - 4)) * 100}%`,
                }}
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-[#E07A3C] rounded-full border-2 border-white" />
              </div>
            )}
          </div>
          {/* Labels below bar */}
          <div className="flex justify-between mt-1 px-0.5">
            {MILESTONES.map((m) => (
              <span
                key={m.month}
                className={`text-[9px] text-center ${
                  currentMonth === m.month
                    ? 'font-bold text-[#E07A3C]'
                    : 'text-[#6B4F2A]/60'
                }`}
                style={{ width: `${100 / MILESTONES.length}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
