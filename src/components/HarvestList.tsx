'use client';

import { useEffect, useState } from 'react';
import type { HarvestRecord } from '@/types';
import { deleteHarvest, getPhotoURL } from '@/lib/storage';

function PhotoThumb({ photoId }: { photoId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let current: string | null = null;
    getPhotoURL(photoId).then((u) => {
      if (active) {
        current = u;
        setUrl(u);
      } else if (u) URL.revokeObjectURL(u);
    });
    return () => {
      active = false;
      if (current) URL.revokeObjectURL(current);
    };
  }, [photoId]);
  if (!url) return <div className="w-14 h-14 rounded bg-soil/10" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="収穫" className="w-14 h-14 rounded object-cover" />;
}

export default function HarvestList({
  records,
  onDelete,
}: {
  records: HarvestRecord[];
  onDelete: (id: string) => void;
}) {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = async (id: string) => {
    if (!confirm('この収穫記録を削除しますか？')) return;
    await deleteHarvest(id);
    onDelete(id);
  };

  if (sorted.length === 0) {
    return (
      <div className="text-center text-soilLight text-xs py-6">
        まだ記録がありません
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {sorted.map((r) => (
        <li key={r.id} className="bg-white rounded-lg p-3 border border-soil/10 flex gap-3">
          {r.photoId ? <PhotoThumb photoId={r.photoId} /> : (
            <div className="w-14 h-14 rounded bg-leafLight/30 flex items-center justify-center text-2xl">
              {r.emoji ?? '🌱'}
            </div>
          )}
          <div className="flex-1">
            <div className="text-sm font-bold">
              {r.emoji} {r.crop}
            </div>
            <div className="text-xs text-soilLight">{r.date}</div>
            <div className="text-xs mt-0.5">
              {r.amountKg !== undefined && <span>{r.amountKg} kg</span>}
              {r.amountCount !== undefined && <span>{r.amountCount} 個</span>}
            </div>
            {r.note && <div className="text-[11px] text-soilLight mt-1">{r.note}</div>}
          </div>
          <button
            onClick={() => handleDelete(r.id)}
            className="text-soilLight text-xs self-start"
            aria-label="削除"
          >
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
}
