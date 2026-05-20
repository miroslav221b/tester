import {
  Atom,
  BarChart2,
  Brain,
  Briefcase,
  Calculator,
  Clapperboard,
  Landmark,
  Languages,
  type LucideIcon,
} from "lucide-react";

import type { TestType } from "@/features/tests/types/test";

export type TestTypeVisual = {
  icon: LucideIcon;
  label: string;
  accent: string;
  image: string;
};

export const testTypeConfig: Record<TestType, TestTypeVisual> = {
  math: {
    icon: Calculator,
    label: "Math",
    accent: "from-blue-500/20 to-blue-600/5",
    image:
      "bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%),radial-gradient(circle_at_70%_80%,#60a5fa_0%,transparent_45%)]",
  },
  physics: {
    icon: Atom,
    label: "Physics",
    accent: "from-violet-500/20 to-violet-600/5",
    image:
      "bg-[radial-gradient(circle_at_25%_75%,#8b5cf6_0%,transparent_50%),radial-gradient(circle_at_75%_25%,#a78bfa_0%,transparent_45%)]",
  },
  history: {
    icon: Landmark,
    label: "History",
    accent: "from-amber-500/20 to-amber-600/5",
    image:
      "bg-[radial-gradient(circle_at_40%_30%,#f59e0b_0%,transparent_50%),radial-gradient(circle_at_60%_70%,#fbbf24_0%,transparent_45%)]",
  },
  language: {
    icon: Languages,
    label: "Language",
    accent: "from-emerald-500/20 to-emerald-600/5",
    image:
      "bg-[radial-gradient(circle_at_35%_65%,#10b981_0%,transparent_50%),radial-gradient(circle_at_65%_35%,#34d399_0%,transparent_45%)]",
  },
  psychology: {
    icon: Brain,
    label: "Psychology",
    accent: "from-rose-500/20 to-rose-600/5",
    image:
      "bg-[radial-gradient(circle_at_30%_25%,#f43f5e_0%,transparent_50%),radial-gradient(circle_at_70%_75%,#fb7185_0%,transparent_45%)]",
  },
  business: {
    icon: Briefcase,
    label: "Business",
    accent: "from-slate-500/20 to-slate-600/5",
    image:
      "bg-[radial-gradient(circle_at_25%_30%,#64748b_0%,transparent_50%),radial-gradient(circle_at_75%_70%,#94a3b8_0%,transparent_45%)]",
  },
  entertainment: {
    icon: Clapperboard,
    label: "Entertainment",
    accent: "from-fuchsia-500/20 to-fuchsia-600/5",
    image:
      "bg-[radial-gradient(circle_at_35%_20%,#d946ef_0%,transparent_50%),radial-gradient(circle_at_65%_80%,#e879f9_0%,transparent_45%)]",
  },
  poll: {
    icon: BarChart2,
    label: "Poll",
    accent: "from-cyan-500/20 to-cyan-600/5",
    image:
      "bg-[radial-gradient(circle_at_40%_70%,#06b6d4_0%,transparent_50%),radial-gradient(circle_at_60%_30%,#22d3ee_0%,transparent_45%)]",
  },
};

export const TEST_TYPE_OPTIONS = (
  Object.entries(testTypeConfig) as [TestType, TestTypeVisual][]
).map(([value, config]) => ({ value, ...config }));
