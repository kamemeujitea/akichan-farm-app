import type { BudgetCategory } from '@/types';

export const BUDGET_TOTAL = 30030;
export const BUDGET_SPRING = 21280;
export const BUDGET_AUTUMN = 5750;
export const BUDGET_RESERVE = 3000;

export const budgetCategories: BudgetCategory[] = [
  {
    id: 'fertilizer',
    icon: '🧪',
    title: '肥料',
    desc: '鶏糞＋化成5-5-7＋N30',
    season: '春夏',
    total: 3600,
    items: [
      { name: 'ふじみ鶏糞 15kg', qty: '5袋', price: 750 },
      { name: '化成 5-5-7（青）20kg', qty: '1袋', price: 1800 },
      { name: 'N30 追肥用 10kg', qty: '1袋', price: 750 },
      { name: '過リン酸石灰 1kg', qty: '1袋', price: 300 },
    ],
    note: '💡 鶏糞はJA直売で15kg=100〜150円。石灰不要。',
  },
  {
    id: 'seedlings',
    icon: '🌱',
    title: '苗（果菜類）',
    desc: 'トマト・ナス接ぎ木 他は実生',
    season: '春夏',
    total: 7580,
    items: [
      { name: 'トマト苗（接ぎ木）', qty: '15株', price: 3000 },
      { name: 'ナス苗（接ぎ木）', qty: '10株', price: 2000 },
      { name: 'ピーマン苗', qty: '6株', price: 360 },
      { name: '青唐辛子苗', qty: '4株', price: 240 },
      { name: 'ズッキーニ苗', qty: '8株', price: 960 },
      { name: 'かぼちゃ苗', qty: '4株', price: 400 },
      { name: 'ゆうがお苗', qty: '3株', price: 300 },
      { name: 'バジル苗', qty: '4株', price: 320 },
    ],
  },
  {
    id: 'seeds',
    icon: '🥔',
    title: '種芋・種・つる苗',
    desc: 'ジャガ・枝豆・オクラ・サツマイモ・ネギ・とうもろこし',
    season: '春夏',
    total: 4100,
    items: [
      { name: 'ジャガイモ種芋 3品種', qty: '5kg', price: 2000 },
      { name: 'とうもろこしの種', qty: '1袋', price: 350 },
      { name: '枝豆の種', qty: '2袋', price: 600 },
      { name: 'オクラの種', qty: '1袋', price: 200 },
      { name: 'サツマイモつる苗', qty: '45本', price: 1350 },
      { name: 'ネギ苗（干しネギ80本）', qty: '1束', price: 600 },
    ],
  },
  {
    id: 'mulch',
    icon: '🔧',
    title: 'マルチ・支柱・農薬',
    desc: '黒マルチ・支柱・雨よけ・農薬',
    season: '春夏',
    total: 6000,
    items: [
      { name: '黒マルチ 95cm×50m', qty: '1巻', price: 1000 },
      { name: '支柱 2m', qty: '10本', price: 1200 },
      { name: 'トマト雨よけセット', qty: '1式', price: 2000 },
      { name: 'モスピラン', qty: '1本', price: 800 },
      { name: 'アディオン', qty: '1本', price: 800 },
      { name: '麻ひも・クリップ等', qty: '一式', price: 200 },
    ],
    note: '💡 支柱・雨よけは初年度投資（翌年使い回し）。農薬は印鑑持参。',
  },
  {
    id: 'autumn',
    icon: '🧄',
    title: '秋冬タマネギ＋マルチ',
    desc: 'タマネギ苗・秋用肥料・マルチ追加',
    season: '秋冬',
    total: 5750,
    items: [
      { name: 'タマネギ苗（O.K.黄等）', qty: '200本', price: 2000 },
      { name: '秋用 鶏糞 15kg', qty: '3袋', price: 450 },
      { name: '秋用 化成5-5-7', qty: '10kg', price: 1000 },
      { name: '黒マルチ追加', qty: '1巻', price: 1000 },
      { name: '穴あきマルチ（タマネギ用）', qty: '1巻', price: 1300 },
    ],
  },
  {
    id: 'reserve',
    icon: '📦',
    title: '予備費・消耗品',
    desc: 'べたがけ・pH測定器・予備種',
    season: '通年',
    total: 3000,
    items: [
      { name: 'べたがけ資材（不織布）', qty: '1巻', price: 800 },
      { name: '簡易pH測定器', qty: '1個', price: 1000 },
      { name: '予備の種・補植苗', qty: '一式', price: 700 },
      { name: 'その他消耗品', qty: '一式', price: 500 },
    ],
    note: '💡 pH測定器・べたがけは来年以降も使える。',
  },
];

export const budgetOutlook = `支柱・雨よけ・pH測定器（約¥3,200）は初年度投資で翌年不要。マルチも一部再利用可。農薬は余りを持ち越せる。2年目以降のランニングコストは年間約¥20,000〜22,000まで下がる見込みです。`;
