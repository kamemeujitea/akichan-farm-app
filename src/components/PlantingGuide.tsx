'use client';

/** 畝内の植え付けレイアウト図（混植・区画分け・ハイブリッド）
 *  植物の位置を丸いドットで視覚的に表示。
 *  60代の農家さんでも一目でわかるデザイン。
 */

/* ─── データ構造 ─── */

interface PlantPosition {
  emoji: string;
  label: string;
  count?: number;
}

interface BedSection {
  title: string;
  bg: string;
  style: 'interplant' | 'zone' | 'net';
  plants: PlantPosition[];
  spacing?: string;
  note?: string;
  heightRatio: number;
}

interface BedLayout {
  bedId: number;
  title: string;
  layoutStyle: '混植' | '区画分け' | 'ハイブリッド';
  styleNote: string;
  sections: BedSection[];
}

/* ─── レイアウトデータ ─── */

const layouts: BedLayout[] = [
  // ⑦ トマト＋バジル＋大葉
  {
    bedId: 7,
    title: 'トマト＋バジル＋大葉',
    layoutStyle: '混植',
    styleNote: 'トマトの株間にバジルを1株ずつ植える。大葉は畝の両端に。',
    sections: [
      {
        title: '大葉（北端）',
        bg: '#e8f5e9',
        style: 'interplant',
        plants: [{ emoji: '🌿', label: '大葉' }],
        heightRatio: 0.5,
      },
      {
        title: '大玉トマト＋バジル',
        bg: '#ffebee',
        style: 'interplant',
        plants: [
          { emoji: '🍅', label: '大玉', count: 4 },
          { emoji: '🌿', label: 'バジル', count: 3 },
        ],
        spacing: '株間50cm',
        heightRatio: 2,
      },
      {
        title: '中玉トマト＋バジル',
        bg: '#fff3e0',
        style: 'interplant',
        plants: [
          { emoji: '🍅', label: '中玉', count: 4 },
          { emoji: '🌿', label: 'バジル', count: 3 },
        ],
        spacing: '株間50cm',
        heightRatio: 2,
      },
      {
        title: 'ミニトマト',
        bg: '#fce4ec',
        style: 'interplant',
        plants: [{ emoji: '🍅', label: 'ミニトマト', count: 4 }],
        heightRatio: 1,
      },
      {
        title: '大葉（南端）',
        bg: '#e8f5e9',
        style: 'interplant',
        plants: [{ emoji: '🌿', label: '大葉' }],
        heightRatio: 0.5,
      },
    ],
  },
  // ⑧ 枝豆＋オクラ＋ゴーヤ＋キュウリ
  {
    bedId: 8,
    title: '枝豆＋オクラ＋ゴーヤ＋キュウリ',
    layoutStyle: '区画分け',
    styleNote: '北から背の低い順に配置。ゴーヤ・キュウリはネットを共有。',
    sections: [
      {
        title: '枝豆ゾーン',
        bg: '#e8f5e9',
        style: 'zone',
        plants: [{ emoji: '🫛', label: '枝豆', count: 4 }],
        spacing: '30cm間隔・2条',
        heightRatio: 1.5,
      },
      {
        title: 'オクラゾーン',
        bg: '#f1f8e9',
        style: 'zone',
        plants: [{ emoji: '🌿', label: 'オクラ', count: 2 }],
        spacing: '40cm間隔',
        heightRatio: 1,
      },
      {
        title: 'ネット仕立てゾーン',
        bg: '#e3f2fd',
        style: 'net',
        plants: [
          { emoji: '🥒', label: 'キュウリ', count: 2 },
          { emoji: '🫘', label: 'ゴーヤ', count: 2 },
        ],
        note: 'ネット共有',
        heightRatio: 2,
      },
    ],
  },
  // ⑩ ズッキーニ＋葉物＋明日葉
  {
    bedId: 10,
    title: 'ズッキーニ＋葉物＋明日葉',
    layoutStyle: 'ハイブリッド',
    styleNote: 'ズッキーニの株間(80cm)にサラダ菜・サンチュを混植。明日葉は南端に区画分け。',
    sections: [
      {
        title: 'ズッキーニ＋葉物（混植）',
        bg: '#f1f8e9',
        style: 'interplant',
        plants: [
          { emoji: '🥒', label: 'ズッキーニ', count: 4 },
          { emoji: '🥬', label: 'サラダ菜', count: 2 },
          { emoji: '🥬', label: 'サンチュ', count: 2 },
        ],
        spacing: '株間80cm',
        heightRatio: 3,
      },
      {
        title: '明日葉（独立区画）',
        bg: '#e8f5e9',
        style: 'zone',
        plants: [{ emoji: '🌿', label: '明日葉', count: 2 }],
        note: '半日陰OK',
        heightRatio: 1,
      },
    ],
  },
];

/* ─── 植物ドット ─── */

function PlantDot({ emoji, label, borderColor }: { emoji: string; label: string; borderColor: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-11 h-11 rounded-full border-2 flex items-center justify-center text-lg shrink-0"
        style={{ background: '#fff', borderColor }}
      >
        {emoji}
      </div>
      <span className="text-xs font-medium text-gray-700 leading-tight text-center">
        {label}
      </span>
    </div>
  );
}

/* ─── 区画の仕切り線 ─── */

function ZoneDivider() {
  return (
    <div className="border-t-[3px] border-[#8B7355] relative my-0">
      <span className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] text-[#8B7355] font-bold">
        区画
      </span>
    </div>
  );
}

/* ─── ⑦ トマト混植レイアウト ─── */

function Bed7Layout() {
  const tomato = '#E53E3E';
  const herb = '#38A169';

  return (
    <>
      {/* 大葉 北端 */}
      <div className="px-3 py-2" style={{ backgroundColor: '#e8f5e9' }}>
        <div className="flex justify-center">
          <PlantDot emoji="🌿" label="大葉" borderColor={herb} />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-[#8B7355]/30" />

      {/* 大玉トマト＋バジル */}
      <div className="px-3 py-3" style={{ backgroundColor: '#ffebee' }}>
        <div className="text-xs font-bold text-gray-600 mb-2">大玉トマト＋バジル</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <PlantDot emoji="🍅" label="大玉" borderColor={tomato} />
          <PlantDot emoji="🌿" label="バジル" borderColor={herb} />
          <PlantDot emoji="🍅" label="大玉" borderColor={tomato} />
          <PlantDot emoji="🌿" label="バジル" borderColor={herb} />
          <PlantDot emoji="🍅" label="大玉" borderColor={tomato} />
          <PlantDot emoji="🌿" label="バジル" borderColor={herb} />
          <PlantDot emoji="🍅" label="大玉" borderColor={tomato} />
          <div className="flex items-center justify-center">
            <span className="text-xs text-gray-500">株間50cm</span>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-[#8B7355]/30" />

      {/* 中玉トマト＋バジル */}
      <div className="px-3 py-3" style={{ backgroundColor: '#fff3e0' }}>
        <div className="text-xs font-bold text-gray-600 mb-2">中玉トマト＋バジル</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <PlantDot emoji="🍅" label="中玉" borderColor={tomato} />
          <PlantDot emoji="🌿" label="バジル" borderColor={herb} />
          <PlantDot emoji="🍅" label="中玉" borderColor={tomato} />
          <PlantDot emoji="🌿" label="バジル" borderColor={herb} />
          <PlantDot emoji="🍅" label="中玉" borderColor={tomato} />
          <PlantDot emoji="🌿" label="バジル" borderColor={herb} />
          <PlantDot emoji="🍅" label="中玉" borderColor={tomato} />
          <div />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-[#8B7355]/30" />

      {/* ミニトマト */}
      <div className="px-3 py-3" style={{ backgroundColor: '#fce4ec' }}>
        <div className="text-xs font-bold text-gray-600 mb-2">ミニトマト</div>
        <div className="grid grid-cols-4 gap-2">
          <PlantDot emoji="🍅" label="ミニ" borderColor={tomato} />
          <PlantDot emoji="🍅" label="ミニ" borderColor={tomato} />
          <PlantDot emoji="🍅" label="ミニ" borderColor={tomato} />
          <PlantDot emoji="🍅" label="ミニ" borderColor={tomato} />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-[#8B7355]/30" />

      {/* 大葉 南端 */}
      <div className="px-3 py-2" style={{ backgroundColor: '#e8f5e9' }}>
        <div className="flex justify-center">
          <PlantDot emoji="🌿" label="大葉" borderColor={herb} />
        </div>
      </div>
    </>
  );
}

/* ─── ⑧ 区画分けレイアウト ─── */

function Bed8Layout() {
  const bean = '#2F855A';
  const okra = '#68D391';
  const net = '#3182CE';

  return (
    <>
      {/* 枝豆ゾーン */}
      <div className="px-3 py-3" style={{ backgroundColor: '#e8f5e9' }}>
        <div className="text-xs font-bold text-gray-600 mb-1">枝豆ゾーン</div>
        <div className="text-[11px] text-gray-500 mb-2">30cm間隔・2条（2列）配置</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <PlantDot emoji="🫛" label="枝豆" borderColor={bean} />
          <PlantDot emoji="🫛" label="枝豆" borderColor={bean} />
          <PlantDot emoji="🫛" label="枝豆" borderColor={bean} />
          <PlantDot emoji="🫛" label="枝豆" borderColor={bean} />
        </div>
      </div>

      <ZoneDivider />

      {/* オクラゾーン */}
      <div className="px-3 py-3" style={{ backgroundColor: '#f1f8e9' }}>
        <div className="text-xs font-bold text-gray-600 mb-1">オクラゾーン</div>
        <div className="text-[11px] text-gray-500 mb-2">40cm間隔</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <PlantDot emoji="🌿" label="オクラ" borderColor={okra} />
          <PlantDot emoji="🌿" label="オクラ" borderColor={okra} />
        </div>
      </div>

      <ZoneDivider />

      {/* ネット仕立てゾーン */}
      <div className="px-3 py-3" style={{ backgroundColor: '#e3f2fd' }}>
        <div className="text-xs font-bold text-gray-600 mb-2">ネット仕立てゾーン</div>
        <div className="border-2 border-dashed border-blue-300 rounded-lg px-3 py-3 bg-white/50">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
            <PlantDot emoji="🥒" label="キュウリ" borderColor={net} />
            <PlantDot emoji="🥒" label="キュウリ" borderColor={net} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <PlantDot emoji="🫘" label="ゴーヤ" borderColor={net} />
            <PlantDot emoji="🫘" label="ゴーヤ" borderColor={net} />
          </div>
        </div>
        <div className="text-[11px] text-gray-500 mt-1.5 text-center">
          ↕ ネット共有
        </div>
      </div>
    </>
  );
}

/* ─── ⑩ ハイブリッドレイアウト ─── */

function Bed10Layout() {
  const zucchini = '#2F855A';
  const leafy = '#68D391';
  const ashitaba = '#276749';

  return (
    <>
      {/* ズッキーニ＋葉物 混植 */}
      <div className="px-3 py-3" style={{ backgroundColor: '#f1f8e9' }}>
        <div className="text-xs font-bold text-gray-600 mb-2">ズッキーニ＋葉物（混植）</div>
        <div className="flex flex-col items-center gap-1">
          {/* ズッキーニ 1 */}
          <PlantDot emoji="🥒" label="ズッキーニ" borderColor={zucchini} />
          <span className="text-[11px] text-gray-400">↕ 80cm</span>

          {/* サラダ菜 + サンチュ (混植) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <PlantDot emoji="🥬" label="サラダ菜" borderColor={leafy} />
            <PlantDot emoji="🥬" label="サンチュ" borderColor={leafy} />
          </div>
          <span className="text-[10px] text-gray-400">(混植)</span>
          <span className="text-[11px] text-gray-400">↕ 80cm</span>

          {/* ズッキーニ 2 */}
          <PlantDot emoji="🥒" label="ズッキーニ" borderColor={zucchini} />
          <span className="text-[11px] text-gray-400">↕ 80cm</span>

          {/* サラダ菜 + サンチュ (混植) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <PlantDot emoji="🥬" label="サラダ菜" borderColor={leafy} />
            <PlantDot emoji="🥬" label="サンチュ" borderColor={leafy} />
          </div>
          <span className="text-[10px] text-gray-400">(混植)</span>
          <span className="text-[11px] text-gray-400">↕ 80cm</span>

          {/* ズッキーニ 3 */}
          <PlantDot emoji="🥒" label="ズッキーニ" borderColor={zucchini} />
          <span className="text-[11px] text-gray-400">↕ 80cm</span>

          {/* ズッキーニ 4 */}
          <PlantDot emoji="🥒" label="ズッキーニ" borderColor={zucchini} />
        </div>
      </div>

      <ZoneDivider />

      {/* 明日葉 独立区画 */}
      <div className="px-3 py-3" style={{ backgroundColor: '#e8f5e9' }}>
        <div className="text-xs font-bold text-gray-600 mb-1">明日葉（独立区画）</div>
        <div className="text-[11px] text-gray-500 mb-2">半日陰OK</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <PlantDot emoji="🌿" label="明日葉" borderColor={ashitaba} />
          <PlantDot emoji="🌿" label="明日葉" borderColor={ashitaba} />
        </div>
      </div>
    </>
  );
}

/* ─── メインコンポーネント ─── */

export default function PlantingGuide({ bedId }: { bedId: number }) {
  const layout = layouts.find((l) => l.bedId === bedId);
  if (!layout) return null;

  const styleBadgeColor: Record<string, string> = {
    '混植': 'bg-green-100 text-green-800 border-green-300',
    '区画分け': 'bg-blue-100 text-blue-800 border-blue-300',
    'ハイブリッド': 'bg-amber-100 text-amber-800 border-amber-300',
  };

  return (
    <div className="w-full">
      {/* ヘッダー：植え方スタイル */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${styleBadgeColor[layout.layoutStyle]}`}
        >
          {layout.layoutStyle}
        </span>
        <span className="text-sm text-soilLight">{layout.title}</span>
      </div>

      {/* 畝ダイアグラム */}
      <div className="border-2 border-[#8B7355] rounded-xl overflow-hidden">
        {/* 北ラベル */}
        <div className="bg-[#8B7355] text-white text-center text-xs font-bold py-1.5">
          北 ↑
        </div>

        {/* 畝コンテンツ */}
        {bedId === 7 && <Bed7Layout />}
        {bedId === 8 && <Bed8Layout />}
        {bedId === 10 && <Bed10Layout />}

        {/* 南ラベル */}
        <div className="bg-[#8B7355] text-white text-center text-xs font-bold py-1.5">
          南 ↓
        </div>
      </div>

      {/* スタイル説明 */}
      <p className="mt-2.5 text-xs text-soilLight leading-relaxed">
        {layout.layoutStyle} &mdash; {layout.styleNote}
      </p>
    </div>
  );
}
