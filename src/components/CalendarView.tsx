'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { cropStepsByBed, stepMeta, type StepCategory, type CropStep } from '@/lib/cropSteps';
import { beds, cropEmoji } from '@/lib/farmData';
import {
  addUserTask,
  deleteUserTask,
  getUserTasks,
  toggleStepCompletion,
  getStepCompletions,
} from '@/lib/storage';
import type { UserTask } from '@/types';

// ========== Helpers ==========

const WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const BED_LABELS = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬';

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function bedLabel(id: number): string {
  return BED_LABELS[id - 1] ?? `${id}`;
}

/** Get crop name for a bed from farmData */
function bedCropName(bedId: number): string {
  const bed = beds.find((b) => b.id === bedId);
  if (!bed) return '';
  if (bed.main) return bed.main.crop;
  const parts: string[] = [];
  if (bed.north) parts.push(bed.north.crop);
  if (bed.south) parts.push(bed.south.crop);
  return parts.join('/');
}

/** Get crop emoji for a bed */
function bedCropEmoji(bedId: number): string {
  const bed = beds.find((b) => b.id === bedId);
  if (!bed) return '🌱';
  if (bed.main?.emoji) return bed.main.emoji;
  if (bed.north?.emoji) return bed.north.emoji;
  return cropEmoji(bedCropName(bedId));
}

// ========== Month parsing ==========

interface ParsedDate {
  month: number;  // 1-indexed
  startDay: number;
  endDay: number;
}

/**
 * Parse month strings like "4月中旬", "5月上旬", "8-9月", "7月", "5月〜", "9-10月",
 * "翌3月", "翌5-6月", "11月〜翌2月" into date ranges.
 */
function parseMonthString(s: string): ParsedDate[] {
  // Handle "翌" prefix (next year marker) - strip it for parsing
  const cleaned = s.replace(/翌/g, '');

  // Range like "8-9月" or "8-10月"
  const rangeMatch = cleaned.match(/^(\d+)-(\d+)月(.*)$/);
  if (rangeMatch) {
    const m1 = parseInt(rangeMatch[1], 10);
    const m2 = parseInt(rangeMatch[2], 10);
    const suffix = rangeMatch[3] || '';
    const results: ParsedDate[] = [];
    for (let m = m1; m <= m2; m++) {
      results.push({ month: m, ...parseSuffix(suffix) });
    }
    return results;
  }

  // Single month like "4月中旬", "7月", "5月〜"
  const singleMatch = cleaned.match(/^(\d+)月(.*)$/);
  if (singleMatch) {
    const m = parseInt(singleMatch[1], 10);
    const suffix = singleMatch[2] || '';
    return [{ month: m, ...parseSuffix(suffix) }];
  }

  return [];
}

function parseSuffix(suffix: string): { startDay: number; endDay: number } {
  const s = suffix.replace(/〜$/, '');
  if (s === '上旬') return { startDay: 1, endDay: 10 };
  if (s === '中旬') return { startDay: 11, endDay: 20 };
  if (s === '下旬') return { startDay: 21, endDay: 28 };
  // No qualifier: full month, use middle day for dot display
  return { startDay: 1, endDay: 28 };
}

/** Get representative display day for a step in a given month */
function getDisplayDay(parsed: ParsedDate): number {
  if (parsed.startDay === 1 && parsed.endDay === 10) return 5;   // 上旬 → 5th
  if (parsed.startDay === 11 && parsed.endDay === 20) return 15; // 中旬 → 15th
  if (parsed.startDay === 21 && parsed.endDay === 28) return 25; // 下旬 → 25th
  return 15; // full month → 15th
}

// ========== Calendar task type ==========

interface CalendarTask {
  key: string;           // "bed-{bedId}-{stepIndex}" for completion tracking
  bedId: number;
  stepIndex: number;
  step: CropStep;
  category: StepCategory;
  displayDate: string;   // "YYYY-MM-DD"
}

/** Build all calendar tasks for a given year from cropSteps */
function buildCropStepTasks(year: number): CalendarTask[] {
  const tasks: CalendarTask[] = [];

  for (const [bedIdStr, steps] of Object.entries(cropStepsByBed)) {
    const bedId = parseInt(bedIdStr, 10);
    steps.forEach((step, stepIndex) => {
      const parsed = parseMonthString(step.month);
      if (parsed.length === 0) return;

      // Use the first parsed month for display date
      const first = parsed[0];
      const displayDay = getDisplayDay(first);
      const dateStr = `${year}-${String(first.month).padStart(2, '0')}-${String(displayDay).padStart(2, '0')}`;

      tasks.push({
        key: `bed-${bedId}-${stepIndex}`,
        bedId,
        stepIndex,
        step,
        category: step.category,
        displayDate: dateStr,
      });
    });
  }

  return tasks;
}

/** Check if a task falls within a given month (year, 0-indexed month) */
function taskInMonth(task: CalendarTask, year: number, month0: number): boolean {
  const parsed = parseMonthString(task.step.month);
  return parsed.some((p) => p.month === month0 + 1);
}

// ========== Category styling ==========

function categoryBadgeBg(cat: StepCategory): string {
  const map: Record<StepCategory, string> = {
    soil: 'bg-amber-800/15 text-amber-900',
    plant: 'bg-green-600/15 text-green-800',
    thin: 'bg-lime-600/15 text-lime-800',
    fertilize: 'bg-amber-700/15 text-amber-800',
    hill: 'bg-yellow-700/15 text-yellow-900',
    prune: 'bg-emerald-700/15 text-emerald-900',
    pest: 'bg-red-500/15 text-red-800',
    water: 'bg-blue-500/15 text-blue-800',
    harvest: 'bg-yellow-500/15 text-yellow-800',
    rotate: 'bg-orange-600/15 text-orange-900',
  };
  return map[cat];
}

function categoryDotColor(cat: StepCategory): string {
  const map: Record<StepCategory, string> = {
    soil: 'bg-amber-800',
    plant: 'bg-green-600',
    thin: 'bg-lime-600',
    fertilize: 'bg-amber-700',
    hill: 'bg-yellow-700',
    prune: 'bg-emerald-700',
    pest: 'bg-red-500',
    water: 'bg-blue-500',
    harvest: 'bg-yellow-500',
    rotate: 'bg-orange-600',
  };
  return map[cat];
}

// ========== Summary helpers ==========

interface CategorySummary {
  category: StepCategory;
  count: number;
  items: { bedId: number; title: string }[];
}

function buildMonthlySummary(tasks: CalendarTask[], year: number, month0: number): CategorySummary[] {
  const monthTasks = tasks.filter((t) => taskInMonth(t, year, month0));
  const map = new Map<StepCategory, CategorySummary>();

  for (const t of monthTasks) {
    let entry = map.get(t.category);
    if (!entry) {
      entry = { category: t.category, count: 0, items: [] };
      map.set(t.category, entry);
    }
    entry.count++;
    entry.items.push({ bedId: t.bedId, title: t.step.title });
  }

  // Sort: plant, soil, thin, fertilize, hill, prune, pest, water, harvest, rotate
  const order: StepCategory[] = ['plant', 'soil', 'thin', 'fertilize', 'hill', 'prune', 'pest', 'water', 'harvest', 'rotate'];
  return order.filter((c) => map.has(c)).map((c) => map.get(c)!);
}

const beginnerTips: Partial<Record<StepCategory, string>> = {
  plant: '苗や種を畑に植える作業です。天気予報を見て晴れの日に!',
  soil: '良い野菜は良い土から。堆肥や肥料を混ぜ込みます。',
  thin: '密集した芽を間引いて、残す株を元気に育てます。',
  fertilize: '生育中の野菜に追加の栄養を与えます。',
  hill: '株元に土を寄せて根を守り、倒伏を防ぎます。',
  prune: '不要な枝や芽を取り除いて、実の品質をUPします。',
  pest: '害虫や病気から野菜を守る薬剤散布です。',
  harvest: '待ちに待った収穫!適期を逃さないように。',
  rotate: '次の季節に向けて畝を切り替えます。',
};

// ========== Component ==========

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [stepCompletions, setStepCompletions] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showSummary, setShowSummary] = useState(true);

  // Load data on mount
  useEffect(() => {
    getUserTasks().then(setUserTasks);
    getStepCompletions().then((completions) => {
      const map: Record<string, boolean> = {};
      for (const key of Object.keys(completions)) {
        map[key] = true;
      }
      setStepCompletions(map);
    });
  }, []);

  // Build cropStep tasks for current year
  const cropTasks = useMemo(() => buildCropStepTasks(year), [year]);

  // Monthly summary
  const monthlySummary = useMemo(
    () => buildMonthlySummary(cropTasks, year, month),
    [cropTasks, year, month]
  );

  // Calendar cells
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toDateStr(new Date(year, month, d)), day: d });
  }

  // Tasks by date (cropStep tasks mapped to display dates)
  const tasksByDate = useMemo(() => {
    const map: Record<string, CalendarTask[]> = {};
    for (const t of cropTasks) {
      // Check if this task appears in the current month
      const parsed = parseMonthString(t.step.month);
      for (const p of parsed) {
        if (p.month === month + 1) {
          const displayDay = getDisplayDay(p);
          const dateStr = `${year}-${String(p.month).padStart(2, '0')}-${String(displayDay).padStart(2, '0')}`;
          (map[dateStr] ??= []).push(t);
        }
      }
    }
    return map;
  }, [cropTasks, year, month]);

  // User tasks by date
  const userTasksByDate = useMemo(() => {
    const map: Record<string, UserTask[]> = {};
    for (const t of userTasks) {
      if (t.date) {
        (map[t.date] ??= []).push(t);
      }
    }
    return map;
  }, [userTasks]);

  // Selected day's tasks
  const selectedCropTasks = tasksByDate[selectedDate] ?? [];
  const selectedUserTasks = userTasksByDate[selectedDate] ?? [];

  // Count tasks for a date cell (for dots)
  const getDateTaskCount = useCallback(
    (dateStr: string) => (tasksByDate[dateStr]?.length ?? 0) + (userTasksByDate[dateStr]?.length ?? 0),
    [tasksByDate, userTasksByDate]
  );

  // Get unique categories for a date (for colored dots)
  const getDateCategories = useCallback(
    (dateStr: string): StepCategory[] => {
      const tasks = tasksByDate[dateStr] ?? [];
      const cats = new Set<StepCategory>();
      for (const t of tasks) cats.add(t.category);
      return Array.from(cats);
    },
    [tasksByDate]
  );

  // Navigation
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };
  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  // Toggle step completion
  const onToggleStep = async (key: string) => {
    const nowDone = await toggleStepCompletion(key);
    setStepCompletions((prev) => ({ ...prev, [key]: nowDone }));
  };

  // User task CRUD
  const onAddTask = async () => {
    if (!newTitle.trim()) return;
    const t = await addUserTask({ date: selectedDate, title: newTitle.trim(), note: newNote.trim() || undefined });
    setUserTasks([...userTasks, t]);
    setNewTitle('');
    setNewNote('');
    setShowForm(false);
  };

  const onDeleteUser = async (id: string) => {
    await deleteUserTask(id);
    setUserTasks(userTasks.filter((t) => t.id !== id));
  };

  // Count completed steps this month
  const monthCompletedCount = useMemo(() => {
    let count = 0;
    for (const tasks of Object.values(tasksByDate)) {
      for (const t of tasks) {
        if (stepCompletions[t.key]) count++;
      }
    }
    return count;
  }, [tasksByDate, stepCompletions]);

  const monthTotalCount = useMemo(() => {
    let count = 0;
    for (const tasks of Object.values(tasksByDate)) {
      count += tasks.length;
    }
    return count;
  }, [tasksByDate]);

  return (
    <div className="p-4">
      {/* ===== 月ヘッダー ===== */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="px-4 py-2.5 text-sm font-bold rounded-md bg-white border border-soil/15 active:bg-cream transition">
          &larr; 前月
        </button>
        <div className="font-bold text-lg">
          {year}年 {month + 1}月
        </div>
        <button onClick={nextMonth} className="px-4 py-2.5 text-sm font-bold rounded-md bg-white border border-soil/15 active:bg-cream transition">
          翌月 &rarr;
        </button>
      </div>

      {/* ===== 今月のやること サマリー ===== */}
      <div className="mb-3">
        <button
          onClick={() => setShowSummary((s) => !s)}
          className="w-full text-left bg-white rounded-lg border border-soil/10 px-3 py-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">
              📋 今月のやること ({monthTotalCount}件)
            </span>
            <span className="text-xs text-soilLight font-bold">
              {monthCompletedCount}/{monthTotalCount} 完了 {showSummary ? '▲' : '▼'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-2.5 bg-soil/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-leaf rounded-full transition-all"
              style={{ width: monthTotalCount > 0 ? `${(monthCompletedCount / monthTotalCount) * 100}%` : '0%' }}
            />
          </div>
        </button>

        {showSummary && monthlySummary.length > 0 && (
          <div className="mt-2 space-y-2">
            {monthlySummary.map((s) => {
              const meta = stepMeta[s.category];
              return (
                <div key={s.category} className="bg-white rounded-lg border border-soil/10 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${categoryBadgeBg(s.category)}`}>
                      {meta.emoji} {meta.label}
                    </span>
                    <span className="text-xs text-soilLight font-bold">{s.count}件</span>
                  </div>
                  <div className="text-xs text-soilLight leading-relaxed">
                    {s.items.slice(0, 4).map((item, i) => (
                      <span key={i}>
                        {bedLabel(item.bedId)}{bedCropEmoji(item.bedId)} {item.title}
                        {i < Math.min(s.items.length, 4) - 1 ? ' / ' : ''}
                      </span>
                    ))}
                    {s.items.length > 4 && <span> ...他{s.items.length - 4}件</span>}
                  </div>
                  {beginnerTips[s.category] && (
                    <div className="text-xs text-leaf mt-1 leading-relaxed">
                      💡 {beginnerTips[s.category]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== 曜日ヘッダ ===== */}
      <div className="grid grid-cols-7 text-xs text-center text-soilLight font-bold mb-1">
        {WEEK.map((w, i) => (
          <div key={w} className={i === 0 ? 'text-sunset' : i === 6 ? 'text-sky' : ''}>
            {w}
          </div>
        ))}
      </div>

      {/* ===== 日付セル ===== */}
      <div className="grid grid-cols-7 gap-0.5 bg-soil/10 rounded-md p-0.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} className="bg-cream min-h-[52px]" />;
          const count = getDateTaskCount(cell.date);
          const cats = getDateCategories(cell.date);
          const isToday = cell.date === toDateStr(today);
          const isSelected = cell.date === selectedDate;
          return (
            <button
              key={cell.date}
              onClick={() => setSelectedDate(cell.date)}
              className={`bg-cream min-h-[52px] text-left p-1.5 relative ${
                isSelected ? 'ring-2 ring-leaf ring-inset' : ''
              }`}
            >
              <div
                className={`text-sm ${
                  isToday ? 'font-bold text-leafDark' : 'text-soil'
                }`}
              >
                {cell.day}
              </div>
              {/* Category dots */}
              {cats.length > 0 && (
                <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center">
                  {cats.slice(0, 4).map((cat) => (
                    <div key={cat} className={`w-2 h-2 rounded-full ${categoryDotColor(cat)}`} />
                  ))}
                  {count > 4 && <div className="w-2 h-2 rounded-full bg-soilLight" />}
                </div>
              )}
              {/* User task indicator */}
              {(userTasksByDate[cell.date]?.length ?? 0) > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sunset" />
              )}
            </button>
          );
        })}
      </div>

      {/* ===== 日別タスク ===== */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-sm">
            📅 {selectedDate} のタスク ({selectedCropTasks.length + selectedUserTasks.length})
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-sm bg-leaf text-white px-4 py-2 rounded-md font-bold active:scale-95 transition"
          >
            {showForm ? 'キャンセル' : '+ 追加'}
          </button>
        </div>

        {/* Add task form */}
        {showForm && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-soil/10 space-y-2">
            <input
              className="w-full border border-soil/20 rounded px-3 py-2.5 text-base"
              placeholder="タスク名"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              className="w-full border border-soil/20 rounded px-3 py-2.5 text-base"
              rows={2}
              placeholder="メモ（任意）"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button
              onClick={onAddTask}
              className="w-full bg-leafDark text-white rounded py-2.5 text-sm font-bold active:scale-95 transition"
            >
              保存
            </button>
          </div>
        )}

        {/* Crop step tasks */}
        {selectedCropTasks.length === 0 && selectedUserTasks.length === 0 ? (
          <div className="text-center text-soilLight text-sm py-6">
            この日のタスクはありません
          </div>
        ) : (
          <ul className="space-y-2">
            {selectedCropTasks.map((t) => {
              const done = !!stepCompletions[t.key];
              const meta = stepMeta[t.category];
              return (
                <li
                  key={t.key}
                  className={`bg-white rounded-lg p-3 border border-soil/10 flex items-start gap-2.5 ${
                    done ? 'opacity-50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggleStep(t.key)}
                    className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 text-sm ${
                      done ? 'bg-leaf border-leaf text-white' : 'border-soilLight'
                    }`}
                    aria-label="完了"
                  >
                    {done && '✓'}
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Top line: bed label + category badge */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-sm font-bold text-soil">
                        {bedLabel(t.bedId)}{bedCropEmoji(t.bedId)}
                      </span>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${categoryBadgeBg(t.category)}`}>
                        {meta.emoji}{meta.label}
                      </span>
                      <span className="text-xs text-soilLight">{t.step.month}</span>
                    </div>

                    {/* Task title */}
                    <div className={`text-sm font-bold leading-snug ${done ? 'line-through' : ''}`}>
                      {t.step.title}
                    </div>

                    {/* Detail */}
                    {t.step.detail && (
                      <div className="text-xs text-soilLight mt-1 leading-relaxed">
                        {t.step.detail}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}

            {/* User tasks */}
            {selectedUserTasks.map((t) => (
              <li
                key={t.id}
                className="bg-white rounded-lg p-3 border border-sunset/20 flex items-start gap-2.5"
              >
                <div className="mt-0.5 w-6 h-6 rounded-full bg-sunset/20 flex items-center justify-center shrink-0">
                  <span className="text-xs">📝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">{t.title}</div>
                  {t.note && (
                    <div className="text-xs text-soilLight mt-0.5">{t.note}</div>
                  )}
                </div>
                <button
                  onClick={() => onDeleteUser(t.id)}
                  className="text-sm text-soilLight shrink-0 w-8 h-8 flex items-center justify-center"
                  aria-label="削除"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
