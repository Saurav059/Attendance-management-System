import { motion } from 'framer-motion';

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] w-full gap-4">
            <motion.div
                animate={{
                    rotate: 360,
                    borderRadius: ["25%", "25%", "50%", "50%", "25%"],
                }}
                transition={{
                    duration: 2,
                    ease: "linear",
                    repeat: Infinity,
                }}
                className="w-12 h-12 bg-blue-600 shadow-lg shadow-blue-500/50"
            />
            <p className="text-slate-400 font-medium animate-pulse">Loading experience...</p>
        </div>
    );
};

export default Loading;
