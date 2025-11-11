import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Shield, Users, Trophy, Star, ExternalLink, Crown, Swords, Award, BarChart3, Target, Home, Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { mapCoCRole, getRoleEmoji } from "@/utils/cocRoleMapping";

// War weight data based on TH level
const TH_WAR_WEIGHTS: Record<number, number> = {
  17: 168000,
  16: 158000,
  15: 148000,
  14: 138000,
  13: 128000,
  12: 118000,
  11: 108000,
  10: 98000,
  9: 88000,
  8: 78000,
  7: 68000,
  6: 58000,
  5: 48000,
};

export default function ClanLookup() {
  const [clanTag, setClanTag] = useState("");
  const [clanData, setClanData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [association, setAssociation] = useState<any>(null);
  const [currentWar, setCurrentWar] = useState<any>(null);
  const [warLog, setWarLog] = useState<any>(null);
  const [showJson, setShowJson] = useState(false);
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
    setClanData(null);
    setAssociation(null);
    setCurrentWar(null);
    setWarLog(null);
    
    try {
      let cleanTag = clanTag.trim();
      cleanTag = decodeURIComponent(cleanTag);
      cleanTag = cleanTag.replace(/[#()%]/g, '');
      cleanTag = cleanTag.trim();
      
      const response = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/clan/${cleanTag}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setClanData(data.clan);
        setAssociation(data.association);
        setLoading(false);
        setCurrentWar(data.currentWar);
        setWarLog(data.warLog);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch clan data",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to API",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block animate-bounce text-6xl mb-4">🏰</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-fade-in">
              Clan Lookup
            </h1>
            <p className="text-muted-foreground text-lg">
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
            <div className="space-y-6 animate-fade-in">
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
                      {JSON.stringify({ clan: clanData, association }, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {association && (
                <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-2 border-amber-500/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        Association: {association.association_type}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  {association.description && (
                    <CardContent>
                      <p className="text-foreground">{association.description}</p>
                    </CardContent>
                  )}
                </Card>
              )}

              <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-500/20 shadow-2xl overflow-hidden">
                <CardHeader>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {clanData.badgeUrls?.medium && (
                        <img 
                          src={clanData.badgeUrls.medium} 
                          alt={`${clanData.name} badge`}
                          className="h-16 w-16 rounded-lg hover-scale"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                          <span className="text-xl md:text-2xl">{clanData.name}</span>
                          <span className="text-sm text-muted-foreground font-mono">
                            {clanData.tag}
                          </span>
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `clashofclans://action=OpenClanProfile&tag=${clanData.tag.replace('#', '')}`}
                            className="gap-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open in Game
                          </Button>
                          <Link to="/clan-cwl">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Trophy className="h-3 w-3" />
                              View CWL
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50 hover-scale">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="text-xl font-bold">{clanData.members}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50 hover-scale">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trophies</p>
                        <p className="text-xl font-bold">{clanData.clanPoints?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50 hover-scale">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Level</p>
                        <p className="text-xl font-bold">{clanData.clanLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50 hover-scale">
                      <Swords className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">War Streak</p>
                        <p className="text-xl font-bold">{clanData.warWinStreak || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">Clan Status</p>
                      <p className="font-semibold capitalize">{clanData.type || 'Unknown'}</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">War League</p>
                      <p className="font-semibold">{clanData.warLeague?.name || 'Unranked'}</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">War Frequency</p>
                      <p className="font-semibold capitalize">{clanData.warFrequency || 'Unknown'}</p>
                    </div>

                    {clanData.memberList?.find((m: any) => m.role === 'leader') && (
                      <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <Crown className="h-4 w-4 text-amber-500" />
                          Clan Leader
                        </p>
                        <p className="font-semibold">
                          {clanData.memberList.find((m: any) => m.role === 'leader').name}
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-500" />
                        War Stats
                      </p>
                      <p className="font-semibold">
                        {clanData.warWins || 0} Wins • {clanData.isWarLogPublic ? 'Public' : 'Private'} Log
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">Required Trophies</p>
                      <p className="font-semibold">{clanData.requiredTrophies?.toLocaleString() || 0}</p>
                    </div>
                  </div>

                  {clanData.description && (
                    <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Description
                      </h3>
                      <p className="text-muted-foreground">{clanData.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* War Weight & Composition */}
              {clanData.memberList && clanData.memberList.length > 0 && (
                <Card className="bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 border-2 border-green-500/20 shadow-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                        Clan Composition & War Weight
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const thDistribution: Record<number, number> = {};
                      let totalWarWeight = 0;
                      
                      clanData.memberList.forEach((member: any) => {
                        const th = member.townHallLevel;
                        thDistribution[th] = (thDistribution[th] || 0) + 1;
                        totalWarWeight += TH_WAR_WEIGHTS[th] || 0;
                      });
                      
                      const sortedTHs = Object.keys(thDistribution)
                        .map(Number)
                        .sort((a, b) => b - a);
                      
                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* TH Distribution */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg mb-4">Town Hall Distribution</h3>
                            {sortedTHs.map(th => {
                              const count = thDistribution[th];
                              const percentage = (count / clanData.memberList.length) * 100;
                              return (
                                <div key={th} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                      <Home className="h-4 w-4" />
                                      TH {th}
                                    </span>
                                    <span className="font-bold">{count} ({percentage.toFixed(0)}%)</span>
                                  </div>
                                  <div className="w-full bg-muted/30 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* War Weight Info */}
                          <div className="p-6 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border-2 border-border/50">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                              <Target className="h-5 w-5 text-red-500" />
                              Estimated War Weight
                            </h3>
                            <div className="space-y-4">
                              <div className="text-center p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
                                <p className="text-sm text-muted-foreground mb-2">Total War Weight</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                  {totalWarWeight.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                                <p className="text-sm text-muted-foreground mb-2">Average Weight per Member</p>
                                <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                  {Math.round(totalWarWeight / clanData.memberList.length).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-xs text-muted-foreground text-center mt-4 p-3 bg-muted/30 rounded">
                                <p>⚠️ This is an estimated war weight based on Town Hall levels.</p>
                                <p className="mt-1">Actual war weight depends on defense and troop upgrades.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Members Table */}
              {clanData.memberList && clanData.memberList.length > 0 && (
                <Card className="bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 border-2 border-purple-500/20 shadow-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Clan Members ({clanData.memberList.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-bold">Rank</TableHead>
                            <TableHead className="font-bold">Name</TableHead>
                            <TableHead className="font-bold">Role</TableHead>
                            <TableHead className="font-bold">TH</TableHead>
                            <TableHead className="text-right font-bold">Trophies</TableHead>
                            <TableHead className="text-right font-bold">Donations</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clanData.memberList.map((member: any, index: number) => (
                            <TableRow key={member.tag} className="border-border/30 hover:bg-muted/50">
                              <TableCell className="font-medium">#{index + 1}</TableCell>
                              <TableCell>
                                <Link 
                                  to="/player-lookup"
                                  className="font-medium hover:underline"
                                  onClick={() => {
                                    // Store the player tag for lookup
                                    localStorage.setItem('playerLookupTag', member.tag);
                                  }}
                                >
                                  {member.name}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{getRoleEmoji(member.role)}</span>
                                  <span>{mapCoCRole(member.role)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Home className="h-3 w-3" />
                                  {member.townHallLevel}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {member.trophies?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-green-600 dark:text-green-400">
                                  {member.donations || 0}
                                </span>
                                {" / "}
                                <span className="text-muted-foreground">
                                  {member.donationsReceived || 0}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current War */}
              {currentWar && currentWar.state !== 'notInWar' && (
                <Card className="bg-gradient-to-br from-red-500/5 via-orange-500/5 to-amber-500/5 border-2 border-red-500/20 shadow-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords className="h-5 w-5" />
                      <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        Current War
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg text-center border border-border/50">
                        <p className="text-sm text-muted-foreground mb-1">War State</p>
                        <p className="font-bold capitalize">{currentWar.state}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg text-center border border-border/50">
                        <p className="text-sm text-muted-foreground mb-1">Team Size</p>
                        <p className="font-bold">{currentWar.teamSize}v{currentWar.teamSize}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg text-center border border-border/50">
                        <p className="text-sm text-muted-foreground mb-1">Stars</p>
                        <p className="font-bold">
                          {currentWar.clan?.stars || 0} vs {currentWar.opponent?.stars || 0}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {currentWar.clan?.name}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Stars</span>
                            <span className="font-semibold flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {currentWar.clan?.stars || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Destruction</span>
                            <span className="font-semibold">{currentWar.clan?.destructionPercentage?.toFixed(2) || 0}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Attacks</span>
                            <span className="font-semibold">{currentWar.clan?.attacks || 0} / {currentWar.teamSize * 2}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Swords className="h-4 w-4" />
                          {currentWar.opponent?.name}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Stars</span>
                            <span className="font-semibold flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {currentWar.opponent?.stars || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Destruction</span>
                            <span className="font-semibold">{currentWar.opponent?.destructionPercentage?.toFixed(2) || 0}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Attacks</span>
                            <span className="font-semibold">{currentWar.opponent?.attacks || 0} / {currentWar.teamSize * 2}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
