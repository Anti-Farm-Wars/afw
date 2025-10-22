import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Shield, Users, Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClanLookup() {
  const [clanTag, setClanTag] = useState("");
  const [clanData, setClanData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [association, setAssociation] = useState<any>(null);
  const { toast } = useToast();

  const searchClan = async () => {
    if (!clanTag.trim()) {
      toast({
        title: "Error",
        description: "Please enter a clan tag",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const cleanTag = clanTag.replace(/^#/, '');
      const response = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/clan/${encodeURIComponent(cleanTag)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setClanData(data.clan);
        setAssociation(data.association);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch clan data",
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
              Clan Lookup
            </h1>
            <p className="text-muted-foreground">
              Search for any Clash of Clans clan by tag
            </p>
          </div>

          <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter clan tag (e.g., #2PP)"
                  value={clanTag}
                  onChange={(e) => setClanTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchClan()}
                  className="flex-1 bg-background/50"
                />
                <Button onClick={searchClan} disabled={loading} variant="hero">
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {clanData && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {association && (
                <Card className="bg-primary/10 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Association: {association.association_type}
                    </CardTitle>
                  </CardHeader>
                  {association.description && (
                    <CardContent>
                      <p className="text-foreground">{association.description}</p>
                    </CardContent>
                  )}
                </Card>
              )}

              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    {clanData.name}
                    <span className="text-sm text-muted-foreground font-normal">
                      {clanData.tag}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                      <Users className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="text-xl font-bold">{clanData.members}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                      <Trophy className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trophies</p>
                        <p className="text-xl font-bold">{clanData.clanPoints?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                      <Shield className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Level</p>
                        <p className="text-xl font-bold">{clanData.clanLevel}</p>
                      </div>
                    </div>
                  </div>

                  {clanData.description && (
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{clanData.description}</p>
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
