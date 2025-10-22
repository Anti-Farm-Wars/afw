import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, Trophy, Star, Award, Swords } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PlayerLookup() {
  const [playerTag, setPlayerTag] = useState("");
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-6 w-6 text-primary" />
                    {playerData.name}
                    <span className="text-sm text-muted-foreground font-normal">
                      {playerData.tag}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                      <Trophy className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trophies</p>
                        <p className="text-xl font-bold">{playerData.trophies?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                      <Star className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Level</p>
                        <p className="text-xl font-bold">{playerData.expLevel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                      <Award className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Town Hall</p>
                        <p className="text-xl font-bold">{playerData.townHallLevel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                      <Swords className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">War Stars</p>
                        <p className="text-xl font-bold">{playerData.warStars}</p>
                      </div>
                    </div>
                  </div>

                  {playerData.clan && (
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h3 className="font-semibold mb-2">Clan</h3>
                      <p className="text-foreground">
                        {playerData.clan.name}
                        <span className="text-muted-foreground ml-2">{playerData.clan.tag}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Role: {playerData.role}
                      </p>
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
