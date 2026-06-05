"use client";

import React from "react";
import { Users, ClipboardCheck, AlertTriangle, HeartPulse } from "lucide-react";

interface SummaryItem {
    label: string;
    value: number;
    suffix: string;
    icon: string;
}

export default function SummaryCards({ data = [] }: { data?: SummaryItem[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((item, idx) => (
                <div key={idx} className="group bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        {item.icon === "Users" && <Users size={120} />}
                        {item.icon === "ClipboardCheck" && <ClipboardCheck size={120} />}
                        {item.icon === "AlertTriangle" && <AlertTriangle size={120} />}
                        {item.icon === "HeartPulse" && <HeartPulse size={120} />}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${
                            idx === 0 ? "bg-teal-50 text-teal-600" :
                            idx === 1 ? "bg-blue-50 text-blue-600" :
                            idx === 2 ? "bg-rose-50 text-rose-600" :
                            "bg-amber-50 text-amber-600"
                        }`}>
                            {item.icon === "Users" && <Users size={22} />}
                            {item.icon === "ClipboardCheck" && <ClipboardCheck size={22} />}
                            {item.icon === "AlertTriangle" && <AlertTriangle size={22} />}
                            {item.icon === "HeartPulse" && <HeartPulse size={22} />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            อัปเดตวันนี้
                        </span>
                    </div>
                    
                    <p className="text-sm font-semibold text-muted-foreground">{item.label}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <h3 className="text-3xl font-black text-foreground">
                            {item.value.toLocaleString()}
                        </h3>
                        <span className="text-sm font-bold text-muted-foreground">{item.suffix}</span>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            +2.4%
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">เทียบกับเดือนที่แล้ว</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
