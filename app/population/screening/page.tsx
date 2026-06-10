"use client";

import React, { useState, useEffect } from "react";
import { 
    ClipboardCheck, Search, Building2, ChevronRight, ChevronLeft, 
    Loader2, AlertCircle, Plus, Activity, Brain, HeartPulse, ArrowLeft,
    Eye, Trash2, FileText,
    Edit2
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import moment from "moment";
import "moment/locale/th";
import { ActionMenu, MenuItem } from "@/components/ui/ActionMenu";

interface Screening {
    id: number;
    person_id: number;
    screen_date: string;
    q2_result: boolean;
    q9_score: number | null;
    q9_result: boolean | null;
    q8_score: number | null;
    q8_result: boolean | null;
    care_type: string | null;
    year: number;
    person: {
        firstname: string;
        lastname: string;
        cid: string | null;
        hospital: {
            name: string;
        };
    };
}

export default function ScreeningListPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pid = searchParams.get("pid");
    
    const [screenings, setScreenings] = useState<Screening[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        async function fetchScreenings() {
            setIsLoading(true);
            try {
                const url = new URL("/api/screenings", window.location.origin);
                url.searchParams.append("page", currentPage.toString());
                url.searchParams.append("limit", itemsPerPage.toString());
                url.searchParams.append("search", searchQuery);
                if (pid) url.searchParams.append("pid", pid);

                const res = await fetch(url.toString());
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลการคัดกรองได้");
                setScreenings(json.data || []);
                setTotalPages(json.meta.totalPages);
                setTotalItems(json.meta.total);
            } catch (err) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setIsLoading(false);
            }
        }

        const debounce = setTimeout(() => {
            fetchScreenings();
        }, 300);

        return () => clearTimeout(debounce);
    }, [currentPage, searchQuery, pid]);

    const getScreeningActions = (s: Screening): MenuItem[] => [
        {
            label: "ดูรายละเอียด",
            icon: <Eye size={16} className="text-primary" />,
            href: `/population/screening/${s.id}`
        },
        {
            label: "แก้ไขข้อมูล",
            icon: <Edit2 size={16} className="text-amber-500" />,
            onClick: () => alert("ฟีเจอร์นี้กำลังพัฒนา...")
        },
        {
            label: "ลบข้อมูล",
            icon: <Trash2 size={16} />,
            variant: "danger",
            onClick: () => {
                if (confirm("คุณต้องการลบข้อมูลการคัดกรองนี้ใช่หรือไม่?")) {
                    console.log("Delete screening id:", s.id);
                }
            }
        }
    ];

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    {pid && (
                        <button 
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 cursor-pointer group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">ย้อนกลับ</span>
                        </button>
                    )}
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <ClipboardCheck className="text-primary" />
                        {pid ? "ประวัติการคัดกรองรายบุคคล" : "ประวัติการคัดกรอง"}
                    </h1>
                    <p className="text-base text-muted-foreground">
                        {pid ? "รายการคัดกรองทั้งหมดของผู้รับบริการท่านนี้" : "รายการคัดกรองและสุขภาพจิตทั้งหมดในระบบ"}
                    </p>
                </div>
                <Link 
                    href="/population/screening/new"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0 cursor-pointer"
                >
                    <Plus size={18} />
                    ทำแบบคัดกรองใหม่
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อผู้รับบริการ หรือ เลขบัตรประชาชน..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div className="bg-muted/50 rounded-2xl border border-border px-6 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
                    <Activity size={16} />
                    <span>ทั้งหมด {totalItems.toLocaleString()} รายการ</span>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-muted/30 text-muted-foreground font-black uppercase tracking-widest text-xs border-b border-border">
                                <th className="px-6 py-4">วันที่คัดกรอง / ปี</th>
                                <th className="px-6 py-4">ผู้รับบริการ</th>
                                <th className="px-6 py-4">ผล 2Q plus</th>
                                <th className="px-6 py-4">คะแนน 9Q / 8Q</th>
                                <th className="px-6 py-4">หน่วยบริการ</th>
                                <th className="px-6 py-4 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-10 bg-muted rounded-xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : screenings.length > 0 ? (
                                screenings.map((s) => (
                                    <tr key={s.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="font-bold text-foreground">
                                                    {moment(s.screen_date).format("D MMM YYYY")}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">
                                                    ปีงบประมาณ {s.year}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                    {s.person.firstname[0]}{s.person.lastname[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {s.person.firstname} {s.person.lastname}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                        CID: {s.person.cid || "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                s.q2_result 
                                                    ? "bg-rose-100 text-rose-600 border border-rose-200" 
                                                    : "bg-emerald-100 text-emerald-600 border border-emerald-200"
                                            }`}>
                                                {s.q2_result ? "เสี่ยง (Risk)" : "ปกติ (Normal)"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Brain size={14} className="text-muted-foreground" />
                                                    <span className="text-xs font-medium">9Q: </span>
                                                    <span className={`text-xs font-bold ${s.q9_result ? "text-rose-600" : "text-foreground"}`}>
                                                        {s.q9_score !== null ? s.q9_score : "-"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <HeartPulse size={14} className="text-muted-foreground" />
                                                    <span className="text-xs font-medium">8Q: </span>
                                                    <span className={`text-xs font-bold ${s.q8_result ? "text-rose-600" : "text-foreground"}`}>
                                                        {s.q8_score !== null ? s.q8_score : "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 size={16} className="text-primary/60 shrink-0" />
                                                <span className="truncate max-w-[150px]">{s.person.hospital.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionMenu items={getScreeningActions(s)} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground/30">
                                                <ClipboardCheck size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-bold text-foreground">ไม่พบข้อมูลการคัดกรอง</p>
                                                <p className="text-xs text-muted-foreground">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-5 border-t border-border flex flex-col sm:flex-row items-center justify-between bg-muted/10 gap-4">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                            แสดง {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(totalItems, currentPage * itemsPerPage)} จาก {totalItems} รายการ
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            <div className="flex items-center gap-1.5 px-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                    }
                                    if (pageNum < 1 || pageNum > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                                                currentPage === pageNum
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110"
                                                    : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || isLoading}
                                className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
