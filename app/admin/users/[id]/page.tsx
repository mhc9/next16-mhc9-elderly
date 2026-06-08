"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    User, Mail, Shield, Building2, MapPin, 
    ArrowLeft, Loader2, AlertCircle, Calendar, 
    Key, Edit2, CheckCircle2,
    CircleUser
} from "lucide-react";

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    hcode: string | null;
    image: string | null;
    hospital: {
        name: string;
        address: string | null;
        province: { name: string | null } | null;
        district: { name: string | null } | null;
        subdistrict: { name: string | null } | null;
    } | null;
}

export default function UserProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch(`/api/users/${id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลผู้ใช้งานได้");
                setUser(json.data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลผู้ใช้งานได้";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchUser();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
            </div>
        );
    }

    if (error || !user) {
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
                        <p className="text-sm">{error || "ไม่พบข้อมูลผู้ใช้งาน"}</p>
                    </div>
                </div>
            </div>
        );
    }

    const userInitials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U";

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <CircleUser className="text-primary" />
                        โปรไฟล์ผู้ใช้งาน
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer">
                        <Edit2 size={18} />
                        แก้ไขข้อมูล
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-background">
                                {userInitials}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-xl border border-border shadow-sm">
                                <div className={`p-1.5 rounded-lg ${
                                    user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-600' :
                                    user.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                    <Shield size={16} />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-1">{user.name || "ไม่ระบุชื่อ"}</h2>
                        <p className="text-muted-foreground text-sm flex items-center gap-1.5 mb-6">
                            <Mail size={14} />
                            {user.email}
                        </p>

                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
                            user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                            {user.role}
                        </div>

                        <div className="w-full grid grid-cols-1 gap-3 mt-4">
                            <div className="bg-muted/30 rounded-2xl p-4 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</span>
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                    <CheckCircle2 size={14} />
                                    <span className="text-sm font-bold">ใช้งานปกติ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        {/* Section Header */}
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-primary" />
                            ข้อมูลความปลอดภัย
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">ID ผู้ใช้</span>
                                <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded border border-border">
                                    {user.id}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">สิทธิ์การใช้งาน</span>
                                <span className="font-bold text-foreground">{user.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        {/* Section Header */}
                        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <Building2 size={20} className="text-primary" />
                            ข้อมูลหน่วยบริการ
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">ชื่อหน่วยบริการ</label>
                                    <p className="text-base font-bold text-foreground">{user.hospital?.name || "ไม่ระบุ"}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">HCODE</label>
                                    <p className="font-mono text-sm bg-muted inline-block px-2 py-0.5 rounded border border-border">{user.hcode || "N/A"}</p>
                                </div>
                            </div>

                            <div className="space-y-4 md:col-span-2">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">ที่ตั้งหน่วยบริการ</label>
                                    <div className="flex items-start gap-2 text-sm text-foreground">
                                        <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p>{user.hospital?.address || "ไม่ระบุที่อยู่"}</p>
                                            <p className="text-muted-foreground">
                                                {user.hospital?.subdistrict?.name && `ต. ${user.hospital.subdistrict.name} `}
                                                {user.hospital?.district?.name && `อ. ${user.hospital.district.name} `}
                                                {user.hospital?.province?.name && `จ. ${user.hospital.province.name}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        {/* Section Header */}
                        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-primary" />
                            ประวัติการเข้าใช้งาน
                        </h3>

                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">ยังไม่มีประวัติการเข้าใช้งานล่าสุด</p>
                                <p className="text-xs text-muted-foreground">ข้อมูลการเข้าใช้งานจะปรากฏขึ้นเมื่อมีการใช้งานระบบ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
