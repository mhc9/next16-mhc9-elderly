"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ValidationErrors {
    email?: string;
    password?: string;
}

export default function LoginPage() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [apiError, setApiError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const registered = searchParams.get("registered");
        if (registered) {
            // Using a small timeout to avoid the "setState synchronously within an effect" warning
            const timer = setTimeout(() => {
                setSuccess("Registration successful! Please sign in with your new account.");
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        if (!email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");
        setSuccess("");
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false, // Changed to false to handle error manually without full page redirect
            });

            if (result?.error) {
                setApiError("Invalid credentials. Please try again.");
            } else {
                // Manually redirect on success
                window.location.href = "/";
            }
        } catch (err) {
            setApiError("Something went wrong. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <LogIn size={32} strokeWidth={2.5} />
                        </div>
                    </div>
                    
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
                        <p className="text-sm text-muted-foreground mt-1">Please sign in to access the dashboard</p>
                    </div>

                    {apiError && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-center gap-2 animate-in shake duration-300">
                            <AlertCircle size={18} />
                            {apiError}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl flex items-center gap-3 animate-in fade-in duration-500">
                            <CheckCircle2 size={18} />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                    }}
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
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                                    }}
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-muted-foreground">Don&apos;t have an account? </span>
                        <Link href="/register" className="text-primary font-bold hover:underline transition-colors">
                            Create an account
                        </Link>
                    </div>
                </div>
                
                <div className="px-8 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                    <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</a>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">System v2.0</span>
                </div>
            </div>
        </div>
    );
}
