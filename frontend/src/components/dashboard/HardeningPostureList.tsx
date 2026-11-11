import React from "react";
import { Link } from "react-router-dom";
import { TbRadar2 } from "react-icons/tb";
import { CategoryPosture } from "../../types/dashboard";

interface HardeningPostureListProps {
  categories: CategoryPosture[];
}

export const HardeningPostureList: React.FC<HardeningPostureListProps> = ({ categories }) => {
  return (
    <div className="rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <TbRadar2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200">CIS Hardening by Domain</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          CIS Docker Benchmark v1.6
        </span>
      </div>

      {/* Fluid Editorial List */}
      <div className="divide-y divide-white/[0.04] flex-1">
        {categories.map((cat, i) => {
          const categorySlug = cat.name.split(" ")[0].toUpperCase();
          return (
            <Link
              key={i}
              to={`/findings?category=${categorySlug}`}
              className="py-3 px-1 flex items-center justify-between gap-4 group hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer block"
            >
              {/* Category Name & Count */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 group-hover:text-white transition-colors truncate">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {cat.violations > 0 ? (
                      <span className="text-[10px] text-slate-400">
                        {cat.violations} violation{cat.violations === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400">passed</span>
                    )}
                    <span
                      style={{ color: cat.color }}
                      className="font-bold text-xs"
                    >
                      {cat.pass_rate}%
                    </span>
                  </div>
                </div>

                {/* Slender Minimalist Progress Indicator */}
                <div className="w-full h-1 bg-slate-950/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.pass_rate}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HardeningPostureList;
