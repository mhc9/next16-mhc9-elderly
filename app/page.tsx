"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ScreeningFunnel from "@/components/dashboard/ScreeningFunnel";
import CareDistribution from "@/components/dashboard/CareDistribution";
import AssessmentRisk from "@/components/dashboard/AssessmentRisk";
import RegionalPerformance from "@/components/dashboard/RegionalPerformance";
import TopPerformers from "@/components/dashboard/TopPerformers";

export default function Dashboard() {
    const [selectedYear, setSelectedYear] = useState<number>(2569);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboardData() {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/reports/summary/fetch?year=${selectedYear}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to fetch dashboard data");
                setData(json.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        }
        fetchDashboardData();
    }, [selectedYear]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse font-medium">กำลังโหลดข้อมูลแดชบอร์ด...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <DashboardHeader selectedYear={selectedYear} onYearChange={setSelectedYear} />
            <SummaryCards data={data?.summary} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <ScreeningFunnel data={data?.funnel} />
                <CareDistribution data={data?.careTypes} />
            </div>

            <div className="grid grid-cols-2 gap-8">
                <AssessmentRisk data={data?.assessments} />
                <TopPerformers data={data?.topScreenings} />
            </div>

            <div className="grid grid-cols-1 gap-8">
                <RegionalPerformance
                    data={data?.districts}
                    provinces={data?.provinces}
                    year={selectedYear}
                />
            </div>
        </div>
    );
}
