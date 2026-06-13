"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    Upload, FileText, AlertCircle, CheckCircle2, 
    ArrowLeft, Loader2, X, Info, Download
} from "lucide-react";

export default function SummaryReportUploadPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        details?: {
            total: number;
            created: number;
            updated: number;
            errors: string[];
        };
    } | null>(null);

    // Redirect if not admin
    if (session && session.user.role === "USER") {
        router.push("/summary/reports");
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
                setResult({
                    success: false,
                    message: "กรุณาเลือกไฟล์ .csv เท่านั้น"
                });
                return;
            }
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/reports/summary/upload", {
                method: "POST",
                body: formData,
            });

            const json = await res.json();

            setResult({
                success: res.ok,
                message: json.message || (res.ok ? "อัปโหลดข้อมูลสำเร็จ" : "เกิดข้อผิดพลาดในการอัปโหลด"),
                details: json.details
            });

            if (res.ok) {
                setFile(null);
            }
        } catch (err) {
            setResult({
                success: false,
                message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link 
                    href="/summary/reports"
                    className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-all"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">อัปโหลดรายงานสรุปผล</h1>
                    <p className="text-sm text-muted-foreground">นำเข้าข้อมูลสรุปผลการดำเนินงานจากไฟล์ CSV</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                            <Info size={18} />
                            ข้อกำหนดของไฟล์
                        </div>
                        <ul className="space-y-3">
                            <li className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1" />
                                ไฟล์ต้องเป็นนามสกุล .csv เท่านั้น
                            </li>
                            <li className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1" />
                                หัวตารางต้องตรงตามรูปแบบที่กำหนด
                            </li>
                            <li className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1" />
                                รหัสหน่วยบริการ (hcode) ต้องมีอยู่จริงในระบบ
                            </li>
                        </ul>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all text-xs">
                            <Download size={14} />
                            ดาวน์โหลดเทมเพลต
                        </button>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider mb-2">
                            <AlertCircle size={18} />
                            ข้อควรระวัง
                        </div>
                        <p className="text-xs text-amber-600 leading-relaxed">
                            หากมีข้อมูลปีและรหัสหน่วยบริการซ้ำกับที่มีอยู่แล้วในระบบ ระบบจะทำการ **อัปเดต (Overwrite)** ข้อมูลเดิมด้วยข้อมูลใหม่จากไฟล์ทันที
                        </p>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="md:col-span-2 space-y-6">
                    <div 
                        className={`
                            relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all
                            ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                        `}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading}
                        />
                        
                        <div className={`p-4 rounded-2xl ${file ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                            <Upload size={32} />
                        </div>

                        <div className="text-center">
                            <p className="text-lg font-bold text-foreground">
                                {file ? file.name : "คลิกหรือลากไฟล์มาวางเพื่ออัปโหลด"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {file ? `(${(file.size / 1024).toFixed(2)} KB)` : "รองรับเฉพาะไฟล์ .csv เท่านั้น"}
                            </p>
                        </div>

                        {file && !isUploading && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                }}
                                className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 text-rose-500 hover:bg-rose-50 shadow-sm transition-all"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {result && (
                        <div className={`p-5 rounded-2xl border ${result.success ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} animate-in fade-in slide-in-from-top-2`}>
                            <div className="flex items-start gap-4">
                                <div className={result.success ? 'text-emerald-500' : 'text-rose-500'}>
                                    {result.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div>
                                        <p className={`font-bold ${result.success ? 'text-emerald-800' : 'text-rose-800'}`}>
                                            {result.message}
                                        </p>
                                        {result.details && (
                                            <div className="mt-2 grid grid-cols-3 gap-4">
                                                <div className="text-center bg-white/50 rounded-xl p-2 border border-black/5">
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">ทั้งหมด</p>
                                                    <p className="text-lg font-black text-foreground">{result.details.total}</p>
                                                </div>
                                                <div className="text-center bg-white/50 rounded-xl p-2 border border-black/5">
                                                    <p className="text-[10px] text-emerald-600 font-bold uppercase">สร้างใหม่</p>
                                                    <p className="text-lg font-black text-emerald-600">{result.details.created}</p>
                                                </div>
                                                <div className="text-center bg-white/50 rounded-xl p-2 border border-black/5">
                                                    <p className="text-[10px] text-primary font-bold uppercase">อัปเดต</p>
                                                    <p className="text-lg font-black text-primary">{result.details.updated}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {result.details?.errors && result.details.errors.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">ข้อผิดพลาดที่พบ:</p>
                                            <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                                {result.details.errors.map((err, i) => (
                                                    <p key={i} className="text-xs text-rose-600 flex gap-2">
                                                        <span className="shrink-0">•</span>
                                                        {err}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Link 
                            href="/summary/reports"
                            className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
                        >
                            ยกเลิก
                        </Link>
                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    กำลังอัปโหลด...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    เริ่มอัปโหลด
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
