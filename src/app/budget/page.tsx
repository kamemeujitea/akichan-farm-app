'use client';

import { useEffect, useState } from 'react';
import BudgetAccordion from '@/components/BudgetAccordion';
import {
  BUDGET_TOTAL,
  BUDGET_SPRING,
  BUDGET_AUTUMN,
  BUDGET_RESERVE,
  budgetCategories,
  budgetOutlook,
} from '@/lib/budgetData';
import {
  getIncomes,
  addIncome,
  deleteIncome,
  getExpenses,
  addExpense,
  deleteExpense,
  type IncomeRecord,
  type ExpenseRecord,
} from '@/lib/storage';

function yen(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const EXPENSE_CATEGORIES = ['肥料', '苗', '種芋・種', 'マルチ・支柱', '農薬', '消耗品', 'その他'];

type Tab = 'estimate' | 'income' | 'expense' | 'summary';

export default function BudgetPage() {
  const [tab, setTab] = useState<Tab>('summary');
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  useEffect(() => {
    getIncomes().then(setIncomes);
    getExpenses().then(setExpenses);
  }, []);

  const totalIncome = incomes.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expenses.reduce((s, r) => s + r.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div>
      <header className="px-4 pt-5 pb-2 text-center">
        <h1 className="text-2xl font-black text-[#3a6a2a]">💰 あきちゃんファーム</h1>
        <div className="text-xs text-soilLight mt-1">
          {new Date().getFullYear()}年 費用管理
        </div>
      </header>

      {/* サマリーカード */}
      <div className="px-3 mt-3">
        <div
          className="rounded-xl p-4 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3a6a2a, #2a5a1a)' }}
        >
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-[#8ab060]">集金合計</div>
              <div className="text-base font-black text-[#ffe066]">{yen(totalIncome)}</div>
            </div>
            <div>
              <div className="text-xs text-[#8ab060]">出費合計</div>
              <div className="text-base font-black text-[#ff9966]">{yen(totalExpense)}</div>
            </div>
            <div>
              <div className="text-xs text-[#8ab060]">残高</div>
              <div className={`text-base font-black ${balance >= 0 ? 'text-[#ffe066]' : 'text-[#ff6666]'}`}>
                {yen(balance)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="px-3 mt-3">
        <div className="flex gap-0.5 bg-white rounded-lg p-0.5 border border-soil/10">
          {([
            { key: 'summary' as Tab, label: '収支' },
            { key: 'income' as Tab, label: '集金' },
            { key: 'expense' as Tab, label: '出費' },
            { key: 'estimate' as Tab, label: '見積' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm rounded font-bold ${
                tab === t.key ? 'bg-leaf text-white' : 'text-soilLight'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 mt-3 pb-4">
        {tab === 'summary' && (
          <SummaryTab incomes={incomes} expenses={expenses} />
        )}
        {tab === 'income' && (
          <IncomeTab
            incomes={incomes}
            onAdd={(r) => setIncomes([...incomes, r])}
            onDelete={async (id) => { await deleteIncome(id); setIncomes(incomes.filter((r) => r.id !== id)); }}
          />
        )}
        {tab === 'expense' && (
          <ExpenseTab
            expenses={expenses}
            onAdd={(r) => setExpenses([...expenses, r])}
            onDelete={async (id) => { await deleteExpense(id); setExpenses(expenses.filter((r) => r.id !== id)); }}
          />
        )}
        {tab === 'estimate' && <EstimateTab />}
      </div>
    </div>
  );
}

// ====================
// 収支一覧
// ====================
function SummaryTab({ incomes, expenses }: { incomes: IncomeRecord[]; expenses: ExpenseRecord[] }) {
  // 全レコードを日付順にマージ
  const all = [
    ...incomes.map((r) => ({ ...r, type: 'income' as const })),
    ...expenses.map((r) => ({ ...r, type: 'expense' as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // 人別集金集計
  const byPerson: Record<string, number> = {};
  for (const r of incomes) {
    byPerson[r.from] = (byPerson[r.from] ?? 0) + r.amount;
  }

  // 費目別出費集計
  const byCat: Record<string, number> = {};
  for (const r of expenses) {
    byCat[r.category] = (byCat[r.category] ?? 0) + r.amount;
  }

  return (
    <div className="space-y-3">
      {/* 集金内訳 */}
      {Object.keys(byPerson).length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-soil/10">
          <div className="text-xs font-bold text-soilLight mb-2">集金内訳（人別）</div>
          {Object.entries(byPerson).sort((a, b) => b[1] - a[1]).map(([name, amt]) => (
            <div key={name} className="flex justify-between text-sm py-2 border-b border-soil/5 last:border-0">
              <span className="font-bold">{name}</span>
              <span className="font-bold text-[#3a6a2a]">{yen(amt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* 出費内訳 */}
      {Object.keys(byCat).length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-soil/10">
          <div className="text-xs font-bold text-soilLight mb-2">出費内訳（費目別）</div>
          {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
            <div key={cat} className="flex justify-between text-sm py-2 border-b border-soil/5 last:border-0">
              <span className="font-bold">{cat}</span>
              <span className="font-bold text-[#c05030]">{yen(amt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* 取引履歴 */}
      <div>
        <div className="text-xs font-bold text-soilLight mb-2">取引履歴</div>
        {all.length === 0 ? (
          <div className="text-center text-soilLight text-sm py-6">
            まだ記録がありません。「集金」「出費」タブから追加してください。
          </div>
        ) : (
          <ul className="space-y-1.5">
            {all.map((r) => (
              <li key={r.id} className="bg-white rounded-lg p-3 border border-soil/10 flex items-center gap-2 text-sm">
                <span className="text-xl">
                  {r.type === 'income' ? '💵' : '🧾'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">
                    {r.type === 'income'
                      ? `${(r as IncomeRecord & { type: 'income' }).from}さんから集金`
                      : `${(r as ExpenseRecord & { type: 'expense' }).item}`
                    }
                  </div>
                  <div className="text-xs text-soilLight">
                    {r.date}
                    {r.type === 'expense' && ` / ${(r as ExpenseRecord & { type: 'expense' }).category}`}
                    {r.note && ` / ${r.note}`}
                  </div>
                </div>
                <div className={`font-black text-base ${r.type === 'income' ? 'text-[#3a6a2a]' : 'text-[#c05030]'}`}>
                  {r.type === 'income' ? '+' : '-'}{yen(r.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ====================
// 集金タブ
// ====================
function IncomeTab({
  incomes,
  onAdd,
  onDelete,
}: {
  incomes: IncomeRecord[];
  onAdd: (r: IncomeRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [from, setFrom] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = async () => {
    if (!from.trim() || !amount) return;
    const r = await addIncome({ date, from: from.trim(), amount: parseInt(amount, 10), note: note.trim() || undefined });
    onAdd(r);
    setFrom('');
    setAmount('');
    setNote('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('この集金記録を削除しますか？')) return;
    onDelete(id);
  };

  const total = incomes.reduce((s, r) => s + r.amount, 0);
  const sorted = [...incomes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-soilLight">
          集金合計: <span className="font-bold text-soil">{yen(total)}</span>
          <span className="ml-2">{incomes.length}件</span>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-sm bg-leaf text-white px-4 py-2 rounded-md font-bold active:scale-95 transition"
        >
          {showForm ? 'キャンセル' : '+ 集金を記録'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-3 border border-soil/10 space-y-2.5">
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">日付</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-soil/20 rounded px-3 py-2.5 text-base" />
          </div>
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">誰から</label>
            <input type="text" value={from} onChange={(e) => setFrom(e.target.value)}
              placeholder="例: 田中さん" className="w-full border border-soil/20 rounded px-3 py-2.5 text-base" />
          </div>
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">金額（円）</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="5000" className="w-full border border-soil/20 rounded px-3 py-2.5 text-base" />
          </div>
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">メモ</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="4月分" className="w-full border border-soil/20 rounded px-3 py-2.5 text-base" />
          </div>
          <button onClick={handleAdd} disabled={!from.trim() || !amount}
            className="w-full bg-leafDark text-white rounded py-3 text-sm font-bold disabled:opacity-50 active:scale-95 transition">
            💵 集金を記録
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center text-soilLight text-sm py-6">まだ集金記録がありません</div>
      ) : (
        <ul className="space-y-1.5">
          {sorted.map((r) => (
            <li key={r.id} className="bg-white rounded-lg p-3 border border-soil/10 flex items-center gap-2">
              <span className="text-xl">💵</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{r.from}さん</div>
                <div className="text-xs text-soilLight">
                  {r.date}{r.note && ` / ${r.note}`}
                </div>
              </div>
              <div className="text-base font-black text-[#3a6a2a]">{yen(r.amount)}</div>
              <button onClick={() => handleDelete(r.id)} className="text-soilLight text-sm w-8 h-8 flex items-center justify-center" aria-label="削除">🗑️</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ====================
// 出費タブ
// ====================
function ExpenseTab({
  expenses,
  onAdd,
  onDelete,
}: {
  expenses: ExpenseRecord[];
  onAdd: (r: ExpenseRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = async () => {
    if (!item.trim() || !amount) return;
    const r = await addExpense({ date, category, item: item.trim(), amount: parseInt(amount, 10), note: note.trim() || undefined });
    onAdd(r);
    setItem('');
    setAmount('');
    setNote('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('この出費記録を削除しますか？')) return;
    onDelete(id);
  };

  const total = expenses.reduce((s, r) => s + r.amount, 0);
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-soilLight">
          出費合計: <span className="font-bold text-soil">{yen(total)}</span>
          <span className="ml-2">{expenses.length}件</span>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-sm bg-sunset text-white px-4 py-2 rounded-md font-bold active:scale-95 transition"
        >
          {showForm ? 'キャンセル' : '+ 出費を記録'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-3 border border-soil/10 space-y-2.5">
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">日付</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-soil/20 rounded px-3 py-2.5 text-base" />
          </div>
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">費目</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-soil/20 rounded px-3 py-2.5 text-base bg-white">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">品名</label>
            <input type="text" value={item} onChange={(e) => setItem(e.target.value)}
              placeholder="例: 鶏糞15kg × 5袋" className="w-full border border-soil/20 rounded px-3 py-2.5 text-base" />
          </div>
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">金額（円）</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="750" className="w-full border border-soil/20 rounded px-3 py-2.5 text-base" />
          </div>
          <div>
            <label className="block text-sm text-soilLight mb-1 font-bold">メモ</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="JA直売で購入" className="w-full border border-soil/20 rounded px-3 py-2.5 text-base" />
          </div>
          <button onClick={handleAdd} disabled={!item.trim() || !amount}
            className="w-full bg-sunset text-white rounded py-3 text-sm font-bold disabled:opacity-50 active:scale-95 transition">
            🧾 出費を記録
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center text-soilLight text-sm py-6">まだ出費記録がありません</div>
      ) : (
        <ul className="space-y-1.5">
          {sorted.map((r) => (
            <li key={r.id} className="bg-white rounded-lg p-3 border border-soil/10 flex items-center gap-2">
              <span className="text-xl">🧾</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{r.item}</div>
                <div className="text-xs text-soilLight">
                  {r.date} / {r.category}{r.note && ` / ${r.note}`}
                </div>
              </div>
              <div className="text-base font-black text-[#c05030]">{yen(r.amount)}</div>
              <button onClick={() => handleDelete(r.id)} className="text-soilLight text-sm w-8 h-8 flex items-center justify-center" aria-label="削除">🗑️</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ====================
// 見積タブ（既存のアコーディオン）
// ====================
function EstimateTab() {
  return (
    <div className="space-y-2.5">
      <div
        className="rounded-xl p-4 text-center text-white shadow"
        style={{ background: 'linear-gradient(135deg, #3a6a2a, #2a5a1a)' }}
      >
        <div className="text-xs font-bold tracking-widest text-[#a0d070]">年間見積（税込目安）</div>
        <div className="text-2xl font-black text-[#ffe066] my-1">{yen(BUDGET_TOTAL)}</div>
        <div className="flex justify-center gap-4 mt-2">
          <div className="text-center">
            <div className="text-xs text-[#8ab060]">春夏</div>
            <div className="text-sm font-black text-[#ffe066]">{yen(BUDGET_SPRING)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[#8ab060]">秋冬</div>
            <div className="text-sm font-black text-[#ffe066]">{yen(BUDGET_AUTUMN)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[#8ab060]">予備費</div>
            <div className="text-sm font-black text-[#ffe066]">{yen(BUDGET_RESERVE)}</div>
          </div>
        </div>
      </div>

      {budgetCategories.map((c) => (
        <BudgetAccordion key={c.id} category={c} />
      ))}

      <div className="bg-white rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-bold text-[#3a6a2a] mb-1">💡 2年目以降の見通し</h3>
        <p className="text-sm text-[#666] leading-relaxed">{budgetOutlook}</p>
      </div>
    </div>
  );
}
