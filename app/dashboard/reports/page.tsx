"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Search, Filter, Calendar, Building2, MapPin, ChevronRight, ChevronLeft, Loader2, AlertCircle, Plus } from "lucide-react";

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
    const [provinceFilter, setProvinceFilter] = useState<string>("all");
    const [districtFilter, setDistrictFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Reset to first page when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, yearFilter, provinceFilter, districtFilter]);

    // Derived data for filters
    const years = Array.from(new Set(reports.map(r => r.year))).sort((a, b) => b - a);
    const provinces = Array.from(new Set(reports.map(r => r.hospital.province?.name).filter(Boolean))).sort();
    
    // Districts should only show those in the selected province
    const districts = Array.from(new Set(
        reports
            .filter(r => provinceFilter === "all" || r.hospital.province?.name === provinceFilter)
            .map(r => r.hospital.district?.name)
            .filter(Boolean)
    )).sort();

    // Reset district if it's no longer in the valid list for the selected province
    useEffect(() => {
        if (districtFilter !== "all" && !districts.includes(districtFilter)) {
            setDistrictFilter("all");
        }
    }, [provinceFilter, districts, districtFilter]);

    const filteredReports = reports.filter(report => {
        const matchesSearch = 
            report.hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.hcode.includes(searchQuery);
        const matchesYear = yearFilter === "all" || report.year.toString() === yearFilter;
        const matchesProvince = provinceFilter === "all" || report.hospital.province?.name === provinceFilter;
        const matchesDistrict = districtFilter === "all" || report.hospital.district?.name === districtFilter;
        
        return matchesSearch && matchesYear && matchesProvince && matchesDistrict;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

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
                <Link 
                    href="/dashboard/reports/new"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0 whitespace-nowrap text-sm"
                >
                    <Plus size={18} />
                    New Report
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative group lg:col-span-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search hospital..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <MapPin size={18} />
                    </div>
                    <select
                        value={provinceFilter}
                        onChange={(e) => setProvinceFilter(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Provinces</option>
                        {provinces.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <MapPin size={18} />
                    </div>
                    <select
                        value={districtFilter}
                        onChange={(e) => setDistrictFilter(e.target.value)}
                        disabled={districts.length === 0}
                        className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                        <option value="all">All Districts</option>
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Calendar size={18} />
                    </div>
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Years</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted/50 rounded-xl border border-border text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    <Filter size={14} className="shrink-0" />
                    <span className="whitespace-nowrap">{filteredReports.length} Matches</span>
                </div>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 gap-4">
                {paginatedReports.length > 0 ? (
                    <>
                        {paginatedReports.map((report) => (
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
                                            {report.target_population > 0 
                                                ? ((report.screened_total / report.target_population) * 100).toFixed(1) 
                                                : "0.0"}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                            style={{ 
                                                width: `${report.target_population > 0 
                                                    ? Math.min(100, (report.screened_total / report.target_population) * 100) 
                                                    : 0}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-row items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                    Page <span className="text-foreground font-bold">{currentPage}</span> of <span className="text-foreground font-bold">{totalPages}</span>
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="flex items-center gap-1 mx-4">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Show pages around current page
                                            let pageNum = currentPage;
                                            if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 2 + i;
                                            
                                            // Ensure pageNum is valid
                                            if (pageNum < 1 || pageNum > totalPages) return null;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
                                                        currentPage === pageNum
                                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110"
                                                            : "bg-card border-border hover:bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>

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

