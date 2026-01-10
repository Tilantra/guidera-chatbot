import { useState } from "react";
import { BrowserGuideraClient } from "../lib/guidera-browser-client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Lock, Globe } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const client = new BrowserGuideraClient();
            await client.login(email, password);
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-6 lg:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10 text-left">
                {/* Left Side: Info */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                            <span className="text-sm font-bold tracking-wider text-blue-600 uppercase">Guidera</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                            Integrated <br />
                            <span className="text-blue-600 dark:text-blue-500">AI Platform</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-slate-400 max-w-xl leading-relaxed">
                            The intelligent control layer for modern AI systems. Optimize spend, ensure compliance, and accelerate deployment with one unified platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Security First</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Enterprise-grade security and compliance built-in.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800">
                                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Fast Deployment</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Go from development to production in minutes.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex justify-center lg:justify-end">
                    <Card className="w-full max-w-md border border-gray-100 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                        <CardHeader className="space-y-1 pt-8">
                            <CardTitle className="text-3xl font-bold text-center dark:text-white">Welcome!</CardTitle>
                            <CardDescription className="text-center text-base dark:text-slate-400">
                                Enter your credentials to access the chatbot.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 py-6 dark:text-white dark:placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="dark:text-slate-200">Password</Label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 py-6 dark:text-white dark:placeholder:text-slate-500"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {error}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-7 text-lg rounded-xl transition-all duration-300 shadow-xl shadow-blue-100 active:scale-[0.98]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Authenticating...
                                        </div>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>

                            <div className="mt-8 text-center text-sm text-gray-500">
                                New to Guidera?{" "}
                                <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                                    Create an account
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
