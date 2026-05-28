"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  Users, ClipboardCheck, AlertTriangle, HeartPulse, 
  Activity, Filter, TrendingUp, MapPin, ArrowUpRight, ChevronRight,
  Target, BarChart3, PieChart as PieChartIcon
} from "lucide-react";
import { dashboardData } from "@/lib/data-mock";

const COLORS = ["#0d9488", "#0ea5e9", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"];
const RISK_COLORS = { normal: "#0d9488", risk: "#f43f5e" };

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.summary.map((item, idx) => (
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
                Updated Today
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
              <span className="text-[10px] text-muted-foreground font-medium">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Screening Funnel */}
        <div className="lg:col-span-8 bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Screening Performance</h2>
                <p className="text-xs text-muted-foreground">Detailed breakdown of the screening funnel</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.funnel} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "var(--foreground)" }}
                  />
                  <Tooltip 
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px" }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                    {dashboardData.funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Care Distribution */}
        <div className="lg:col-span-4 bg-card rounded-2xl shadow-sm border border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <PieChartIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Care Types</h2>
                <p className="text-xs text-muted-foreground">Distribution of assistance</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.careTypes}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {dashboardData.careTypes.map((entry, index) => (
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
              {dashboardData.careTypes.map((item, i) => (
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

        {/* Assessment Risk Comparison */}
        <div className="lg:col-span-5 bg-card rounded-2xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Risk Assessment</h2>
                <p className="text-xs text-muted-foreground">Comparison of clinical findings</p>
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
                  <Bar dataKey="normal" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} name="Normal" />
                  <Bar dataKey="risk" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} name="At Risk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* District Summary Table */}
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
      </div>
    </div>
  );
}
