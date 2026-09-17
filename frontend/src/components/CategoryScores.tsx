import { useEffect, useState } from "react";
import type { FeedbackCategories } from "../types/domain";

const CATEGORY_MAX: Record<string, number> = {
  classDesign: 2,
  abstraction: 2,
  encapsulation: 1,
  relationships: 2,
  extensibility: 2,
  designPatterns: 1,
};

const LABELS: Record<string, string> = {
  classDesign: "Class Design",
  abstraction: "Abstraction",
  encapsulation: "Encapsulation",
  relationships: "Relationships",
  extensibility: "Extensibility",
  designPatterns: "Design Patterns",
};

export function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percent = Math.min(100, (value / max) * 100);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(percent));
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[15px] font-medium text-[var(--text-primary)]">{label}</span>
        <span className="tabular text-[13px] font-semibold text-[var(--text-primary)]">
          {value} / {max}
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-soft)]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function CategoryScores({ categories }: { categories: FeedbackCategories }) {
  return (
    <div className="space-y-4">
      {Object.keys(LABELS).map((key) => (
        <ScoreBar
          key={key}
          label={LABELS[key]}
          value={categories[key as keyof FeedbackCategories] ?? 0}
          max={CATEGORY_MAX[key]}
        />
      ))}
    </div>
  );
}
