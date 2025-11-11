import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Trophy, Star, Target, Swords, Shield, Flame, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

export default function ClanCWL() {
  const [clanTag, setClanTag] = useState("");
  const [cwlData, setCwlData] = useState<any>(null);
  const [clanBasicData, setClanBasicData] = useState<any>(null);
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
    setClanBasicData(null);
    
    try {
      const cleanTag = clanTag.replace(/^#/, '');
      
      // Fetch basic clan data first
      const clanResponse = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/clan/${encodeURIComponent(cleanTag)}`
      );
      const clanData = await clanResponse.json();
      if (clanResponse.ok) {
        setClanBasicData(clanData.clan);
      }
      
      // Then fetch CWL data
      const cwlResponse = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/clan/${encodeURIComponent(cleanTag)}/cwl`
      );
      const data = await cwlResponse.json();
      
      if (cwlResponse.ok) {
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

  // Helper to find searched clan and opponent in a war
  const getWarParticipants = (war: any, searchedClanTag: string) => {
    const normalizedSearchTag = searchedClanTag.replace(/^#/, '').toUpperCase();
    const clanTag = war.clan?.tag?.replace(/^#/, '').toUpperCase();
    const opponentTag = war.opponent?.tag?.replace(/^#/, '').toUpperCase();
    
    if (clanTag === normalizedSearchTag) {
      return { searchedClan: war.clan, opponent: war.opponent };
    } else if (opponentTag === normalizedSearchTag) {
      return { searchedClan: war.opponent, opponent: war.clan };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block animate-bounce text-6xl mb-4">🏆</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-fade-in">
              Clan War League Lookup
            </h1>
            <p className="text-muted-foreground text-lg">
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

          {/* Basic Clan Info */}
          {clanBasicData && (
            <Card className="mb-8 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-500/20 shadow-2xl overflow-hidden animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 flex-wrap">
                  {clanBasicData.badgeUrls?.medium && (
                    <img 
                      src={clanBasicData.badgeUrls.medium} 
                      alt="" 
                      className="h-12 w-12 rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl md:text-2xl font-bold">{clanBasicData.name}</span>
                      <span className="text-sm text-muted-foreground font-mono">{clanBasicData.tag}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Level {clanBasicData.clanLevel} • {clanBasicData.members} Members • {clanBasicData.warLeague?.name || 'Unranked'}
                    </p>
                  </div>
                  <Link to="/clan-lookup">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-3 w-3" />
                      View Full Details
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          {cwlData && (
            <div className="space-y-6 animate-fade-in">
              {/* CWL Season Info Banner */}
              <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-500/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl opacity-10">🏆</div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                    <span className="animate-pulse text-3xl">🎖️</span>
                    <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-bold">
                      CWL Season {cwlData.season}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="p-4 md:p-6 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur rounded-xl border border-border/50 text-center hover-scale">
                      <div className="text-4xl mb-2 animate-pulse">⚔️</div>
                      <p className="text-sm text-muted-foreground mb-2 font-semibold">Status</p>
                      <p className="text-xl md:text-2xl font-bold capitalize bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {cwlData.state}
                      </p>
                    </div>
                    <div className="p-4 md:p-6 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur rounded-xl border border-border/50 text-center hover-scale">
                      <div className="text-4xl mb-2 animate-bounce">🏰</div>
                      <p className="text-sm text-muted-foreground mb-2 font-semibold">Total Clans</p>
                      <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        {cwlData.clans?.length || 0}
                      </p>
                    </div>
                    <div className="p-4 md:p-6 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur rounded-xl border border-border/50 text-center hover-scale">
                      <div className="text-4xl mb-2 animate-pulse">🎯</div>
                      <p className="text-sm text-muted-foreground mb-2 font-semibold">War Rounds</p>
                      <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                        {cwlData.rounds?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Group Standings */}
              {cwlData.clans && cwlData.clans.length > 0 && (
                <Card className="bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 border-2 border-purple-500/20 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 text-9xl opacity-5">📊</div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                      <span className="animate-pulse text-3xl">👑</span>
                      <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent font-bold">
                        Group Standings
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-bold">Rank</TableHead>
                            <TableHead className="font-bold">Clan</TableHead>
                            <TableHead className="text-right font-bold">⭐ Stars</TableHead>
                            <TableHead className="text-right font-bold">💥 Destruction</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cwlData.clans
                            .sort((a: any, b: any) => {
                              if (b.stars !== a.stars) return b.stars - a.stars;
                              return b.destructionPercentage - a.destructionPercentage;
                            })
                            .map((clan: any, index: number) => (
                              <TableRow 
                                key={clan.tag} 
                                className={`border-border/30 hover:bg-gradient-to-r ${
                                  index === 0 
                                    ? 'hover:from-amber-500/10 hover:to-yellow-500/10' 
                                    : index === 1
                                    ? 'hover:from-slate-400/10 hover:to-slate-500/10'
                                    : index === 2
                                    ? 'hover:from-orange-700/10 hover:to-orange-800/10'
                                    : 'hover:from-muted/30 hover:to-muted/10'
                                } transition-all cursor-pointer`}
                                onClick={() => {
                                  setClanTag(clan.tag);
                                  searchCWL();
                                }}
                              >
                                <TableCell className="font-bold text-base md:text-lg">
                                  {index === 0 ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl md:text-3xl animate-bounce">🥇</span>
                                    </div>
                                  ) : index === 1 ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl md:text-3xl animate-pulse">🥈</span>
                                    </div>
                                  ) : index === 2 ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl md:text-3xl">🥉</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">#{index + 1}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 md:gap-3">
                                    {clan.badgeUrls?.small && (
                                      <img 
                                        src={clan.badgeUrls.small} 
                                        alt="" 
                                        className="h-8 w-8 md:h-10 md:w-10 rounded-lg hover-scale"
                                      />
                                    )}
                                    <div>
                                      <p className="font-bold text-sm md:text-base">
                                        {clan.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        {clan.tag}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="inline-flex items-center gap-2 px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                                    <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-sm md:text-lg">{clan.stars || 0}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="inline-flex items-center gap-2 px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                                    <span className="font-bold text-sm md:text-lg">
                                      {clan.destructionPercentage?.toFixed(1) || 0}%
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* War Details with History - Only show searched clan vs opponent */}
              {cwlData.warDetails && cwlData.warDetails.length > 0 && clanBasicData && (
                <Card className="bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 border-2 border-blue-500/20 shadow-2xl overflow-hidden">
                  <div className="absolute bottom-0 right-0 text-9xl opacity-5">⚔️</div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                      <span className="animate-pulse text-3xl">⚔️</span>
                      <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent font-bold">
                        War Rounds
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <Tabs defaultValue="round-1" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-2 mb-6 h-auto">
                        {cwlData.rounds?.map((round: any, index: number) => (
                          <TabsTrigger key={index} value={`round-${index + 1}`} className="text-xs md:text-sm">
                            Round {index + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {cwlData.rounds?.map((round: any, roundIndex: number) => {
                        // Find the war involving the searched clan
                        const searchedClanWar = cwlData.warDetails.find((war: any) => {
                          const clanTag = war.clan?.tag?.replace(/^#/, '').toUpperCase();
                          const opponentTag = war.opponent?.tag?.replace(/^#/, '').toUpperCase();
                          const searchTag = clanBasicData.tag?.replace(/^#/, '').toUpperCase();
                          return clanTag === searchTag || opponentTag === searchTag;
                        });

                        const participants = searchedClanWar ? getWarParticipants(searchedClanWar, clanBasicData.tag) : null;

                        return (
                          <TabsContent key={roundIndex} value={`round-${roundIndex + 1}`} className="space-y-4">
                            {participants ? (
                              <Card className="bg-gradient-to-br from-background/80 to-background/40 border-border/50">
                                <CardContent className="pt-6">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                                    {/* Searched Clan */}
                                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border-2 border-green-500/30">
                                      <div className="flex items-center gap-3 mb-3">
                                        {participants.searchedClan?.badgeUrls?.small && (
                                          <img 
                                            src={participants.searchedClan.badgeUrls.small} 
                                            alt="" 
                                            className="h-10 w-10 md:h-12 md:w-12 rounded-lg"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <button
                                            onClick={() => {
                                              setClanTag(participants.searchedClan.tag);
                                              searchCWL();
                                            }}
                                            className="font-bold text-sm md:text-base hover:underline text-left"
                                          >
                                            {participants.searchedClan?.name}
                                          </button>
                                          <p className="text-xs text-muted-foreground font-mono">{participants.searchedClan?.tag}</p>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Stars</span>
                                          <span className="font-bold flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                            {participants.searchedClan?.stars || 0}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Destruction</span>
                                          <span className="font-bold">{participants.searchedClan?.destructionPercentage?.toFixed(2) || 0}%</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* VS */}
                                    <div className="flex items-center justify-center">
                                      <div className="text-3xl md:text-4xl font-bold text-muted-foreground">VS</div>
                                    </div>

                                    {/* Opponent */}
                                    <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border-2 border-red-500/30">
                                      <div className="flex items-center gap-3 mb-3">
                                        {participants.opponent?.badgeUrls?.small && (
                                          <img 
                                            src={participants.opponent.badgeUrls.small} 
                                            alt="" 
                                            className="h-10 w-10 md:h-12 md:w-12 rounded-lg"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <button
                                            onClick={() => {
                                              setClanTag(participants.opponent.tag);
                                              searchCWL();
                                            }}
                                            className="font-bold text-sm md:text-base hover:underline text-left"
                                          >
                                            {participants.opponent?.name}
                                          </button>
                                          <p className="text-xs text-muted-foreground font-mono">{participants.opponent?.tag}</p>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Stars</span>
                                          <span className="font-bold flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                            {participants.opponent?.stars || 0}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Destruction</span>
                                          <span className="font-bold">{participants.opponent?.destructionPercentage?.toFixed(2) || 0}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* War Result */}
                                  <div className="text-center p-4 bg-gradient-to-r from-background/80 to-background/40 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Result</p>
                                    <p className="text-xl md:text-2xl font-bold capitalize">
                                      {searchedClanWar.state === 'warEnded' 
                                        ? (participants.searchedClan.stars > participants.opponent.stars 
                                            ? '🎉 Victory!' 
                                            : participants.searchedClan.stars < participants.opponent.stars 
                                            ? '😢 Defeat' 
                                            : '🤝 Draw')
                                        : searchedClanWar.state}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ) : (
                              <p className="text-center text-muted-foreground py-8">No war data available for this round</p>
                            )}
                          </TabsContent>
                        );
                      })}
                    </Tabs>
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
