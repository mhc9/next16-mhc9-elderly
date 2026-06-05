"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";
import { COLORS } from "@/lib/constants/dashboard";

export default function ScreeningFunnel({ data = [] }: { data?: any[] }) {
    const totalTarget = data.length > 0 ? data[0].value : 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percentageNum = totalTarget > 0 ? (value / totalTarget * 100) : 0;
            const percentage = percentageNum.toFixed(2);

            const getStatusColor = (val: number) => {
                if (val >= 60) return "text-primary";
                if (val >= 30) return "text-amber-500";
                return "text-rose-500";
            };

            const getBarColor = (val: number) => {
                if (val >= 60) return "bg-primary";
                if (val >= 30) return "bg-amber-500";
                return "bg-rose-500";
            };

            const statusColor = getStatusColor(percentageNum);
            const barColor = getBarColor(percentageNum);

            return (
                <div className="lg:col-span-6 bg-card border border-border p-3 rounded-xl shadow-xl space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-foreground">
                            {value.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">คน</span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="h-1 w-8 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${barColor} rounded-full`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className={`text-xs font-bold ${statusColor}`}>
                                {percentage}%
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

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
                <div className="h-[350px] w-full">
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
                                content={<CustomTooltip />}
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
