"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Executive Summary
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Fiscal Year 2569 Performance Report
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
              <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            +5
          </div>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2">
          Export Report <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
