import Link from 'next/link';
import FarmMap from '@/components/FarmMap';
import { farm, beds } from '@/lib/farmData';

function countCrops(): number {
  const names = new Set<string>();
  for (const b of beds) {
    if (b.split) {
      if (b.north) names.add(b.north.crop);
      if (b.south) names.add(b.south.crop);
    } else if (b.main) {
      names.add(b.main.crop);
    }
  }
  return names.size;
}

export default function Home() {
  const cropCount = countCrops();
  return (
    <div>
      <header className="px-4 pt-5 pb-3 text-center">
        <h1 className="text-2xl font-black text-[#3a6a2a]">🌱 {farm.name}</h1>
        <p className="text-xs text-soilLight mt-1 leading-relaxed">
          {farm.location.replace('長野県', '')} ─ 東西{farm.width_ew}m × 南北{farm.length_ns}m ─ 畝
          {farm.beds}本 ─ {cropCount}品目
        </p>
        <div className="flex gap-3 justify-center mt-3">
          <Link
            href="/weather"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white rounded-full border border-soil/10 text-sm font-bold text-soil hover:bg-cream active:scale-95 transition"
          >
            ⛅ 天気
          </Link>
          <Link
            href="/harvest"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white rounded-full border border-soil/10 text-sm font-bold text-soil hover:bg-cream active:scale-95 transition"
          >
            🌾 収穫記録
          </Link>
        </div>
      </header>
      <FarmMap />
    </div>
  );
}
