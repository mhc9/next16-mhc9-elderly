"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    User, Phone, Mail, Building2, MapPin, 
    ArrowLeft, Loader2, AlertCircle, Calendar, 
    Edit2, CreditCard, ClipboardCheck, 
    History, MoreVertical, Plus, ChevronRight
} from "lucide-react";
import { calculateAge } from "@/lib/utils/calculation";
import moment from "moment";
import "moment/locale/th";

interface Screening {
    id: number;
    screen_date: string;
    q2_result: boolean;
    q9_score: number | null;
    q9_result: boolean | null;
    q8_score: number | null;
    q8_result: boolean | null;
    care_type: string | null;
    year: number;
}

interface PersonData {
    pid: number;
    cid: string | null;
    firstname: string;
    lastname: string;
    birth_date: string | null;
    address: string | null;
    moo: number | null;
    road: string | null;
    zipcode: string | null;
    telephone: string | null;
    mobile: string | null;
    email: string | null;
    hcode: string;
    hospital: {
        name: string;
    };
    province: { name: string | null } | null;
    district: { name: string | null } | null;
    subdistrict: { name: string | null } | null;
    screenings: Screening[];
}

export default function PersonDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [person, setPerson] = useState<PersonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchPerson() {
            try {
                const res = await fetch(`/api/population/${id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลประชากรได้");
                setPerson(json);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลประชากรได้";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchPerson();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse font-medium">กำลังโหลดข้อมูลประชากร...</p>
            </div>
        );
    }

    if (error || !person) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span>กลับ</span>
                </button>
                <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-4">
                    <AlertCircle size={24} />
                    <div>
                        <p className="font-bold text-lg">เกิดข้อผิดพลาด</p>
                        <p className="text-sm">{error || "ไม่พบข้อมูลประชากร"}</p>
                    </div>
                </div>
            </div>
        );
    }

    const personInitials = `${person.firstname[0]}${person.lastname[0]}`;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 cursor-pointer group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">ย้อนกลับ</span>
                    </button>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <User className="text-primary" />
                        รายละเอียดประชากร
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        href={`/population/edit/${person.pid}`}
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold transition-all cursor-pointer border border-border"
                    >
                        <Edit2 size={18} />
                        แก้ไขข้อมูล
                    </Link>
                    <Link 
                        href={`/summary/reports/new?pid=${person.pid}`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                    >
                        <Plus size={18} />
                        คัดกรองใหม่
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center text-primary text-4xl font-bold mb-6 shadow-inner">
                            {personInitials}
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-1">
                            {person.firstname} {person.lastname}
                        </h2>
                        <p className="text-muted-foreground text-sm font-mono mb-6">
                            PID: {person.pid}
                        </p>

                        <div className="w-full space-y-3 mt-4 text-left">
                            <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">บัตรประชาชน</span>
                                    <span className="text-sm font-bold font-mono">{person.cid || "ไม่ระบุ"}</span>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">อายุ / วันเกิด</span>
                                    <span className="text-sm font-bold">
                                        {calculateAge(person.birth_date!)} ปี ({person.birth_date ? moment(person.birth_date).format("D MMM YYYY") : "ไม่ระบุ"})
                                    </span>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">เบอร์โทรศัพท์</span>
                                    <span className="text-sm font-bold">{person.mobile || person.telephone || "ไม่ระบุ"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Building2 size={20} className="text-primary" />
                            หน่วยบริการที่ดูแล
                        </h3>
                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                            <p className="text-sm font-bold text-foreground mb-1">{person.hospital.name}</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">HCODE: {person.hcode}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info & History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Address Card */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <MapPin size={20} className="text-primary" />
                            ข้อมูลที่อยู่
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">บ้านเลขที่ / หมู่ / ถนน</label>
                                    <p className="text-base font-bold text-foreground">
                                        {person.address || "-"} {person.moo && `หมู่ ${person.moo}`} {person.road && `ถ. ${person.road}`}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">รหัสไปรษณีย์</label>
                                    <p className="text-base font-bold text-foreground">{person.zipcode || "-"}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">ตำบล / อำเภอ / จังหวัด</label>
                                    <div className="space-y-1">
                                        <p className="text-base font-bold text-foreground">ต. {person.subdistrict?.name || "-"}</p>
                                        <p className="text-base font-bold text-foreground">อ. {person.district?.name || "-"}</p>
                                        <p className="text-base font-bold text-foreground">จ. {person.province?.name || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screening History */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <History size={20} className="text-primary" />
                                ประวัติการคัดกรอง
                            </h3>
                            <span className="text-xs font-bold text-muted-foreground px-3 py-1 bg-muted rounded-full">
                                ทั้งหมด {person.screenings.length} ครั้ง
                            </span>
                        </div>

                        {person.screenings.length > 0 ? (
                            <div className="space-y-4">
                                {person.screenings.map((s) => (
                                    <div key={s.id} className="group relative p-5 bg-muted/20 hover:bg-muted/40 border border-border rounded-2xl transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                                    s.q2_result ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                                                }`}>
                                                    <ClipboardCheck size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-foreground">
                                                            {moment(s.screen_date).format("D MMMM YYYY")}
                                                        </span>
                                                        <span className="text-[10px] font-black bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                                                            ปี {s.year}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-muted-foreground">ผล 2Q plus:</span>
                                                            <span className={`text-xs font-bold ${s.q2_result ? "text-rose-600" : "text-emerald-600"}`}>
                                                                {s.q2_result ? "เสี่ยง" : "ปกติ"}
                                                            </span>
                                                        </div>
                                                        {(s.q9_score !== null) && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs text-muted-foreground">9Q:</span>
                                                                <span className="text-xs font-bold text-foreground">{s.q9_score} คะแนน</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-primary">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                                    <ClipboardCheck size={32} />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-foreground">ยังไม่มีประวัติการคัดกรอง</p>
                                    <p className="text-xs text-muted-foreground mb-6">เริ่มการคัดกรองครั้งแรกเพื่อติดตามสุขภาพจิต</p>
                                    <Link 
                                        href={`/summary/reports/new?pid=${person.pid}`}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                                    >
                                        <Plus size={18} />
                                        เริ่มการคัดกรอง
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
