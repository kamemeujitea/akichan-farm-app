import ProgressDashboard from '@/components/ProgressDashboard';

export const metadata = {
  title: '進捗管理 - あきちゃんファーム',
};

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-[#FBF7EE] pb-24">
      <div className="max-w-md mx-auto px-3 pt-4">
        <h1 className="text-2xl font-bold text-[#3B2B12] mb-3">
          📈 進捗管理ダッシュボード
        </h1>
        <ProgressDashboard />
      </div>
    </main>
  );
}
