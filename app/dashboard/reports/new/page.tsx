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
    const [message, setMessage] = useState({ type: "", text: "" });

    // Hospital selection state
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        year: new Date().getFullYear() + 543, // Default to current Thai year
        target_population: 0,
        screened_total: 0,
        screened_normal: 0,
        screened_risk: 0,
        care_total: 0,
        assess_9q_normal: 0,
        assess_9q_risk: 0,
        assess_8q_normal: 0,
        assess_8q_risk: 0,
        care_counseling: 0,
        care_referral: 0,
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
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/dashboard/reports"
                        className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition-all"
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
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : "bg-rose-50 border-rose-100 text-rose-700"
                }`}>
                    {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-semibold">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative space-y-8">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
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
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold"
                            />
                        </div>

                        <div className="space-y-2">
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
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Core Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Users size={20} />
                            </div>
                            <h2 className="font-bold text-lg">Screening</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <FormField label="Total Screened" name="screened_total" value={formData.screened_total} onChange={handleInputChange} />
                            <FormField label="Normal Cases" name="screened_normal" value={formData.screened_normal} onChange={handleInputChange} color="text-emerald-600" />
                            <FormField label="Risk Cases" name="screened_risk" value={formData.screened_risk} onChange={handleInputChange} color="text-rose-600" />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                <Stethoscope size={20} />
                            </div>
                            <h2 className="font-bold text-lg">Assessment</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <FormField label="9Q Normal" name="assess_9q_normal" value={formData.assess_9q_normal} onChange={handleInputChange} color="text-emerald-600" />
                            <FormField label="9Q Risk (>=7)" name="assess_9q_risk" value={formData.assess_9q_risk} onChange={handleInputChange} color="text-rose-600" />
                            <FormField label="8Q Normal" name="assess_8q_normal" value={formData.assess_8q_normal} onChange={handleInputChange} color="text-emerald-600" />
                            <FormField label="8Q Risk (>=1)" name="assess_8q_risk" value={formData.assess_8q_risk} onChange={handleInputChange} color="text-rose-600" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Advanced Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                <ClipboardCheck size={20} />
                            </div>
                            <h2 className="font-bold text-lg">Summary</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <FormField label="Care Total" name="care_total" value={formData.care_total} onChange={handleInputChange} />
                            <FormField label="Care Counseling" name="care_counseling" value={formData.care_counseling} onChange={handleInputChange} />
                            <FormField label="Care Referral" name="care_referral" value={formData.care_referral} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                                <HeartPulse size={20} />
                            </div>
                            <h2 className="font-bold text-lg">Follow-up</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <FormField label="Follow-up Normal" name="followup_normal" value={formData.followup_normal} onChange={handleInputChange} color="text-emerald-600" />
                            <FormField label="Risk Q1/Q2" name="followup_risk_q12" value={formData.followup_risk_q12} onChange={handleInputChange} color="text-rose-600" />
                            <FormField label="Risk Q3" name="followup_risk_q3" value={formData.followup_risk_q3} onChange={handleInputChange} color="text-rose-600" />
                        </div>
                    </div>
                </div>

                {/* Submit Area */}
                <div className="relative w-full p-0 bg-background/80 backdrop-blur-md z-999">
                    <div className="max-w-4xl mx-auto flex items-center justify-end gap-4">
                        <Link 
                            href="/dashboard/reports"
                            className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
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
                            Save Record
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
