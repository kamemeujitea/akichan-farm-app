'use client';

import { useState } from 'react';
import { addHarvest } from '@/lib/storage';
import { beds, cropEmoji } from '@/lib/farmData';
import type { HarvestRecord } from '@/types';

const CROP_OPTIONS = Array.from(
  new Set(
    beds.flatMap((b) =>
      b.split ? [b.north?.crop, b.south?.crop] : [b.main?.crop]
    ).filter((c): c is string => !!c)
  )
);

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HarvestForm({ onAdded }: { onAdded: (r: HarvestRecord) => void }) {
  const [date, setDate] = useState(todayStr());
  const [crop, setCrop] = useState(CROP_OPTIONS[0] ?? '');
  const [unit, setUnit] = useState<'kg' | 'count'>('kg');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop || !amount) return;
    setSaving(true);
    try {
      const rec = await addHarvest(
        {
          date,
          crop,
          emoji: cropEmoji(crop),
          amountKg: unit === 'kg' ? parseFloat(amount) : undefined,
          amountCount: unit === 'count' ? parseInt(amount, 10) : undefined,
          note: note.trim() || undefined,
        },
        photo ?? undefined
      );
      onAdded(rec);
      setAmount('');
      setNote('');
      setPhoto(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 border border-soil/10 space-y-3">
      <div>
        <label className="block text-xs text-soilLight mb-1">日付</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-soil/20 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-soilLight mb-1">品目</label>
        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="w-full border border-soil/20 rounded px-2 py-1.5 text-sm bg-white"
        >
          {CROP_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {cropEmoji(c)} {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-soilLight mb-1">収穫量</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="flex-1 border border-soil/20 rounded px-2 py-1.5 text-sm"
          />
          <div className="flex rounded-md overflow-hidden border border-soil/20">
            <button
              type="button"
              onClick={() => setUnit('kg')}
              className={`px-3 text-xs ${unit === 'kg' ? 'bg-leaf text-white' : 'bg-white'}`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => setUnit('count')}
              className={`px-3 text-xs ${unit === 'count' ? 'bg-leaf text-white' : 'bg-white'}`}
            >
              個
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-soilLight mb-1">写真（任意）</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="text-xs"
        />
        {photo && <div className="text-[10px] text-soilLight mt-1">選択済: {photo.name}</div>}
      </div>

      <div>
        <label className="block text-xs text-soilLight mb-1">メモ</label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="状態・虫食い・味の感想など"
          className="w-full border border-soil/20 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !amount}
        className="w-full bg-leafDark text-white rounded py-2 text-sm font-bold disabled:opacity-50"
      >
        {saving ? '保存中…' : '🧺 収穫を記録'}
      </button>
    </form>
  );
}
