'use client';

import { useEffect, useState } from 'react';
import type { Bed, BedStatus, CropInfo, Season } from '@/types';
import { categoryColors } from '@/lib/farmData';
import { getBedStatuses } from '@/lib/storage';
import CropTimeline from './CropTimeline';

const STATUS_LABELS: Record<BedStatus, { label: string; emoji: string }> = {
  none: { label: '未着手', emoji: '⚪' },
  preparing: { label: '土づくり中', emoji: '🪨' },
  planted: { label: '植え付け済', emoji: '🌱' },
  growing: { label: '生育中', emoji: '🌿' },
  harvesting: { label: '収穫期', emoji: '🧺' },
  harvested: { label: '収穫済', emoji: '✅' },
  autumn: { label: '秋冬転用中', emoji: '🍂' },
};

function CropCard({ info, sub }: { info: CropInfo; sub?: string }) {
  const color = categoryColors[info.category];
  return (
    <div className="mb-3">
      <div
        className="rounded-lg p-3"
        style={{ background: color.bg, borderLeft: `4px solid ${color.text}22` }}
      >
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-2xl">{info.emoji ?? '🌱'}</span>
          <div>
            <div className="font-bold text-lg" style={{ color: color.text }}>
              {sub && <span className="text-sm mr-1.5 opacity-70">{sub}</span>}
              {info.crop}
            </div>
            {info.variety && (
              <div className="text-sm opacity-70" style={{ color: color.text }}>
                品種: {info.variety}
              </div>
            )}
          </div>
        </div>

        <dl className="text-sm space-y-1 text-soil leading-relaxed">
          {info.plants !== undefined && (
            <div className="flex gap-2">
              <dt className="text-soilLight w-16 shrink-0 font-bold">株数</dt>
              <dd>{info.plants}</dd>
            </div>
          )}
          {info.plant_date && (
            <div className="flex gap-2">
              <dt className="text-soilLight w-16 shrink-0 font-bold">植え付け</dt>
              <dd>{info.plant_date}</dd>
            </div>
          )}
          {info.harvest_date && (
            <div className="flex gap-2">
              <dt className="text-soilLight w-16 shrink-0 font-bold">収穫</dt>
              <dd>{info.harvest_date}</dd>
            </div>
          )}
          {info.fertilizer && (
            <div className="flex gap-2">
              <dt className="text-soilLight w-16 shrink-0 font-bold">肥料</dt>
              <dd>{info.fertilizer}</dd>
            </div>
          )}
          {info.autumn_use && (
            <div className="flex gap-2">
              <dt className="text-soilLight w-16 shrink-0 font-bold">秋冬</dt>
              <dd>{info.autumn_use}</dd>
            </div>
          )}
        </dl>
      </div>

      {info.detail && (
        <p className="text-sm text-soilLight mt-2 leading-relaxed">{info.detail}</p>
      )}
      {info.compTip && (
        <div className="mt-2 px-3 py-2 rounded-md bg-[#e8f8ea] border border-[#b0d8b0] text-sm text-[#2a7a3a] leading-relaxed">
          {info.compTip}
        </div>
      )}
      {info.hint && (
        <div className="mt-2 px-3 py-2 rounded-md bg-[#fdf6e8] border border-[#e0d0a0] text-sm text-[#8a6a20] leading-relaxed">
          {info.hint}
        </div>
      )}
    </div>
  );
}

function FallowCard() {
  return (
    <div className="mb-3 rounded-lg p-4 bg-[#e0dcd0] text-center">
      <span className="text-3xl">💤</span>
      <p className="text-sm text-[#999] mt-1">
        この畝は秋冬シーズンは休閑です
      </p>
    </div>
  );
}

export default function BedDetail({
  bed,
  season,
  onClose,
}: {
  bed: Bed;
  season: Season;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<BedStatus>('none');
  const [showTimeline, setShowTimeline] = useState(true);

  useEffect(() => {
    setStatus(getBedStatuses()[bed.id] ?? 'none');
  }, [bed.id]);

  // 季節に応じた作物情報
  const springNorth = bed.north;
  const springSouth = bed.south;
  const springMain = bed.main;
  const autumnNorth = bed.autumnNorth;
  const autumnSouth = bed.autumnSouth;
  const autumnMain = bed.autumnMain;

  const isSpring = season === 'spring';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="bg-cream w-full max-w-md mx-auto rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">
            {bed.label} 畝{' '}
            <span className="text-sm font-normal text-soilLight">{bed.position}</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-xl w-11 h-11 flex items-center justify-center rounded-full hover:bg-soil/10 active:bg-soil/20 transition"
          >
            ✕
          </button>
        </div>

        {/* 季節インジケータ */}
        <div className="mb-3 text-sm text-soilLight flex items-center gap-1.5">
          <span className="text-lg">{isSpring ? '🌻' : '🍂'}</span>
          <span className="font-bold">{isSpring ? '春夏シーズン' : '秋冬シーズン'}</span>
        </div>

        {/* ステータス（自動算出・読み取り専用） */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-leaf/10 text-leaf border border-leaf/20">
            {STATUS_LABELS[status].emoji} {STATUS_LABELS[status].label}
          </span>
        </div>

        {/* 作物情報 */}
        {isSpring ? (
          bed.split ? (
            <>
              {springNorth && <CropCard info={springNorth} sub="北側" />}
              {springSouth && <CropCard info={springSouth} sub="南側" />}
            </>
          ) : (
            springMain && <CropCard info={springMain} />
          )
        ) : bed.split ? (
          <>
            {autumnNorth ? (
              <CropCard info={autumnNorth} sub="北側（秋冬）" />
            ) : (
              <FallowCard />
            )}
            {autumnSouth ? (
              <CropCard info={autumnSouth} sub="南側（秋冬）" />
            ) : (
              springNorth && autumnNorth && <FallowCard />
            )}
          </>
        ) : autumnMain ? (
          <CropCard info={autumnMain} />
        ) : (
          <FallowCard />
        )}

        {/* 栽培スケジュール ドリルダウン */}
        <div className="mt-4 border-t border-soil/10 pt-3">
          <button
            onClick={() => setShowTimeline((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-bold text-soilLight py-2"
          >
            <span>📋 この畝の栽培スケジュール</span>
            <span className={`text-lg transition-transform ${showTimeline ? 'rotate-90' : ''}`}>
              ›
            </span>
          </button>
          {showTimeline && (
            <div className="mt-3">
              <CropTimeline bedId={bed.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
