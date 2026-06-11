"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    LayoutDashboard, 
    Users, 
    ChartPie, 
    CircleUser, 
    X, 
    ShieldUser,
    ChevronRight
} from "lucide-react";
import { useLayout } from "@/lib/contexts/LayoutContext";

export default function Sidebar() {
    const { isSidebarOpen, setSidebarOpen } = useLayout();
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    const navItems = [
        {
            label: "แดชบอร์ด",
            href: "/",
            icon: <LayoutDashboard size={20} />,
            active: pathname === "/"
        },
        {
            label: "รายชื่อประชากร",
            href: "/population",
            icon: <Users size={20} />,
            active: pathname === "/population"
        },
        {
            label: "การคัดกรอง",
            href: "/population/screening",
            icon: <ShieldUser size={20} />,
            active: pathname === "/population/screening"
        },
        {
            label: "รายงาน",
            href: "/summary/reports",
            icon: <ChartPie size={20} />,
            active: pathname.startsWith("/summary/reports")
        },
    ];

    if (user?.role === "ADMIN" || user?.role === "SUPERADMIN") {
        navItems.push({
            label: "ผู้ใช้งาน",
            href: "/admin/users",
            icon: <CircleUser size={20} />,
            active: pathname.startsWith("/admin/users")
        });
    }

    return (
        <>
            {/* Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 transition-opacity md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Panel */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                                <Users size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-foreground">Elderly Care</span>
                        </Link>
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${item.active 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                {item.active && <ChevronRight size={16} />}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer / User Info */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 px-2 py-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user?.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold truncate">{user?.name || "User"}</span>
                                <span className="text-xs text-muted-foreground truncate">{user?.email || ""}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
