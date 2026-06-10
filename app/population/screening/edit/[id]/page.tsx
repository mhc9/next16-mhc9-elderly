"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ArrowLeft, Save, Loader2, AlertCircle, 
    User, Calendar, ClipboardCheck, Brain, 
    HeartPulse, Activity, MessageSquare, CheckCircle2,
    Search, X, UserSearch,
    Building2,
    Plus
} from "lucide-react";
import Link from "next/link";
import { PersonSelectModal } from "@/components/ui/forms/PersonSelectModal";
import DatePicker from "@/components/ui/forms/DatePicker";
import moment from "moment";
import "moment/locale/th";

export default function EditScreeningPage() {
    const { id } = useParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Person State (Read-only in edit mode usually, but we'll show details)
    const [selectedPerson, setSelectedPerson] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        person_id: "",
        year: moment().year() + 543,
        q2_result: "NORMAL",
        screen_date: moment().format("YYYY-MM-DD"),
        use_9q: false,
        q9_score: "" as string | number,
        q9_result: false,
        use_8q: false,
        q8_score: "" as string | number,
        q8_result: false,
        care_date: moment().format("YYYY-MM-DD"),
        remark: "",
        q2_result_2: "NORMAL",
        screen_date_2: moment().format("YYYY-MM-DD"),
        care_selections: {
            Counseling: { active: false, detail: "" },
            Referral: { active: false, detail: "" },
            FollowUp: { active: false, detail: "" },
            Other: { active: false, detail: "" }
        }
    });

    useEffect(() => {
        async function fetchScreening() {
            try {
                const res = await fetch(`/api/screenings/${id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลการคัดกรองได้");
                
                const s = json.data;
                setSelectedPerson(s.person);

                // Parse aggregated care selections
                const activeCares = (s.care_type || "").split(", ");
                // care_detail is stored as "Label: detail --- Label: detail"
                const detailParts = (s.care_detail || "").split("\n---\n");
                const detailsMap: Record<string, string> = {};
                detailParts.forEach((part: string) => {
                    const [label, ...rest] = part.split(": ");
                    if (label && rest.length > 0) {
                        detailsMap[label.trim()] = rest.join(": ").trim();
                    }
                });

                const newCareSelections = {
                    Counseling: { 
                        active: activeCares.includes(getCareLabel("Counseling")), 
                        detail: detailsMap[getCareLabel("Counseling")] || "" 
                    },
                    Referral: { 
                        active: activeCares.includes(getCareLabel("Referral")), 
                        detail: detailsMap[getCareLabel("Referral")] || "" 
                    },
                    FollowUp: { 
                        active: activeCares.includes(getCareLabel("FollowUp")), 
                        detail: detailsMap[getCareLabel("FollowUp")] || "" 
                    },
                    Other: { 
                        active: activeCares.includes(getCareLabel("Other")), 
                        detail: detailsMap[getCareLabel("Other")] || "" 
                    }
                };

                setFormData({
                    person_id: s.person_id.toString(),
                    year: s.year,
                    q2_result: s.q2_result,
                    screen_date: moment(s.screen_date).format("YYYY-MM-DD"),
                    use_9q: s.q9_score !== null,
                    q9_score: s.q9_score ?? "",
                    q9_result: s.q9_result ?? false,
                    use_8q: s.q8_score !== null,
                    q8_score: s.q8_score ?? "",
                    q8_result: s.q8_result ?? false,
                    care_date: s.care_date ? moment(s.care_date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
                    remark: s.remark || "",
                    q2_result_2: s.q2_result_2 || "NORMAL",
                    screen_date_2: s.screen_date_2 ? moment(s.screen_date_2).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
                    care_selections: newCareSelections
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchScreening();
    }, [id]);

    const handleCareToggle = (type: keyof typeof formData.care_selections) => {
        setFormData(prev => ({
            ...prev,
            care_selections: {
                ...prev.care_selections,
                [type]: {
                    ...prev.care_selections[type],
                    active: !prev.care_selections[type].active
                }
            }
        }));
    };

    const handleCareDetailChange = (type: keyof typeof formData.care_selections, detail: string) => {
        setFormData(prev => ({
            ...prev,
            care_selections: {
                ...prev.care_selections,
                [type]: {
                    ...prev.care_selections[type],
                    detail
                }
            }
        }));
    };

    function getCareLabel(type: string) {
        switch (type) {
            case "Counseling": return "ให้คำปรึกษา / ดูแลสังคมจิตใจ";
            case "Referral": return "ส่งต่อโรงพยาบาล";
            case "FollowUp": return "ติดตามอาการ";
            case "Other": return "อื่นๆ";
            default: return type;
        }
    }

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

        // Validation for care details
        const activeCares = Object.entries(formData.care_selections).filter(([_, v]) => v.active);
        if (activeCares.length === 0) {
            setError("กรุณาเลือกรูปแบบการดูแลอย่างน้อย 1 รายการ");
            setIsSubmitting(false);
            return;
        }

        for (const [key, val] of activeCares) {
            if (!val.detail.trim()) {
                setError(`กรุณาระบุรายละเอียดสำหรับ: ${getCareLabel(key)}`);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            // Aggregate care types and details for existing DB schema
            const careTypes = activeCares.map(([k]) => getCareLabel(k)).join(", ");
            const careDetails = activeCares.map(([k, v]) => `${getCareLabel(k)}: ${v.detail}`).join("\n---\n");

            const res = await fetch(`/api/screenings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    year: parseInt(formData.year.toString()),
                    q2_result: formData.q2_result,
                    screen_date: formData.screen_date,
                    q9_score: formData.use_9q && formData.q9_score !== "" ? parseInt(formData.q9_score.toString()) : null,
                    q9_result: formData.use_9q ? formData.q9_result : null,
                    q8_score: formData.use_8q && formData.q8_score !== "" ? parseInt(formData.q8_score.toString()) : null,
                    q8_result: formData.use_8q ? formData.q8_result : null,
                    care_type: careTypes,
                    care_detail: careDetails,
                    care_date: formData.care_date,
                    remark: formData.remark,
                    q2_result_2: (selectedPerson as any)?.screenings?.length > 0 ? formData.q2_result_2 : null,
                    screen_date_2: (selectedPerson as any)?.screenings?.length > 0 ? formData.screen_date_2 : null
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
                <h2 className="text-2xl font-bold text-foreground">แก้ไขข้อมูลสำเร็จ</h2>
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
                        แก้ไขผลการคัดกรอง
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
                        <h2 className="text-lg font-bold text-foreground">ข้อมูลพื้นฐาน (อ่านอย่างเดียว)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <User size={14} /> ผู้รับบริการ
                            </label>
                            <div className="w-full bg-muted/50 border border-border rounded-xl py-2 px-4 text-sm font-bold text-foreground flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">
                                    {selectedPerson ? `${selectedPerson.firstname[0]}${selectedPerson.lastname[0]}` : "?"}
                                </div>
                                <span className="truncate">
                                    {selectedPerson ? `${selectedPerson.firstname} ${selectedPerson.lastname}` : "กำลังโหลด..."}
                                </span>
                            </div>
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
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Activity size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">แบบคัดกรอง 2Q plus</h2>
                    </div>

                    <div className="pt-4">
                        <DatePicker
                            value={formData.screen_date}
                            onChange={(date) => setFormData(prev => ({ ...prev, screen_date: date }))}
                            label="วันที่คัดกรอง"
                            placeholder="เลือกวันที่"
                            icon={<Calendar size={14} />}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="space-y-2 pt-6 border-t border-border/50">
                        <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 block">
                            ผลการคัดกรองด้วย 2Q plus (รอบที่ 1)
                        </label>

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
                </div>

                {/* 3. การดูแลช่วยเหลือ */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">การดูแลช่วยเหลือ</h2>
                    </div>

                    <div className="pt-4">
                        <DatePicker
                            value={formData.care_date}
                            onChange={(date) => setFormData(prev => ({ ...prev, care_date: date }))}
                            label="วันที่ให้การดูแลช่วยเหลือ"
                            placeholder="เลือกวันที่"
                            icon={<Calendar size={14} />}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="space-y-2 pt-6 border-t border-border/50">
                        <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 block">
                            ผลการประเมินด้วย 9Q และ 8Q (ถ้ามี)
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all font-mono font-bold"
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

                    {/* Multiple Care Selection */}
                    <div className="space-y-2 pt-6 border-t border-border/50">
                        <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 block">
                            รูปแบบการดูแลช่วยเหลือ (เลือกได้มากกว่า 1 รายการ)
                        </label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(Object.keys(formData.care_selections) as Array<keyof typeof formData.care_selections>).map((type) => (
                                <div 
                                    key={type}
                                    className={`p-5 rounded-3xl border transition-all duration-300 ${
                                        formData.care_selections[type].active 
                                            ? 'bg-card border-teal-200 shadow-md ring-1 ring-teal-100' 
                                            : 'bg-muted/10 border-border hover:bg-muted/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${formData.care_selections[type].active ? 'bg-teal-100 text-teal-600' : 'bg-muted text-muted-foreground'}`}>
                                                {type === 'Referral'
                                                    ? <Building2 size={18} />
                                                    : type === 'FollowUp' ? <Activity size={18} />
                                                    : type === 'Other' ? <Plus size={18} />
                                                    : <MessageSquare size={18} />}
                                            </div>
                                            <span className={`font-bold text-sm ${formData.care_selections[type].active ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {getCareLabel(type)}
                                            </span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.care_selections[type].active}
                                                onChange={() => handleCareToggle(type)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                                        </label>
                                    </div>

                                    {formData.care_selections[type].active && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <textarea
                                                value={formData.care_selections[type].detail}
                                                onChange={(e) => handleCareDetailChange(type, e.target.value)}
                                                placeholder={`ระบุรายละเอียดสำหรับ${getCareLabel(type)}...`}
                                                rows={2}
                                                required
                                                className="w-full bg-background border border-teal-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-50 focus:border-teal-400 transition-all resize-none font-medium"
                                            ></textarea>
                                            <p className="text-[10px] text-teal-600 mt-1.5 font-bold flex items-center gap-1">
                                                <AlertCircle size={10} /> จำเป็นต้องระบุรายละเอียด
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <MessageSquare size={14} className="text-primary" /> ปัญหา/สาเหตุ
                            </label>
                            <textarea
                                name="remark"
                                value={formData.remark}
                                onChange={handleInputChange}
                                placeholder="ระบุปัญหาหรือสาเหตุเพิ่มเติม (ถ้ามี)..."
                                rows={3}
                                className="w-full bg-muted/30 border border-border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-medium"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* 4. แบบคัดกรอง 2Q plus (รอบที่ 2) - Conditional */}
                {((selectedPerson as any)?.screenings?.length > 1 || formData.q2_result_2 !== "NORMAL" || moment(formData.screen_date_2).isAfter(formData.screen_date)) && (
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6 animate-in zoom-in-95 duration-500">
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
                                    className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                                        formData.q2_result_2 === "NORMAL" 
                                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                                            : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.q2_result_2 === "NORMAL" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <span className="text-sm font-bold">ปกติ</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, q2_result_2: "RISK_Q12" }))}
                                    className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                                        formData.q2_result_2 === "RISK_Q12" 
                                            ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm" 
                                            : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.q2_result_2 === "RISK_Q12" ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <span className="text-sm font-bold">เสี่ยงข้อ 1 และหรือข้อ 2</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, q2_result_2: "RISK_Q3" }))}
                                    className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                                        formData.q2_result_2 === "RISK_Q3" 
                                            ? "bg-orange-50 border-orange-500 text-orange-700 shadow-sm" 
                                            : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.q2_result_2 === "RISK_Q3" ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <span className="text-sm font-bold">เสี่ยงเฉพาะข้อ 3</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                บันทึกผลการแก้ไข
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
