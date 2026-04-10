'use client';

import { openDB, type IDBPDatabase } from 'idb';
import type {
  BedStatus,
  TaskCompletion,
  UserTask,
  HarvestRecord,
  FarmMember,
  ShiftSlot,
  CheckIn,
} from '@/types';
import { cropStepsByBed, type StepCategory } from '@/lib/cropSteps';
import { supabase } from '@/lib/supabase';

// ======================
// localStorage helpers
// ======================

const LS_KEYS = {
  bedStatus: 'akichan.bedStatus',
  taskCompletions: 'akichan.taskCompletions',
  userTasks: 'akichan.userTasks',
  members: 'akichan.members',
  shifts: 'akichan.shifts',
  checkins: 'akichan.checkins',
  settings: 'akichan.settings',
  stepCompletions: 'akichan.stepCompletions',
  incomes: 'akichan.incomes',
  expenses: 'akichan.expenses',
} as const;

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ======================
// Step completions (cropSteps)
// ======================

export interface StepCompletion {
  key: string;        // "bed-{id}-{stepIndex}"
  completedAt: string;
  note?: string;
}

export async function getStepCompletions(): Promise<Record<string, StepCompletion>> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('step_completions')
        .select('key, completed_at, note');
      if (!error && data) {
        const map: Record<string, StepCompletion> = {};
        for (const row of data) {
          map[row.key] = {
            key: row.key,
            completedAt: row.completed_at,
            note: row.note ?? undefined,
          };
        }
        writeLS(LS_KEYS.stepCompletions, map);
        return map;
      }
    } catch {
      // fall through to localStorage
    }
  }
  return readLS<Record<string, StepCompletion>>(LS_KEYS.stepCompletions, {});
}

export async function toggleStepCompletion(key: string): Promise<boolean> {
  const map = await getStepCompletions();
  if (map[key]) {
    // Remove
    delete map[key];
    if (supabase) {
      try {
        await supabase.from('step_completions').delete().eq('key', key);
      } catch {
        // offline — localStorage only
      }
    }
    writeLS(LS_KEYS.stepCompletions, map);
    return false;
  }
  // Add
  const entry: StepCompletion = { key, completedAt: new Date().toISOString() };
  map[key] = entry;
  if (supabase) {
    try {
      await supabase.from('step_completions').upsert({
        key: entry.key,
        completed_at: entry.completedAt,
        note: entry.note ?? null,
      });
    } catch {
      // offline
    }
  }
  writeLS(LS_KEYS.stepCompletions, map);
  return true;
}

export async function isStepCompleted(key: string): Promise<boolean> {
  const map = await getStepCompletions();
  return !!map[key];
}

// ======================
// Bed status
// ======================

export async function getBedStatuses(): Promise<Record<number, BedStatus>> {
  // Bed statuses are computed from step completions — no dedicated Supabase table.
  // They are cached in localStorage.
  return readLS<Record<number, BedStatus>>(LS_KEYS.bedStatus, {});
}

export async function setBedStatus(bedId: number, status: BedStatus): Promise<void> {
  const map = await getBedStatuses();
  map[bedId] = status;
  writeLS(LS_KEYS.bedStatus, map);
}

// ======================
// Task completions
// ======================

export async function getTaskCompletions(): Promise<TaskCompletion[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('task_completions')
        .select('task_id, completed_at, note');
      if (!error && data) {
        const list: TaskCompletion[] = data.map((row) => ({
          taskId: row.task_id,
          completedAt: row.completed_at,
          note: row.note ?? undefined,
        }));
        writeLS(LS_KEYS.taskCompletions, list);
        return list;
      }
    } catch {
      // fall through
    }
  }
  return readLS<TaskCompletion[]>(LS_KEYS.taskCompletions, []);
}

export async function toggleTaskCompletion(taskId: string): Promise<boolean> {
  const list = await getTaskCompletions();
  const idx = list.findIndex((c) => c.taskId === taskId);
  if (idx >= 0) {
    list.splice(idx, 1);
    if (supabase) {
      try {
        await supabase.from('task_completions').delete().eq('task_id', taskId);
      } catch {
        // offline
      }
    }
    writeLS(LS_KEYS.taskCompletions, list);
    return false;
  }
  const entry: TaskCompletion = { taskId, completedAt: new Date().toISOString() };
  list.push(entry);
  if (supabase) {
    try {
      await supabase.from('task_completions').upsert({
        task_id: entry.taskId,
        completed_at: entry.completedAt,
        note: entry.note ?? null,
      });
    } catch {
      // offline
    }
  }
  writeLS(LS_KEYS.taskCompletions, list);
  return true;
}

export async function isTaskCompleted(taskId: string): Promise<boolean> {
  const list = await getTaskCompletions();
  return list.some((c) => c.taskId === taskId);
}

// ======================
// User tasks
// ======================

export async function getUserTasks(): Promise<UserTask[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('id, date, title, note, bed_ids');
      if (!error && data) {
        const list: UserTask[] = data.map((row) => ({
          id: row.id,
          date: row.date,
          title: row.title,
          note: row.note ?? undefined,
          bedIds: row.bed_ids ?? undefined,
          preset: false as const,
        }));
        writeLS(LS_KEYS.userTasks, list);
        return list;
      }
    } catch {
      // fall through
    }
  }
  return readLS<UserTask[]>(LS_KEYS.userTasks, []);
}

export async function addUserTask(task: Omit<UserTask, 'id' | 'preset'>): Promise<UserTask> {
  const list = await getUserTasks();
  const newTask: UserTask = {
    ...task,
    id: `user-${Date.now()}`,
    preset: false,
  };
  if (supabase) {
    try {
      await supabase.from('user_tasks').insert({
        id: newTask.id,
        date: newTask.date,
        title: newTask.title,
        note: newTask.note ?? null,
        bed_ids: newTask.bedIds ?? null,
      });
    } catch {
      // offline
    }
  }
  list.push(newTask);
  writeLS(LS_KEYS.userTasks, list);
  return newTask;
}

export async function deleteUserTask(id: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('user_tasks').delete().eq('id', id);
    } catch {
      // offline
    }
  }
  const list = (await getUserTasks()).filter((t) => t.id !== id);
  writeLS(LS_KEYS.userTasks, list);
}

// ======================
// Members
// ======================

export async function getMembers(): Promise<FarmMember[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, emoji, color, assigned_bed_ids');
      if (!error && data) {
        const list: FarmMember[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          emoji: row.emoji,
          color: row.color,
          assignedBedIds: row.assigned_bed_ids ?? undefined,
        }));
        writeLS(LS_KEYS.members, list);
        return list;
      }
    } catch {
      // fall through
    }
  }
  return readLS<FarmMember[]>(LS_KEYS.members, []);
}

export async function saveMembers(members: FarmMember[]): Promise<void> {
  if (supabase) {
    try {
      // Replace all members: delete then insert
      await supabase.from('members').delete().gte('id', '');
      if (members.length > 0) {
        await supabase.from('members').insert(
          members.map((m) => ({
            id: m.id,
            name: m.name,
            emoji: m.emoji,
            color: m.color,
            assigned_bed_ids: m.assignedBedIds ?? null,
          }))
        );
      }
    } catch {
      // offline
    }
  }
  writeLS(LS_KEYS.members, members);
}

// ======================
// Shifts
// ======================

export async function getShifts(): Promise<ShiftSlot[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('id, member_id, weekday, task');
      if (!error && data) {
        const list: ShiftSlot[] = data.map((row) => ({
          id: row.id,
          memberId: row.member_id,
          weekday: row.weekday,
          task: row.task ?? undefined,
        }));
        writeLS(LS_KEYS.shifts, list);
        return list;
      }
    } catch {
      // fall through
    }
  }
  return readLS<ShiftSlot[]>(LS_KEYS.shifts, []);
}

export async function saveShifts(shifts: ShiftSlot[]): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('shifts').delete().gte('id', '');
      if (shifts.length > 0) {
        await supabase.from('shifts').insert(
          shifts.map((s) => ({
            id: s.id,
            member_id: s.memberId,
            weekday: s.weekday,
            task: s.task ?? null,
          }))
        );
      }
    } catch {
      // offline
    }
  }
  writeLS(LS_KEYS.shifts, shifts);
}

// ======================
// Check-ins
// ======================

export async function getCheckIns(): Promise<CheckIn[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select('id, member_id, date, checked_at, note, completed_task_ids');
      if (!error && data) {
        const list: CheckIn[] = data.map((row) => ({
          id: row.id,
          memberId: row.member_id,
          date: row.date,
          checkedAt: row.checked_at,
          note: row.note ?? undefined,
          completedTaskIds: row.completed_task_ids ?? undefined,
        }));
        writeLS(LS_KEYS.checkins, list);
        return list;
      }
    } catch {
      // fall through
    }
  }
  return readLS<CheckIn[]>(LS_KEYS.checkins, []);
}

export async function addCheckIn(checkin: Omit<CheckIn, 'id' | 'checkedAt'>): Promise<CheckIn> {
  const list = await getCheckIns();
  const newCheckIn: CheckIn = {
    ...checkin,
    id: `chk-${Date.now()}`,
    checkedAt: new Date().toISOString(),
  };
  if (supabase) {
    try {
      await supabase.from('checkins').insert({
        id: newCheckIn.id,
        member_id: newCheckIn.memberId,
        date: newCheckIn.date,
        checked_at: newCheckIn.checkedAt,
        note: newCheckIn.note ?? null,
        completed_task_ids: newCheckIn.completedTaskIds ?? null,
      });
    } catch {
      // offline
    }
  }
  list.push(newCheckIn);
  writeLS(LS_KEYS.checkins, list);
  return newCheckIn;
}

// ======================
// Income (集金)
// ======================

export interface IncomeRecord {
  id: string;
  date: string;
  from: string;     // 誰から
  amount: number;
  note?: string;
  createdAt: string;
}

export async function getIncomes(): Promise<IncomeRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('id, date, from_name, amount, note, created_at');
      if (!error && data) {
        const list: IncomeRecord[] = data.map((row) => ({
          id: row.id,
          date: row.date,
          from: row.from_name,
          amount: row.amount,
          note: row.note ?? undefined,
          createdAt: row.created_at,
        }));
        writeLS(LS_KEYS.incomes, list);
        return list;
      }
    } catch {
      // fall through
    }
  }
  return readLS<IncomeRecord[]>(LS_KEYS.incomes, []);
}

export async function addIncome(rec: Omit<IncomeRecord, 'id' | 'createdAt'>): Promise<IncomeRecord> {
  const list = await getIncomes();
  const newRec: IncomeRecord = { ...rec, id: `inc-${Date.now()}`, createdAt: new Date().toISOString() };
  if (supabase) {
    try {
      await supabase.from('incomes').insert({
        id: newRec.id,
        date: newRec.date,
        from_name: newRec.from,
        amount: newRec.amount,
        note: newRec.note ?? null,
        created_at: newRec.createdAt,
      });
    } catch {
      // offline
    }
  }
  list.push(newRec);
  writeLS(LS_KEYS.incomes, list);
  return newRec;
}

export async function deleteIncome(id: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('incomes').delete().eq('id', id);
    } catch {
      // offline
    }
  }
  const list = (await getIncomes()).filter((r) => r.id !== id);
  writeLS(LS_KEYS.incomes, list);
}

// ======================
// Expense (出費)
// ======================

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;  // 費目
  item: string;      // 品名
  amount: number;
  note?: string;
  createdAt: string;
}

export async function getExpenses(): Promise<ExpenseRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, date, category, item, amount, note, created_at');
      if (!error && data) {
        const list: ExpenseRecord[] = data.map((row) => ({
          id: row.id,
          date: row.date,
          category: row.category,
          item: row.item,
          amount: row.amount,
          note: row.note ?? undefined,
          createdAt: row.created_at,
        }));
        writeLS(LS_KEYS.expenses, list);
        return list;
      }
    } catch {
      // fall through
    }
  }
  return readLS<ExpenseRecord[]>(LS_KEYS.expenses, []);
}

export async function addExpense(rec: Omit<ExpenseRecord, 'id' | 'createdAt'>): Promise<ExpenseRecord> {
  const list = await getExpenses();
  const newRec: ExpenseRecord = { ...rec, id: `exp-${Date.now()}`, createdAt: new Date().toISOString() };
  if (supabase) {
    try {
      await supabase.from('expenses').insert({
        id: newRec.id,
        date: newRec.date,
        category: newRec.category,
        item: newRec.item,
        amount: newRec.amount,
        note: newRec.note ?? null,
        created_at: newRec.createdAt,
      });
    } catch {
      // offline
    }
  }
  list.push(newRec);
  writeLS(LS_KEYS.expenses, list);
  return newRec;
}

export async function deleteExpense(id: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('expenses').delete().eq('id', id);
    } catch {
      // offline
    }
  }
  const list = (await getExpenses()).filter((r) => r.id !== id);
  writeLS(LS_KEYS.expenses, list);
}

// ======================
// Auto-compute bed status from step completions
// ======================

const CARE_CATEGORIES: StepCategory[] = ['thin', 'fertilize', 'hill', 'prune', 'pest', 'water'];

export async function computeBedStatusFromSteps(bedId: number): Promise<BedStatus> {
  const steps = cropStepsByBed[bedId];
  if (!steps || steps.length === 0) return 'none';

  const completions = await getStepCompletions();
  const done: StepCategory[] = [];
  let allCompleted = true;
  let lastCompletedCategory: StepCategory | null = null;

  for (let i = 0; i < steps.length; i++) {
    const key = `bed-${bedId}-${i}`;
    if (completions[key]) {
      if (!done.includes(steps[i].category)) done.push(steps[i].category);
      lastCompletedCategory = steps[i].category;
    } else {
      allCompleted = false;
    }
  }

  if (done.length === 0) return 'none';
  if (allCompleted) return 'harvested';
  if (done.includes('rotate')) return 'autumn';
  if (lastCompletedCategory === 'harvest') return 'harvesting';

  if (done.includes('plant')) {
    const hasCare = CARE_CATEGORIES.some((c) => done.includes(c));
    if (hasCare) return 'growing';
    return 'planted';
  }

  if (done.includes('soil')) return 'preparing';
  return 'none';
}

export async function syncAllBedStatuses(): Promise<void> {
  for (let bedId = 1; bedId <= 13; bedId++) {
    const status = await computeBedStatusFromSteps(bedId);
    await setBedStatus(bedId, status);
  }
}

// ======================
// Settings
// ======================

export interface AppSettings {
  weatherApiKey?: string;
}

export async function getSettings(): Promise<AppSettings> {
  return readLS<AppSettings>(LS_KEYS.settings, {});
}

export async function saveSettings(s: AppSettings): Promise<void> {
  writeLS(LS_KEYS.settings, s);
}

// ======================
// IndexedDB for harvest photos (fallback)
// ======================

const DB_NAME = 'akichan-farm';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available on server'));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('harvests')) {
          const store = db.createObjectStore('harvests', { keyPath: 'id' });
          store.createIndex('date', 'date');
          store.createIndex('crop', 'crop');
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos');
        }
      },
    });
  }
  return dbPromise;
}

export async function addHarvest(rec: Omit<HarvestRecord, 'id' | 'createdAt'>, photoBlob?: Blob): Promise<HarvestRecord> {
  const id = `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();
  let photoId: string | undefined;

  if (supabase) {
    try {
      let photoUrl: string | null = null;
      if (photoBlob) {
        const photoPath = `harvests/${id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('harvest-photos')
          .upload(photoPath, photoBlob, { contentType: photoBlob.type || 'image/jpeg' });
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('harvest-photos')
            .getPublicUrl(photoPath);
          photoUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from('harvests').insert({
        id,
        date: rec.date,
        bed_id: rec.bedId ?? null,
        crop: rec.crop,
        emoji: rec.emoji ?? null,
        amount_kg: rec.amountKg ?? null,
        amount_count: rec.amountCount ?? null,
        photo_url: photoUrl,
        note: rec.note ?? null,
        created_at: createdAt,
      });

      if (!error) {
        const newRec: HarvestRecord = {
          ...rec,
          id,
          photoId: photoUrl ?? undefined,
          createdAt,
        };
        return newRec;
      }
    } catch {
      // fall through to IndexedDB
    }
  }

  // Fallback: IndexedDB
  const db = await getDB();
  if (photoBlob) {
    photoId = `photo-${id}`;
    await db.put('photos', photoBlob, photoId);
  }
  const newRec: HarvestRecord = {
    ...rec,
    id,
    photoId,
    createdAt,
  };
  await db.put('harvests', newRec);
  return newRec;
}

export async function getHarvests(): Promise<HarvestRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('harvests')
        .select('id, date, bed_id, crop, emoji, amount_kg, amount_count, photo_url, note, created_at')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          date: row.date,
          bedId: row.bed_id ?? undefined,
          crop: row.crop,
          emoji: row.emoji ?? undefined,
          amountKg: row.amount_kg ?? undefined,
          amountCount: row.amount_count ?? undefined,
          photoId: row.photo_url ?? undefined,
          note: row.note ?? undefined,
          createdAt: row.created_at,
        }));
      }
    } catch {
      // fall through
    }
  }

  // Fallback: IndexedDB
  try {
    const db = await getDB();
    return (await db.getAll('harvests')) as HarvestRecord[];
  } catch {
    return [];
  }
}

export async function deleteHarvest(id: string): Promise<void> {
  if (supabase) {
    try {
      // Fetch the record to get photo_url for storage cleanup
      const { data } = await supabase
        .from('harvests')
        .select('photo_url')
        .eq('id', id)
        .single();
      if (data?.photo_url) {
        // Extract path from public URL
        const url = data.photo_url as string;
        const pathMatch = url.match(/harvest-photos\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from('harvest-photos').remove([pathMatch[1]]);
        }
      }
      const { error } = await supabase.from('harvests').delete().eq('id', id);
      if (!error) return;
    } catch {
      // fall through
    }
  }

  // Fallback: IndexedDB
  const db = await getDB();
  const rec = (await db.get('harvests', id)) as HarvestRecord | undefined;
  if (rec?.photoId) {
    await db.delete('photos', rec.photoId);
  }
  await db.delete('harvests', id);
}

export async function getPhotoURL(photoId: string): Promise<string | null> {
  // If photoId looks like a URL (from Supabase), return it directly
  if (photoId.startsWith('http://') || photoId.startsWith('https://')) {
    return photoId;
  }

  // Fallback: IndexedDB blob
  try {
    const db = await getDB();
    const blob = (await db.get('photos', photoId)) as Blob | undefined;
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
