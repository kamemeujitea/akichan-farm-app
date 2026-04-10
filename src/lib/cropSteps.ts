// 各畝ごとの栽培ステップ（植える→間引き→追肥→土寄せ→収穫など）
// schedule.ts はカレンダー用のプリセットタスク、こちらは作物の栽培フロー

export type StepCategory =
  | 'soil'      // 土づくり・畝立て
  | 'plant'     // 植え付け・播種
  | 'thin'      // 間引き・芽かき
  | 'fertilize' // 追肥
  | 'hill'      // 土寄せ
  | 'prune'     // 剪定・誘引・整枝
  | 'pest'      // 防除・消毒
  | 'water'     // 水やり・灌水
  | 'harvest'   // 収穫
  | 'rotate';   // 秋冬転用

export interface CropStep {
  month: string;     // "4月中旬", "7月上旬" 等
  category: StepCategory;
  title: string;
  detail?: string;
}

export const stepMeta: Record<StepCategory, { emoji: string; label: string; color: string }> = {
  soil: { emoji: '🪨', label: '土づくり', color: '#8B7355' },
  plant: { emoji: '🌱', label: '植え付け', color: '#4A8C3F' },
  thin: { emoji: '✂️', label: '間引き', color: '#6B8E23' },
  fertilize: { emoji: '💩', label: '追肥', color: '#A0522D' },
  hill: { emoji: '⛰️', label: '土寄せ', color: '#B8860B' },
  prune: { emoji: '✂️', label: '剪定', color: '#556B2F' },
  pest: { emoji: '🛡️', label: '防除', color: '#CD5C5C' },
  water: { emoji: '💧', label: '水やり', color: '#4682B4' },
  harvest: { emoji: '🧺', label: '収穫', color: '#DAA520' },
  rotate: { emoji: '🔄', label: '転用', color: '#8B6914' },
};

// 畝ID → 栽培ステップ一覧（年間フロー）
export const cropStepsByBed: Record<number, CropStep[]> = {
  // ① ジャガイモ① + かぼちゃ
  1: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み', detail: '鶏糞200g/㎡ + 化成5-5-7 80g/㎡。石灰なし。' },
    { month: '4月中旬', category: 'plant', title: 'ジャガイモ①種芋植え付け（北側）', detail: '男爵40-45株。芽出し済み種芋。30cm間隔。' },
    { month: '4月下旬', category: 'thin', title: '芽かき（2本仕立て）', detail: '太い芽を2本残し、他は引き抜く。' },
    { month: '5月上旬', category: 'hill', title: '1回目の土寄せ', detail: '芽かき後すぐ。株元に5cmほど寄せる。' },
    { month: '5月中旬', category: 'plant', title: 'かぼちゃ定植（南側）', detail: '2株。ネギ10本囲み。行灯設置。' },
    { month: '5月下旬', category: 'hill', title: '2回目の土寄せ', detail: '花が咲き始めたら。しっかり寄せて緑化防止。' },
    { month: '7月上旬', category: 'harvest', title: 'ジャガイモ収穫（北側）', detail: '茎葉が黄変したら。晴天続きの日に掘り上げ。' },
    { month: '7月中旬', category: 'fertilize', title: 'かぼちゃ追肥', detail: '着果確認後、化成肥料を株元に。' },
    { month: '8月', category: 'prune', title: 'かぼちゃ着果制限', detail: '1株3-4果に制限。余分なツルを整理。' },
    { month: '8-9月', category: 'harvest', title: 'かぼちゃ収穫（南側）', detail: 'ヘタがコルク化したら収穫。' },
    { month: '9月', category: 'soil', title: '秋用堆肥すき込み（北側跡地）', detail: '鶏糞＋5-5-7で秋タマネギ準備。' },
    { month: '10月', category: 'soil', title: 'タマネギ畝準備', detail: '穴あきマルチ敷設。' },
    { month: '11月', category: 'rotate', title: '秋タマネギ定植', detail: '約65本。O.K.黄・ネオアース等。' },
  ],
  // ② ジャガイモ② + ゆうがお
  2: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み', detail: '鶏糞200g/㎡ + 化成5-5-7 80g/㎡。' },
    { month: '4月中旬', category: 'plant', title: 'ジャガイモ②種芋植え付け（北側）', detail: 'きたあかり40-45株。' },
    { month: '4月下旬', category: 'thin', title: '芽かき（2本仕立て）', detail: '太い芽を2本残す。' },
    { month: '5月上旬', category: 'hill', title: '1回目の土寄せ' },
    { month: '5月中旬', category: 'plant', title: 'ゆうがお定植（南側）', detail: '2-3株。林側。ツル南展開。' },
    { month: '5月下旬', category: 'hill', title: '2回目の土寄せ' },
    { month: '7月上旬', category: 'harvest', title: 'ジャガイモ収穫（北側）' },
    { month: '8-9月', category: 'harvest', title: 'ゆうがお収穫（南側）' },
    { month: '10月', category: 'rotate', title: '秋ネギ転用（北側）', detail: '溝植え。30-40本。' },
  ],
  // ③ ジャガイモ③ + かぼちゃ
  3: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み' },
    { month: '4月中旬', category: 'plant', title: 'ジャガイモ③種芋植え付け（北側）', detail: '予備/メークイン40-45株。' },
    { month: '4月下旬', category: 'thin', title: '芽かき（2本仕立て）' },
    { month: '5月上旬', category: 'hill', title: '1回目の土寄せ' },
    { month: '5月中旬', category: 'plant', title: 'かぼちゃ定植（南側）', detail: '1-2株。ネギ囲み。' },
    { month: '5月下旬', category: 'hill', title: '2回目の土寄せ' },
    { month: '7月上旬', category: 'harvest', title: 'ジャガイモ収穫（北側）' },
    { month: '8-9月', category: 'harvest', title: 'かぼちゃ収穫（南側）' },
    { month: '9月', category: 'soil', title: '秋用堆肥すき込み' },
    { month: '10月', category: 'soil', title: 'タマネギ畝準備', detail: '穴あきマルチ。' },
    { month: '11月', category: 'rotate', title: '秋タマネギ定植', detail: '約65本。' },
  ],
  // ④ サツマイモ
  4: [
    { month: '5月', category: 'soil', title: '高畝立て＋マルチ張り', detail: '肥料なし（地力のみ）。ナス科の緩衝帯。' },
    { month: '6月上旬', category: 'plant', title: 'つる苗挿し', detail: '40-45本。斜め挿しで活着率UP。' },
    { month: '7月', category: 'prune', title: 'つる返し', detail: 'つるが伸びたら持ち上げて戻す。不定根切断でつるボケ防止。' },
    { month: '8月', category: 'prune', title: 'つる返し（2回目）', detail: '月1回ペースで。' },
    { month: '10月', category: 'harvest', title: 'サツマイモ収穫', detail: '霜が降りる前に。晴天日に掘り上げ、2週間追熟。' },
  ],
  // ⑤ ナス＋ネギ
  5: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み', detail: '鶏糞300g/㎡ + 化成5-5-7 100g/㎡。' },
    { month: '5月上旬', category: 'plant', title: 'ナス定植＋ネギ添え植え', detail: '10-12株。ネギ10-15本。行灯設置。' },
    { month: '5月中旬', category: 'prune', title: '行灯撤去', detail: '定植2週間後。' },
    { month: '5月下旬', category: 'thin', title: 'わき芽かき（3本仕立て）', detail: '主枝＋1番花下の2本を残す。他のわき芽は摘む。' },
    { month: '6月', category: 'prune', title: '誘引・支柱立て', detail: '3本仕立ての枝をそれぞれ支柱に固定。' },
    { month: '6月下旬', category: 'fertilize', title: 'N30追肥（1回目）', detail: '1株5-10g。株元にばらまき。' },
    { month: '7月上旬', category: 'harvest', title: '収穫開始', detail: '1番果は早めに収穫（株の負担軽減）。' },
    { month: '7月中旬', category: 'fertilize', title: 'N30追肥（2回目）', detail: '2週間おきに継続。' },
    { month: '7月下旬', category: 'prune', title: '更新剪定', detail: '枝を半分に切り戻し。根切りも。→秋ナスへ。' },
    { month: '8月', category: 'fertilize', title: '更新剪定後の追肥', detail: '切り戻し後に元肥相当を。' },
    { month: '9-10月', category: 'harvest', title: '秋ナス収穫', detail: '更新剪定から約1ヶ月後に再び実がつく。' },
  ],
  // ⑥ ピーマン＋青唐辛子
  6: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み', detail: 'ナスに準ずる。' },
    { month: '5月上旬', category: 'plant', title: 'ピーマン＋青唐辛子定植', detail: '10-13株。ネギ5本混植。行灯設置。' },
    { month: '5月中旬', category: 'prune', title: '行灯撤去＋1番花摘み', detail: '1番花は摘んで株の成長優先。' },
    { month: '5月下旬', category: 'thin', title: 'わき芽整理', detail: '1番花の下のわき芽は摘む。上は放任でOK。' },
    { month: '6月下旬', category: 'fertilize', title: 'N30追肥（1回目）' },
    { month: '7月', category: 'harvest', title: '収穫開始', detail: '実が6-7cmになったら。こまめに収穫で成り疲れ防止。' },
    { month: '7月中旬', category: 'fertilize', title: 'N30追肥（2回目）' },
    { month: '8-10月', category: 'harvest', title: '収穫最盛期', detail: '2-3日おきに収穫。' },
  ],
  // ⑦ トマト＋バジル
  7: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み', detail: '鶏糞200g/㎡ + 化成5-5-7 80g/㎡。' },
    { month: '5月上旬', category: 'plant', title: 'トマト定植＋バジル混植', detail: '15-20株。行灯設置。雨よけアーチ設置。' },
    { month: '5月中旬', category: 'prune', title: '行灯撤去＋わき芽かき開始', detail: '主枝1本仕立て。わき芽は5cm以下で摘む。' },
    { month: '5月〜', category: 'prune', title: 'わき芽かき（毎週）', detail: '週1-2回チェック。全てのわき芽を摘む。' },
    { month: '6月', category: 'prune', title: '誘引＋下葉かき', detail: '支柱に紐で8の字結び。実の下の葉は除去。' },
    { month: '6月下旬', category: 'fertilize', title: 'N30追肥（1回目）', detail: '3段目の花が咲いたら。' },
    { month: '7月', category: 'harvest', title: '収穫開始', detail: '大玉は赤く色づいたら。ミニは房ごとOK。' },
    { month: '7月中旬', category: 'fertilize', title: 'N30追肥（2回目）' },
    { month: '7月下旬', category: 'prune', title: '摘心', detail: '6-7段目の花房の上で主枝を切る。' },
    { month: '7-9月', category: 'harvest', title: '収穫期', detail: '雨よけ下で管理。裂果注意。' },
  ],
  // ⑧ 枝豆①②③
  8: [
    { month: '5月中旬', category: 'plant', title: '枝豆①直播き', detail: '2条千鳥。べたがけ設置。3-4粒/穴。' },
    { month: '5月下旬', category: 'thin', title: '枝豆①間引き', detail: '本葉2枚で2本に間引き。' },
    { month: '6月上旬', category: 'plant', title: '枝豆②播き', detail: '時間差収穫のため2回目。' },
    { month: '6月中旬', category: 'thin', title: '枝豆②間引き' },
    { month: '6月中旬', category: 'hill', title: '枝豆①土寄せ', detail: '株元に土を寄せて倒伏防止。' },
    { month: '6月下旬', category: 'plant', title: '枝豆③播き', detail: '3回目。' },
    { month: '7月', category: 'hill', title: '枝豆②③土寄せ' },
    { month: '7月下旬', category: 'harvest', title: '枝豆①収穫', detail: '莢がふっくらしたら。株ごと引き抜き。' },
    { month: '8月', category: 'harvest', title: '枝豆②収穫' },
    { month: '9月上旬', category: 'harvest', title: '枝豆③収穫' },
  ],
  // ⑨ オクラ
  9: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み', detail: '鶏糞200g/㎡ + 化成5-5-7 80g/㎡。' },
    { month: '5月下旬', category: 'soil', title: '黒マルチ張り' },
    { month: '6月上旬', category: 'plant', title: 'オクラ定植', detail: '15-20株。松本は6月まで低温なので急がない。' },
    { month: '6月下旬', category: 'thin', title: '間引き（1本立て）', detail: '直播きの場合は本葉3枚で1本に。' },
    { month: '7月', category: 'harvest', title: '収穫開始', detail: '7-8cmで早穫り。大きくなると硬くなる。' },
    { month: '7月', category: 'prune', title: '下葉かき', detail: '収穫した実の下の葉は除去。風通しUP。' },
    { month: '7-8月', category: 'fertilize', title: '追肥（2週間おき）', detail: '生育旺盛なので定期的に。' },
    { month: '7-9月', category: 'harvest', title: '収穫最盛期', detail: '2日おきに収穫。取り遅れ注意。' },
  ],
  // ⑩ ズッキーニ
  10: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み' },
    { month: '5月上旬', category: 'plant', title: 'ズッキーニ定植', detail: '8-10株。株間80cm。行灯設置。' },
    { month: '5月中旬', category: 'prune', title: '行灯撤去' },
    { month: '6月', category: 'prune', title: '人工授粉', detail: '訪問日の朝に雄花を雌花にこすりつけ。' },
    { month: '6月〜', category: 'harvest', title: '収穫開始', detail: '20cm以下で収穫。大きくなりすぎ注意。' },
    { month: '7月', category: 'fertilize', title: '追肥', detail: '実が成り始めたら2-3週おきに。' },
    { month: '7月', category: 'prune', title: '古葉除去', detail: '下葉が枯れたら除去。うどんこ病予防。' },
    { month: '6-9月', category: 'harvest', title: '収穫期', detail: '2-3日おきにチェック。' },
  ],
  // ⑪ ネギ
  11: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み＋溝掘り', detail: '深さ20-30cmの溝を掘る。' },
    { month: '6月上旬', category: 'plant', title: '干しネギ苗植え付け', detail: '80本束。本畝40-50本 + 他畝に30本分配。溝底に立てかけ。' },
    { month: '7月', category: 'fertilize', title: '追肥＋軽く土寄せ', detail: '根付いたら化成肥料。溝の壁を少し崩す。' },
    { month: '8月', category: 'hill', title: '土寄せ（1回目）', detail: '葉の分岐部の下まで。白い部分を伸ばす。' },
    { month: '9月', category: 'hill', title: '土寄せ（2回目）', detail: '1回目から3-4週間後。' },
    { month: '9月', category: 'fertilize', title: '追肥', detail: '土寄せの都度、化成肥料を。' },
    { month: '10月', category: 'hill', title: '土寄せ（3回目）', detail: '葉の付け根ギリギリまで。' },
    { month: '10-11月', category: 'hill', title: '土寄せ（4回目・最終）', detail: '白い部分30cm以上が目標。' },
    { month: '11月〜翌2月', category: 'harvest', title: '収穫', detail: '霜で甘みが増す。必要な分だけ掘り出す。' },
  ],
  // ⑫ 予備→秋タマネギ
  12: [
    { month: '9月', category: 'soil', title: '畝準備・元肥', detail: '鶏糞＋化成5-5-7。苦土石灰不要（pH7）。' },
    { month: '10月', category: 'soil', title: '穴あきマルチ敷設', detail: 'タマネギ用の穴あきマルチ。' },
    { month: '10-11月', category: 'plant', title: 'タマネギ苗200本定植', detail: 'O.K.黄・ネオアース等。深植え注意。' },
    { month: '12月', category: 'water', title: '越冬管理', detail: '乾燥しすぎたら軽く灌水。霜柱で浮いた苗は押し戻す。' },
    { month: '翌3月', category: 'fertilize', title: '春の追肥', detail: '止め肥。3月上旬に化成肥料。それ以降は追肥しない。' },
    { month: '翌4月', category: 'prune', title: 'トウ立ち除去', detail: 'ネギ坊主が出たら早めに摘む。' },
    { month: '翌5-6月', category: 'harvest', title: 'タマネギ収穫', detail: '茎が倒れたら収穫適期。晴天日に抜いて乾燥。' },
  ],
  // ⑬ とうもろこし
  13: [
    { month: '4月上旬', category: 'soil', title: '元肥すき込み', detail: '鶏糞300g/㎡ + 化成5-5-7 100g/㎡。' },
    { month: '5月中旬', category: 'plant', title: '直播き', detail: '2条ブロック植え。30株。3粒/穴。' },
    { month: '5月下旬', category: 'thin', title: '間引き', detail: '本葉3枚で1本に間引き。' },
    { month: '6月', category: 'hill', title: '土寄せ', detail: '株元にしっかり土寄せ。倒伏防止。' },
    { month: '6月', category: 'fertilize', title: '追肥', detail: '草丈50cmで1回目。穂が出始めで2回目。' },
    { month: '6月下旬', category: 'pest', title: 'アディオン2,000倍散布', detail: 'アワノメイガ対策。雄穂が出始めに。' },
    { month: '7月', category: 'prune', title: 'ヤングコーン除去', detail: '1株1本に。上部の穂を残し下の穂は除去。' },
    { month: '7-8月', category: 'harvest', title: 'とうもろこし収穫', detail: 'ヒゲが茶色くなったら。早朝収穫が甘い。' },
  ],
};
