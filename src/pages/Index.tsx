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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <img 
              src={logo} 
              alt="AFW" 
              className="h-32 w-32 mx-auto mb-8 animate-pulse hover-scale"
              style={{ filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))' }}
            />
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
              AFW Clan Stats
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
              🏆 Comprehensive Clash of Clans clan and player lookup platform 🏆
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              <Link to="/clan-lookup">
                <Button size="lg" variant="hero" className="gap-2 text-lg px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Shield className="h-5 w-5" />
                  Search Clans
                </Button>
              </Link>
              <Link to="/player-lookup">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 border-purple-500/50 hover:bg-purple-500/10">
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
            <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 hover-scale">
              <CardContent className="pt-6">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg w-fit mb-4">
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Clan Lookup</h3>
                <p className="text-muted-foreground">
                  🏰 Search any clan by tag and view detailed statistics, war weight, members, and achievements
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border-2 border-purple-500/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 hover-scale">
              <CardContent className="pt-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg w-fit mb-4">
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Player Lookup</h3>
                <p className="text-muted-foreground">
                  👤 Track player progress, heroes, troops, pets, trophies, and achievements
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-red-500/10 border-2 border-pink-500/20 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all duration-300 hover-scale">
              <CardContent className="pt-6">
                <div className="p-3 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg w-fit mb-4">
                  <Image className="h-8 w-8 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Complete Gallery</h3>
                <p className="text-muted-foreground">
                  🖼️ Browse all heroes, troops, spells, pets, and siege machines with images
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-500/20 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 hover-scale">
              <CardContent className="pt-6">
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg w-fit mb-4">
                  <Star className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Clan Associations</h3>
                <p className="text-muted-foreground">
                  ⭐ Track official partnerships and sister clans with verified badges
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-green-500/20 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300 hover-scale">
              <CardContent className="pt-6">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg w-fit mb-4">
                  <Trophy className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">CWL Tracker</h3>
                <p className="text-muted-foreground">
                  🏆 View Clan War League standings, rounds, and detailed war statistics
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 via-orange-500/10 to-amber-500/10 border-2 border-red-500/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 hover-scale">
              <CardContent className="pt-6">
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg w-fit mb-4">
                  <Swords className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">War Analytics</h3>
                <p className="text-muted-foreground">
                  ⚔️ Detailed war statistics, matchup analysis, and performance tracking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.3)] overflow-hidden">
            <div className="absolute top-0 right-0 text-9xl opacity-5">🏆</div>
            <CardContent className="py-12 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Ready to Get Started? 🚀
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Start exploring Clash of Clans data today with our powerful lookup tools
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/clan-lookup">
                  <Button size="lg" variant="hero" className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Shield className="h-5 w-5" />
                    Search Clans Now
                  </Button>
                </Link>
                <Link to="/clan-cwl">
                  <Button size="lg" variant="outline" className="gap-2 border-purple-500/50 hover:bg-purple-500/10">
                    <Trophy className="h-5 w-5" />
                    View CWL
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
