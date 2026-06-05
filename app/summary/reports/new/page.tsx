"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HospitalSearch, Hospital } from "@/components/ui/forms/HospitalSearch";
import { FormField } from "@/components/ui/forms/FormField";
import { 
    ChevronLeft, 
    Save, 
    Calendar, 
    Users, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    ClipboardCheck,
    Stethoscope,
    HeartPulse,
    Building2
} from "lucide-react";

export default function NewReportPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Hospital selection state
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        year: new Date().getFullYear() + 543, // Default to current Thai year
        target_population: 0,
        screened_normal: 0,
        screened_risk: 0,
        screened_total: 0,
        care_counseling: 0,
        care_referral: 0,
        care_total: 0,
        assess_9q_normal: 0,
        assess_9q_risk: 0,
        assess_8q_normal: 0,
        assess_8q_risk: 0,
        followup_normal: 0,
        followup_risk_q12: 0,
        followup_risk_q3: 0,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const fetchSystemData = async () => {
        if (!selectedHospital) {
            setMessage({ type: "error", text: "Please select a hospital first" });
            return;
        }

        setIsFetching(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch(`/api/reports/summary/fetch?hcode=${selectedHospital.hcode}&year=${formData.year}`);
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || "Failed to fetch data");

            setFormData(prev => ({
                ...prev,
                ...json.data
            }));
            setMessage({ type: "success", text: "Data fetched from system successfully!" });
        } catch (err) {
            setMessage({ 
                type: "error", 
                text: err instanceof Error ? err.message : "Failed to fetch data" 
            });
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHospital) {
            setMessage({ type: "error", text: "Please select a hospital first" });
            return;
        }

        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/reports/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    hcode: selectedHospital.hcode
                })
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.error || "Failed to save report");

            setMessage({ type: "success", text: "Report saved successfully!" });
            setTimeout(() => {
                router.push("/dashboard/reports");
                router.refresh();
            }, 1500);

        } catch (err) {
            setMessage({ 
                type: "error", 
                text: err instanceof Error ? err.message : "Failed to save report" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/dashboard/reports"
                        className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition-all cursor-pointer"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Create New Report</h1>
                        <p className="text-sm text-muted-foreground">Add annual screening statistics for a healthcare facility</p>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                    message.type === "success" 
                        ? "bg-emerald-50 border-emerald-100 text-primary" 
                        : "bg-rose-50 border-rose-100 text-rose-700"
                }`}>
                    {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-semibold">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Hospital Selection */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                    <HospitalSearch 
                        label="หน่วยบริการ"
                        icon={<Building2 size={18} className="text-primary" />}
                        selectedHospital={selectedHospital}
                        onSelect={setSelectedHospital}
                        onClear={() => setSelectedHospital(null)}
                        placeholder="Search by hospital name or HCODE..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 pl-1">
                                <Calendar size={14} className="text-primary" />
                                ปีงบประมาณ (พ.ศ.)
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                required
                                placeholder="2569"
                                className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 pl-1">
                                <Users size={14} className="text-primary" />
                                จำนวนประชากรเป้าหมาย
                            </label>
                            <input
                                type="number"
                                name="target_population"
                                value={formData.target_population}
                                onChange={handleInputChange}
                                required
                                placeholder="0"
                                className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={fetchSystemData}
                            disabled={isFetching || !selectedHospital}
                            className="flex items-center justify- gap-2 py-2 px-4 bg-primary/5 hover:bg-primary/10 text-primary font-bold rounded-xl border border-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isFetching ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <ClipboardCheck size={18} />
                            )}
                            ดึงข้อมูลจากการคัดกรอง
                        </button>
                    </div>
                </div>

                {/* Section 2: Core Metrics */}
                <div className="flex flex-col gap-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-1 pb-2 border-b border-border/50">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Users size={20} />
                            </div>
                            <h2 className="font-bold text-lg">การคัดกรอง 2Q+</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <FormField label="คัดกรองทั้งหมด (ราย)" name="screened_total" value={formData.screened_total} onChange={handleInputChange} />
                            <FormField label="ปกติ (ราย)" name="screened_normal" value={formData.screened_normal} onChange={handleInputChange} color="text-emerald-600" />
                            <FormField label="เสี่ยง (ราย)" name="screened_risk" value={formData.screened_risk} onChange={handleInputChange} color="text-rose-600" />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-1 pb-2 border-b border-border/50">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                <ClipboardCheck size={20} />
                            </div>
                            <h2 className="font-bold text-lg">การดูแลช่วยเหลือ (รอบ 1)</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <FormField label="ได้รับการดูแลช่วยเหลือทั้งหมด (ราย)" name="care_total" value={formData.care_total} onChange={handleInputChange} />
                            <FormField label="ให้คำปรึกษา/ดูแลสังคมจิตใจ (ราย)" name="care_counseling" value={formData.care_counseling} onChange={handleInputChange} />
                            <FormField label="ส่งต่อ (ราย)" name="care_referral" value={formData.care_referral} onChange={handleInputChange} />
                        </div>

                        <div>
                            {/* Sub Section Header */}
                            <div className="flex items-center gap-1 pb-1">
                                <div className="p-2 rounded-lg text-orange-500">
                                    <Stethoscope size={16} />
                                </div>
                                <h2 className="font-semibold text-sm">การประเมิน 9Q และ 8Q</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField label="9Q ปกติ (ราย)" name="assess_9q_normal" value={formData.assess_9q_normal} onChange={handleInputChange} color="text-emerald-600" />
                                <FormField label="9Q เสี่ยง (>=7) (ราย)" name="assess_9q_risk" value={formData.assess_9q_risk} onChange={handleInputChange} color="text-rose-600" />
                                <FormField label="8Q ปกติ (ราย)" name="assess_8q_normal" value={formData.assess_8q_normal} onChange={handleInputChange} color="text-emerald-600" />
                                <FormField label="8Q เสี่ยง (>=1) (ราย)" name="assess_8q_risk" value={formData.assess_8q_risk} onChange={handleInputChange} color="text-rose-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Advanced Metrics */}
                <div className="flex flex-col gap-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-1 pb-2 border-b border-border/50">
                            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                                <HeartPulse size={20} />
                            </div>
                            <h2 className="font-bold text-lg mr-2">การดูแลช่วยเหลือ (รอบ 2)</h2> • 
                            <p className="text-sm text-muted-foreground ml-2">
                                คัดกรอง 2Q+ ซ้ำ
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <FormField label="ปกติ (ราย)" name="followup_normal" value={formData.followup_normal} onChange={handleInputChange} color="text-emerald-600" />
                            <FormField label="ความเสี่ยง ข้อ 1 / ข้อ 2 (ราย)" name="followup_risk_q12" value={formData.followup_risk_q12} onChange={handleInputChange} color="text-rose-600" />
                            <FormField label="ความเสี่ยง ข้อ 3 (ราย)" name="followup_risk_q3" value={formData.followup_risk_q3} onChange={handleInputChange} color="text-rose-600" />
                        </div>
                    </div>
                </div>

                {/* Submit Area */}
                <div className="w-full p-0 bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex items-center justify-end gap-4">
                        <Link 
                            href="/dashboard/reports"
                            className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            ยกเลิก
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading || !selectedHospital}
                            className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white font-black rounded-xl cursor-pointer hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Save size={20} className="group-hover:scale-110 transition-transform" />
                            )}
                            บันทึกข้อมูล
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
