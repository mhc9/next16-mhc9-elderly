"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    User, Mail, Shield, Building2, 
    ArrowLeft, Loader2, AlertCircle, 
    Key, Save, CircleUser, CheckCircle2,
    KeyRound,
    ShieldUser
} from "lucide-react";
import { HospitalSearch, Hospital } from "@/components/ui/forms/HospitalSearch";

export default function CreateUserPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER",
        hcode: ""
    });

    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleHospitalSelect = (hospital: Hospital) => {
        setSelectedHospital(hospital);
        setFormData(prev => ({ ...prev, hcode: hospital.hcode }));
    };

    const handleHospitalClear = () => {
        setSelectedHospital(null);
        setFormData(prev => ({ ...prev, hcode: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.password || !formData.role) {
            setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน");
            return;
        }

        if (formData.password.length < 6) {
            setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    hcode: formData.hcode || null
                })
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "ไม่สามารถสร้างผู้ใช้งานได้");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/admin/users");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">สร้างผู้ใช้งานสำเร็จ</h2>
                <p className="text-muted-foreground">กำลังพาท่านกลับไปยังหน้ารายชื่อผู้ใช้งาน...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-1">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 cursor-pointer group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">ย้อนกลับ</span>
                </button>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <CircleUser className="text-primary" />
                    เพิ่มผู้ใช้งานใหม่
                </h1>
                <p className="text-muted-foreground">สร้างบัญชีผู้ใช้งานใหม่เข้าสู่ระบบ</p>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in shake-in duration-300">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                            <User size={20} className="text-primary" />
                            ข้อมูลพื้นฐาน
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">ชื่อ-นามสกุล</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="ระบุชื่อ-นามสกุล"
                                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">อีเมล (ใช้เป็น Username)</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">สิทธิ์การใช้งาน</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                        <ShieldUser size={18} />
                                    </div>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="USER">User (ผู้ใช้งานทั่วไป)</option>
                                        <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
                                        <option value="SUPERADMIN">Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password & Security */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                            <Shield size={20} className="text-primary" />
                            ความปลอดภัย
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">รหัสผ่าน</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">ยืนยันรหัสผ่านอีกครั้ง</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-muted/30 rounded-2xl">
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                <span className="font-bold text-foreground block mb-1">ข้อแนะนำ:</span>
                                รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร และควรประกอบด้วยตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลขเพื่อความปลอดภัยสูงสุด
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hospital Selection */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                        <Building2 size={20} className="text-primary" />
                        หน่วยบริการที่สังกัด
                    </h3>

                    <HospitalSearch
                        selectedHospital={selectedHospital}
                        onSelect={handleHospitalSelect}
                        onClear={handleHospitalClear}
                        label="เลือกหน่วยบริการ"
                        placeholder="ค้นหาหน่วยบริการด้วยชื่อ หรือ HCODE..."
                    />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all cursor-pointer"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer min-w-[160px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>กำลังบันทึก...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>บันทึกข้อมูล</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
