'use client';

import { useState } from 'react';
import type { BudgetCategory } from '@/types';

const SEASON_STYLE: Record<BudgetCategory['season'], string> = {
  春夏: 'bg-[#e0f0c8] text-[#3a7a2a]',
  秋冬: 'bg-[#f0e0c0] text-[#8a6a20]',
  通年: 'bg-[#e0e4f0] text-[#3a4a7a]',
};

function yen(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`;
}

export default function BudgetAccordion({ category }: { category: BudgetCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-3 text-left min-h-[52px]"
      >
        <span className="text-2xl">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold flex items-center gap-1.5 flex-wrap">
            {category.title}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-sm ${
                SEASON_STYLE[category.season]
              }`}
            >
              {category.season}
            </span>
          </div>
          <div className="text-xs text-[#888] mt-0.5">{category.desc}</div>
        </div>
        <div className="text-base font-black text-leafDark">{yen(category.total)}</div>
        <div
          className={`text-soilLight text-lg font-black transition-transform ${
            open ? 'rotate-90' : ''
          }`}
        >
          ›
        </div>
      </button>
      {open && (
        <div className="bg-[#faf8f2] px-3 py-2.5 border-t border-[#f0ece0]">
          {category.items.map((it, i) => (
            <div
              key={i}
              className="flex items-baseline gap-2 py-2 border-b border-[#f0ece0] last:border-b-0 text-sm"
            >
              <div className="flex-1 text-[#666]">{it.name}</div>
              <div className="w-16 text-right text-xs text-[#999]">{it.qty}</div>
              <div className="w-16 text-right font-bold">{yen(it.price)}</div>
            </div>
          ))}
          {category.note && (
            <div className="text-xs text-[#3a8a3a] pt-2 mt-2 border-t border-dashed border-[#e0dcd0] leading-relaxed">
              {category.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
