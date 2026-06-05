"use client";

import React from "react";
import { ArrowUpRight, Calendar } from "lucide-react";

interface DashboardHeaderProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export default function DashboardHeader({ selectedYear, onYearChange }: DashboardHeaderProps) {
    const years = [2569, 2568, 2567];

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    สรุปผลการดำเนินงาน
                </h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    รายงานผลการดำเนินงาน ประจำปีงบประมาณ {selectedYear}
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative group min-w-[140px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Calendar size={18} />
                    </div>
                    <select
                        value={selectedYear}
                        onChange={(e) => onYearChange(parseInt(e.target.value))}
                        className="w-full bg-card border border-border rounded-xl py-2 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>ปีงบประมาณ {y}</option>
                        ))}
                    </select>
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
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer">
                        ส่งออกรายงาน <ArrowUpRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
