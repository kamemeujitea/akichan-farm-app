'use client';

/** 畝内の植え付けレイアウト図（混植・区画分け・ハイブリッド） */

interface Section {
  label: string;
  bg: string;
  border?: string;
  rows: string[];
  note?: string;
  isNet?: boolean;
}

interface BedLayout {
  bedId: number;
  title: string;
  style: '混植' | '区画分け' | 'ハイブリッド';
  styleNote: string;
  sections: Section[];
}

const layouts: BedLayout[] = [
  {
    bedId: 7,
    title: 'トマト＋バジル＋大葉',
    style: '混植',
    styleNote:
      'トマトの株間にバジルを1株ずつ植える。大葉は畝の両端に。',
    sections: [
      {
        label: '大葉（北端）',
        bg: '#e8f5e9',
        rows: ['🌿大葉 ×1'],
        note: '端に配置',
      },
      {
        label: '大玉トマト＋バジル',
        bg: '#ffebee',
        rows: [
          '🍅大玉  🌿バジル',
          '🍅大玉  🌿バジル',
          '🍅大玉  🌿バジル',
          '🍅大玉',
        ],
        note: '株間50cm・バジル混植',
      },
      {
        label: '中玉トマト＋バジル',
        bg: '#fff3e0',
        rows: [
          '🍅中玉  🌿バジル',
          '🍅中玉  🌿バジル',
          '🍅中玉  🌿バジル',
          '🍅中玉',
        ],
        note: '株間50cm・バジル混植',
      },
      {
        label: 'ミニトマト',
        bg: '#fce4ec',
        rows: ['🍅ミニ ×4', '（株間にバジル残り）'],
        note: 'ミニトマト',
      },
      {
        label: '大葉（南端）',
        bg: '#e8f5e9',
        rows: ['🌿大葉 ×1'],
        note: '端に配置',
      },
    ],
  },
  {
    bedId: 8,
    title: '枝豆＋オクラ＋ゴーヤ＋キュウリ',
    style: '区画分け',
    styleNote:
      '北から背の低い順に配置。ゴーヤ・キュウリはネットを共有。',
    sections: [
      {
        label: '枝豆ゾーン',
        bg: '#e8f5e9',
        rows: ['🫛 枝豆 ×4', '（30cm間隔、2条）'],
        note: '北端: 背が低い',
      },
      {
        label: 'オクラ',
        bg: '#f1f8e9',
        rows: ['🌿 オクラ ×2', '（40cm間隔）'],
        note: '中央: 背が高く風よけに',
      },
      {
        label: 'ネット仕立てゾーン',
        bg: '#e3f2fd',
        rows: ['🥒キュウリ ×2', '🫘ゴーヤ ×2'],
        note: '南側: ネットを共有して誘引',
        isNet: true,
      },
    ],
  },
  {
    bedId: 10,
    title: 'ズッキーニ＋葉物＋明日葉',
    style: 'ハイブリッド',
    styleNote:
      'ズッキーニの株間(80cm)にサラダ菜・サンチュを混植。明日葉は南端に区画分け。',
    sections: [
      {
        label: 'ズッキーニ＋葉物（混植）',
        bg: '#f1f8e9',
        rows: [
          '🥒ズッキーニ ×1',
          '  ↕80cm',
          '🥬サラダ菜  🥬サンチュ',
          '  （ズッキーニの日陰に配置）',
          '🥒ズッキーニ ×1',
          '  ↕80cm',
          '🥬サラダ菜  🥬サンチュ',
          '🥒ズッキーニ ×1',
          '  ↕80cm',
          '🥒ズッキーニ ×1',
        ],
        note: 'ズッキーニの株間に葉物を混植',
      },
      {
        label: '明日葉（独立区画）',
        bg: '#e8f5e9',
        rows: ['🌿明日葉 ×2', '（半日陰OK）'],
        note: '南端に区画分け',
      },
    ],
  },
];

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
          className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${styleBadgeColor[layout.style]}`}
        >
          {layout.style}
        </span>
        <span className="text-sm text-soilLight">{layout.title}</span>
      </div>

      {/* 畝ダイアグラム */}
      <div className="border-2 border-[#8B7355] rounded-xl overflow-hidden">
        {/* 北ラベル */}
        <div className="bg-[#8B7355] text-white text-center text-xs font-bold py-1">
          北 ↑
        </div>

        {/* セクション */}
        {layout.sections.map((section, i) => (
          <div key={i}>
            {i > 0 && (
              <div className="border-t-2 border-dashed border-[#8B7355]/40" />
            )}
            <div
              className="px-3 py-2.5"
              style={{ backgroundColor: section.bg }}
            >
              {/* セクションラベル */}
              <div className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                {section.isNet && <span className="text-blue-500">🔲</span>}
                {section.label}
              </div>

              {/* ネット仕立ての場合、枠線で囲む */}
              <div
                className={
                  section.isNet
                    ? 'border border-blue-300 rounded-md px-2 py-1.5 bg-white/50'
                    : ''
                }
              >
                {section.rows.map((row, j) => (
                  <div
                    key={j}
                    className={`text-sm leading-relaxed ${
                      row.startsWith('  ') || row.startsWith('（')
                        ? 'text-xs text-gray-500 pl-2'
                        : 'font-medium'
                    }`}
                  >
                    {row}
                  </div>
                ))}
              </div>

              {/* 注記 */}
              {section.note && (
                <div className="text-xs text-gray-500 mt-1">
                  ← {section.note}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 南ラベル */}
        <div className="bg-[#8B7355] text-white text-center text-xs font-bold py-1">
          南 ↓
        </div>
      </div>

      {/* スタイル説明 */}
      <p className="mt-2.5 text-xs text-soilLight leading-relaxed">
        「{layout.style}」— {layout.styleNote}
      </p>
    </div>
  );
}
