'use client';

import { useEffect, useState } from 'react';
import type { Bed, BedStatus, CropInfo, Season } from '@/types';
import { beds, categoryColors } from '@/lib/farmData';
import { getBedStatuses } from '@/lib/storage';
import BedDetail from './BedDetail';

function statusDot(s: BedStatus): string {
  switch (s) {
    case 'planted': return '🌱';
    case 'growing': return '🌿';
    case 'harvesting': return '🧺';
    case 'harvested': return '✅';
    case 'preparing': return '🪨';
    case 'autumn': return '🍂';
    default: return '';
  }
}

// 季節に応じた作物情報を取得
function getBedCrops(bed: Bed, season: Season): {
  isSplit: boolean;
  north?: CropInfo;
  south?: CropInfo;
  main?: CropInfo;
} {
  if (season === 'spring') {
    return { isSplit: bed.split, north: bed.north, south: bed.south, main: bed.main };
  }
  // 秋冬: autumnXxx があればそちら、なければ undefined(休閑)
  if (bed.split) {
    return {
      isSplit: true,
      north: bed.autumnNorth,
      south: bed.autumnSouth,
    };
  }
  return { isSplit: false, main: bed.autumnMain };
}

const FALLOW: CropInfo = {
  crop: '休閑',
  emoji: '💤',
  category: 'fallow',
};

function FullBed({
  bed,
  info,
  status,
  selected,
  onClick,
}: {
  bed: Bed;
  info: CropInfo | undefined;
  status: BedStatus;
  selected: boolean;
  onClick: () => void;
}) {
  const crop = info ?? FALLOW;
  const c = categoryColors[crop.category];
  const isFallow = !info;
  return (
    <button
      onClick={onClick}
      className={`relative w-full h-full min-w-0 rounded-sm border flex flex-col items-center justify-start text-center py-1 px-0.5 overflow-hidden active:scale-[0.97] transition ${
        selected ? 'ring-2 ring-red-500' : ''
      } ${isFallow ? 'opacity-50' : ''}`}
      style={{ background: c.bg, borderColor: selected ? '#e04040' : '#baa870', borderWidth: 1.5 }}
    >
      <span className="absolute top-0 left-0.5 text-[8px] font-bold text-[#a09060]">
        {bed.label}
      </span>
      {status !== 'none' && (
        <span className="absolute top-0 right-0 text-[10px]">{statusDot(status)}</span>
      )}
      <span className="text-base leading-none mt-2">{crop.emoji ?? '🌱'}</span>
      <span
        className="text-xs font-bold leading-tight mt-1 [writing-mode:vertical-rl]"
        style={{ color: c.text }}
      >
        {crop.crop}
      </span>
      {crop.plants && (
        <span className="text-[8px] text-[#6a5a3a] leading-tight mt-0.5 [writing-mode:vertical-rl]">
          {String(crop.plants)}
        </span>
      )}
    </button>
  );
}

function HalfCell({
  info,
  label,
  selected,
  onClick,
}: {
  info: CropInfo | undefined;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const crop = info ?? FALLOW;
  const c = categoryColors[crop.category];
  const isFallow = !info;
  return (
    <button
      onClick={onClick}
      className={`relative flex-[5] min-w-0 rounded-sm border flex flex-col items-center justify-start text-center py-0.5 px-0.5 overflow-hidden active:scale-[0.97] transition ${
        selected ? 'ring-2 ring-red-500' : ''
      } ${isFallow ? 'opacity-50' : ''}`}
      style={{
        background: c.bg,
        borderColor: selected ? '#e04040' : '#baa870',
        borderWidth: 1.5,
      }}
    >
      <span className="absolute top-0 left-0.5 text-[8px] font-bold text-[#a09060]">
        {label}
      </span>
      <span className="text-sm leading-none mt-2">{crop.emoji ?? '🌱'}</span>
      <span
        className="text-xs font-bold leading-tight mt-0.5 [writing-mode:vertical-rl]"
        style={{ color: c.text }}
      >
        {crop.crop}
      </span>
    </button>
  );
}

function SplitBed({
  bed,
  northInfo,
  southInfo,
  status,
  selected,
  onClick,
}: {
  bed: Bed;
  northInfo: CropInfo | undefined;
  southInfo: CropInfo | undefined;
  status: BedStatus;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div className="w-full h-full min-w-0 flex flex-col gap-0.5">
      <HalfCell
        info={northInfo}
        label={`${bed.label}北`}
        selected={selected}
        onClick={onClick}
      />
      <div className="text-center text-[7px] text-[#a09060] font-bold leading-none">
        ─分割─
      </div>
      <HalfCell
        info={southInfo}
        label={`${bed.label}南`}
        selected={selected}
        onClick={onClick}
      />
      {status !== 'none' && (
        <span className="absolute top-0 right-0 text-[10px]">{statusDot(status)}</span>
      )}
    </div>
  );
}

export default function FarmMap() {
  const [selected, setSelected] = useState<Bed | null>(null);
  const [statuses, setStatuses] = useState<Record<number, BedStatus>>({});
  const [season, setSeason] = useState<Season>('spring');

  useEffect(() => {
    setStatuses(getBedStatuses());
  }, [selected]);

  return (
    <div className="px-3 pb-4">
      {/* 季節切替 */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex rounded-lg overflow-hidden border border-soil/20 bg-white">
          <button
            onClick={() => setSeason('spring')}
            className={`px-6 py-2.5 text-sm font-bold transition ${
              season === 'spring'
                ? 'bg-leafDark text-white'
                : 'text-soilLight hover:bg-cream'
            }`}
          >
            🌻 春夏
          </button>
          <button
            onClick={() => setSeason('autumn')}
            className={`px-6 py-2.5 text-sm font-bold transition ${
              season === 'autumn'
                ? 'bg-[#8B6914] text-white'
                : 'text-soilLight hover:bg-cream'
            }`}
          >
            🍂 秋冬
          </button>
        </div>
      </div>

      {/* 外枠カード */}
      <div className="bg-white rounded-xl p-1.5 shadow-sm">
        {/* 方角ラベル（北） */}
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[9px] font-bold text-[#998]">🏠家（北西）</span>
          <span className="text-xs font-bold text-red-600">▲ 北（傾斜上）</span>
          <span className="text-[9px] invisible">placeholder</span>
        </div>

        {/* 中央: 西ラベル + 圃場 + 東ラベル */}
        <div className="flex items-center gap-1">
          <div className="text-xs font-bold text-[#999] shrink-0">◀西</div>

          {/* 圃場 */}
          <div
            className="w-full rounded-md border-2 grid gap-0.5 p-1"
            style={{
              aspectRatio: '15 / 17',
              background: '#d4c494',
              borderColor: '#b8a878',
              gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
            }}
          >
            {beds.map((bed) => {
              const status = statuses[bed.id] ?? 'none';
              const isSelected = selected?.id === bed.id;
              const crops = getBedCrops(bed, season);

              if (crops.isSplit) {
                return (
                  <SplitBed
                    key={bed.id}
                    bed={bed}
                    northInfo={crops.north}
                    southInfo={crops.south}
                    status={status}
                    selected={isSelected}
                    onClick={() => setSelected(bed)}
                  />
                );
              }
              return (
                <FullBed
                  key={bed.id}
                  bed={bed}
                  info={crops.main}
                  status={status}
                  selected={isSelected}
                  onClick={() => setSelected(bed)}
                />
              );
            })}
          </div>

          <div className="text-xs font-bold text-[#999] shrink-0">東▶</div>
        </div>

        {/* 方角ラベル（南） */}
        <div className="flex items-center justify-between px-2 mt-1">
          <span className="text-[9px] font-bold text-[#5a8a3a]">🌲林（南西）</span>
          <span className="text-xs font-bold text-red-600">▼ 南 ☀（傾斜下）</span>
          <span className="text-[9px] invisible">placeholder</span>
        </div>
      </div>

      {/* カテゴリ凡例 */}
      <div className="mt-3 flex gap-2 justify-center flex-wrap">
        {Object.entries(categoryColors)
          .filter(([k]) => (season === 'spring' ? k !== 'fallow' : true))
          .map(([k, c]) => (
            <div key={k} className="flex items-center gap-1 text-xs text-soilLight">
              <span
                className="w-3 h-3 rounded-sm inline-block border border-[#ddd]"
                style={{ background: c.bg }}
              />
              <span>{c.label}</span>
            </div>
          ))}
        <span className="text-xs text-red-600 font-bold">⚠ミント→プランター</span>
      </div>

      {selected && (
        <BedDetail bed={selected} season={season} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
