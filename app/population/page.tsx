"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
    Users, Search, MapPin, Building2, ChevronRight, ChevronLeft, 
    ClipboardCheck, AlertCircle, UserPlus, CreditCard, Calendar, 
    Eye, Edit2, Trash2 
} from "lucide-react";
import { calculateAge } from "@/lib/utils/calculation";
import { ActionMenu, MenuItem } from "@/components/ui/ActionMenu";

interface Person {
    pid: number;
    cid: string | null;
    firstname: string;
    lastname: string;
    birth_date: string | null;
    telephone: string | null;
    hcode: string;
    hospital: { name: string };
    province: { name: string | null } | null;
    district: { name: string | null } | null;
    subdistrict: { name: string | null } | null;
}

export default function PopulationPage() {
    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        async function fetchPersons() {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/population?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลประชากรได้");
                setPersons(json.data || []);
                setTotalPages(json.meta.totalPages);
                setTotalItems(json.meta.total);
            } catch (err) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setIsLoading(false);
            }
        }

        const debounce = setTimeout(() => {
            fetchPersons();
        }, 300);

        return () => clearTimeout(debounce);
    }, [currentPage, searchQuery]);

    const getPersonActions = (person: Person): MenuItem[] => [
        {
            label: "ดูรายละเอียด",
            icon: <Eye size={16} className="text-primary" />,
            href: `/population/${person.pid}`
        },
        {
            label: "แก้ไขข้อมูล",
            icon: <Edit2 size={16} className="text-amber-500" />,
            href: `/population/edit/${person.pid}`
        },
        {
            label: "ข้อมูลคัดกรอง",
            icon: <ClipboardCheck size={16} className="text-emerald-500" />,
            href: `/population/screening/new?pid=${person.pid}`
        },
        {
            label: "ลบข้อมูล",
            icon: <Trash2 size={16} />,
            variant: "danger",
            onClick: () => {
                if (confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) {
                    console.log("Delete pid:", person.pid);
                }
            }
        }
    ];

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Users className="text-primary" />
                        ข้อมูลประชากร
                    </h1>
                    <p className="text-base text-muted-foreground mt-1">
                        รายชื่อผู้สูงอายุที่ลงทะเบียนในระบบ
                    </p>
                </div>
                <Link 
                    href="/population/new"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0 cursor-pointer"
                >
                    <UserPlus size={18} />
                    ลงทะเบียนใหม่
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อ, นามสกุล หรือ เลขบัตรประชาชน..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div className="bg-muted/50 rounded-2xl border border-border px-6 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
                    <Users size={16} />
                    <span>ทั้งหมด {totalItems.toLocaleString()} ราย</span>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <div className="bg-card border border-border rounded-3xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-muted/30 text-muted-foreground font-black uppercase tracking-widest text-xs border-b border-border">
                                <th className="px-6 py-4">ข้อมูลทั่วไป</th>
                                <th className="px-6 py-4">บัตรประชาชน / อายุ</th>
                                <th className="px-6 py-4">หน่วยบริการ</th>
                                <th className="px-6 py-4">ที่อยู่</th>
                                <th className="px-6 py-4 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-10 bg-muted rounded-xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : persons.length > 0 ? (
                                persons.map((person) => (
                                    <tr key={person.pid} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                                                    {person.firstname[0]}{person.lastname[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {person.firstname} {person.lastname}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter mt-0.5">
                                                        PID: {person.pid}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                    <CreditCard size={14} className="text-muted-foreground" />
                                                    <span className="font-mono">{person.cid || "ไม่ระบุ"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar size={14} />
                                                    <span>อายุ {calculateAge(person.birth_date!)} ปี</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 size={16} className="text-primary/60 shrink-0" />
                                                <span className="truncate max-w-[150px]">{person.hospital.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex items-start gap-1.5 max-w-[200px]">
                                                <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                                                <span className="text-xs line-clamp-2">
                                                    ต. {person.subdistrict?.name || "-"} อ. {person.district?.name || "-"} จ. {person.province?.name || "-"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionMenu items={getPersonActions(person)} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground/30">
                                                <Users size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-bold text-foreground">ไม่พบข้อมูลประชากร</p>
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
                            แสดง {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(totalItems, currentPage * itemsPerPage)} จาก {totalItems} ราย
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
