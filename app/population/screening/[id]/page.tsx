"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ClipboardCheck, User, Calendar, Activity, 
    Brain, HeartPulse, MessageSquare, ArrowLeft, 
    Loader2, AlertCircle, Building2, MapPin,
    Clock, CheckCircle2, XCircle, Edit
} from "lucide-react";
import Link from "next/link";
import moment from "moment";
import "moment/locale/th";
import { ActionMenu } from "@/components/ui/ActionMenu";

interface ScreeningData {
    id: number;
    person_id: number;
    screen_date: string;
    q2_result: string;
    q9_score: number | null;
    q9_result: boolean | null;
    q8_score: number | null;
    q8_result: boolean | null;
    care_type: string | null;
    care_detail: string | null;
    care_date: string | null;
    remark: string | null;
    q2_result_2: string | null;
    screen_date_2: string | null;
    year: number;
    person: {
        firstname: string;
        lastname: string;
        cid: string | null;
        birth_date: string | null;
        hospital: {
            name: string;
        };
        province: { name: string | null } | null;
        district: { name: string | null } | null;
        subdistrict: { name: string | null } | null;
    };
}

export default function ScreeningDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [screening, setScreening] = useState<ScreeningData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchScreening() {
            try {
                const res = await fetch(`/api/screenings/${id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลการคัดกรองได้");
                setScreening(json.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchScreening();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse font-medium">กำลังโหลดข้อมูลการคัดกรอง...</p>
            </div>
        );
    }

    if (error || !screening) {
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
                        <p className="text-sm">{error || "ไม่พบข้อมูลการคัดกรอง"}</p>
                    </div>
                </div>
            </div>
        );
    }

    const careTypeLabel = (type: string | null) => {
        if (!type) return "ไม่ระบุ";
        return type;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
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
                        <ClipboardCheck className="text-primary" />
                        รายละเอียดการคัดกรอง
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-muted rounded-xl border border-border flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="text-sm font-bold">ปีงบประมาณ {screening.year}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Person & Hospital Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User size={16} className="text-primary" />
                            ข้อมูลผู้รับบริการ
                        </h3>
                        
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mb-4">
                                {screening.person.firstname[0]}{screening.person.lastname[0]}
                            </div>
                            <h4 className="font-bold text-lg">{screening.person.firstname} {screening.person.lastname}</h4>
                            <p className="text-xs text-muted-foreground font-mono mt-1">CID: {screening.person.cid || "-"}</p>
                        </div>

                        <div className="space-y-4 border-t border-border pt-6">
                            <div className="flex items-start gap-3">
                                <Building2 size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">หน่วยบริการ</p>
                                    <p className="text-sm font-bold">{screening.person.hospital.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">ที่ตั้ง</p>
                                    <p className="text-sm text-foreground">
                                        ต.{screening.person.subdistrict?.name} อ.{screening.person.district?.name} จ.{screening.person.province?.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link 
                            href={`/population/${screening.person_id}`}
                            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold transition-all"
                        >
                            ดูโปรไฟล์ทั้งหมด
                        </Link>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-primary" />
                            วันคัดกรอง
                        </h3>
                        <p className="text-xl font-bold text-foreground">
                            {moment(screening.screen_date).format("D MMMM YYYY")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            เวลา {moment(screening.screen_date).format("HH:mm")} น.
                        </p>
                    </div>
                </div>

                {/* Right Column: Screening Results */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Results Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center gap-2 shadow-sm ${
                            screening.q2_result === "NORMAL" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                        }`}>
                            <Activity size={24} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">ผล 2Q plus</p>
                                <p className="text-lg font-black">
                                    {screening.q2_result === "NORMAL" ? "ปกติ" : 
                                     screening.q2_result === "RISK_Q12" ? "เสี่ยง Q1/Q2" : "เสี่ยง Q3"}
                                </p>
                            </div>
                        </div>

                        <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center gap-2 shadow-sm ${
                            screening.q9_result ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}>
                            <Brain size={24} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">ประเมิน 9Q</p>
                                <p className="text-lg font-black">{screening.q9_result ? "เสี่ยง" : "ปกติ"}</p>
                            </div>
                        </div>

                        <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center gap-2 shadow-sm ${
                            screening.q8_result ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}>
                            <HeartPulse size={24} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">ประเมิน 8Q</p>
                                <p className="text-lg font-black">{screening.q8_result ? "เสี่ยง" : "ปกติ"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Score Details */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-primary" />
                            คะแนนการประเมิน
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                            <Brain size={20} />
                                        </div>
                                        <span className="font-bold">คะแนน 9Q</span>
                                    </div>
                                    <span className="text-2xl font-black">{screening.q9_score ?? "-"}</span>
                                </div>
                                <p className="text-xs text-muted-foreground px-2 italic">
                                    * เกณฑ์คะแนน 9Q: คะแนนตั้งแต่ 7 ขึ้นไป ถือว่า "มีความเสี่ยง"
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                            <HeartPulse size={20} />
                                        </div>
                                        <span className="font-bold">คะแนน 8Q</span>
                                    </div>
                                    <span className="text-2xl font-black">{screening.q8_score ?? "-"}</span>
                                </div>
                                <p className="text-xs text-muted-foreground px-2 italic">
                                    * เกณฑ์คะแนน 8Q: คะแนนตั้งแต่ 1 ขึ้นไป ถือว่า "มีความเสี่ยง"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Care Details */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <MessageSquare size={20} className="text-primary" />
                                การดูแลช่วยเหลือ
                            </h3>
                            {screening.care_date && (
                                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50">
                                    <Calendar size={14} />
                                    <span className="text-xs font-bold">วันที่ให้บริการ: {moment(screening.care_date).format("D MMM YYYY")}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">รูปแบบการดูแล</label>
                                <div className="flex flex-wrap gap-2">
                                    {screening.care_type?.split(", ").map((type, idx) => (
                                        <div key={idx} className="inline-flex px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs">
                                            {type}
                                        </div>
                                    ))}
                                    {!screening.care_type && <span className="text-sm text-muted-foreground italic">ไม่ระบุ</span>}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">รายละเอียดการดูแล</label>
                                <div className="p-5 bg-muted/30 rounded-2xl border border-border min-h-[100px]">
                                    {screening.care_detail ? (
                                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                            {screening.care_detail}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">ไม่มีรายละเอียดเพิ่มเติม</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remark Section */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <AlertCircle size={20} className="text-primary" />
                            ปัญหา/สาเหตุ
                        </h3>

                        <div className="p-5 bg-rose-50/30 rounded-2xl border border-rose-100 min-h-[80px]">
                            {screening.remark ? (
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {screening.remark}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">ไม่มีข้อมูลปัญหาหรือสาเหตุเพิ่มเติม</p>
                            )}
                        </div>
                    </div>

                    {/* Round 2 Result (If exists) */}
                    {screening.q2_result_2 && (
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Activity size={20} className="text-blue-500" />
                                    ผลการคัดกรองรอบที่ 2 (ติดตาม)
                                </h3>
                                <ActionMenu 
                                    items={[
                                        {
                                            label: "แก้ไขผลการติดตาม",
                                            icon: <Edit size={16} />,
                                            href: `/population/screening/follow-up/${screening.id}`
                                        }
                                    ]}
                                />
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className={`px-8 py-4 rounded-2xl border flex items-center gap-4 ${
                                    screening.q2_result_2 === "NORMAL" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                                }`}>
                                    <CheckCircle2 size={32} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">ผลลัพธ์รอบที่ 2</p>
                                        <p className="text-xl font-black">
                                            {screening.q2_result_2 === "NORMAL" ? "ปกติ" : 
                                             screening.q2_result_2 === "RISK_Q12" ? "เสี่ยง Q1/Q2" : "เสี่ยง Q3"}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar size={20} />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter">วันที่คัดกรองรอบที่ 2</p>
                                        <p className="font-bold">{moment(screening.screen_date_2).format("D MMMM YYYY")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        {!screening.q2_result_2 && (
                            <Link 
                                href={`/population/screening/follow-up/${screening.id}`}
                                className="px-8 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Activity size={18} />
                                ติดตามผลรอบที่ 2
                            </Link>
                        )}
                        <Link 
                            href={`/population/screening/edit/${screening.id}`}
                            className="px-8 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold transition-all cursor-pointer"
                        >
                            แก้ไขข้อมูล
                        </Link>
                        <button 
                            onClick={async () => {
                                if (confirm("คุณต้องการลบข้อมูลการคัดกรองนี้ใช่หรือไม่?")) {
                                    try {
                                        const res = await fetch(`/api/screenings/${screening.id}`, { method: 'DELETE' });
                                        if (res.ok) {
                                            router.push('/population/screening');
                                            router.refresh();
                                        } else {
                                            const json = await res.json();
                                            alert(json.error || "ไม่สามารถลบข้อมูลได้");
                                        }
                                    } catch (err) {
                                        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
                                    }
                                }
                            }}
                            className="px-8 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl font-bold transition-all cursor-pointer"
                        >
                            ลบข้อมูล
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
