'use client';

import { useEffect, useState, useMemo } from 'react';
import type { CheckIn, FarmMember, ShiftSlot, Weekday } from '@/types';
import {
  addCheckIn,
  getCheckIns,
  getMembers,
  getShifts,
  saveMembers,
  saveShifts,
} from '@/lib/storage';
import { beds } from '@/lib/farmData';

const WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const MEMBER_EMOJIS = ['👨‍🌾', '👩‍🌾', '🧑‍🌾', '👦', '👧', '🦁', '🐰', '🐸'];
const MEMBER_COLORS = ['#6B8E23', '#E07A3C', '#C9A66B', '#7FB3D5', '#B06B3A', '#A8C66C', '#4A6B16', '#F5D547'];

/** Get the crop emoji for a bed */
function bedCropEmoji(bedId: number): string {
  const bed = beds.find((b) => b.id === bedId);
  if (!bed) return '🌱';
  const crop = bed.main ?? bed.north ?? bed.south;
  return crop?.emoji ?? '🌱';
}

/** Get bed label like ①② */
function bedLabel(bedId: number): string {
  const bed = beds.find((b) => b.id === bedId);
  return bed?.label ?? `${bedId}`;
}

export default function ShiftPage() {
  const [members, setMembers] = useState<FarmMember[]>([]);
  const [shifts, setShifts] = useState<ShiftSlot[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [checkinMember, setCheckinMember] = useState<string | null>(null);
  const [checkinNote, setCheckinNote] = useState('');
  const [checkinBedIds, setCheckinBedIds] = useState<number[]>([]);
  const [showBedAssign, setShowBedAssign] = useState<string | null>(null); // memberId

  useEffect(() => {
    setMembers(getMembers());
    setShifts(getShifts());
    setCheckins(getCheckIns());
  }, []);

  // --- Current month helpers ---
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthCheckins = useMemo(
    () => checkins.filter((c) => c.date.startsWith(currentMonthStr)),
    [checkins, currentMonthStr]
  );

  const memberCheckinCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) counts[m.id] = 0;
    for (const c of monthCheckins) {
      if (counts[c.memberId] !== undefined) counts[c.memberId]++;
    }
    return counts;
  }, [members, monthCheckins]);

  const avgCheckins = useMemo(() => {
    if (members.length === 0) return 0;
    const total = Object.values(memberCheckinCounts).reduce((a, b) => a + b, 0);
    return total / members.length;
  }, [members, memberCheckinCounts]);

  // --- Member CRUD ---
  const addMember = () => {
    if (!newName.trim()) return;
    const idx = members.length;
    const m: FarmMember = {
      id: `m-${Date.now()}`,
      name: newName.trim(),
      emoji: MEMBER_EMOJIS[idx % MEMBER_EMOJIS.length],
      color: MEMBER_COLORS[idx % MEMBER_COLORS.length],
    };
    const next = [...members, m];
    setMembers(next);
    saveMembers(next);
    setNewName('');
    setShowAdd(false);
  };

  const removeMember = (id: string) => {
    if (!confirm('このメンバーを削除しますか？')) return;
    const next = members.filter((m) => m.id !== id);
    const nextShifts = shifts.filter((s) => s.memberId !== id);
    setMembers(next);
    setShifts(nextShifts);
    saveMembers(next);
    saveShifts(nextShifts);
  };

  const toggleShift = (memberId: string, weekday: Weekday) => {
    const existing = shifts.find((s) => s.memberId === memberId && s.weekday === weekday);
    let next: ShiftSlot[];
    if (existing) {
      next = shifts.filter((s) => s.id !== existing.id);
    } else {
      next = [...shifts, { id: `s-${Date.now()}-${Math.random()}`, memberId, weekday }];
    }
    setShifts(next);
    saveShifts(next);
  };

  // --- Check-in with bed selection ---
  const toggleCheckinBed = (bedId: number) => {
    setCheckinBedIds((prev) =>
      prev.includes(bedId) ? prev.filter((id) => id !== bedId) : [...prev, bedId]
    );
  };

  const doCheckIn = () => {
    if (!checkinMember) return;
    const d = new Date().toISOString().slice(0, 10);
    const c = addCheckIn({
      memberId: checkinMember,
      date: d,
      note: checkinNote.trim() || undefined,
      completedTaskIds: checkinBedIds.length > 0 ? checkinBedIds.map(String) : undefined,
    });
    setCheckins([...checkins, c]);
    setCheckinMember(null);
    setCheckinNote('');
    setCheckinBedIds([]);
  };

  // --- Bed assignment ---
  const toggleBedAssignment = (memberId: string, bedId: number) => {
    const updated = members.map((m) => {
      if (m.id !== memberId) return m;
      const current = m.assignedBedIds ?? [];
      const next = current.includes(bedId)
        ? current.filter((id) => id !== bedId)
        : [...current, bedId];
      return { ...m, assignedBedIds: next.length > 0 ? next : undefined };
    });
    setMembers(updated);
    saveMembers(updated);
  };

  // --- Derived data ---
  const recentCheckins = [...checkins]
    .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
    .slice(0, 10);

  // Last visit per member
  const lastVisitMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of checkins) {
      if (!map[c.memberId] || c.date > map[c.memberId]) {
        map[c.memberId] = c.date;
      }
    }
    return map;
  }, [checkins]);

  const daysSince = (dateStr: string): number => {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Most active member this month
  const mostActiveMember = useMemo(() => {
    if (members.length === 0) return null;
    let maxId = members[0].id;
    let maxCount = memberCheckinCounts[maxId] ?? 0;
    for (const m of members) {
      const cnt = memberCheckinCounts[m.id] ?? 0;
      if (cnt > maxCount) {
        maxCount = cnt;
        maxId = m.id;
      }
    }
    return maxCount > 0 ? members.find((m) => m.id === maxId) ?? null : null;
  }, [members, memberCheckinCounts]);

  const totalMonthCheckins = monthCheckins.length;

  // Workload bar color
  const getBarColor = (count: number): string => {
    if (avgCheckins === 0) return '#A8C66C'; // green
    if (count < avgCheckins * 0.5) return '#E07A3C'; // red
    if (count < avgCheckins * 0.8) return '#F5D547'; // yellow
    return '#A8C66C'; // green
  };

  const hasImbalance = useMemo(() => {
    if (avgCheckins === 0) return false;
    return members.some((m) => (memberCheckinCounts[m.id] ?? 0) < avgCheckins * 0.5);
  }, [members, memberCheckinCounts, avgCheckins]);

  // Beds already assigned to another member
  const assignedBedMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const m of members) {
      for (const bId of m.assignedBedIds ?? []) {
        map[bId] = m.id;
      }
    }
    return map;
  }, [members]);

  return (
    <div>
      <header className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">👥 シフト管理</h1>
        <p className="text-sm text-soilLight mt-1">週間シフト表と訪問記録</p>
      </header>

      <div className="px-4 mt-2 space-y-4">
        {/* メンバーリスト */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-soilLight">メンバー ({members.length})</div>
            <button
              onClick={() => setShowAdd((s) => !s)}
              className="text-sm bg-leaf text-white px-4 py-2 rounded-md font-bold active:scale-95 transition"
            >
              {showAdd ? 'キャンセル' : '+ 追加'}
            </button>
          </div>
          {showAdd && (
            <div className="bg-white rounded-lg p-3 border border-soil/10 mb-2 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="名前"
                className="flex-1 border border-soil/20 rounded px-3 py-2.5 text-base"
              />
              <button onClick={addMember} className="bg-leafDark text-white rounded px-4 py-2.5 text-sm font-bold active:scale-95 transition">
                追加
              </button>
            </div>
          )}
          {members.length === 0 ? (
            <div className="text-center text-soilLight text-sm py-4">
              まずはメンバーを追加してください
            </div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="bg-white rounded-full px-4 py-2 border-2 flex items-center gap-1.5"
                  style={{ borderColor: m.color }}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-sm font-bold">{m.name}</span>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="text-soilLight text-sm ml-1 w-6 h-6 flex items-center justify-center"
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* シフト表 */}
        {members.length > 0 && (
          <div>
            <div className="text-sm font-bold text-soilLight mb-2">週間シフト表（タップで担当割当）</div>
            <div className="bg-white rounded-lg border border-soil/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-leaf/10">
                    <th className="py-2 px-1.5 text-left text-sm">担当</th>
                    {WEEK_LABELS.map((w, i) => (
                      <th
                        key={w}
                        className={`py-2 px-1 text-center ${
                          i === 0 ? 'text-sunset' : i === 6 ? 'text-sky' : ''
                        }`}
                      >
                        {w}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-t border-soil/10">
                      <td className="py-2 px-1.5">
                        <span className="mr-1">{m.emoji}</span>
                        <span className="text-sm">{m.name}</span>
                      </td>
                      {WEEK_LABELS.map((_, i) => {
                        const weekday = i as Weekday;
                        const assigned = shifts.find(
                          (s) => s.memberId === m.id && s.weekday === weekday
                        );
                        return (
                          <td
                            key={i}
                            className="py-1.5 px-0.5 text-center"
                          >
                            <button
                              onClick={() => toggleShift(m.id, weekday)}
                              className={`w-9 h-9 rounded-full text-sm ${
                                assigned
                                  ? 'text-white font-bold'
                                  : 'bg-soil/5 text-soilLight'
                              }`}
                              style={
                                assigned ? { background: m.color } : undefined
                              }
                            >
                              {assigned ? '●' : '○'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* チェックイン（強化版: 畝選択付き） */}
        {members.length > 0 && (
          <div>
            <div className="text-sm font-bold text-soilLight mb-2">作業完了チェックイン</div>
            <div className="bg-white rounded-lg p-3 border border-soil/10 space-y-3">
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCheckinMember(m.id)}
                    className={`px-4 py-2 rounded-full text-sm border-2 min-h-[44px] ${
                      checkinMember === m.id ? 'text-white font-bold' : 'bg-cream text-soil'
                    }`}
                    style={
                      checkinMember === m.id
                        ? { background: m.color, borderColor: m.color }
                        : { borderColor: m.color }
                    }
                  >
                    {m.emoji} {m.name}
                  </button>
                ))}
              </div>

              {/* 畝選択 */}
              {checkinMember && (
                <div>
                  <div className="text-xs text-soilLight mb-1.5 font-bold">作業した畝を選択（任意）</div>
                  <div className="flex flex-wrap gap-1.5">
                    {beds.map((bed) => {
                      const selected = checkinBedIds.includes(bed.id);
                      const crop = bed.main ?? bed.north ?? bed.south;
                      return (
                        <button
                          key={bed.id}
                          onClick={() => toggleCheckinBed(bed.id)}
                          className={`px-2.5 py-1.5 rounded text-xs border min-h-[36px] ${
                            selected
                              ? 'bg-leafDark text-white border-leafDark'
                              : 'bg-cream border-soil/20 text-soil'
                          }`}
                        >
                          {bed.label}{crop?.emoji ?? '🌱'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <input
                type="text"
                value={checkinNote}
                onChange={(e) => setCheckinNote(e.target.value)}
                placeholder="作業メモ（任意）"
                className="w-full border border-soil/20 rounded px-3 py-2.5 text-base"
              />
              <button
                onClick={doCheckIn}
                disabled={!checkinMember}
                className="w-full bg-leafDark text-white rounded py-3 text-sm font-bold disabled:opacity-50 active:scale-95 transition"
              >
                ✅ チェックイン
              </button>
            </div>
          </div>
        )}

        {/* ========== 負荷バランス ========== */}
        {members.length > 0 && (
          <div>
            <div className="text-sm font-bold text-soilLight mb-2">
              📊 負荷バランス（{now.getMonth() + 1}月）
            </div>
            <div className="bg-white rounded-lg p-3 border border-soil/10 space-y-2.5">
              {hasImbalance && (
                <div className="bg-sunset/10 border border-sunset/30 rounded px-3 py-2 text-sm text-sunset font-bold">
                  ⚠ 偏りアラート: 平均の50%未満のメンバーがいます
                </div>
              )}
              {members.map((m) => {
                const count = memberCheckinCounts[m.id] ?? 0;
                const maxCount = Math.max(...Object.values(memberCheckinCounts), 1);
                const widthPct = Math.max((count / maxCount) * 100, 4);
                return (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="w-20 text-sm truncate flex items-center gap-1">
                      <span>{m.emoji}</span>
                      <span className="font-bold">{m.name}</span>
                    </div>
                    <div className="flex-1 bg-soil/5 rounded-full h-5 relative overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: getBarColor(count),
                        }}
                      />
                      {/* Average line */}
                      {avgCheckins > 0 && maxCount > 0 && (
                        <div
                          className="absolute top-0 h-full w-0.5 bg-soil/40"
                          style={{ left: `${(avgCheckins / maxCount) * 100}%` }}
                          title={`平均: ${avgCheckins.toFixed(1)}`}
                        />
                      )}
                    </div>
                    <div className="text-sm w-8 text-right font-bold">{count}</div>
                  </div>
                );
              })}
              <div className="text-xs text-soilLight flex items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-[#A8C66C]" /> 良好</span>
                <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-[#F5D547]" /> やや少ない</span>
                <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-[#E07A3C]" /> 要注意</span>
                <span className="inline-flex items-center gap-1"><span className="inline-block w-1 h-4 bg-soil/40" /> 平均</span>
              </div>
            </div>
          </div>
        )}

        {/* ========== 月間作業サマリー ========== */}
        {members.length > 0 && (
          <div>
            <div className="text-sm font-bold text-soilLight mb-2">
              📅 月間作業サマリー（{now.getMonth() + 1}月）
            </div>
            <div className="bg-white rounded-lg p-3 border border-soil/10 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-leaf/10 rounded-lg p-3">
                  <div className="text-soilLight text-xs">今月のチェックイン</div>
                  <div className="text-xl font-bold mt-0.5">{totalMonthCheckins}回</div>
                </div>
                <div className="bg-leaf/10 rounded-lg p-3">
                  <div className="text-soilLight text-xs">最も活発</div>
                  <div className="text-xl font-bold mt-0.5">
                    {mostActiveMember
                      ? `${mostActiveMember.emoji} ${mostActiveMember.name}`
                      : '---'}
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-soilLight mt-1">最終訪問</div>
              <ul className="space-y-1.5">
                {members.map((m) => {
                  const lastDate = lastVisitMap[m.id];
                  const days = lastDate ? daysSince(lastDate) : null;
                  const warn = days !== null && days > 7;
                  return (
                    <li
                      key={m.id}
                      className={`flex items-center justify-between text-sm px-3 py-2 rounded ${
                        warn ? 'bg-sunset/10' : 'bg-soil/5'
                      }`}
                    >
                      <span className="font-bold">
                        {m.emoji} {m.name}
                      </span>
                      {lastDate ? (
                        <span className={warn ? 'text-sunset font-bold' : 'text-soilLight'}>
                          {lastDate}
                          {warn && ` (${days}日未訪問⚠)`}
                          {!warn && days !== null && ` (${days}日前)`}
                        </span>
                      ) : (
                        <span className="text-soilLight">記録なし</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* ========== 担当エリア割り当て ========== */}
        {members.length > 0 && (
          <div>
            <div className="text-sm font-bold text-soilLight mb-2">🌾 担当エリア割り当て</div>
            <div className="bg-white rounded-lg p-3 border border-soil/10 space-y-3">
              {members.map((m) => {
                const assigned = m.assignedBedIds ?? [];
                const isEditing = showBedAssign === m.id;
                return (
                  <div key={m.id} className="border-b border-soil/5 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span>{m.emoji}</span>
                        <span className="font-bold">{m.name}</span>
                        {assigned.length > 0 && (
                          <span className="text-xs text-soilLight ml-1">
                            {assigned.map((id) => `${bedLabel(id)}${bedCropEmoji(id)}`).join(' ')}
                          </span>
                        )}
                        {assigned.length === 0 && (
                          <span className="text-xs text-soilLight ml-1">未割当</span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowBedAssign(isEditing ? null : m.id)}
                        className="text-sm text-leaf font-bold underline py-1 px-2"
                      >
                        {isEditing ? '閉じる' : '編集'}
                      </button>
                    </div>
                    {isEditing && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {beds.map((bed) => {
                          const isAssigned = assigned.includes(bed.id);
                          const otherOwner = assignedBedMap[bed.id];
                          const ownedByOther = otherOwner && otherOwner !== m.id;
                          const otherMember = ownedByOther
                            ? members.find((x) => x.id === otherOwner)
                            : null;
                          const crop = bed.main ?? bed.north ?? bed.south;
                          return (
                            <button
                              key={bed.id}
                              onClick={() => toggleBedAssignment(m.id, bed.id)}
                              className={`px-2.5 py-1.5 rounded text-xs border min-h-[36px] ${
                                isAssigned
                                  ? 'text-white border-leafDark'
                                  : ownedByOther
                                  ? 'bg-soil/10 border-soil/20 text-soilLight'
                                  : 'bg-cream border-soil/20 text-soil'
                              }`}
                              style={isAssigned ? { backgroundColor: m.color } : undefined}
                              title={
                                ownedByOther
                                  ? `${otherMember?.name ?? '他'}が担当中`
                                  : `${crop?.crop ?? ''}`
                              }
                            >
                              {bed.label}{crop?.emoji ?? '🌱'}
                              {ownedByOther && otherMember && (
                                <span className="ml-0.5">{otherMember.emoji}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="text-xs text-soilLight pt-1">
                タップで担当畝を割り当て。他メンバーの担当畝も選択可能です。
              </div>
            </div>
          </div>
        )}

        {/* 訪問履歴（強化版: 畝情報付き） */}
        <div>
          <div className="text-sm font-bold text-soilLight mb-2">訪問記録 (最新10件)</div>
          {recentCheckins.length === 0 ? (
            <div className="text-center text-soilLight text-sm py-4">記録なし</div>
          ) : (
            <ul className="space-y-1.5">
              {recentCheckins.map((c) => {
                const m = members.find((x) => x.id === c.memberId);
                const workedBeds = c.completedTaskIds
                  ?.map(Number)
                  .filter((id) => !isNaN(id));
                return (
                  <li key={c.id} className="bg-white rounded-lg p-3 border border-soil/10 text-sm flex gap-2">
                    <span className="text-xl">{m?.emoji ?? '👤'}</span>
                    <div className="flex-1">
                      <div>
                        <span className="font-bold">{m?.name ?? '不明'}</span>
                        <span className="text-soilLight ml-2">{c.date}</span>
                      </div>
                      {workedBeds && workedBeds.length > 0 && (
                        <div className="text-xs text-soilLight mt-0.5">
                          作業畝: {workedBeds.map((id) => `${bedLabel(id)}${bedCropEmoji(id)}`).join(' ')}
                        </div>
                      )}
                      {c.note && <div className="text-soilLight mt-0.5">{c.note}</div>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
