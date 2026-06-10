"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    ArrowLeft, Save, Loader2, AlertCircle, 
    User, Calendar, ClipboardCheck, Brain, 
    HeartPulse, Activity, MessageSquare, CheckCircle2,
    Search, X, UserSearch
} from "lucide-react";
import Link from "next/link";
import { PersonSelectModal } from "@/components/ui/forms/PersonSelectModal";

interface PersonOption {
    pid: number;
    firstname: string;
    lastname: string;
    cid: string | null;
    birth_date?: string | null;
    hcode?: string;
    hospital?: { name: string };
}

export default function NewScreeningPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pidFromUrl = searchParams.get("pid");

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Person State
    const [selectedPerson, setSelectedPerson] = useState<PersonOption | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        person_id: pidFromUrl || "",
        year: new Date().getFullYear() + 543,
        q2_result: false,
        q9_score: "",
        q9_result: false,
        q8_score: "",
        q8_result: false,
        care_type: "Counseling",
        care_detail: ""
    });

    useEffect(() => {
        if (pidFromUrl) {
            async function fetchPerson() {
                try {
                    const res = await fetch(`/api/population/${pidFromUrl}`);
                    const json = await res.json();
                    if (res.ok) {
                        setSelectedPerson(json);
                    }
                } catch (err) {
                    console.error("Failed to fetch person details");
                }
            }
            fetchPerson();
        }
    }, [pidFromUrl]);

    const handlePersonSelect = (person: any) => {
        setSelectedPerson(person);
        setFormData(prev => ({ ...prev, person_id: person.pid.toString() }));
        setIsModalOpen(false);
        setError("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: val };
            
            // Auto-calculate results based on scores
            if (name === "q9_score") {
                const score = parseInt(value);
                newState.q9_result = !isNaN(score) && score >= 7;
            } else if (name === "q8_score") {
                const score = parseInt(value);
                newState.q8_result = !isNaN(score) && score >= 1;
            }
            
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        if (!formData.person_id) {
            setError("กรุณาเลือกผู้รับบริการ");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/screenings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    q9_score: formData.q9_score === "" ? null : parseInt(formData.q9_score),
                    q8_score: formData.q8_score === "" ? null : parseInt(formData.q8_score),
                    year: parseInt(formData.year.toString())
                })
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");

            setSuccess(true);
            setTimeout(() => {
                router.push(pidFromUrl ? `/population/${pidFromUrl}` : "/population/screening");
                router.refresh();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">บันทึกข้อมูลสำเร็จ</h2>
                <p className="text-muted-foreground">กำลังนำคุณกลับ...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
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
                        แบบคัดกรองสุขภาพจิต
                    </h1>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. ข้อมูลพื้นฐาน */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">ข้อมูลพื้นฐาน</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <User size={14} /> ผู้รับบริการ
                            </label>
                            
                            {pidFromUrl ? (
                                <div className="w-full bg-muted/50 border border-border rounded-xl py-1.5 px-4 text-sm font-bold text-foreground flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">
                                        {selectedPerson ? `${selectedPerson.firstname[0]}${selectedPerson.lastname[0]}` : "?"}
                                    </div>
                                    <span className="truncate">
                                        {selectedPerson ? `${selectedPerson.firstname} ${selectedPerson.lastname}` : "กำลังโหลด..."}
                                    </span>
                                </div>
                            ) : (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className={`w-full flex items-center justify-between bg-muted/30 border rounded-xl py-1.5 px-4 text-sm transition-all cursor-pointer group ${
                                            selectedPerson ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {selectedPerson ? (
                                                <>
                                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                                                        {selectedPerson.firstname[0]}{selectedPerson.lastname[0]}
                                                    </div>
                                                    <div className="flex flex-col text-left truncate">
                                                        <span className="font-bold text-foreground leading-tight">
                                                            {selectedPerson.firstname} {selectedPerson.lastname}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            CID: {selectedPerson.cid || "ไม่ระบุ"}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-dashed border-border group-hover:border-primary/50 transition-colors">
                                                        <UserSearch size={14} />
                                                    </div>
                                                    <span className="text-muted-foreground font-medium">กดเพื่อเลือกผู้รับบริการ...</span>
                                                </>
                                            )}
                                        </div>
                                        <Search size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <Calendar size={14} /> ปีงบประมาณ (พ.ศ.)
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. แบบคัดกรอง 2Q plus */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Activity size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">แบบคัดกรอง 2Q plus</h2>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">ผลการคัดกรองเบื้องต้น</p>
                            <p className="text-xs text-muted-foreground">ติ๊กเมื่อพบความเสี่ยงจากการคัดกรอง 2Q plus</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="q2_result"
                                checked={formData.q2_result}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                            <span className={`ml-3 text-sm font-black uppercase tracking-widest ${formData.q2_result ? "text-rose-600" : "text-emerald-600"}`}>
                                {formData.q2_result ? "เสี่ยง" : "ปกติ"}
                            </span>
                        </label>
                    </div>
                </div>

                {/* 3. การประเมิน 9Q และ 8Q */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Brain size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">แบบประเมิน 9Q</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">คะแนนรวม</label>
                                <input
                                    type="number"
                                    name="q9_score"
                                    value={formData.q9_score}
                                    onChange={handleInputChange}
                                    placeholder="0-27"
                                    className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold"
                                />
                            </div>
                            <div className={`p-3 rounded-xl border text-center text-xs font-black uppercase tracking-widest ${
                                formData.q9_result ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            }`}>
                                {formData.q9_result ? "เสี่ยง (คะแนน >= 7)" : "ปกติ (คะแนน < 7)"}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <HeartPulse size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">แบบประเมิน 8Q</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">คะแนนรวม</label>
                                <input
                                    type="number"
                                    name="q8_score"
                                    value={formData.q8_score}
                                    onChange={handleInputChange}
                                    placeholder="0-52"
                                    className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold"
                                />
                            </div>
                            <div className={`p-3 rounded-xl border text-center text-xs font-black uppercase tracking-widest ${
                                formData.q8_result ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            }`}>
                                {formData.q8_result ? "เสี่ยง (คะแนน >= 1)" : "ปกติ (คะแนน < 1)"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. การดูแลช่วยเหลือ */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">การดูแลช่วยเหลือ</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">รูปแบบการดูแล</label>
                            <select
                                name="care_type"
                                value={formData.care_type}
                                onChange={handleInputChange}
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer font-bold"
                            >
                                <option value="Counseling">ให้คำปรึกษา / ดูแลสังคมจิตใจ</option>
                                <option value="Referral">ส่งต่อโรงพยาบาล</option>
                                <option value="Follow-up">ติดตามอาการ</option>
                                <option value="Other">อื่นๆ</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">รายละเอียดเพิ่มเติม</label>
                            <textarea
                                name="care_detail"
                                value={formData.care_detail}
                                onChange={handleInputChange}
                                placeholder="ระบุรายละเอียดการดูแลช่วยเหลือ..."
                                rows={1}
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            ></textarea>
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
                                บันทึกผลการคัดกรอง
                            </>
                        )}
                    </button>
                </div>
            </form>

            <PersonSelectModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handlePersonSelect}
            />
        </div>
    );
}
