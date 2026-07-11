"use client";

import { useMemo } from "react";
import type { AudienceTag } from "@/lib/enums";
import { DEPARTMENTS, LEVELS } from "@/lib/enums";
import type { AudienceEstimate } from "@/types/upload";

export function useAudienceEstimate(
  department: string,
  level: string,
  tags: AudienceTag[],
): AudienceEstimate {
  return useMemo(() => {
    const deptLabel =
      DEPARTMENTS.find((d) => d.value === department)?.label ??
      "All departments";
    const levelLabel =
      LEVELS.find((l) => l.value === level)?.label ?? "All levels";

    const base = 260 + ((department.length * 37 + level.length * 91) % 900);
    const narrowed =
      tags.length === 0 ? base * 2 : Math.round(base / (1 + tags.length * 0.35));
    const label = [deptLabel, levelLabel, ...tags].join(" · ");

    return { count: narrowed, label };
  }, [department, level, tags]);
}
