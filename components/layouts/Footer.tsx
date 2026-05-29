"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) return null;

    return (
        <footer className="border-t border-border py-6 bg-card/50">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-muted-foreground">
                    © 2024 Elderly Care System. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
