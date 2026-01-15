import { useState } from "react";
import { BrowserGuideraClient } from "../lib/guidera-browser-client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Lock, Globe } from "lucide-react";
import TilantraBlueLogo from "../components/assets/Tilantra_blueLOGO.png";

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        full_name: "",
        company: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const client = new BrowserGuideraClient();
            await client.register({
                ...formData,
                models: ["gpt4", "llama3", "gemini2.5-flash"],
                teams: ["**NO_TEAM**"],
            });
            await client.login(formData.email, formData.password);
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Registration failed");
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

            {/* Tilantra Logo - Top Left */}
            <div className="absolute top-6 left-6 z-20">
                <img src={TilantraBlueLogo} alt="Tilantra" className="h-12 w-auto" />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10 text-left">
                {/* Left Side: Info */}
                <div className="hidden lg:block space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                            Access both <br />
                            <span style={{ color: '#6e4edf' }}>Guidera</span>
                            <span className="text-black dark:text-white"> & </span>
                            <span style={{ color: '#1a4161ff' }}>Capsule Hub</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-slate-400 max-w-xl leading-relaxed">
                            Scale your AI dreams. The intelligent control layer for modern AI systems.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Compliance Ready</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Automatic policy enforcement across all models.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800">
                                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Optimization</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Reduce token spend by up to 40% with smart routing.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex justify-center lg:justify-end">
                    <Card className="w-full max-w-md border border-gray-100 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                        <CardHeader className="space-y-1 pt-8 text-center">
                            <CardTitle className="text-3xl font-bold dark:text-white">Create account</CardTitle>
                            <CardDescription className="text-base dark:text-slate-400">
                                One account for Guidera & Capsule Hub
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="dark:text-slate-200">Username</Label>
                                        <Input
                                            id="username"
                                            placeholder="johndoe"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name" className="dark:text-slate-200">Full Name</Label>
                                        <Input
                                            id="full_name"
                                            placeholder="John Doe"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="dark:text-slate-200">Work Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 py-6 dark:text-white dark:placeholder:text-slate-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company" className="dark:text-slate-200">Company Name</Label>
                                    <Input
                                        id="company"
                                        placeholder="Acme Corp"
                                        value={formData.company}
                                        onChange={handleChange}
                                        required
                                        className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 py-6 dark:text-white dark:placeholder:text-slate-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="dark:text-slate-200">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 py-6 dark:text-white dark:placeholder:text-slate-500"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
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
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-7 text-lg rounded-xl transition-all duration-300 shadow-xl shadow-blue-100 active:scale-[0.98] mt-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Creating Account...
                                        </div>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </form>

                            <div className="mt-8 text-center text-sm text-gray-500">
                                Already have an account?{" "}
                                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                                    Sign in instead
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
