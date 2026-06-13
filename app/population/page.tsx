"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
    Users, Search, MapPin, Building2, ChevronRight, ChevronLeft, 
    ClipboardCheck, AlertCircle, UserPlus, CreditCard, Calendar, 
    Eye, Edit2, Trash2, Filter, X
} from "lucide-react";
import { calculateAge } from "@/lib/utils/calculation";
import { ActionMenu, MenuItem } from "@/components/ui/ActionMenu";
import { useSession } from "next-auth/react";
import SearchableSelect from "@/components/ui/forms/SearchableSelect";

interface LocationOption {
    id: number;
    name: string;
}

interface Person {
    pid: number;
    cid: string | null;
    prefix: string | null;
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
    const { data: session } = useSession();
    const user = session?.user;
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Filter State
    const [provinceFilter, setProvinceFilter] = useState("all");
    const [districtFilter, setDistrictFilter] = useState("all");
    const [hcodeFilter, setHcodeFilter] = useState("all");

    // Filter Options
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [hospitals, setHospitals] = useState<{hcode: string, name: string}[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Load Provinces
    useEffect(() => {
        if (isAdmin) {
            async function fetchProvinces() {
                try {
                    const res = await fetch("/api/locations/provinces");
                    const json = await res.json();
                    setProvinces(json.data || []);
                } catch (err) { console.error("Failed to fetch provinces"); }
            }
            fetchProvinces();
        }
    }, [isAdmin]);

    // Load Districts when province changes
    useEffect(() => {
        if (isAdmin && provinceFilter !== "all") {
            async function fetchDistricts() {
                try {
                    const res = await fetch(`/api/locations/districts/${provinceFilter}`);
                    const json = await res.json();
                    setDistricts(json.data || []);
                    setDistrictFilter("all");
                } catch (err) { console.error("Failed to fetch districts"); }
            }
            fetchDistricts();
        } else {
            setDistricts([]);
            setDistrictFilter("all");
        }
    }, [isAdmin, provinceFilter]);

    // Load Hospitals based on filters
    useEffect(() => {
        if (isAdmin) {
            async function fetchHospitals() {
                try {
                    let url = "/api/hospitals/search?q=";
                    if (districtFilter !== "all") url += `&districtId=${districtFilter}`;
                    else if (provinceFilter !== "all") url += `&provinceId=${provinceFilter}`;

                    const res = await fetch(url);
                    const json = await res.json();
                    setHospitals(json.data || []);
                } catch (err) { console.error("Failed to fetch hospitals"); }
            }
            fetchHospitals();
        }
    }, [isAdmin, provinceFilter, districtFilter]);

    // Reset hcode when location changes
    useEffect(() => {
        setHcodeFilter("all");
    }, [provinceFilter, districtFilter]);

    useEffect(() => {
        async function fetchPersons() {
            setIsLoading(true);
            try {
                let url = `/api/population?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}`;
                if (isAdmin) {
                    if (provinceFilter !== "all") url += `&provinceId=${provinceFilter}`;
                    if (districtFilter !== "all") url += `&districtId=${districtFilter}`;
                    if (hcodeFilter !== "all") url += `&hcode=${hcodeFilter}`;
                }

                const res = await fetch(url);
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
    }, [currentPage, searchQuery, provinceFilter, districtFilter, hcodeFilter, isAdmin]);

    // Reset to page 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, provinceFilter, districtFilter, hcodeFilter]);

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
            {/* Page Header */}
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

            {/* Filters */}
            <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'md:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-4'}`}>
                <div className={`${isAdmin ? 'lg:col-span-1' : 'md:col-span-3'} relative group`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อ, เลขบัตร..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {isAdmin && (
                    <>
                        <div className="md:col-span-1">
                            <SearchableSelect
                                placeholder="ทุกจังหวัด"
                                options={provinces.map(p => ({ value: p.id.toString(), label: p.name }))}
                                value={provinceFilter === "all" ? "" : provinceFilter}
                                onChange={(val) => setProvinceFilter(val || "all")}
                                icon={<MapPin size={18} className="text-muted-foreground" />}
                                prefixIcon={<MapPin size={18} />}
                                searchable
                                clearable
                            />
                        </div>

                        <div className="md:col-span-1">
                            <SearchableSelect
                                placeholder="ทุกอำเภอ"
                                options={districts.map(d => ({ value: d.id.toString(), label: d.name }))}
                                value={districtFilter === "all" ? "" : districtFilter}
                                onChange={(val) => setDistrictFilter(val || "all")}
                                disabled={districts.length === 0}
                                icon={<MapPin size={18} className="text-muted-foreground" />}
                                prefixIcon={<MapPin size={18} />}
                                searchable
                                clearable
                            />
                        </div>

                        <div className="md:col-span-1">
                            <SearchableSelect
                                placeholder="ทุกหน่วยบริการ"
                                options={hospitals.map(h => ({ value: h.hcode, label: h.name }))}
                                value={hcodeFilter === "all" ? "" : hcodeFilter}
                                onChange={(val) => setHcodeFilter(val || "all")}
                                icon={<Building2 size={18} className="text-muted-foreground" />}
                                prefixIcon={<Building2 size={18} />}
                                searchable
                                clearable
                            />
                        </div>
                    </>
                )}

                <div className="bg-muted/50 rounded-2xl border border-border px-6 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
                    <Users size={16} />
                    <span className="whitespace-nowrap">ทั้งหมด {totalItems.toLocaleString()} ราย</span>
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
                                                        {person.prefix} {person.firstname} {person.lastname}
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
