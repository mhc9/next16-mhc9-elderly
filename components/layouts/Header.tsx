"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layouts/Navbar";

export default function Header() {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) return null;

    return (
        <header className="sticky top-0 z-40 w-full glass">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <Navbar />
            </div>
        </header>
    );
}
