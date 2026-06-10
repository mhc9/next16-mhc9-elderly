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
        q2_result: "NORMAL",
        use_9q: false,
        q9_score: "",
        q9_result: false,
        use_8q: false,
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
                    q9_score: formData.use_9q && formData.q9_score !== "" ? parseInt(formData.q9_score) : null,
                    q9_result: formData.use_9q ? formData.q9_result : null,
                    q8_score: formData.use_8q && formData.q8_score !== "" ? parseInt(formData.q8_score) : null,
                    q8_result: formData.use_8q ? formData.q8_result : null,
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, q2_result: "NORMAL" }))}
                            className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                                formData.q2_result === "NORMAL" 
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.q2_result === "NORMAL" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                <CheckCircle2 size={24} />
                            </div>
                            <span className="text-sm font-bold">ปกติ</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, q2_result: "RISK_Q12" }))}
                            className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                                formData.q2_result === "RISK_Q12" 
                                    ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm" 
                                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.q2_result === "RISK_Q12" ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                <AlertCircle size={24} />
                            </div>
                            <span className="text-sm font-bold">เสี่ยงข้อ 1 และหรือข้อ 2</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, q2_result: "RISK_Q3" }))}
                            className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                                formData.q2_result === "RISK_Q3" 
                                    ? "bg-orange-50 border-orange-500 text-orange-700 shadow-sm" 
                                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.q2_result === "RISK_Q3" ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                <AlertCircle size={24} />
                            </div>
                            <span className="text-sm font-bold">เสี่ยงเฉพาะข้อ 3</span>
                        </button>
                    </div>
                </div>

                {/* 3. การดูแลช่วยเหลือและการประเมินเพิ่มเติม */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">การดูแลช่วยเหลือและการประเมินเพิ่มเติม</h2>
                    </div>

                    {/* Care Selection */}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {/* 9Q Optional Assessment */}
                        <div className={`p-6 rounded-3xl border transition-all ${formData.use_9q ? 'bg-card border-purple-200 shadow-sm' : 'bg-muted/10 border-dashed border-border'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.use_9q ? 'bg-purple-100 text-purple-600' : 'bg-muted text-muted-foreground'}`}>
                                        <Brain size={20} />
                                    </div>
                                    <h3 className={`font-bold ${formData.use_9q ? 'text-foreground' : 'text-muted-foreground'}`}>แบบประเมิน 9Q</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="use_9q"
                                        checked={formData.use_9q}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {formData.use_9q && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">คะแนนรวม (0-27)</label>
                                        <input
                                            type="number"
                                            name="q9_score"
                                            value={formData.q9_score}
                                            onChange={handleInputChange}
                                            placeholder="ระบุคะแนน"
                                            className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all font-mono font-bold"
                                        />
                                    </div>
                                    <div className={`p-3 rounded-xl border text-center text-[10px] font-black uppercase tracking-widest ${
                                        formData.q9_result ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                                    }`}>
                                        {formData.q9_result ? "เสี่ยง (คะแนน >= 7)" : "ปกติ (คะแนน < 7)"}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 8Q Optional Assessment */}
                        <div className={`p-6 rounded-3xl border transition-all ${formData.use_8q ? 'bg-card border-amber-200 shadow-sm' : 'bg-muted/10 border-dashed border-border'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.use_8q ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                                        <HeartPulse size={20} />
                                    </div>
                                    <h3 className={`font-bold ${formData.use_8q ? 'text-foreground' : 'text-muted-foreground'}`}>แบบประเมิน 8Q</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="use_8q"
                                        checked={formData.use_8q}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                            </div>

                            {formData.use_8q && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">คะแนนรวม (0-52)</label>
                                        <input
                                            type="number"
                                            name="q8_score"
                                            value={formData.q8_score}
                                            onChange={handleInputChange}
                                            placeholder="ระบุคะแนน"
                                            className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all font-mono font-bold"
                                        />
                                    </div>
                                    <div className={`p-3 rounded-xl border text-center text-[10px] font-black uppercase tracking-widest ${
                                        formData.q8_result ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                                    }`}>
                                        {formData.q8_result ? "เสี่ยง (คะแนน >= 1)" : "ปกติ (คะแนน < 1)"}
                                    </div>
                                </div>
                            )}
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
