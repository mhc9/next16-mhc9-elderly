"use client";

import React from "react";
import { Trophy, Medal, Building2, MapPin } from "lucide-react";

interface TopHospital {
    hcode: string;
    name: string;
    district: string;
    province: string;
    target: number;
    screened: number;
    coverage: number;
}

export default function TopPerformers({ data = [] }: { data?: TopHospital[] }) {
    const getBadgeColor = (index: number) => {
        switch (index) {
            case 0: return "bg-amber-100 text-amber-600 border-amber-200";
            case 1: return "bg-slate-100 text-slate-600 border-slate-200";
            case 2: return "bg-orange-100 text-orange-600 border-orange-200";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    const getCoverageColor = (val: number) => {
        if (val >= 80) return "text-primary";
        if (val >= 60) return "text-lime-600";
        if (val >= 40) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">หน่วยบริการยอดเยี่ยม</h2>
                        <p className="text-xs text-muted-foreground">5 อันดับแรกที่มีความครอบคลุมสูงสุด</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 py-6 px-4">
                <div className="space-y-4">
                    {data.length > 0 ? (
                        data.map((h, idx) => (
                            <div key={h.hcode} className="flex items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 font-black text-sm shadow-sm ${getBadgeColor(idx)}`}>
                                    {idx < 3 ? <Medal size={20} /> : idx + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                        {h.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                        <MapPin size={10} className="shrink-0" />
                                        <span className="truncate">{h.district}, {h.province}</span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className={`text-sm font-black ${getCoverageColor(h.coverage)}`}>
                                        {h.coverage.toFixed(1)}%
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                        {h.screened.toLocaleString()} / {h.target.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                            <Building2 className="text-muted-foreground opacity-20" size={40} />
                            <p className="text-xs text-muted-foreground font-medium">ไม่มีข้อมูลหน่วยบริการ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
