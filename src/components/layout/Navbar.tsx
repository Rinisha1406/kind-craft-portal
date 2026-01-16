import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Gem, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Products", path: "/products" },
  { name: "Gallery", path: "/gallery" },
  { name: "Matrimony", path: "/matrimony" },
  { name: "Members", path: "/members" },
  {
    name: "Todays News & Rasi Palan",
    path: "#",
    isDropdown: true,
    subLinks: [
      { name: "Today's News", path: "/today-news" },
      { name: "Today's Rasi Palan", path: "/today-rasi-palan" },
    ]
  },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center shadow-gold"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Gem className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-serif font-bold text-foreground">
              S. P. GEM <span className="text-primary">GOLD ACADEMY</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.isDropdown ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger className="relative px-4 py-2 outline-none flex items-center gap-1 group">
                    <motion.span
                      className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {link.name}
                    </motion.span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all duration-200 group-data-[state=open]:rotate-180" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50">
                    {link.subLinks?.map((sub) => (
                      <DropdownMenuItem key={sub.path} asChild>
                        <Link
                          to={sub.path}
                          className={`w-full cursor-pointer ${isActive(sub.path) ? "text-primary font-semibold" : ""}`}
                        >
                          {sub.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2"
                >
                  <motion.span
                    className={`relative z-10 text-sm font-medium transition-colors ${isActive(link.path) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {link.name}
                  </motion.span>
                  {isActive(link.path) && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              )
            ))}

            <div className="ml-4 pl-4 border-l border-border/50">
              {/* Auth buttons removed as per request */}
            </div>
          </div>



          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 text-foreground rounded-xl bg-muted"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {link.isDropdown ? (
                      <div className="space-y-1">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {link.name}
                        </div>
                        {link.subLinks?.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setIsOpen(false)}
                            className={`block px-8 py-2 rounded-xl text-sm font-medium transition-colors ${isActive(sub.path)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted"
                              }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive(link.path)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.div>
                ))}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
