import { Link } from "react-router-dom";
import { Gem, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-secondary pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center">
                <Gem className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-serif font-bold text-champagne">
                Golden<span className="text-gold">Legacy</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Premium jewelry and trusted matrimony services for our cherished community members.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-champagne mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Products", "Matrimony", "Members", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                    className="text-muted-foreground text-sm hover:text-gold transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-champagne mb-4">Categories</h4>
            <ul className="space-y-2">
              {["Gold Jewelry", "Silver Collection", "Diamond Pieces", "Platinum Range", "Gemstones"].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/products"
                    className="text-muted-foreground text-sm hover:text-gold transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-champagne mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-gold" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-gold" />
                info@goldenlegacy.com
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-gold mt-0.5" />
                123 Jewelry Street, Mumbai, Maharashtra 400001
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-muted/20 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Golden Legacy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
