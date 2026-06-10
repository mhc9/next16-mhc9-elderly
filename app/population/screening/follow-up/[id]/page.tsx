"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ArrowLeft, Save, Loader2, AlertCircle, 
    User, Calendar, ClipboardCheck, Brain, 
    HeartPulse, Activity, MessageSquare, CheckCircle2,
    Building2, Clock, MapPin
} from "lucide-react";
import Link from "next/link";
import DatePicker from "@/components/ui/forms/DatePicker";
import moment from "moment";
import "moment/locale/th";

export default function FollowUpScreeningPage() {
    const { id } = useParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [screening, setScreening] = useState<any>(null);

    // Form State for Round 2 only
    const [formData, setFormData] = useState({
        q2_result_2: "NORMAL",
        screen_date_2: moment().format("YYYY-MM-DD"),
    });

    useEffect(() => {
        async function fetchScreening() {
            try {
                const res = await fetch(`/api/screenings/${id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลการคัดกรองได้");
                
                const s = json.data;
                setScreening(s);

                setFormData({
                    q2_result_2: s.q2_result_2 || "NORMAL",
                    screen_date_2: s.screen_date_2 ? moment(s.screen_date_2).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchScreening();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch(`/api/screenings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    q2_result_2: formData.q2_result_2,
                    screen_date_2: formData.screen_date_2
                })
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");

            setSuccess(true);
            setTimeout(() => {
                router.push(`/population/screening/${id}`);
                router.refresh();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse font-medium">กำลังโหลดข้อมูลการคัดกรอง...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">บันทึกข้อมูลติดตามรอบที่ 2 สำเร็จ</h2>
                <p className="text-muted-foreground">กำลังนำคุณกลับ...</p>
            </div>
        );
    }

    if (!screening) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
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
                        <Activity className="text-primary" />
                        ติดตามผลการคัดกรอง (รอบที่ 2)
                    </h1>
                    <p className="text-muted-foreground">บันทึกผลการคัดกรองซ้ำสำหรับผู้ที่มีความเสี่ยงในรอบแรก</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Existing Data (Read-only Summary) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Person Summary */}
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User size={16} className="text-primary" />
                            ข้อมูลผู้รับบริการ
                        </h3>
                        
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mb-4">
                                {screening.person.firstname[0]}{screening.person.lastname[0]}
                            </div>
                            <h4 className="font-bold text-lg">{screening.person.firstname} {screening.person.lastname}</h4>
                            <p className="text-xs text-muted-foreground font-mono mt-1">CID: {screening.person.cid || "-"}</p>
                        </div>

                        <div className="space-y-3 border-t border-border pt-6">
                            <div className="flex items-start gap-3">
                                <Clock size={14} className="text-muted-foreground shrink-0 mt-1" />
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">รอบที่ 1 เมื่อวันที่</p>
                                    <p className="text-sm font-bold">{moment(screening.screen_date).format("D MMM YYYY")}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                                screening.q2_result === "NORMAL" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                            }`}>
                                <Activity size={16} />
                                <span className="text-sm font-black">
                                    {screening.q2_result === "NORMAL"
                                        ? "ปกติ"
                                        : screening.q2_result === "RISK_Q12"
                                            ? "เสี่ยง Q1/Q2"
                                            : "เสี่ยง Q3"
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Assessment & Care Summary */}
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={16} className="text-primary" />
                            ผลการประเมินและการดูแล
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-2xl border text-center ${screening.q9_result ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"}`}>
                                <p className="text-[10px] font-black opacity-70">9Q</p>
                                <p className="text-sm font-bold">{screening.q9_score ?? "-"}</p>
                            </div>
                            <div className={`p-3 rounded-2xl border text-center ${screening.q8_result ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"}`}>
                                <p className="text-[10px] font-black opacity-70">8Q</p>
                                <p className="text-sm font-bold">{screening.q8_score ?? "-"}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">รูปแบบการดูแล</p>
                                <div className="flex flex-wrap gap-1">
                                    {screening.care_type?.split(", ").map((t: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-muted rounded-lg text-[10px] font-bold border border-border">{t}</span>
                                    ))}
                                </div>
                            </div>
                            {screening.remark && (
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">ปัญหา/สาเหตุ</p>
                                    <p className="text-xs text-foreground bg-muted/30 p-2 rounded-lg border border-border/50 line-clamp-3">{screening.remark}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Follow-up Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Activity size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-foreground">แบบคัดกรอง 2Q plus (รอบที่ 2)</h2>
                            </div>

                            <div className="pt-4">
                                <DatePicker
                                    value={formData.screen_date_2}
                                    onChange={(date) => setFormData(prev => ({ ...prev, screen_date_2: date }))}
                                    label="วันที่คัดกรองรอบที่ 2"
                                    placeholder="เลือกวันที่"
                                    icon={<Calendar size={14} />}
                                    className="max-w-xs"
                                />
                            </div>

                            <div className="space-y-2 pt-6 border-t border-border/50">
                                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 block">
                                    ผลการคัดกรองด้วย 2Q plus (รอบที่ 2)
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, q2_result_2: "NORMAL" }))}
                                        className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center gap-3 cursor-pointer ${
                                            formData.q2_result_2 === "NORMAL" 
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.q2_result_2 === "NORMAL" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <span className="text-sm font-black">ปกติ</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, q2_result_2: "RISK_Q12" }))}
                                        className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center gap-3 cursor-pointer ${
                                            formData.q2_result_2 === "RISK_Q12" 
                                                ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm" 
                                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.q2_result_2 === "RISK_Q12" ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                            <AlertCircle size={28} />
                                        </div>
                                        <span className="text-sm font-black">เสี่ยงข้อ 1 และหรือข้อ 2</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, q2_result_2: "RISK_Q3" }))}
                                        className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center gap-3 cursor-pointer ${
                                            formData.q2_result_2 === "RISK_Q3" 
                                                ? "bg-orange-50 border-orange-500 text-orange-700 shadow-sm" 
                                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.q2_result_2 === "RISK_Q3" ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                            <AlertCircle size={28} />
                                        </div>
                                        <span className="text-sm font-black">เสี่ยงเฉพาะข้อ 3</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Area */}
                        <div className="flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 py-3 rounded-2xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-10 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        บันทึกผลการติดตาม
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
