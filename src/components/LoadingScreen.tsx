import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import brandLogo from "@/assets/cejob_brand.png";

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
                {/* Logo Image */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                        duration: 0.8, 
                        ease: [0.16, 1, 0.3, 1] 
                    }}
                    className="w-24 h-24 relative flex items-center justify-center"
                >
                    <Image
                        src={brandLogo}
                        alt="CEJOP Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </motion.div>

                {/* Animated Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute -inset-6 border border-t-white/40 border-r-white/10 border-b-transparent border-l-transparent rounded-full"
                />
            </div>
        </motion.div>
    );
}
