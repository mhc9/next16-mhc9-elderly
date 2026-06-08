"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChartPie, LayoutDashboard, Users, Settings, LogOut, Bell, Search, CircleUser, ShieldUser, ChevronDown, ListChecks } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const user = session?.user;
    const isLoggedIn = status === "authenticated";

    const userInitials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U";

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <nav className="h-16 w-full flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Users size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-foreground leading-none">Elderly Care</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Dashboard v2.0</span>
                    </div>
                </Link>

                {isLoggedIn && (
                    <div className="hidden lg:flex items-center gap-1">
                        <NavLink href="/" icon={<LayoutDashboard size={18} />} label="แดชบอร์ด" active={pathname === "/"} />
                        
                        <NavDropdown 
                            label="ประชากร" 
                            icon={<Users size={18} />} 
                            active={pathname.startsWith("/population")}
                        >
                            <MenuLink 
                                href="/population" 
                                icon={<Users size={16} />} 
                                label="รายชื่อประชากร" 
                                active={pathname === "/population"}
                            />
                            <MenuLink 
                                href="/screening" 
                                icon={<ShieldUser size={16} />} 
                                label="การคัดกรอง" 
                                active={pathname === "/screening"}
                            />
                        </NavDropdown>

                        <NavLink href="/summary/reports" icon={<ChartPie size={18} />} label="รายงาน" active={pathname === "/summary/reports"} />
                        {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
                            <NavLink href="/admin/users" icon={<CircleUser size={18} />} label="ผู้ใช้งาน" active={pathname === "/admin/users"} />
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* {isLoggedIn && (
                    <div className="hidden md:flex items-center bg-muted/50 border border-border rounded-full px-3 py-1.5 gap-2">
                        <Search size={14} className="text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="bg-transparent border-none focus:outline-none text-xs w-32"
                        />
                    </div>
                )} */}

                <ThemeToggle />

                {isLoggedIn && (
                    <>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors relative cursor-pointer">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                        </button>

                        <div className="relative" ref={ref}>
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 transition-colors cursor-pointer"
                                aria-expanded={open}
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal-700 flex items-center justify-center text-white font-semibold shadow-md">
                                    {userInitials}
                                </div>
                                <div className="hidden sm:flex flex-col items-start pr-2">
                                    <span className="text-xs font-bold text-foreground leading-none">{user?.name || "User"}</span>
                                    <span className="text-[10px] text-muted-foreground capitalize">{user?.role?.toLowerCase() || "Guest"}</span>
                                </div>
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-border mb-1">
                                        <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                                        <p className="text-sm font-bold text-foreground truncate">{user?.email}</p>
                                    </div>
                                    <MenuLink href={`/admin/users/${user?.id}`} icon={<CircleUser size={16} />} label="โปรไฟล์" />
                                    {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
                                        <MenuLink href="/admin/users" icon={<Users size={16} />} label="จัดการผู้ใช้งาน" />
                                    )}
                                    <MenuLink href="/settings" icon={<Settings size={16} />} label="การตั้งค่า" />
                                    <div className="border-t border-border mt-1 pt-1">
                                        <button 
                                            onClick={() => signOut({ callbackUrl: "/login" })}
                                            className="w-full text-left cursor-pointer"
                                        >
                                            <MenuLink href="#" icon={<LogOut size={16} />} label="ออกจากระบบ" variant="danger" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}

function NavDropdown({ 
    label, 
    icon, 
    active = false, 
    children 
}: { 
    label: string, 
    icon: React.ReactNode, 
    active?: boolean, 
    children: React.ReactNode 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                    ${active 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                `}
            >
                {icon}
                <span>{label}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div 
                    className="absolute left-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

function NavLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link 
            href={href} 
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
            `}
        >
            {icon}
            {label}
        </Link>
    );
}

function MenuLink({ 
    href, 
    icon, 
    label, 
    variant = "default", 
    active = false,
    onClick 
}: { 
    href: string, 
    icon: React.ReactNode, 
    label: string, 
    variant?: "default" | "danger",
    active?: boolean,
    onClick?: () => void
}) {
    return (
        <Link 
            href={href} 
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer
                ${variant === "danger"
                    ? "text-red-500 hover:bg-red-50" 
                    : active
                        ? "bg-primary/5 text-primary font-bold"
                        : "text-foreground hover:bg-muted/50"
                }
            `}
        >
            {icon}
            {label}
        </Link>
    );
}
