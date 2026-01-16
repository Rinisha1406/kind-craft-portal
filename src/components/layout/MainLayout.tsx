import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const MainLayout = ({ children, showFooter = true }: MainLayoutProps) => {
  const whatsappNumber = "919514879417";
  const message = encodeURIComponent("Hi! I'm interested in your services. Can you help me?");

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      {showFooter && <Footer />}

      {/* Floating WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${whatsappNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex items-center gap-3 group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with us
        </span>
        <motion.div
          className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 text-white rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] flex items-center justify-center border-4 border-white hover:scale-110 transition-transform cursor-pointer relative"
          whileHover={{ rotate: 10 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </motion.div>
      </motion.a>
    </div>
  );
};

export default MainLayout;
