// 季節
export type Season = 'spring' | 'autumn';

// 品目カテゴリ（HTMLの凡例と対応）
export type CropCategory =
  | 'potato'      // 芋（ジャガイモ・サツマイモ）
  | 'summer'      // 夏野菜（ナス・ピーマン・トマト・ズッキーニ）
  | 'bean'        // 豆（枝豆・オクラ）
  | 'onion'       // ネギ・タマネギ
  | 'corn'        // とうもろこし
  | 'gourd'       // ウリ科（かぼちゃ・ゆうがお）
  | 'fallow';     // 休閑

// 畝ステータス
export type BedStatus =
  | 'none'          // 未着手
  | 'preparing'     // 土づくり中
  | 'planted'       // 植え付け済
  | 'growing'       // 生育中
  | 'harvesting'    // 収穫期
  | 'harvested'     // 収穫済
  | 'autumn';       // 秋冬転用中

export interface CropInfo {
  crop: string;
  emoji?: string;
  variety?: string;
  plants?: number | string;
  plant_date?: string;
  harvest_date?: string;
  autumn_use?: string;
  fertilizer?: string;
  companion?: string;
  note?: string;
  category: CropCategory;
  // 詳細パネル用
  detail?: string;    // 栽培情報
  compTip?: string;   // コンパニオン/注意
  hint?: string;      // ヒント
}

export interface Bed {
  id: number;
  position: string;
  label: string; // ①〜⑬
  split: boolean;
  // 春夏の作物
  main?: CropInfo;
  north?: CropInfo;
  south?: CropInfo;
  // 秋冬の作物（未設定 = 休閑）
  autumnMain?: CropInfo;
  autumnNorth?: CropInfo;
  autumnSouth?: CropInfo;
}

export interface Farm {
  name: string;
  location: string;
  width_ew: number;
  length_ns: number;
  soil_ph: number;
  beds: number;
}

// 作業タスク
export type TaskPeriod =
  | '4月'
  | '5月上旬'
  | '5月中旬'
  | '6月上旬'
  | '6月下旬'
  | '7月'
  | '8月'
  | '9月'
  | '10月'
  | '10-11月'
  | '11月-翌2月'
  | '翌5-6月';

export interface ScheduleTask {
  id: string;
  period: TaskPeriod;
  month: number;
  dueDate?: string;
  title: string;
  bedIds?: number[];
  category?: 'plant' | 'fertilize' | 'harvest' | 'pest' | 'maintain';
  preset: true;
}

export interface UserTask {
  id: string;
  date: string;
  title: string;
  note?: string;
  bedIds?: number[];
  preset: false;
}

export type Task = ScheduleTask | UserTask;

export interface TaskCompletion {
  taskId: string;
  completedAt: string;
  note?: string;
}

// 収穫記録
export interface HarvestRecord {
  id: string;
  date: string;
  bedId?: number;
  crop: string;
  emoji?: string;
  amountKg?: number;
  amountCount?: number;
  photoId?: string;
  note?: string;
  createdAt: string;
}

// 天気
export interface WeatherDaily {
  date: string;
  tempMin: number;
  tempMax: number;
  pop: number;
  windSpeed: number;
  weatherMain: string;
  weatherDesc: string;
  icon: string;
}

export interface FarmAlert {
  id: string;
  level: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  icon: string;
}

// シフト管理
export interface FarmMember {
  id: string;
  name: string;
  emoji: string;
  color: string;
  assignedBedIds?: number[];
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ShiftSlot {
  id: string;
  memberId: string;
  weekday: Weekday;
  task?: string;
}

export interface CheckIn {
  id: string;
  memberId: string;
  date: string;
  checkedAt: string;
  note?: string;
  completedTaskIds?: string[];
}

// 予算
export interface BudgetItem {
  name: string;
  qty: string;
  price: number;
}

export interface BudgetCategory {
  id: string;
  icon: string;
  title: string;
  desc: string;
  season: '春夏' | '秋冬' | '通年';
  total: number;
  items: BudgetItem[];
  note?: string;
}
