"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";
import { COLORS } from "@/lib/constants/dashboard";

export default function ScreeningFunnel({ data = [] }: { data?: any[] }) {
    return (
        <div className="lg:col-span-8 bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">ประสิทธิภาพการคัดกรอง</h2>
                        <p className="text-xs text-muted-foreground">รายละเอียดขั้นตอนการคัดกรองและดูแล</p>
                    </div>
                </div>
            </div>
            <div className="py-6 px-4">
                <div className="h-[350px] w-full border">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                width={100}
                                tick={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    fill: "var(--foreground)"
                                }}
                            />
                            <Tooltip 
                                cursor={{
                                    fill: "var(--muted)",
                                    opacity: 0.4
                                }}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                    padding: "12px"
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
