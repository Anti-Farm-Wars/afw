import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Trophy, Users, Star, Award, Crown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function ClanCWL() {
  const [clanTag, setClanTag] = useState("");
  const [cwlData, setCwlData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchCWL = async () => {
    if (!clanTag.trim()) {
      toast({
        title: "Error",
        description: "Please enter a clan tag",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCwlData(null);
    
    try {
      const cleanTag = clanTag.replace(/^#/, '');
      const response = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/clan/${encodeURIComponent(cleanTag)}/cwl`
      );
      const data = await response.json();
      
      if (response.ok) {
        console.log('CWL Data:', data);
        setCwlData(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch CWL data",
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Clan War League Lookup
            </h1>
            <p className="text-muted-foreground">
              View complete CWL information and standings
            </p>
          </div>

          <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter clan tag (e.g., #2PP)"
                  value={clanTag}
                  onChange={(e) => setClanTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchCWL()}
                  className="flex-1 bg-background/50"
                />
                <Button onClick={searchCWL} disabled={loading} variant="hero">
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {cwlData && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* CWL Season Info */}
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-secondary" />
                    CWL Season {cwlData.season}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-background/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">State</p>
                      <p className="text-xl font-bold capitalize">{cwlData.state}</p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Clans</p>
                      <p className="text-xl font-bold">{cwlData.clans?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Rounds</p>
                      <p className="text-xl font-bold">{cwlData.rounds?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Group Standings */}
              {cwlData.clans && cwlData.clans.length > 0 && (
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-secondary" />
                      Group Standings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Clan</TableHead>
                          <TableHead className="text-right">Stars</TableHead>
                          <TableHead className="text-right">Destruction %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cwlData.clans
                          .sort((a: any, b: any) => {
                            if (b.stars !== a.stars) return b.stars - a.stars;
                            return b.destructionPercentage - a.destructionPercentage;
                          })
                          .map((clan: any, index: number) => (
                            <TableRow key={clan.tag}>
                              <TableCell className="font-medium">
                                {index === 0 ? (
                                  <Crown className="h-5 w-5 text-yellow-500" />
                                ) : (
                                  index + 1
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {clan.badgeUrls?.small && (
                                    <img src={clan.badgeUrls.small} alt="" className="h-8 w-8" />
                                  )}
                                  <div>
                                    <p className="font-semibold">{clan.name}</p>
                                    <p className="text-xs text-muted-foreground">{clan.tag}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                <div className="flex items-center justify-end gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  {clan.stars || 0}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{clan.destructionPercentage?.toFixed(2) || 0}%</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* War Rounds */}
              {cwlData.rounds && cwlData.rounds.length > 0 && (
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-secondary" />
                      War Rounds
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cwlData.rounds.map((round: any, roundIndex: number) => (
                      <div key={roundIndex} className="p-4 bg-background/50 rounded-lg">
                        <h4 className="font-semibold mb-4">Round {roundIndex + 1}</h4>
                        <div className="space-y-2">
                          {round.warTags?.map((warTag: string, warIndex: number) => (
                            <div key={warIndex} className="p-3 bg-background/30 rounded-lg text-sm">
                              <p className="text-muted-foreground">War Tag: {warTag}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
