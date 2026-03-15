"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);

    // Initial branding animation steps
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-cejop-dark flex flex-col items-center justify-center"
        >
            <div className="relative">
                {/* Logo Box */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                        duration: 0.8, 
                        ease: [0.16, 1, 0.3, 1] 
                    }}
                    className="w-24 h-24 bg-cejop-blue flex items-center justify-center shadow-2xl shadow-cejop-blue/20"
                >
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="font-montserrat font-black text-white text-2xl leading-none tracking-tighter text-center"
                    >
                        CEJ
                        <br />
                        OP
                    </motion.span>
                </motion.div>

                {/* Animated Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-t-white border-r-white/20 border-b-white/10 border-l-white/5 rounded-full"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-12 text-center"
            >
                <h2 className="font-montserrat font-bold text-white text-xl tracking-tight">
                    CEJOP <span className="text-cejop-blue-light font-medium">Tucumán</span>
                </h2>
                <p className="font-encode text-white/40 text-xs tracking-[0.3em] uppercase mt-2">
                    Formación Política
                </p>
            </motion.div>

            {/* Progress bar line */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/10 overflow-hidden">
                <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-full h-full bg-white/40"
                />
            </div>
        </motion.div>
    );
}
