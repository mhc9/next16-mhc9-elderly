"use client";

import React from "react";
import { ArrowUpRight, Calendar, LayoutDashboard } from "lucide-react";

interface DashboardHeaderProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export default function DashboardHeader({ selectedYear, onYearChange }: DashboardHeaderProps) {
    const years = [2569, 2568, 2567];

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <LayoutDashboard className="text-primary" />
                    สรุปผลการดำเนินงาน
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    รายงานผลการดำเนินงาน ประจำปีงบประมาณ {selectedYear}
                </p>
            </div>
            <div className="flex sm:flex-row items-center gap-3">
                <div className="relative group min-w-[140px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Calendar size={18} />
                    </div>
                    <select
                        value={selectedYear}
                        onChange={(e) => onYearChange(parseInt(e.target.value))}
                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>ปีงบประมาณ {y}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer">
                        ส่งออกรายงาน <ArrowUpRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
