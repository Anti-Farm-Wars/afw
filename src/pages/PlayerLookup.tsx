import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, Trophy, Star, Award, Swords, Target, Shield, Zap, Crown, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function PlayerLookup() {
  const [playerTag, setPlayerTag] = useState("");
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const { toast } = useToast();

  const searchPlayer = async () => {
    if (!playerTag.trim()) {
      toast({
        title: "Error",
        description: "Please enter a player tag",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const cleanTag = playerTag.replace(/^#/, '');
      const response = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/player/${encodeURIComponent(cleanTag)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setPlayerData(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch player data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Player Lookup
            </h1>
            <p className="text-muted-foreground">
              Search for any Clash of Clans player by tag
            </p>
          </div>

          <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter player tag (e.g., #YO28VGY88)"
                  value={playerTag}
                  onChange={(e) => setPlayerTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPlayer()}
                  className="flex-1 bg-background/50"
                />
                <Button onClick={searchPlayer} disabled={loading} variant="hero">
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {playerData && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowJson(!showJson)}
                >
                  {showJson ? "Hide" : "Show"} JSON
                </Button>
              </div>

              {showJson && (
                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(playerData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Player Profile Card */}
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 flex-wrap">
                    <User className="h-6 w-6 text-primary animate-pulse" />
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {playerData.name}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {playerData.tag}
                    </span>
                    {playerData.builderHallLevel && (
                      <Badge variant="secondary" className="gap-1">
                        <Award className="h-3 w-3" />
                        BH {playerData.builderHallLevel}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
                      <Trophy className="h-5 w-5 text-yellow-500 animate-pulse" />
                      <div>
                        <p className="text-xs text-muted-foreground">Trophies</p>
                        <p className="text-xl font-bold">{playerData.trophies?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Best: {playerData.bestTrophies?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                      <Star className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Level</p>
                        <p className="text-xl font-bold">{playerData.expLevel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                      <Award className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Town Hall</p>
                        <p className="text-xl font-bold">{playerData.townHallLevel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
                      <Swords className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">War Stars</p>
                        <p className="text-xl font-bold">{playerData.warStars?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                      <Target className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Attack Wins</p>
                        <p className="text-lg font-bold">{playerData.attackWins?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Defense Wins</p>
                        <p className="text-lg font-bold">{playerData.defenseWins?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Donations</p>
                        <p className="text-lg font-bold">{playerData.donations?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Received</p>
                        <p className="text-lg font-bold">{playerData.donationsReceived?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Clan Info */}
                  {playerData.clan && (
                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Clan</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        {playerData.clan.badgeUrls?.small && (
                          <img 
                            src={playerData.clan.badgeUrls.small} 
                            alt="" 
                            className="h-12 w-12 rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-foreground">
                            {playerData.clan.name}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {playerData.clan.tag}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {playerData.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Level {playerData.clan.clanLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* League Info */}
                  {playerData.league && (
                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold text-lg">League</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {playerData.league.iconUrls?.small && (
                          <img 
                            src={playerData.league.iconUrls.small} 
                            alt="" 
                            className="h-12 w-12"
                          />
                        )}
                        <p className="font-bold">{playerData.league.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Heroes */}
                  {playerData.heroes && playerData.heroes.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-purple-500" />
                        Heroes
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {playerData.heroes.map((hero: any) => (
                          <div key={hero.name} className="p-3 bg-background/50 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground mb-1">{hero.name}</p>
                            <p className="text-lg font-bold">Lv {hero.level}</p>
                            <p className="text-xs text-muted-foreground">Max: {hero.maxLevel}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
