"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Users, FileText, Settings, LogOut, User, Bell, Search } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Navbar() {
    const { data: session, status } = useSession();
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
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Users size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-foreground leading-none">Elderly Care</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Dashboard v2.0</span>
                    </div>
                </div>

                {isLoggedIn && (
                    <div className="hidden lg:flex items-center gap-1">
                        <NavLink icon={<LayoutDashboard size={18} />} label="Overview" active />
                        <NavLink icon={<Users size={18} />} label="Population" />
                        <NavLink icon={<FileText size={18} />} label="Reports" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {isLoggedIn && (
                    <div className="hidden md:flex items-center bg-muted/50 border border-border rounded-full px-3 py-1.5 gap-2">
                        <Search size={14} className="text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="bg-transparent border-none focus:outline-none text-xs w-32"
                        />
                    </div>
                )}

                <ThemeToggle />

                {isLoggedIn && (
                    <>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                        </button>

                        <div className="relative" ref={ref}>
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
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
                                    <MenuLink icon={<User size={16} />} label="Your Profile" />
                                    <MenuLink icon={<Settings size={16} />} label="Settings" />
                                    <div className="border-t border-border mt-1 pt-1">
                                        <button 
                                            onClick={() => signOut({ callbackUrl: "/login" })}
                                            className="w-full text-left"
                                        >
                                            <MenuLink icon={<LogOut size={16} />} label="Sign out" variant="danger" />
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

function NavLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <a 
            href="#" 
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
            `}
        >
            {icon}
            {label}
        </a>
    );
}

function MenuLink({ icon, label, variant = "default" }: { icon: React.ReactNode, label: string, variant?: "default" | "danger" }) {
    return (
        <a 
            href="#" 
            className={`
                flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                ${variant === "danger"
                    ? "text-red-500 hover:bg-red-50" 
                    : "text-foreground hover:bg-muted/50"
                }
            `}
        >
            {icon}
            {label}
        </a>
    );
}
