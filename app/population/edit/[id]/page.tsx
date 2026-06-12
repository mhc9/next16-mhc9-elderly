"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
    Users, ArrowLeft, Save, Loader2, AlertCircle, 
    User, CreditCard, Calendar, Phone, Mail, 
    MapPin, Building2, Home, Edit3,
    VenusAndMars,
    CircleUser
} from "lucide-react";
import { useSession } from "next-auth/react";
import { HospitalSearch, Hospital } from "@/components/ui/forms/HospitalSearch";
import DatePicker from "@/components/ui/forms/DatePicker";
import SearchableSelect from "@/components/ui/forms/SearchableSelect";
import moment from "moment";
import { SEXES, PREFIXES } from "@/lib/constants/population";

interface LocationOption {
    id: number;
    name: string;
}

export default function EditPersonPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    
    // Form State
    const [formData, setFormData] = useState({
        cid: "",
        prefix: "",
        firstname: "",
        lastname: "",
        sex: "",
        birth_date: "",
        telephone: "",
        mobile: "",
        email: "",
        address: "",
        moo: "",
        road: "",
        zipcode: "",
        province_id: "",
        district_id: "",
        subdistrict_id: "",
        hcode: ""
    });

    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

    // Location Data State
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [subdistricts, setSubdistricts] = useState<LocationOption[]>([]);

    // Fetch Initial Data
    useEffect(() => {
        async function fetchPersonData() {
            try {
                const res = await fetch(`/api/population/${id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลประชากรได้");
                console.log("Fetched person data:", json);
                
                setFormData({
                    cid: json.cid || "",
                    prefix: json.prefix || "",
                    firstname: json.firstname || "",
                    lastname: json.lastname || "",
                    sex: json.sex || "",
                    birth_date: json.birth_date ? moment(json.birth_date).format("YYYY-MM-DD") : "",
                    telephone: json.telephone || "",
                    mobile: json.mobile || "",
                    email: json.email || "",
                    address: json.address || "",
                    moo: json.moo?.toString() || "",
                    road: json.road || "",
                    zipcode: json.zipcode || "",
                    province_id: json.province_id?.toString() || "",
                    district_id: json.district_id?.toString() || "",
                    subdistrict_id: json.subdistrict_id?.toString() || "",
                    hcode: json.hcode || ""
                });

                if (json.hospital) {
                    setSelectedHospital({
                        hcode: json.hcode,
                        name: json.hospital.name
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchPersonData();
    }, [id]);

    useEffect(() => {
        async function fetchProvinces() {
            try {
                const res = await fetch("/api/locations/provinces");
                const json = await res.json();
                setProvinces(json.data || []);
            } catch (err) {
                console.error("Failed to fetch provinces");
            }
        }
        fetchProvinces();
    }, []);

    useEffect(() => {
        async function fetchDistricts() {
            if (!formData.province_id) {
                setDistricts([]);
                return;
            }
            try {
                const res = await fetch(`/api/locations/districts/${formData.province_id}`);
                const json = await res.json();
                setDistricts(json.data || []);
            } catch (err) {
                console.error("Failed to fetch districts");
            }
        }
        fetchDistricts();
    }, [formData.province_id]);

    useEffect(() => {
        async function fetchSubdistricts() {
            if (!formData.district_id) {
                setSubdistricts([]);
                return;
            }
            try {
                const res = await fetch(`/api/locations/subdistricts/${formData.district_id}`);
                const json = await res.json();
                setSubdistricts(json.data || []);
            } catch (err) {
                console.error("Failed to fetch subdistricts");
            }
        }
        fetchSubdistricts();
    }, [formData.district_id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: string) => {
        setFormData(prev => ({ ...prev, birth_date: date }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // Clear children when parent changes
            if (name === "province_id") {
                newState.district_id = "";
                newState.subdistrict_id = "";
            } else if (name === "district_id") {
                newState.subdistrict_id = "";
            }
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        const payload = {
            ...formData,
            hcode: isAdmin ? selectedHospital?.hcode : formData.hcode || session?.user?.hcode
        };

        if (!payload.hcode) {
            setError("กรุณาเลือกหน่วยบริการ");
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch(`/api/population/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");

            router.push(`/population/${id}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse font-medium">กำลังโหลดข้อมูลประชากร...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
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
                        <Edit3 className="text-primary" />
                        แก้ไขข้อมูลผู้สูงอายุ
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
                {/* 1. ข้อมูลส่วนบุคคล */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">ข้อมูลส่วนบุคคล</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="space-y-1.5 md:col-span-7">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <CreditCard size={14} /> เลขบัตรประชาชน
                            </label>
                            <input
                                type="text"
                                name="cid"
                                value={formData.cid}
                                onChange={handleInputChange}
                                placeholder="เลขบัตรประชาชน 13 หลัก"
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                                maxLength={13}
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <VenusAndMars size={14} /> เพศ
                            </label>
                            <div className="flex gap-2">
                                {SEXES.map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, sex: s }))}
                                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                                            formData.sex === s 
                                                ? "bg-primary text-white border-primary shadow-md" 
                                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                        }`}
                                    >
                                        {s === "M" ? "ชาย" : "หญิง"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <SearchableSelect
                                label="คำนำหน้า"
                                placeholder="เลือก"
                                icon={<CircleUser size={14} />}
                                options={PREFIXES}
                                value={formData.prefix}
                                onChange={(val) => handleSelectChange("prefix", val)}
                                clearable={false}
                                searchable
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <User size={14} /> ชื่อ
                            </label>
                            <input
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleInputChange}
                                required
                                placeholder="ระบุชื่อ"
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <Users size={14} /> นามสกุล
                            </label>
                            <input
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleInputChange}
                                required
                                placeholder="ระบุนามสกุล"
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <DatePicker
                                value={formData.birth_date}
                                onChange={handleDateChange}
                                label="วันเกิด"
                                placeholder="เลือกวันเกิด"
                                icon={<Calendar size={14} />}
                                className="space-y-1.5"
                                showAge
                                inputCss="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <Phone size={14} /> เบอร์โทรศัพท์มือถือ
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                placeholder="0xx-xxx-xxxx"
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                                <Mail size={14} /> อีเมล (ถ้ามี)
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="example@email.com"
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. ที่อยู่ปัจจุบัน */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Home size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">ที่อยู่ปัจจุบัน</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">ที่อยู่ (บ้านเลขที่/ซอย/หมู่บ้าน)</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="เช่น 123/45 ซอย... หมู่บ้าน..."
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">หมู่ที่</label>
                            <input
                                type="number"
                                name="moo"
                                value={formData.moo}
                                onChange={handleInputChange}
                                placeholder="ระบุตัวเลข"
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">ถนน</label>
                            <input
                                type="text"
                                name="road"
                                value={formData.road}
                                onChange={handleInputChange}
                                placeholder="ระบุชื่อถนน (ถ้ามี)"
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1">รหัสไปรษณีย์</label>
                            <input
                                type="text"
                                name="zipcode"
                                value={formData.zipcode}
                                onChange={handleInputChange}
                                placeholder="5 หลัก"
                                maxLength={5}
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <SearchableSelect
                                label="จังหวัด"
                                placeholder="เลือกจังหวัด"
                                options={provinces.map(p => ({ value: p.id.toString(), label: p.name }))}
                                value={formData.province_id}
                                onChange={(val) => handleSelectChange("province_id", val)}
                                searchable
                                clearable
                            />
                        </div>
                        <div className="space-y-1.5">
                            <SearchableSelect
                                label="อำเภอ"
                                placeholder="เลือกอำเภอ"
                                options={districts.map(d => ({ value: d.id.toString(), label: d.name }))}
                                value={formData.district_id}
                                onChange={(val) => handleSelectChange("district_id", val)}
                                disabled={!formData.province_id}
                                searchable
                                clearable
                            />
                        </div>
                        <div className="space-y-1.5">
                            <SearchableSelect
                                label="ตำบล"
                                placeholder="เลือกตำบล"
                                options={subdistricts.map(s => ({ value: s.id.toString(), label: s.name }))}
                                value={formData.subdistrict_id}
                                onChange={(val) => handleSelectChange("subdistrict_id", val)}
                                disabled={!formData.district_id}
                                searchable
                                clearable
                            />
                        </div>
                    </div>
                </div>

                {/* 3. ข้อมูลหน่วยบริการ (Admin Only) */}
                {isAdmin && (
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Building2 size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">ข้อมูลหน่วยบริการ</h2>
                        </div>
                        
                        <HospitalSearch 
                            selectedHospital={selectedHospital}
                            onSelect={setSelectedHospital}
                            onClear={() => setSelectedHospital(null)}
                            label="ค้นหาหน่วยบริการต้นสังกัด"
                            placeholder="พิมพ์ชื่อหรือรหัส 5 หลักเพื่อค้นหา..."
                            provinceId={formData.province_id}
                            districtId={formData.district_id}
                        />
                    </div>
                )}

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
                        disabled={isSaving}
                        className="flex items-center gap-2 px-10 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                บันทึกการแก้ไข
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
