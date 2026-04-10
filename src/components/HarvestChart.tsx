'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { HarvestRecord } from '@/types';

const COLORS = ['#6B8E23', '#E07A3C', '#C9A66B', '#7FB3D5', '#A8C66C', '#4A6B16', '#F5D547', '#B06B3A'];

export default function HarvestChart({ records }: { records: HarvestRecord[] }) {
  // 月別合計kg
  const monthly = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of records) {
      const m = r.date.slice(0, 7); // YYYY-MM
      const kg = r.amountKg ?? (r.amountCount ? r.amountCount * 0.1 : 0);
      map[m] = (map[m] ?? 0) + kg;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, kg]) => ({ month: m.slice(5) + '月', kg: Math.round(kg * 10) / 10 }));
  }, [records]);

  // 品目別合計
  const byCrop = useMemo(() => {
    const map: Record<string, { kg: number; count: number }> = {};
    for (const r of records) {
      const key = r.crop;
      if (!map[key]) map[key] = { kg: 0, count: 0 };
      if (r.amountKg) map[key].kg += r.amountKg;
      if (r.amountCount) map[key].count += r.amountCount;
    }
    return Object.entries(map)
      .map(([name, v]) => ({
        name,
        value: Math.round((v.kg + v.count * 0.1) * 10) / 10,
      }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center border border-soil/10 text-soilLight text-xs">
        まだ記録がありません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg p-3 border border-soil/10">
        <div className="text-xs font-bold text-soilLight mb-2">月別収穫量 (kg換算)</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="kg" fill="#6B8E23" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 border border-soil/10">
        <div className="text-xs font-bold text-soilLight mb-2">品目別シェア</div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCrop} dataKey="value" nameKey="name" outerRadius={70} label={(e) => e.name}>
                {byCrop.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
