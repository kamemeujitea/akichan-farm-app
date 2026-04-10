import type { ScheduleTask } from '@/types';

// 年間プリセットタスク（dueDateは今年を想定して動的に組み立て）
type Preset = Omit<ScheduleTask, 'id' | 'dueDate' | 'preset'> & { day?: number };

const PRESETS: Preset[] = [
  // 4月
  { period: '4月', month: 4, day: 5, title: '鶏糞＋化成5-5-7を全畝にすき込み（サツマイモ畝除く、石灰不要）', category: 'fertilize' },
  { period: '4月', month: 4, day: 10, title: '①②③北側にジャガイモ種芋を植え付け（芽出し済み）', bedIds: [1, 2, 3], category: 'plant' },
  { period: '4月', month: 4, day: 12, title: '行灯用の肥料袋を準備', category: 'maintain' },

  // 5月上旬
  { period: '5月上旬', month: 5, day: 3, title: '⑤ナス定植＋ネギ添え植え（行灯設置）', bedIds: [5], category: 'plant' },
  { period: '5月上旬', month: 5, day: 3, title: '⑥ピーマン＋青唐辛子定植＋ネギ混植（行灯設置）', bedIds: [6], category: 'plant' },
  { period: '5月上旬', month: 5, day: 4, title: '⑦トマト定植＋バジル混植（行灯設置、雨よけアーチ設置）', bedIds: [7], category: 'plant' },
  { period: '5月上旬', month: 5, day: 4, title: '⑩ズッキーニ定植（行灯設置）', bedIds: [10], category: 'plant' },

  // 5月中旬
  { period: '5月中旬', month: 5, day: 15, title: '⑬とうもろこし直播き（2条）', bedIds: [13], category: 'plant' },
  { period: '5月中旬', month: 5, day: 15, title: '⑧枝豆①直播き（べたがけ設置）', bedIds: [8], category: 'plant' },
  { period: '5月中旬', month: 5, day: 17, title: '①②③南側にかぼちゃ・ゆうがお定植（ネギ10本で囲む）', bedIds: [1, 2, 3], category: 'plant' },
  { period: '5月中旬', month: 5, day: 20, title: '全畝の行灯を撤去（定植2週間後）', category: 'maintain' },

  // 6月上旬
  { period: '6月上旬', month: 6, day: 5, title: '④サツマイモつる挿し（高畝マルチ済み）', bedIds: [4], category: 'plant' },
  { period: '6月上旬', month: 6, day: 5, title: '⑨オクラ定植（黒マルチ）', bedIds: [9], category: 'plant' },
  { period: '6月上旬', month: 6, day: 8, title: '⑧枝豆②播き', bedIds: [8], category: 'plant' },
  { period: '6月上旬', month: 6, day: 10, title: '⑪ネギ本畝に干しネギ苗植え付け', bedIds: [11], category: 'plant' },

  // 6月下旬
  { period: '6月下旬', month: 6, day: 25, title: '⑧枝豆③播き', bedIds: [8], category: 'plant' },
  { period: '6月下旬', month: 6, day: 26, title: '⑬とうもろこしにアディオン2,000倍散布（アワノメイガ対策）', bedIds: [13], category: 'pest' },
  { period: '6月下旬', month: 6, day: 28, title: '⑤⑥⑦にN30追肥（1回目）', bedIds: [5, 6, 7], category: 'fertilize' },

  // 7月
  { period: '7月', month: 7, day: 5, title: '①②③北側ジャガイモ収穫', bedIds: [1, 2, 3], category: 'harvest' },
  { period: '7月', month: 7, day: 15, title: '⑤⑥⑦にN30追肥（2回目）', bedIds: [5, 6, 7], category: 'fertilize' },
  { period: '7月', month: 7, day: 25, title: '⑤ナス更新剪定（枝を半分に切り戻し→秋ナスへ）', bedIds: [5], category: 'maintain' },
  { period: '7月', month: 7, day: 28, title: '⑬とうもろこし収穫', bedIds: [13], category: 'harvest' },
  { period: '7月', month: 7, day: 20, title: '全畝にモスピラン2,000倍（アブラムシ対策、必要に応じて）', category: 'pest' },

  // 8月
  { period: '8月', month: 8, day: 5, title: '⑧枝豆①②順次収穫', bedIds: [8], category: 'harvest' },
  { period: '8月', month: 8, day: 10, title: '⑤⑥⑦⑨⑩ 収穫最盛期', bedIds: [5, 6, 7, 9, 10], category: 'harvest' },
  { period: '8月', month: 8, day: 15, title: '⑪ネギ土寄せ（1回目）', bedIds: [11], category: 'maintain' },
  { period: '8月', month: 8, day: 20, title: '①②③南かぼちゃ着果制限（1株3-4果）', bedIds: [1, 2, 3], category: 'maintain' },

  // 9月
  { period: '9月', month: 9, day: 5, title: '⑧枝豆③収穫', bedIds: [8], category: 'harvest' },
  { period: '9月', month: 9, day: 10, title: '⑪ネギ土寄せ（2回目）', bedIds: [11], category: 'maintain' },
  { period: '9月', month: 9, day: 15, title: '①②③南かぼちゃ・ゆうがお収穫', bedIds: [1, 2, 3], category: 'harvest' },
  { period: '9月', month: 9, day: 25, title: '①②③北側ジャガイモ跡地に秋用堆肥すき込み', bedIds: [1, 2, 3], category: 'fertilize' },

  // 10月
  { period: '10月', month: 10, day: 5, title: '④サツマイモ収穫', bedIds: [4], category: 'harvest' },
  { period: '10月', month: 10, day: 10, title: '①②③北側にタマネギ畝準備（鶏糞＋5-5-7＋穴あきマルチ）', bedIds: [1, 2, 3], category: 'fertilize' },
  { period: '10月', month: 10, day: 15, title: '⑪ネギ土寄せ（3回目）', bedIds: [11], category: 'maintain' },

  // 10-11月
  { period: '10-11月', month: 11, day: 5, title: 'タマネギ苗200本定植（①②③北側＋⑫予備畝）', bedIds: [1, 2, 3, 12], category: 'plant' },
  { period: '10-11月', month: 11, day: 10, title: '⑪ネギ土寄せ（4回目）', bedIds: [11], category: 'maintain' },

  // 11月-翌2月
  { period: '11月-翌2月', month: 11, day: 25, title: '⑪ネギ収穫（霜で甘みが増す）', bedIds: [11], category: 'harvest' },
  { period: '11月-翌2月', month: 12, day: 15, title: 'タマネギ越冬管理', bedIds: [1, 2, 3, 12], category: 'maintain' },

  // 翌5-6月
  { period: '翌5-6月', month: 5, day: 25, title: 'タマネギ収穫', bedIds: [1, 2, 3, 12], category: 'harvest' },
  { period: '翌5-6月', month: 6, day: 1, title: '次シーズンの畝計画開始', category: 'maintain' },
];

export function buildSchedule(year: number = new Date().getFullYear()): ScheduleTask[] {
  return PRESETS.map((p, i): ScheduleTask => {
    const m = p.month;
    const d = p.day ?? 1;
    const dueDate = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return {
      id: `preset-${i}`,
      period: p.period,
      month: p.month,
      dueDate,
      title: p.title,
      bedIds: p.bedIds,
      category: p.category,
      preset: true,
    };
  });
}

export const categoryEmoji: Record<NonNullable<ScheduleTask['category']>, string> = {
  plant: '🌱',
  fertilize: '💩',
  harvest: '🧺',
  pest: '🛡️',
  maintain: '🛠️',
};
