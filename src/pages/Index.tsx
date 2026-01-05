import { Link } from "react-router-dom";
import { ArrowRight, Gem, Heart, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";

const features = [
  {
    icon: Gem,
    title: "Premium Jewelry",
    description: "Exquisite gold, silver, diamond, and platinum collections crafted with perfection.",
  },
  {
    icon: Heart,
    title: "Matrimony Services",
    description: "Find your perfect life partner within our trusted community network.",
  },
  {
    icon: Users,
    title: "Community Members",
    description: "Join our growing family of members and enjoy exclusive benefits.",
  },
  {
    icon: Star,
    title: "Trusted Legacy",
    description: "Decades of trust and quality service to our cherished community.",
  },
];

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-gradient min-h-[80vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsl(38_70%_45%_/_0.1),_transparent_50%)]" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl animate-slide-up">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              Welcome to Golden Legacy
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
              Where Tradition Meets
              <span className="text-gold-gradient block">Timeless Elegance</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Discover our exquisite jewelry collections and connect with our vibrant community 
              through trusted matrimony and membership services.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="gold-gradient text-primary-foreground shadow-gold hover:opacity-90 text-base px-8">
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/matrimony">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base px-8">
                  Matrimony Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full opacity-20 hidden lg:block">
          <div className="absolute top-20 right-20 w-64 h-64 gold-gradient rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-40 w-48 h-48 bg-rose-gold rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a blessed life - from stunning jewelry to meaningful connections.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 gold-gradient rounded-xl flex items-center justify-center mb-5 shadow-gold group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_hsl(38_70%_45%_/_0.15),_transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-serif font-bold text-champagne mb-4">
            Join Our Community
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Become a member today and unlock exclusive access to premium collections, 
            special discounts, and matrimony services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/members">
              <Button size="lg" className="gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                Become a Member
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-champagne/30 text-champagne hover:bg-champagne/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
