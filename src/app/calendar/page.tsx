import CalendarView from '@/components/CalendarView';

export default function CalendarPage() {
  return (
    <div>
      <header className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">📅 作業カレンダー</h1>
        <p className="text-sm text-soilLight mt-1">畝ごとの栽培ステップ＋カスタムタスク</p>
      </header>
      <CalendarView />
    </div>
  );
}
