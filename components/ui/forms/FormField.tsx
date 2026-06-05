"use client";

import React from "react";

interface FormFieldProps {
    label: string;
    name: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: React.ReactNode;
    color?: string;
    placeholder?: string;
    required?: boolean;
}

export function FormField({ 
    label,
    name, 
    value, 
    onChange,
    icon, 
    color = "text-foreground",
    placeholder = "0",
    required = false
}: FormFieldProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2 pl-1">
                {icon && <span>{icon}</span>}
                {label}
            </label>
            <input
                type="number"
                name={name}
                value={value === 0 ? "" : value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-muted/20 border border-border/60 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-mono font-bold ${color}`}
            />
        </div>
    );
}
