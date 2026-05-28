"use client";

import React from "react";
import { MapPin, ChevronRight } from "lucide-react";
import { dashboardData } from "@/lib/data-mock";

export default function RegionalPerformance() {
    return (
        <div className="lg:col-span-7 bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Regional Performance</h2>
                        <p className="text-xs text-muted-foreground">Metrics across different districts</p>
                    </div>
                </div>
                <button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                    View All <ChevronRight size={14} />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-muted/30 text-muted-foreground font-bold border-b border-border">
                            <th className="px-6 py-4">District</th>
                            <th className="px-6 py-4">Target</th>
                            <th className="px-6 py-4">Coverage</th>
                            <th className="px-6 py-4 text-right">Care</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {dashboardData.districts.map((d, i) => (
                            <tr key={i} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-foreground">{d.name}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Region Alpha</div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground font-medium">{d.target.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full" 
                                                style={{ width: `${(d.screened/d.target*100).toFixed(0)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-foreground">{(d.screened/d.target*100).toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-xs font-black px-2.5 py-1 rounded-full">
                                        {d.care}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
