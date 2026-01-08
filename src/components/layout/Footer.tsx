import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gem, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-champagne relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_hsl(38_70%_45%_/_0.08),_transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_hsl(15_50%_55%_/_0.05),_transparent_40%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center shadow-gold">
                <Gem className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-champagne">
                  GOLD<span className="text-gold">JEWELTECH</span>
                </span>
              </div>
            </Link>
            <p className="text-champagne/60 text-sm leading-relaxed mb-6">
              Premium jewelry and trusted matrimony services for our cherished community.
              Excellence in craftsmanship for over 50 years.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-champagne/10 rounded-full flex items-center justify-center text-champagne/60 hover:gold-gradient hover:text-primary-foreground transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-serif text-lg font-semibold text-champagne mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Services", path: "/services" },
                { name: "Products", path: "/products" },
                { name: "Matrimony", path: "/matrimony" },
                { name: "Members", path: "/members" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => window.scrollTo(0, 0)}
                    className="group flex items-center gap-2 text-champagne/60 text-sm hover:text-gold transition-colors"
                  >
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Collections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-serif text-lg font-semibold text-champagne mb-6">Collections</h4>
            <ul className="space-y-3">
              {["Gold Jewelry", "Diamond Collection", "Silver Pieces", "Platinum Range", "Gemstone Jewelry"].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/products"
                    onClick={() => window.scrollTo(0, 0)}
                    className="group flex items-center gap-2 text-champagne/60 text-sm hover:text-gold transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-gold/50 rounded-full" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-serif text-lg font-semibold text-champagne mb-6">Contact Us</h4>
            <ul className="space-y-4">
              {[
                { icon: Phone, text: "+91 98765 43210" },
                { icon: Mail, text: "info@goldjeweltech.com" },
                { icon: MapPin, text: "123 Jewelry Street, Mumbai, Maharashtra 400001" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-champagne/60 text-sm">
                  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-gold" />
                  </div>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-champagne/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-champagne/40 text-sm">
              © {currentYear} GOLDJEWELTECH. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-champagne/40">
              <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold transition-colors">Refund Policy</a>
              <Link to="/admin/login" className="hover:text-gold transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
