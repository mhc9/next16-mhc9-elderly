"use client";

import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ScreeningFunnel from "@/components/dashboard/ScreeningFunnel";
import CareDistribution from "@/components/dashboard/CareDistribution";
import AssessmentRisk from "@/components/dashboard/AssessmentRisk";
import RegionalPerformance from "@/components/dashboard/RegionalPerformance";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardHeader />
      <SummaryCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ScreeningFunnel />
        <CareDistribution />
        <AssessmentRisk />
        <RegionalPerformance />
      </div>
    </div>
  );
}
