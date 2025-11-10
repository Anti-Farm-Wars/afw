import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Trophy, Star, Target, Swords, Shield, Flame } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <div className="inline-block animate-bounce text-6xl mb-4">🏆</div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-fade-in">
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

          {cwlData && (
            <div className="space-y-6 animate-fade-in">
              {/* CWL Season Info Banner */}
              <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-500/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl opacity-10">🏆</div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <span className="animate-pulse text-3xl">🎖️</span>
                    <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-bold">
                      CWL Season {cwlData.season}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur rounded-xl border border-border/50 text-center hover-scale">
                      <div className="text-4xl mb-2 animate-pulse">⚔️</div>
                      <p className="text-sm text-muted-foreground mb-2 font-semibold">Status</p>
                      <p className="text-2xl font-bold capitalize bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {cwlData.state}
                      </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur rounded-xl border border-border/50 text-center hover-scale">
                      <div className="text-4xl mb-2 animate-bounce">🏰</div>
                      <p className="text-sm text-muted-foreground mb-2 font-semibold">Total Clans</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        {cwlData.clans?.length || 0}
                      </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur rounded-xl border border-border/50 text-center hover-scale">
                      <div className="text-4xl mb-2 animate-pulse">🎯</div>
                      <p className="text-sm text-muted-foreground mb-2 font-semibold">War Rounds</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
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
                    <CardTitle className="flex items-center gap-3 text-2xl">
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
                                } transition-all`}
                              >
                                <TableCell className="font-bold text-lg">
                                  {index === 0 ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-3xl animate-bounce">🥇</span>
                                    </div>
                                  ) : index === 1 ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-3xl animate-pulse">🥈</span>
                                    </div>
                                  ) : index === 2 ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-3xl">🥉</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">#{index + 1}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {clan.badgeUrls?.small && (
                                      <img 
                                        src={clan.badgeUrls.small} 
                                        alt="" 
                                        className="h-10 w-10 rounded-lg hover-scale"
                                      />
                                    )}
                                    <div>
                                      <p className="font-bold text-base">
                                        {clan.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        {clan.tag}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-lg">{clan.stars || 0}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                                    <span className="font-bold text-lg">
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

              {/* Win Probability Stats */}
              {cwlData.clans && cwlData.clans.length > 0 && (
                <Card className="bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 border-2 border-green-500/20 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 text-9xl opacity-5">📈</div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <span className="animate-pulse text-3xl">🎯</span>
                      <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent font-bold">
                        Win Probability Analysis
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cwlData.clans
                        .sort((a: any, b: any) => {
                          const aScore = (a.stars || 0) * 100 + (a.destructionPercentage || 0);
                          const bScore = (b.stars || 0) * 100 + (b.destructionPercentage || 0);
                          return bScore - aScore;
                        })
                        .map((clan: any, index: number) => {
                          const totalStars = cwlData.clans.reduce((sum: number, c: any) => sum + (c.stars || 0), 0);
                          const winProbability = totalStars > 0 
                            ? ((clan.stars || 0) / totalStars * 100).toFixed(1)
                            : 0;
                          
                          return (
                            <Card key={clan.tag} className={`bg-gradient-to-br ${
                              index === 0 
                                ? 'from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30' 
                                : 'from-background/80 to-background/40 border border-border/50'
                            }`}>
                              <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                  {clan.badgeUrls?.small && (
                                    <img 
                                      src={clan.badgeUrls.small} 
                                      alt="" 
                                      className="h-12 w-12 rounded-lg"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-bold text-sm">{clan.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{clan.tag}</p>
                                  </div>
                                  {index === 0 && <span className="text-2xl">🏆</span>}
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Win Chance</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                      {winProbability}%
                                    </span>
                                  </div>
                                  
                                  <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${winProbability}%` }}
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 pt-2">
                                    <div className="text-center p-2 bg-background/50 rounded">
                                      <p className="text-xs text-muted-foreground">Stars</p>
                                      <p className="font-bold text-yellow-500">{clan.stars || 0}</p>
                                    </div>
                                    <div className="text-center p-2 bg-background/50 rounded">
                                      <p className="text-xs text-muted-foreground">Destruction</p>
                                      <p className="font-bold text-orange-500">{(clan.destructionPercentage || 0).toFixed(1)}%</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* War Details with History */}
              {cwlData.warDetails && cwlData.warDetails.length > 0 ? (
                <Card className="bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 border-2 border-blue-500/20 shadow-2xl overflow-hidden">
                  <div className="absolute bottom-0 right-0 text-9xl opacity-5">⚔️</div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <span className="animate-pulse text-3xl">⚔️</span>
                      <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent font-bold">
                        War Details & History
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <Tabs defaultValue="0" className="w-full">
                      <TabsList className="grid w-full grid-cols-7 mb-4">
                        {cwlData.rounds.map((_: any, roundIndex: number) => (
                          <TabsTrigger key={roundIndex} value={roundIndex.toString()}>
                            Round {roundIndex + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {cwlData.rounds.map((round: any, roundIndex: number) => (
                        <TabsContent key={roundIndex} value={roundIndex.toString()}>
                          <div className="grid grid-cols-1 gap-4">
                            {cwlData.warDetails
                              .filter((war: any) => round.warTags?.includes(war.tag))
                              .map((war: any, warIndex: number) => (
                                <Card key={warIndex} className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur border-border/50">
                                  <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-500" />
                                        <span className="text-lg">{war.clan.name}</span>
                                        <span className="text-sm text-muted-foreground font-mono">{war.clan.tag}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-bold ${
                                          war.clan.stars > war.opponent.stars 
                                            ? 'text-green-500' 
                                            : war.clan.stars < war.opponent.stars 
                                            ? 'text-red-500' 
                                            : 'text-yellow-500'
                                        }`}>
                                          {war.clan.stars > war.opponent.stars 
                                            ? '🏆 Victory' 
                                            : war.clan.stars < war.opponent.stars 
                                            ? '💀 Defeat' 
                                            : '🤝 Draw'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground font-mono">{war.opponent.tag}</span>
                                        <span className="text-lg">{war.opponent.name}</span>
                                        <Shield className="h-5 w-5 text-red-500" />
                                      </div>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {/* War Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                      <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                          <p className="text-sm text-muted-foreground font-semibold">Stars</p>
                                        </div>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                          {war.clan.stars} - {war.opponent.stars}
                                        </p>
                                      </div>
                                      <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                          <Flame className="h-5 w-5 text-orange-500" />
                                          <p className="text-sm text-muted-foreground font-semibold">Destruction</p>
                                        </div>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                          {war.clan.destructionPercentage.toFixed(1)}% - {war.opponent.destructionPercentage.toFixed(1)}%
                                        </p>
                                      </div>
                                      <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                          <Target className="h-5 w-5 text-purple-500" />
                                          <p className="text-sm text-muted-foreground font-semibold">Attacks</p>
                                        </div>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                          {war.clan.attacks} - {war.opponent.attacks}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Attack History */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Clan Attacks */}
                                      <div>
                                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                          <Swords className="h-4 w-4 text-blue-500" />
                                          {war.clan.name} Attacks
                                        </h4>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                          {war.clan.members?.map((member: any) => 
                                            member.attacks?.map((attack: any, idx: number) => (
                                              <div key={`${member.tag}-${idx}`} className="p-2 bg-muted/30 rounded border border-border/30 text-xs">
                                                <div className="flex items-center justify-between">
                                                  <span className="font-semibold">{member.name}</span>
                                                  <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1">
                                                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                      {attack.stars}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                      {attack.destructionPercentage}%
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>

                                      {/* Opponent Attacks */}
                                      <div>
                                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                          <Swords className="h-4 w-4 text-red-500" />
                                          {war.opponent.name} Attacks
                                        </h4>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                          {war.opponent.members?.map((member: any) => 
                                            member.attacks?.map((attack: any, idx: number) => (
                                              <div key={`${member.tag}-${idx}`} className="p-2 bg-muted/30 rounded border border-border/30 text-xs">
                                                <div className="flex items-center justify-between">
                                                  <span className="font-semibold">{member.name}</span>
                                                  <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1">
                                                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                      {attack.stars}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                      {attack.destructionPercentage}%
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              ) : cwlData && (
                <Card className="bg-muted/50 border-border/50">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      ⚠️ War details are not yet available. Check back when wars are in progress or completed.
                    </p>
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
