"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, Building, Loader2, X, AlertCircle } from "lucide-react";

interface LocationInfo {
    name: string;
}

interface HealthCenter {
    hcode: string;
    name: string;
    province?: LocationInfo;
    district?: LocationInfo;
}

interface ValidationErrors {
    name?: string;
    email?: string;
    hcode?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        hcode: "",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [apiError, setApiError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<HealthCenter[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/hospitals/search?q=${encodeURIComponent(searchQuery)}`);
                const json = await res.json();
                setSearchResults(json.data ?? []);
                setShowDropdown(true);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field-specific error when user types
        if (errors[name as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectCenter = (center: HealthCenter) => {
        setSelectedCenter(center);
        setSearchQuery(center.name);
        setFormData(prev => ({ ...prev, hcode: center.hcode }));
        setShowDropdown(false);
        // Clear hcode error
        if (errors.hcode) {
            setErrors(prev => ({ ...prev, hcode: undefined }));
        }
    };

    const handleClearCenter = () => {
        setSelectedCenter(null);
        setSearchQuery("");
        setFormData(prev => ({ ...prev, hcode: "" }));
        setSearchResults([]);
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = "Full name is required";
        }
        
        if (!formData.email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        if (!formData.hcode) {
            newErrors.hcode = "Please select a health center";
        }
        
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }
        
        if (formData.password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            router.push("/login?registered=true");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <UserPlus size={32} strokeWidth={2.5} />
                        </div>
                    </div>
                    
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
                        <p className="text-sm text-muted-foreground mt-1">Join the Elderly Care System</p>
                    </div>

                    {apiError && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-center gap-2">
                            <AlertCircle size={18} />
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-rose-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                                    <User size={18} />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className={`w-full bg-muted/50 border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                                        errors.name 
                                            ? 'border-rose-500 focus:ring-rose-500/20' 
                                            : 'border-border focus:ring-primary/20 focus:border-primary'
                                    }`}
                                />
                            </div>
                            {errors.name && <p className="text-xs text-rose-500 ml-1 font-medium">{errors.name}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-rose-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@elderlycare.go.th"
                                    className={`w-full bg-muted/50 border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                                        errors.email 
                                            ? 'border-rose-500 focus:ring-rose-500/20' 
                                            : 'border-border focus:ring-primary/20 focus:border-primary'
                                    }`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-500 ml-1 font-medium">{errors.email}</p>}
                        </div>

                        {/* Health Center Search */}
                        <div className="space-y-2 relative" ref={dropdownRef}>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                Health Center
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${errors.hcode ? 'text-rose-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                                    <Building size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => {
                                        setSearchQuery(e.target.value);
                                        if (selectedCenter) handleClearCenter();
                                    }}
                                    onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                    placeholder="Search health center by name or code..."
                                    className={`w-full bg-muted/50 border rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 transition-all ${
                                        errors.hcode 
                                            ? 'border-rose-500 focus:ring-rose-500/20' 
                                            : 'border-border focus:ring-primary/20 focus:border-primary'
                                    }`}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleClearCenter}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {showDropdown && (
                                <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                                    {isSearching ? (
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                                            <Loader2 size={14} className="animate-spin" />
                                            Searching...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <ul className="max-h-48 overflow-y-auto">
                                            {searchResults.map(center => (
                                                <li
                                                    key={center.hcode}
                                                    onClick={() => handleSelectCenter(center)}
                                                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 text-sm transition-colors"
                                                >
                                                    <Building size={16} className="text-muted-foreground shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{center.hcode} - {center.name}</span>
                                                        <span className="text-xs text-muted-foreground">อ.{center.district?.name} จ.{center.province?.name}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-muted-foreground">
                                            No health centers found
                                        </div>
                                    )}
                                </div>
                            )}
                            {errors.hcode && <p className="text-xs text-rose-500 ml-1 font-medium">{errors.hcode}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-rose-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full bg-muted/50 border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                                        errors.password 
                                            ? 'border-rose-500 focus:ring-rose-500/20' 
                                            : 'border-border focus:ring-primary/20 focus:border-primary'
                                    }`}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-rose-500 ml-1 font-medium">{errors.password}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.confirmPassword ? 'text-rose-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) {
                                            setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                        }
                                    }}
                                    placeholder="••••••••"
                                    className={`w-full bg-muted/50 border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                                        errors.confirmPassword 
                                            ? 'border-rose-500 focus:ring-rose-500/20' 
                                            : 'border-border focus:ring-primary/20 focus:border-primary'
                                    }`}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-rose-500 ml-1 font-medium">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="px-8 py-4 bg-muted/30 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        Already have an account?{" "}
                        <a href="/login" className="font-bold text-primary hover:underline">Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
