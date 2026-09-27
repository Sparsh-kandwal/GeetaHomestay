import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const StatusRibbon = ({ message }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 rounded-2xl border border-red-700 bg-[#dc2626] px-4 py-3.5 sm:px-5 sm:py-4 shadow-[0_8px_24px_rgba(220,38,38,0.25)]"
      role="alert"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
        <AlertCircle className="h-5 w-5" />
      </div>
      <p className="font-merriweather text-xs sm:text-sm font-semibold tracking-wide leading-relaxed text-white">
        {message}
      </p>
    </motion.div>
  );
};

export default StatusRibbon;
