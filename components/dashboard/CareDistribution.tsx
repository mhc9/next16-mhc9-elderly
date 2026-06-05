"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { COLORS } from "@/lib/constants/dashboard";

export default function CareDistribution({ data = [] }: { data?: any[] }) {
    return (
        <div className="lg:col-span-4 bg-card rounded-2xl shadow-sm border border-border flex flex-col">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <PieChartIcon size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">ประเภทการดูแล</h2>
                        <p className="text-xs text-muted-foreground">สัดส่วนการให้ความช่วยเหลือ</p>
                    </div>
                </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-3 mt-6">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
                                <span className="text-sm font-medium text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
