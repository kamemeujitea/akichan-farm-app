'use client';

import { useEffect, useState } from 'react';
import HarvestForm from '@/components/HarvestForm';
import HarvestChart from '@/components/HarvestChart';
import HarvestList from '@/components/HarvestList';
import { getHarvests } from '@/lib/storage';
import type { HarvestRecord } from '@/types';

export default function HarvestPage() {
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [tab, setTab] = useState<'form' | 'chart' | 'list'>('form');

  useEffect(() => {
    getHarvests().then(setRecords);
  }, []);

  const totalKg = records.reduce((s, r) => s + (r.amountKg ?? 0), 0);
  const totalCount = records.reduce((s, r) => s + (r.amountCount ?? 0), 0);

  return (
    <div>
      <header className="px-4 pt-5 pb-2">
        <h1 className="text-xl font-bold flex items-center gap-2">🌾 収穫記録</h1>
        <div className="mt-2 flex gap-3 text-xs text-soilLight">
          <div className="bg-white rounded-md px-2 py-1 border border-soil/10">
            累計 <span className="text-soil font-bold">{totalKg.toFixed(1)} kg</span>
          </div>
          <div className="bg-white rounded-md px-2 py-1 border border-soil/10">
            累計 <span className="text-soil font-bold">{totalCount} 個</span>
          </div>
          <div className="bg-white rounded-md px-2 py-1 border border-soil/10">
            記録 <span className="text-soil font-bold">{records.length} 件</span>
          </div>
        </div>
      </header>

      <div className="px-4 mt-3">
        <div className="flex gap-1 bg-white rounded-md p-1 border border-soil/10">
          {(['form', 'chart', 'list'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs rounded ${
                tab === t ? 'bg-leaf text-white font-bold' : 'text-soilLight'
              }`}
            >
              {t === 'form' ? '＋記録' : t === 'chart' ? '集計' : '履歴'}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {tab === 'form' && (
            <HarvestForm
              onAdded={(r) => {
                setRecords([...records, r]);
                setTab('list');
              }}
            />
          )}
          {tab === 'chart' && <HarvestChart records={records} />}
          {tab === 'list' && (
            <HarvestList
              records={records}
              onDelete={(id) => setRecords(records.filter((r) => r.id !== id))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
