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
// Bed status
// ======================

export function getBedStatuses(): Record<number, BedStatus> {
  return readLS<Record<number, BedStatus>>(LS_KEYS.bedStatus, {});
}

export function setBedStatus(bedId: number, status: BedStatus): void {
  const map = getBedStatuses();
  map[bedId] = status;
  writeLS(LS_KEYS.bedStatus, map);
}

// ======================
// Task completions
// ======================

export function getTaskCompletions(): TaskCompletion[] {
  return readLS<TaskCompletion[]>(LS_KEYS.taskCompletions, []);
}

export function toggleTaskCompletion(taskId: string): boolean {
  const list = getTaskCompletions();
  const idx = list.findIndex((c) => c.taskId === taskId);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeLS(LS_KEYS.taskCompletions, list);
    return false;
  }
  list.push({ taskId, completedAt: new Date().toISOString() });
  writeLS(LS_KEYS.taskCompletions, list);
  return true;
}

export function isTaskCompleted(taskId: string): boolean {
  return getTaskCompletions().some((c) => c.taskId === taskId);
}

// ======================
// User tasks
// ======================

export function getUserTasks(): UserTask[] {
  return readLS<UserTask[]>(LS_KEYS.userTasks, []);
}

export function addUserTask(task: Omit<UserTask, 'id' | 'preset'>): UserTask {
  const list = getUserTasks();
  const newTask: UserTask = {
    ...task,
    id: `user-${Date.now()}`,
    preset: false,
  };
  list.push(newTask);
  writeLS(LS_KEYS.userTasks, list);
  return newTask;
}

export function deleteUserTask(id: string): void {
  const list = getUserTasks().filter((t) => t.id !== id);
  writeLS(LS_KEYS.userTasks, list);
}

// ======================
// Step completions (cropSteps)
// ======================

export interface StepCompletion {
  key: string;        // "bed-{id}-{stepIndex}"
  completedAt: string;
  note?: string;
}

export function getStepCompletions(): Record<string, StepCompletion> {
  return readLS<Record<string, StepCompletion>>(LS_KEYS.stepCompletions, {});
}

export function toggleStepCompletion(key: string): boolean {
  const map = getStepCompletions();
  if (map[key]) {
    delete map[key];
    writeLS(LS_KEYS.stepCompletions, map);
    return false;
  }
  map[key] = { key, completedAt: new Date().toISOString() };
  writeLS(LS_KEYS.stepCompletions, map);
  return true;
}

export function isStepCompleted(key: string): boolean {
  return !!getStepCompletions()[key];
}

// ======================
// Members
// ======================

export function getMembers(): FarmMember[] {
  return readLS<FarmMember[]>(LS_KEYS.members, []);
}

export function saveMembers(members: FarmMember[]): void {
  writeLS(LS_KEYS.members, members);
}

// ======================
// Shifts
// ======================

export function getShifts(): ShiftSlot[] {
  return readLS<ShiftSlot[]>(LS_KEYS.shifts, []);
}

export function saveShifts(shifts: ShiftSlot[]): void {
  writeLS(LS_KEYS.shifts, shifts);
}

// ======================
// Check-ins
// ======================

export function getCheckIns(): CheckIn[] {
  return readLS<CheckIn[]>(LS_KEYS.checkins, []);
}

export function addCheckIn(checkin: Omit<CheckIn, 'id' | 'checkedAt'>): CheckIn {
  const list = getCheckIns();
  const newCheckIn: CheckIn = {
    ...checkin,
    id: `chk-${Date.now()}`,
    checkedAt: new Date().toISOString(),
  };
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

export function getIncomes(): IncomeRecord[] {
  return readLS<IncomeRecord[]>(LS_KEYS.incomes, []);
}

export function addIncome(rec: Omit<IncomeRecord, 'id' | 'createdAt'>): IncomeRecord {
  const list = getIncomes();
  const newRec: IncomeRecord = { ...rec, id: `inc-${Date.now()}`, createdAt: new Date().toISOString() };
  list.push(newRec);
  writeLS(LS_KEYS.incomes, list);
  return newRec;
}

export function deleteIncome(id: string): void {
  writeLS(LS_KEYS.incomes, getIncomes().filter((r) => r.id !== id));
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

export function getExpenses(): ExpenseRecord[] {
  return readLS<ExpenseRecord[]>(LS_KEYS.expenses, []);
}

export function addExpense(rec: Omit<ExpenseRecord, 'id' | 'createdAt'>): ExpenseRecord {
  const list = getExpenses();
  const newRec: ExpenseRecord = { ...rec, id: `exp-${Date.now()}`, createdAt: new Date().toISOString() };
  list.push(newRec);
  writeLS(LS_KEYS.expenses, list);
  return newRec;
}

export function deleteExpense(id: string): void {
  writeLS(LS_KEYS.expenses, getExpenses().filter((r) => r.id !== id));
}

// ======================
// Auto-compute bed status from step completions
// ======================

const CARE_CATEGORIES: StepCategory[] = ['thin', 'fertilize', 'hill', 'prune', 'pest', 'water'];

export function computeBedStatusFromSteps(bedId: number): BedStatus {
  const steps = cropStepsByBed[bedId];
  if (!steps || steps.length === 0) return 'none';

  const completions = getStepCompletions();
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

export function syncAllBedStatuses(): void {
  for (let bedId = 1; bedId <= 13; bedId++) {
    const status = computeBedStatusFromSteps(bedId);
    setBedStatus(bedId, status);
  }
}

// ======================
// Settings
// ======================

export interface AppSettings {
  weatherApiKey?: string;
}

export function getSettings(): AppSettings {
  return readLS<AppSettings>(LS_KEYS.settings, {});
}

export function saveSettings(s: AppSettings): void {
  writeLS(LS_KEYS.settings, s);
}

// ======================
// IndexedDB for harvest records + photos
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
  const db = await getDB();
  const id = `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let photoId: string | undefined;
  if (photoBlob) {
    photoId = `photo-${id}`;
    await db.put('photos', photoBlob, photoId);
  }
  const newRec: HarvestRecord = {
    ...rec,
    id,
    photoId,
    createdAt: new Date().toISOString(),
  };
  await db.put('harvests', newRec);
  return newRec;
}

export async function getHarvests(): Promise<HarvestRecord[]> {
  try {
    const db = await getDB();
    return (await db.getAll('harvests')) as HarvestRecord[];
  } catch {
    return [];
  }
}

export async function deleteHarvest(id: string): Promise<void> {
  const db = await getDB();
  const rec = (await db.get('harvests', id)) as HarvestRecord | undefined;
  if (rec?.photoId) {
    await db.delete('photos', rec.photoId);
  }
  await db.delete('harvests', id);
}

export async function getPhotoURL(photoId: string): Promise<string | null> {
  try {
    const db = await getDB();
    const blob = (await db.get('photos', photoId)) as Blob | undefined;
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
