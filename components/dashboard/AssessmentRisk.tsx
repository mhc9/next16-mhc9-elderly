"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { dashboardData } from "@/lib/data-mock";

export default function AssessmentRisk() {
    return (
        <div className="lg:col-span-5 bg-card rounded-2xl shadow-sm border border-border">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">การประเมินความเสี่ยง</h2>
                        <p className="text-xs text-muted-foreground">เปรียบเทียบผลการประเมินทางคลินิก</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.assessments}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                            <Bar dataKey="normal" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} name="ปกติ" />
                            <Bar dataKey="risk" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} name="กลุ่มเสี่ยง" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
