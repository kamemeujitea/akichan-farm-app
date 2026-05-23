import type { Bed, Farm, CropCategory } from '@/types';

export const farm: Farm = {
  name: 'あきちゃんファーム',
  location: '長野県松本市内田',
  width_ew: 15,
  length_ns: 17,
  soil_ph: 7.0,
  beds: 13,
};

// HTMLの凡例と一致するカテゴリ色
export const categoryColors: Record<CropCategory, { bg: string; text: string; label: string }> = {
  gourd: { bg: '#e8d8a0', text: '#3B2B12', label: 'ウリ' },
  potato: { bg: '#f0dca0', text: '#3B2B12', label: '芋' },
  summer: { bg: '#e0f0c8', text: '#2B3B12', label: '夏野菜' },
  bean: { bg: '#c8eac8', text: '#1F3B1F', label: '豆' },
  onion: { bg: '#d0e8d0', text: '#1F3B1F', label: 'ネギ' },
  corn: { bg: '#f8f0a0', text: '#3B3000', label: '🌽' },
  fallow: { bg: '#e0dcd0', text: '#999', label: '休閑' },
};

export const cropEmoji = (crop: string): string => {
  if (crop.includes('ジャガイモ') || crop.includes('じゃがいも')) return '🥔';
  if (crop.includes('かぼちゃ')) return '🎃';
  if (crop.includes('ゆうがお')) return '🎃';
  if (crop.includes('サツマイモ') || crop.includes('さつまいも')) return '🍠';
  if (crop.includes('ナス') || crop.includes('なす')) return '🍆';
  if (crop.includes('ピーマン') || crop.includes('唐辛子')) return '🫑';
  if (crop.includes('トマト') || crop.includes('バジル')) return '🍅';
  if (crop.includes('枝豆')) return '🫛';
  if (crop.includes('オクラ')) return '🌿';
  if (crop.includes('ズッキーニ')) return '🥒';
  if (crop.includes('タマネギ') || crop.includes('たまねぎ')) return '🧄';
  if (crop.includes('ネギ') || crop.includes('ねぎ')) return '🧅';
  if (crop.includes('とうもろこし') || crop.includes('コーン')) return '🌽';
  return '🌱';
};

const label = (n: number): string => '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬'[n - 1] ?? `${n}`;

export const beds: Bed[] = [
  {
    id: 1,
    position: 'west-1',
    label: label(1),
    split: true,
    north: {
      crop: 'ジャガイモ①',
      emoji: '🥔',
      variety: '男爵',
      plants: '40-45株',
      plant_date: '4月中旬',
      harvest_date: '7月上旬',
      autumn_use: '秋タマネギ転用',
      fertilizer: '鶏糞200g/㎡ + 化成5-5-7 80g/㎡（石灰なし）',
      category: 'potato',
      detail: '畝北半分。40-45株。4月→7月。石灰不要(pH7)。収穫後→秋タマネギ転用。',
      compTip: '⚠ ④サツマイモ緩衝帯で⑦トマトと距離確保。',
      hint: '💡 芽かき2本＋土寄せ2回。',
    },
    south: {
      crop: 'かぼちゃ',
      emoji: '🎃',
      plants: '2株',
      plant_date: '5月中旬',
      harvest_date: '8-9月',
      note: '林側。ツル南方向に展開。ネギ10本囲み',
      category: 'gourd',
      detail: '①南かぼちゃ2株。林側（🌲）。ツル南方向に展開。鶏糞200g/㎡＋5-5-7控えめ60g/㎡。',
      compTip: '⚠ ⑩ズッキーニとは畑の反対側。林の影OK（耐陰性高い）。',
      hint: '💡 7月ジャガ収穫後に北側へもツル展開。1株3-4果制限。',
    },
    autumnNorth: {
      crop: '秋タマネギ',
      emoji: '🧅',
      plants: '約65本',
      plant_date: '10-11月',
      harvest_date: '翌5-6月',
      fertilizer: '鶏糞＋5-5-7＋穴あきマルチ',
      category: 'onion',
      detail: 'ジャガイモ①収穫後→秋タマネギ転用。穴あきマルチ。',
      compTip: '🤝 枝豆後作の残留窒素を活用。',
      hint: '💡 O.K.黄・ネオアース等。越冬管理。',
    },
  },
  {
    id: 2,
    position: 'west-2',
    label: label(2),
    split: true,
    north: {
      crop: 'ジャガイモ②',
      emoji: '🥔',
      variety: 'きたあかり',
      plants: '40-45株',
      plant_date: '4月中旬',
      harvest_date: '7月上旬',
      autumn_use: '秋ネギ転用',
      category: 'potato',
      detail: '①と同管理。品種はきたあかり。収穫後→秋ネギ転用。',
      compTip: '⚠ 距離確保済み。',
      hint: '💡 品種違いで用途を広げる。',
    },
    south: {
      crop: 'ゆうがお',
      emoji: '🎃',
      plants: '2-3株',
      plant_date: '5月中旬',
      harvest_date: '8-9月',
      note: '林側。ツル南方向に展開',
      category: 'gourd',
      detail: '②南ゆうがお2-3株。林側。ツル南展開。',
      compTip: '🤝 ウリ科3種は離配置。',
      hint: '💡 人工授粉で着果安定。',
    },
    autumnNorth: {
      crop: '秋ネギ',
      emoji: '🧅',
      plants: '30-40本',
      plant_date: '10月',
      harvest_date: '翌1-3月',
      category: 'onion',
      detail: 'ジャガイモ②収穫後→秋ネギ転用。溝植え。',
      hint: '💡 土寄せ2回で白い部分を伸ばす。',
    },
  },
  {
    id: 3,
    position: 'west-3',
    label: label(3),
    split: true,
    north: {
      crop: 'ジャガイモ③',
      emoji: '🥔',
      variety: '予備/メークイン',
      plants: '40-45株',
      plant_date: '4月中旬',
      harvest_date: '7月上旬',
      autumn_use: '秋タマネギ転用',
      category: 'potato',
      detail: '3畝計120-135株。収穫後→秋タマネギ。',
      compTip: '⚠ 多収穫→保存計画を。',
      hint: '💡 メークイン等も可。',
    },
    south: {
      crop: 'かぼちゃ',
      emoji: '🎃',
      plants: '1-2株',
      plant_date: '5月中旬',
      harvest_date: '8-9月',
      note: 'ネギ囲み',
      category: 'gourd',
      detail: '③南かぼちゃ1-2株。ネギ10本囲みでウリハムシ対策。',
      compTip: '🤝 ネギでウリハムシ忌避。',
      hint: '💡 着果後追肥。',
    },
    autumnNorth: {
      crop: '秋タマネギ',
      emoji: '🧅',
      plants: '約65本',
      plant_date: '10-11月',
      harvest_date: '翌5-6月',
      fertilizer: '鶏糞＋5-5-7＋穴あきマルチ',
      category: 'onion',
      detail: 'ジャガイモ③収穫後→秋タマネギ転用。①と同管理。',
      hint: '💡 穴あきマルチ使用。',
    },
  },
  {
    id: 4,
    position: 'center-1',
    label: label(4),
    split: false,
    main: {
      crop: 'サツマイモ（4品種）',
      emoji: '🍠',
      plants: '10本×4品種=40本',
      plant_date: '6月上旬',
      harvest_date: '10月',
      fertilizer: 'なし（地力のみ）',
      variety: '安納芋・紅はるか・紅あずま 他1種',
      note: '高畝マルチ。ナス科の緩衝帯',
      companion: '緩衝帯として機能',
      category: 'potato',
      detail: '高畝マルチ・10本×4品種=40本。6月→10月。肥料なし（地力のみ）。安納芋・紅はるか・紅あずま 他1種。',
      compTip: '🤝 ナス科の緩衝帯として機能。',
      hint: '💡 つるボケ注意。',
    },
  },
  {
    id: 5,
    position: 'center-2',
    label: label(5),
    split: false,
    main: {
      crop: 'ナス（4種）',
      emoji: '🍆',
      variety: '水ナス含む4品種',
      plants: '10-12株',
      plant_date: '5月上旬',
      harvest_date: '7-10月',
      fertilizer: '鶏糞300g/㎡ + 化成5-5-7 100g/㎡ + N30追肥',
      note: '7月下旬更新剪定→秋ナス',
      category: 'summer',
      detail: 'ナスのみ4種栽培。水ナス含む。ネギ添え植えなし。',
      compTip: '🤝 果菜類集中ゾーン。🤝 ⑪ネギ本畝から5-10本を株元に分配推奨（青枯病・萎凋病抑制）。',
      hint: '💡 7月下旬更新剪定→秋ナス。',
    },
  },
  {
    id: 6,
    position: 'center-3',
    label: label(6),
    split: false,
    main: {
      crop: 'ピーマン＋万願寺＋パプリカ',
      emoji: '🫑',
      plants: '10-13株',
      plant_date: '5月上旬',
      harvest_date: '7-10月',
      fertilizer: 'ナスに準ずる',
      companion: 'ネギ5本混植',
      category: 'summer',
      detail: 'ピーマン・万願寺とうがらし・パプリカの3種。10-13株。ネギ5本混植。',
      compTip: '🤝 果菜類中核。交雑は今年の実に影響なし。',
      hint: '💡 1番花は摘む。パプリカは色づくまで長いので早めに定植。',
    },
  },
  {
    id: 7,
    position: 'center-4',
    label: label(7),
    split: false,
    main: {
      crop: 'トマト＋バジル＋大葉',
      emoji: '🍅',
      plants: 'トマト12(大玉4+中玉4+ミニ4) バジル6 大葉2',
      plant_date: '5月上旬',
      harvest_date: '7-9月',
      fertilizer: '鶏糞200g/㎡ + 化成5-5-7 80g/㎡ + N30追肥',
      companion: 'バジル＋大葉混植（害虫忌避＋糖度UP）',
      note: '雨よけアーチ必須。大玉+中玉+ミニ各4株',
      category: 'summer',
      detail: 'トマト12株（大玉4+中玉4+ミニ4）＋バジル6株＋大葉2株。雨よけ必須。追肥N30。',
      compTip: '🤝 バジル＋大葉（シソ科）がアブラムシ忌避＋トマトの糖度UP。',
      hint: '💡 行灯2週間。',
    },
  },
  {
    id: 8,
    position: 'center-5',
    label: label(8),
    split: false,
    main: {
      crop: '枝豆＋オクラ＋ゴーヤ＋キュウリ',
      emoji: '🫛',
      plants: '枝豆4 オクラ2 ゴーヤ2 キュウリ2',
      plant_date: '5月中旬〜6月上旬',
      harvest_date: '7月〜9月',
      fertilizer: '鶏糞少量 + 過リン酸石灰50g/㎡',
      companion: '枝豆の窒素固定が全作物を助ける',
      category: 'bean',
      detail: '混植畝。枝豆の窒素固定でオクラ・ゴーヤ・キュウリを促進。ゴーヤ・キュウリはネット仕立て。',
      compTip: '🤝 枝豆の窒素固定がウリ科と共生。ゴーヤ・キュウリはかぼちゃ①②③と距離確保済み。',
      hint: '💡 ゴーヤ・キュウリはネット必須。オクラは7-8cmで早穫り。',
    },
  },
  {
    id: 9,
    position: 'center-6',
    label: label(9),
    split: false,
    main: {
      crop: '予備畝',
      emoji: '🌱',
      category: 'fallow',
      detail: '追加苗や秋冬用に確保。⑧ゴーヤ・キュウリと⑩ズッキーニの間の緩衝帯。',
    },
  },
  {
    id: 10,
    position: 'center-7',
    label: label(10),
    split: false,
    main: {
      crop: 'ズッキーニ＋葉物＋明日葉',
      emoji: '🥒',
      plants: 'ズッキーニ4 サラダ菜2 サンチュ2 明日葉2',
      plant_date: '5月上旬〜6月上旬',
      harvest_date: '6月〜9月',
      category: 'summer',
      detail: '混植畝。ズッキーニの大きな葉が葉物に適度な日陰を提供。',
      compTip: '🤝 ズッキーニはかぼちゃ①②③と畑の反対側（うどんこ病対策）。⑨予備畝で⑧ウリ科と緩衝。葉物は半日陰で徒長防止。',
      hint: '💡 ズッキーニは人工授粉。サラダ菜・サンチュは外葉から収穫で長期収穫。',
    },
  },
  {
    id: 11,
    position: 'east-1',
    label: label(11),
    split: false,
    main: {
      crop: '空き（6月ネギ定植予定）',
      emoji: '🕐',
      plants: '40-50本＋30本分配',
      plant_date: '6月上旬',
      harvest_date: '11月-翌2月',
      note: '本畝40-50本 + 他畝に30本分配。溝植え。土寄せ3-4回',
      category: 'fallow',
      detail: '現在空き。6月上旬に干しネギ苗80本を定植予定。',
      hint: '💡 ネギ苗は干しネギで6月に植え付け。それまでは空き畝。',
    },
    autumnMain: {
      crop: 'ネギ（越冬収穫）',
      emoji: '🧅',
      plants: '40-50本',
      harvest_date: '11月-翌2月',
      category: 'onion',
      detail: '霜が降りると甘みが増す。11月〜2月まで随時収穫。',
      hint: '💡 霜で甘みが増す。必要な分だけ掘り出す。',
    },
  },
  {
    id: 12,
    position: 'east-2',
    label: label(12),
    split: false,
    main: {
      crop: '予備（秋タマネギ用）',
      emoji: '🕐',
      plants: '200本',
      plant_date: '10-11月',
      harvest_date: '翌5-6月',
      note: '穴あきマルチ。O.K.黄・ネオアース等',
      category: 'fallow',
      detail: '現在予備。10-11月にタマネギ200本定植予定。穴あきマルチ。',
      hint: '💡 秋まで空き。緑肥や短期葉物の栽培も可能。',
    },
    autumnMain: {
      crop: '秋タマネギ（本畝）',
      emoji: '🧄',
      plants: '200本',
      plant_date: '10-11月',
      harvest_date: '翌5-6月',
      fertilizer: '鶏糞＋5-5-7',
      category: 'onion',
      detail: 'タマネギ200本定植。穴あきマルチ。O.K.黄・ネオアース等。',
      compTip: '🤝 枝豆後作に好相性（残留窒素活用）。',
      hint: '💡 越冬管理：霜対策、追肥は春先に。',
    },
  },
  {
    id: 13,
    position: 'east-3',
    label: label(13),
    split: true,
    north: {
      crop: 'とうもろこし',
      emoji: '🌽',
      plants: '12株',
      plant_date: '5月中旬',
      harvest_date: '7-8月',
      fertilizer: '鶏糞300g/㎡ + 化成5-5-7 100g/㎡',
      companion: '東端で風よけ。枝豆の窒素恩恵',
      note: '北半分のみ。アディオン2,000倍',
      category: 'corn',
      detail: '北半分に12株。5月中旬直播き→7-8月収穫。鶏糞300g/㎡＋5-5-7 100g/㎡。',
      compTip: '🤝 東風を遮り西側の果菜類を守る。⑧枝豆の窒素恩恵。',
      hint: '💡 アディオン2,000倍。2条ブロック植え必須。',
    },
    south: {
      crop: 'スイカ',
      emoji: '🍉',
      plants: '1株',
      plant_date: '5月下旬',
      harvest_date: '8月',
      category: 'gourd',
      detail: 'ウリ科。かぼちゃ①②③（西端）から最も離れた東端に配置。とうもろこしが風よけ。',
      compTip: '🤝 とうもろこしの風よけ効果。ウリ科と最大距離でうどんこ病リスク低減。',
      hint: '💡 ツルは南方向に展開。1株3-4果制限。朝9時までに人工授粉。',
    },
  },
];

export const fertilizerNotes = `肥料体系（地元農家からのアドバイス）:
- 堆肥: ふじみ鶏糞（窒素・リン酸豊富）
- 元肥: 化成肥料 5-5-7（青袋）※カリ高めで果菜類向き
- 追肥: N30（窒素30の速効性肥料）1株5-10g
- 消毒: アディオン 2,000倍（アワノメイガ→とうもろこし）
- 殺虫: モスピラン 2,000倍（アブラムシ→ナス・ピーマン・オクラ等）
- 石灰: 不要（pH7）
- 農薬購入時は印鑑が必要`;

export const companionNotes = `良い組み合わせ:
- トマト × バジル（アブラムシ忌避＋糖度UP）
- ナス × ネギ（青枯病・萎凋病抑制）
- ピーマン × ネギ（同上）
- 枝豆 × とうもろこし（窒素固定＋日陰の相互メリット）
- 枝豆 × オクラ（窒素固定がオクラを促進）
- ウリ科 × ネギボーダー（ウリハムシ忌避）
- 枝豆後作 → タマネギ（残留窒素活用）

注意:
- トマト × ジャガイモ（ナス科同士→④サツマイモで緩衝）
- ウリ科3種（かぼちゃ・ゆうがお・ズッキーニ→畑の両端に離す）
- ピーマン × 青唐辛子（交雑→今年の実には影響なし。自家採種しなければOK）
- ミント → 絶対にプランター隔離`;
