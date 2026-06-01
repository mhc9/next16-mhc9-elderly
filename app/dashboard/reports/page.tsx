"use client";

import React, { useState, useEffect } from "react";
import { FileText, Search, Filter, Calendar, Building2, MapPin, ChevronRight, Loader2, AlertCircle } from "lucide-react";

interface SummaryReport {
    id: number;
    year: number;
    hcode: string;
    target_population: number;
    screened_total: number;
    screened_normal: number;
    screened_risk: number;
    hospital: {
        name: string;
        province?: { name: string };
        district?: { name: string };
    };
}

export default function SummaryReportsPage() {
    const [reports, setReports] = useState<SummaryReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [yearFilter, setYearFilter] = useState<string>("all");

    useEffect(() => {
        async function fetchReports() {
            try {
                const res = await fetch("/api/reports/summary");
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "Failed to fetch reports");
                setReports(json.data || []);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to fetch reports";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchReports();
    }, []);

    const years = Array.from(new Set(reports.map(r => r.year))).sort((a, b) => b - a);

    const filteredReports = reports.filter(report => {
        const matchesSearch = 
            report.hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.hcode.includes(searchQuery);
        const matchesYear = yearFilter === "all" || report.year.toString() === yearFilter;
        return matchesSearch && matchesYear;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse">Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <FileText className="text-primary" />
                        Summary Reports
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Overview of screening performance and elderly care distribution
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search hospital or hcode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Calendar size={18} />
                    </div>
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                    >
                        <option value="all">All Years</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 rounded-xl border border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    <Filter size={14} />
                    Found {filteredReports.length} Reports
                </div>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <div 
                            key={report.id}
                            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wide">
                                            Year {report.year}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            #{report.hcode}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                        {report.hospital.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {report.hospital.district?.name}, {report.hospital.province?.name}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Target</p>
                                        <p className="text-xl font-black text-foreground">{report.target_population.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Screened</p>
                                        <p className="text-xl font-black text-primary">{report.screened_total.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Normal</p>
                                        <p className="text-xl font-black text-emerald-600">{report.screened_normal.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Risk</p>
                                        <p className="text-xl font-black text-rose-600">{report.screened_risk.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <button className="p-2 rounded-xl bg-muted group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-5 space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                    <span className="text-muted-foreground">Screening Progress</span>
                                    <span className="text-primary">
                                        {((report.screened_total / report.target_population) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${(report.screened_total / report.target_population) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-3xl gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Building2 size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-foreground">No reports found</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
