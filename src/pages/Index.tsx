import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Shield, Users, Image, Swords, Star, Trophy } from "lucide-react";
import logo from "@/assets/afw-logo.png";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ background: 'var(--gradient-hero)' }}
        />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <img 
              src={logo} 
              alt="AFW" 
              className="h-32 w-32 mx-auto mb-8 animate-pulse"
              style={{ filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.5))' }}
            />
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
              AFW
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
              Comprehensive Clash of Clans clan and player lookup platform
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              <Link to="/clan-lookup">
                <Button size="lg" variant="hero" className="gap-2 text-lg px-8">
                  <Shield className="h-5 w-5" />
                  Search Clans
                </Button>
              </Link>
              <Link to="/player-lookup">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                  <Users className="h-5 w-5" />
                  Search Players
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to track and analyze CoC data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Clan Lookup</h3>
                <p className="text-muted-foreground">
                  Search any clan by tag and view detailed statistics, members, and achievements
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Player Lookup</h3>
                <p className="text-muted-foreground">
                  Track player progress, trophies, achievements, and clan membership
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Image className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Complete Gallery</h3>
                <p className="text-muted-foreground">
                  Browse all heroes, troops, spells, pets, and siege machines with images
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
                  <Star className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Clan Associations</h3>
                <p className="text-muted-foreground">
                  Track official partnerships and sister clans with verified badges
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
                  <Trophy className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">API Access</h3>
                <p className="text-muted-foreground">
                  Full REST API for developers to integrate CoC data into their apps
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
                  <Swords className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Staff Management</h3>
                <p className="text-muted-foreground">
                  Secure staff portal for managing clan associations and partnerships
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/30 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Start exploring Clash of Clans data today with our powerful lookup tools
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/clan-lookup">
                  <Button size="lg" variant="hero" className="gap-2">
                    <Shield className="h-5 w-5" />
                    Search Clans Now
                  </Button>
                </Link>
                <Link to="/gallery">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Image className="h-5 w-5" />
                    Browse Gallery
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
