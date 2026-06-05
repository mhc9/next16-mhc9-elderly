"use client";

import React, { useState, useMemo } from "react";
import { MapPin, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";

interface DistrictData {
    name: string;
    province: string;
    target: number;
    screened: number;
    risk: number;
    care: number;
}

export default function RegionalPerformance({ 
    data = [], 
    provinces = [],
    year = 2569
}: { 
    data?: DistrictData[]; 
    provinces?: string[];
    year?: number;
}) {
    const [selectedProvince, setSelectedProvince] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter data based on selected province
    const filteredData = useMemo(() => {
        if (selectedProvince === "all") return data;
        return data.filter(d => d.province === selectedProvince);
    }, [data, selectedProvince]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    // Reset page when filter changes
    const handleProvinceChange = (province: string) => {
        setSelectedProvince(province);
        setCurrentPage(1);
    };

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">ผลการดำเนินงานรายพื้นที่</h2>
                        <p className="text-xs text-muted-foreground">ข้อมูลแยกตามรายอำเภอ</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group w-full md:min-w-[200px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                            <Filter size={16} />
                        </div>
                        <select
                            value={selectedProvince}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
                        >
                            <option value="all">ทุกจังหวัด</option>
                            {provinces.map(province => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-muted/30 text-muted-foreground font-bold border-b border-border">
                            <th className="px-6 py-4">อำเภอ / จังหวัด</th>
                            <th className="px-6 py-4 hidden sm:table-cell">เป้าหมาย</th>
                            <th className="px-6 py-4">ความครอบคลุม</th>
                            <th className="px-6 py-4 text-right hidden sm:table-cell">การดูแล</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((d, i) => {
                                const coverage = d.target > 0 ? (d.screened / d.target * 100) : 0;
                                
                                const getColors = (val: number) => {
                                    if (val >= 80) return { text: "text-primary", bg: "bg-primary" };
                                    if (val >= 60) return { text: "text-lime-600", bg: "bg-lime-500" };
                                    if (val >= 40) return { text: "text-cyan-500", bg: "bg-cyan-500" };
                                    if (val >= 20) return { text: "text-amber-500", bg: "bg-amber-500" };
                                    return { text: "text-rose-500", bg: "bg-rose-500" };
                                };

                                const colors = getColors(coverage);

                                return (
                                    <tr key={i} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link 
                                                href={`/summary/reports?district=${encodeURIComponent(d.name)}&province=${encodeURIComponent(d.province)}&year=${year}`}
                                                className="font-bold text-foreground group-hover:text-primary transition-colors hover:underline"
                                            >
                                                {d.name}
                                            </Link>
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                                                จ. {d.province}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-medium hidden sm:table-cell">
                                            {d.target.toLocaleString()} <span className="text-[10px]">คน</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-[60px] sm:min-w-[100px] h-2 bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                                                        style={{ width: `${coverage.toFixed(0)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-black ${colors.text}`}>
                                                    {coverage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                                            <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-lg">
                                                {d.care.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                    ไม่พบข้อมูลที่ตรงตามเงื่อนไข
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-center sm:justify-between bg-muted/20 gap-4">
                    <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                        แสดง {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredData.length, currentPage * itemsPerPage)} จาก {filteredData.length} รายการ
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="flex items-center gap-1 px-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple pagination display logic
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                }
                                if (pageNum < 1) return null;
                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            currentPage === pageNum 
                                                ? "bg-primary text-white shadow-md shadow-primary/20" 
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
