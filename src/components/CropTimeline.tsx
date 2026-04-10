'use client';

import { useEffect, useState } from 'react';
import { cropStepsByBed, stepMeta, type CropStep } from '@/lib/cropSteps';
import { getStepCompletions, toggleStepCompletion } from '@/lib/storage';

export default function CropTimeline({ bedId }: { bedId: number }) {
  const steps = cropStepsByBed[bedId];
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getStepCompletions().then((map) => {
      const state: Record<string, boolean> = {};
      steps?.forEach((_, i) => {
        const key = `bed-${bedId}-${i}`;
        state[key] = !!map[key];
      });
      setCompleted(state);
    });
  }, [bedId, steps]);

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center text-soilLight text-sm py-4">
        この畝の栽培ステップはまだ登録されていません
      </div>
    );
  }

  const doneCount = Object.values(completed).filter(Boolean).length;

  const onToggle = async (index: number) => {
    const key = `bed-${bedId}-${index}`;
    const nowDone = await toggleStepCompletion(key);
    setCompleted((prev) => ({ ...prev, [key]: nowDone }));
  };

  return (
    <div>
      {/* 進捗バー */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-soilLight mb-1">
          <span className="font-bold">進捗</span>
          <span className="font-bold">{doneCount} / {steps.length}</span>
        </div>
        <div className="w-full h-3 bg-soil/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-leaf rounded-full transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative pl-6">
        {/* タイムラインバー */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-leaf/25 rounded" />

        {steps.map((step, i) => {
          const key = `bed-${bedId}-${i}`;
          const done = !!completed[key];
          return (
            <TimelineItem
              key={i}
              step={step}
              done={done}
              onToggle={() => onToggle(i)}
              isLast={i === steps.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}

function TimelineItem({
  step,
  done,
  onToggle,
  isLast,
}: {
  step: CropStep;
  done: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const meta = stepMeta[step.category];
  return (
    <div className={`relative flex gap-2.5 ${isLast ? '' : 'pb-3'}`}>
      {/* ドット */}
      <div
        className={`absolute -left-6 top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-xs z-10 border-2 border-cream transition ${
          done ? 'opacity-40' : ''
        }`}
        style={{ background: done ? '#999' : meta.color }}
      >
        <span className="text-[10px]">{done ? '✓' : meta.emoji}</span>
      </div>

      {/* コンテンツ */}
      <div
        className={`flex-1 min-w-0 bg-white rounded-lg px-3 py-2.5 border transition ${
          done ? 'border-soil/5 opacity-60' : 'border-soil/10'
        }`}
      >
        <div className="flex items-start gap-2">
          {/* チェックボックス */}
          <button
            onClick={onToggle}
            className={`mt-0.5 w-7 h-7 rounded border-2 shrink-0 flex items-center justify-center text-sm transition ${
              done
                ? 'bg-leaf border-leaf text-white'
                : 'border-soilLight/40 hover:border-leaf'
            }`}
            aria-label={done ? '完了を取り消す' : '完了にする'}
          >
            {done && '✓'}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ background: meta.color + '22', color: meta.color }}
              >
                {meta.label}
              </span>
              <span className="text-xs text-soilLight">{step.month}</span>
            </div>
            <div
              className={`text-sm font-bold mt-1 leading-snug ${
                done ? 'line-through text-soilLight' : 'text-soil'
              }`}
            >
              {step.title}
            </div>
            {step.detail && (
              <div className="text-xs text-soilLight mt-0.5 leading-relaxed">
                {step.detail}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
