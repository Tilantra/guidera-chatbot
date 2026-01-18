import React, { useRef } from 'react';
import { useMouse } from 'react-use';
import { Hexagon, Plus } from 'lucide-react';

export const AuthBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { docX, docY } = useMouse(containerRef);

    // Calculate parallax offset - Slightly increased responsiveness
    const parallaxX = (docX - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) * 0.012;
    const parallaxY = (docY - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) * 0.012;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#F8FAFC] dark:bg-slate-950"
        >
            {/* Base Gradients */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-[120px]"></div>

            {/* Enhanced Floating Geometric Elements - Faster Speeds */}
            {/* 1. Large Hexagon - Top Left */}
            <div
                className="absolute top-[15%] left-[10%] animate-float"
                style={{
                    transform: `translate(${parallaxX * 2.5}px, ${parallaxY * 2.5}px) rotate(15deg)`,
                    animationDuration: '8s'
                }}
            >
                <Hexagon className="w-16 h-16 text-blue-500/20 dark:text-blue-400/10" strokeWidth={0.5} />
            </div>

            {/* 2. Hexagon - Top Center */}
            <div
                className="absolute top-[8%] left-[45%] animate-float"
                style={{
                    transform: `translate(${parallaxX * 1.5}px, ${parallaxY * 1.5}px) rotate(-10deg)`,
                    animationDelay: '1s',
                    animationDuration: '12s'
                }}
            >
                <Hexagon className="w-10 h-10 text-indigo-400/15 dark:text-indigo-300/10" strokeWidth={1} />
            </div>

            {/* 3. Hexagon - Mid Right */}
            <div
                className="absolute top-[45%] right-[5%] animate-float"
                style={{
                    transform: `translate(${parallaxX * -3}px, ${parallaxY * -3}px) rotate(45deg)`,
                    animationDelay: '0.5s',
                    animationDuration: '10s'
                }}
            >
                <Hexagon className="w-14 h-14 text-purple-400/20 dark:text-purple-300/10" strokeWidth={0.8} />
            </div>

            {/* 4. NEW Hexagon - Mid Left (Small) */}
            <div
                className="absolute top-[35%] left-[5%] animate-float"
                style={{
                    transform: `translate(${parallaxX * 1.2}px, ${parallaxY * 1.2}px) rotate(-20deg)`,
                    animationDelay: '3s',
                    animationDuration: '9s'
                }}
            >
                <Hexagon className="w-8 h-8 text-blue-400/20 dark:text-blue-300/10" strokeWidth={1} />
            </div>

            {/* 5. Hexagon - Bottom Left area */}
            <div
                className="absolute bottom-[20%] left-[25%] animate-float"
                style={{
                    transform: `translate(${parallaxX * 2}px, ${parallaxY * 2}px) rotate(-25deg)`,
                    animationDelay: '2s',
                    animationDuration: '11s'
                }}
            >
                <Hexagon className="w-12 h-12 text-blue-400/15 dark:text-blue-300/10" strokeWidth={1.2} />
            </div>

            {/* 6. NEW Hexagon - Far Bottom Left (Large) */}
            <div
                className="absolute bottom-[8%] left-[8%] animate-float"
                style={{
                    transform: `translate(${parallaxX * -2.5}px, ${parallaxY * -2.5}px) rotate(40deg)`,
                    animationDelay: '1.5s',
                    animationDuration: '15s'
                }}
            >
                <Hexagon className="w-20 h-20 text-indigo-500/10 dark:text-indigo-400/5" strokeWidth={0.4} />
            </div>

            {/* 7. Hexagon - Top Right area */}
            <div
                className="absolute top-[25%] right-[15%] animate-float"
                style={{
                    transform: `translate(${parallaxX * -1.5}px, ${parallaxY * -1.5}px) rotate(30deg)`,
                    animationDelay: '0.5s',
                    animationDuration: '10s'
                }}
            >
                <Hexagon className="w-12 h-12 text-indigo-500/15 dark:text-indigo-400/10" strokeWidth={1} />
            </div>

            {/* Plus - Middle Left */}
            <div
                className="absolute top-[50%] left-[20%] animate-float"
                style={{
                    transform: `translate(${parallaxX * 3.5}px, ${parallaxY * 3.5}px)`,
                    animationDelay: '2s',
                    animationDuration: '10s'
                }}
            >
                <Plus className="w-8 h-8 text-blue-600/20 dark:text-blue-500/10" strokeWidth={1.5} />
            </div>

            {/* 8. Large Hexagon - Bottom Right area */}
            <div
                className="absolute bottom-[15%] right-[10%] animate-float"
                style={{
                    transform: `translate(${parallaxX * 4}px, ${parallaxY * 4}px) rotate(-15deg)`,
                    animationDelay: '0.5s',
                    animationDuration: '18s'
                }}
            >
                <Hexagon className="w-24 h-24 text-purple-500/15 dark:text-purple-400/10" strokeWidth={0.3} />
            </div>

            {/* Small Plus - Bottom Left area */}
            <div
                className="absolute bottom-[30%] left-[10%] animate-float"
                style={{
                    transform: `translate(${parallaxX * -2}px, ${parallaxY * -2}px)`,
                    animationDelay: '3s',
                    animationDuration: '14s'
                }}
            >
                <Plus className="w-6 h-6 text-indigo-400/20 dark:text-indigo-300/10" strokeWidth={2} />
            </div>

            {/* Floating Dots for Depth */}
            <div
                className="absolute top-[40%] left-[40%] animate-float opacity-40"
                style={{
                    transform: `translate(${parallaxX * -3}px, ${parallaxY * -3}px)`,
                    animationDelay: '4.5s'
                }}
            >
                <div className="w-3 h-3 rounded-full bg-blue-500/40 dark:bg-blue-400/20 blur-[1px]"></div>
            </div>

            <div
                className="absolute bottom-[40%] right-[40%] animate-float opacity-30"
                style={{
                    transform: `translate(${parallaxX * 5}px, ${parallaxY * 5}px)`,
                    animationDelay: '1.2s'
                }}
            >
                <div className="w-2 h-2 rounded-full bg-purple-500/40 dark:bg-purple-400/20 blur-[1px]"></div>
            </div>

            <div
                className="absolute top-[10%] right-[45%] animate-float opacity-20"
                style={{
                    transform: `translate(${parallaxX * -4}px, ${parallaxY * -4}px)`,
                    animationDelay: '2.5s'
                }}
            >
                <div className="w-4 h-4 rounded-full bg-indigo-500/40 dark:bg-indigo-400/20 blur-[2px]"></div>
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook-dark.png')]"></div>
        </div>
    );
};
