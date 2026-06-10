"use client";

import { useState, useEffect } from "react";
import { 
    Users, Search, Filter, Shield, Building2, 
    Mail, Loader2, AlertCircle, CircleUser, 
    Eye, Edit2, Trash2 
} from "lucide-react";
import Link from "next/link";
import { ActionMenu, MenuItem } from "@/components/ui/ActionMenu";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    hcode: string | null;
    hospital: {
        name: string;
    } | null;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch("/api/users");
                const json = await res.json();

                if (!res.ok) throw new Error(json.error || "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
                setUsers(json.data || []);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลผู้ใช้ได้";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
            (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
            (user.hospital?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
            (user.hcode?.includes(searchQuery) || false);
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    const getUserActions = (user: User): MenuItem[] => [
        {
            label: "รายละเอียด",
            icon: <Eye size={16} className="text-primary" />,
            href: `/admin/users/${user.id}`
        },
        {
            label: "แก้ไขข้อมูล",
            icon: <Edit2 size={16} className="text-amber-500" />,
            href: `/admin/users/edit/${user.id}`
        },
        {
            label: "ลบผู้ใช้งาน",
            icon: <Trash2 size={16} />,
            variant: "danger",
            onClick: () => {
                if (confirm("คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) {
                    console.log("Delete user id:", user.id);
                }
            }
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <CircleUser className="text-primary" />
                        รายชื่อผู้ใช้งาน
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        จัดการและตรวจสอบข้อมูลผู้ใช้งานทั้งหมดในระบบ
                    </p>
                </div>
                <Link 
                    href="/admin/users/new"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                >
                    <Users size={18} />
                    เพิ่มผู้ใช้งานใหม่
                </Link>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group md:col-span-2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, อีเมล หรือหน่วยบริการ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                        <Shield size={18} />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">ทุกสิทธิ์การใช้งาน</option>
                        <option value="SUPERADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="USER">User</option>
                    </select>
                </div>
            </div>

            {/* Users List */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-muted/50 rounded-xl border border-border p-2 flex items-center gap-2 mb-2">
                    <Filter size={14} className="text-muted-foreground ml-2" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        พบทั้งหมด {filteredUsers.length} รายการ
                    </span>
                </div>

                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div 
                            key={user.id}
                            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Users size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                                {user.name || "ไม่ระบุชื่อ"}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
                                                user.role === 'SUPERADMIN' 
                                                    ? 'bg-purple-100 text-purple-700' 
                                                    : user.role === 'ADMIN'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Mail size={14} />
                                                {user.email || "ไม่มีอีเมล"}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Building2 size={14} />
                                                {user.hospital?.name || "ไม่ระบุหน่วยบริการ"}
                                                {user.hcode && (
                                                    <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded border border-border">
                                                        {user.hcode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <ActionMenu items={getUserActions(user)} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-3xl gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Users size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-foreground">ไม่พบข้อมูลผู้ใช้งาน</p>
                            <p className="text-sm text-muted-foreground">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
