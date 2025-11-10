import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Shield, Users, Trophy, Star, ExternalLink, Crown, Swords, Award, BarChart3, Target } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

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
      // Clean the tag: remove #, parentheses, URL encoding, and whitespace
      let cleanTag = clanTag.trim();
      cleanTag = decodeURIComponent(cleanTag); // Decode any URL encoding
      cleanTag = cleanTag.replace(/[#()%]/g, ''); // Remove #, (, ), %
      cleanTag = cleanTag.trim();
      
      const response = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/clan/${cleanTag}`
      );
      const data = await response.json();
      
      if (response.ok) {
        console.log('API Response:', data);
        // Show clan data immediately
        setClanData(data.clan);
        setAssociation(data.association);
        setLoading(false);
        
        // Load war data in background
        console.log('Current War:', data.currentWar);
        console.log('War Log:', data.warLog);
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
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {clanData.badgeUrls?.medium && (
                        <img 
                          src={clanData.badgeUrls.medium} 
                          alt={`${clanData.name} badge`}
                          className="h-16 w-16 rounded-lg"
                        />
                      )}
                      <div>
                        <CardTitle className="flex items-center gap-3 mb-2">
                          {clanData.name}
                          <span className="text-sm text-muted-foreground font-normal">
                            {clanData.tag}
                          </span>
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `clashofclans://action=OpenClanProfile&tag=${clanData.tag.replace('#', '')}`}
                          className="gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open in Game
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                      <Swords className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">War Streak</p>
                        <p className="text-xl font-bold">{clanData.warWinStreak || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Clan Status</p>
                      <p className="font-semibold capitalize">{clanData.type || 'Unknown'}</p>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">War League</p>
                      <p className="font-semibold">{clanData.warLeague?.name || 'Unranked'}</p>
                    </div>

                    {clanData.memberList?.find((m: any) => m.role === 'leader') && (
                      <div className="p-4 bg-background/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Clan Leader
                        </p>
                        <p className="font-semibold">
                          {clanData.memberList.find((m: any) => m.role === 'leader').name}
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        War Stats
                      </p>
                      <p className="font-semibold">
                        {clanData.warWins || 0} Wins • {clanData.isWarLogPublic ? 'Public' : 'Private'} Log
                      </p>
                    </div>
                  </div>

                  {clanData.description && (
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{clanData.description}</p>
                    </div>
                  )}

                  {clanData.memberList && clanData.memberList.length > 0 && (
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h3 className="font-semibold mb-4">Clan Members</h3>
                      <div className="max-h-96 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>TH Level</TableHead>
                              <TableHead className="text-right">Trophies</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clanData.memberList.map((member: any) => (
                              <TableRow key={member.tag}>
                                <TableCell className="font-medium">{member.name}</TableCell>
                                <TableCell className="capitalize">{member.role}</TableCell>
                                <TableCell>TH {member.townHallLevel}</TableCell>
                                <TableCell className="text-right">{member.trophies?.toLocaleString() || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {clanData.memberList && clanData.memberList.length > 0 && (
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-secondary" />
                      Clan Composition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const thDistribution: Record<number, number> = {};
                      clanData.memberList.forEach((member: any) => {
                        const th = member.townHallLevel;
                        thDistribution[th] = (thDistribution[th] || 0) + 1;
                      });
                      
                      const sortedTHs = Object.keys(thDistribution)
                        .map(Number)
                        .sort((a, b) => b - a);
                      
                      const estimatedWeight = clanData.memberList.reduce((sum: number, m: any) => {
                        return sum + (m.townHallLevel * 163000);
                      }, 0);
                      
                      return (
                        <div className="bg-muted/30 rounded-lg p-6 border-2 border-border font-mono text-sm">
                          <div className="space-y-2">
                            <div className="text-center text-lg font-bold mb-3">
                              🏰 Clan Composition 🏰
                            </div>
                            <div className="text-center font-semibold mb-4">
                              {clanData.name} (#{clanData.tag.replace('#', '')})
                            </div>
                            <div className="space-y-1 mb-4">
                              {sortedTHs.map(th => {
                                const count = thDistribution[th];
                                return (
                                  <div key={th}>
                                    🏠 TH {th}: {count}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="border-t border-border my-4" />
                            <div className="space-y-1">
                              <div>Total Members: {clanData.memberList.length}</div>
                              <div>
                                ⚖️ Est. Weight: {estimatedWeight.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {currentWar && currentWar.state !== 'notInWar' && (
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords className="h-5 w-5 text-secondary" />
                      Current War
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-background/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">War State</p>
                        <p className="font-bold capitalize">{currentWar.state}</p>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Team Size</p>
                        <p className="font-bold">{currentWar.teamSize}v{currentWar.teamSize}</p>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Stars</p>
                        <p className="font-bold">
                          {currentWar.clan?.stars || 0} vs {currentWar.opponent?.stars || 0}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-background/50 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
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
                            <span className="font-semibold">{currentWar.clan?.attacks || 0}/{(currentWar.teamSize || 0) * 2}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-background/50 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-destructive" />
                          {currentWar.opponent?.name || 'Opponent'}
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
                            <span className="font-semibold">{currentWar.opponent?.attacks || 0}/{(currentWar.teamSize || 0) * 2}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {currentWar.clan?.members && (
                      <div className="p-4 bg-background/50 rounded-lg">
                        <h4 className="font-semibold mb-4">War Roster Performance</h4>
                        <div className="max-h-80 overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Map Position</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>TH</TableHead>
                                <TableHead className="text-center">Attacks</TableHead>
                                <TableHead className="text-right">Stars</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentWar.clan.members
                                .sort((a: any, b: any) => a.mapPosition - b.mapPosition)
                                .map((member: any) => (
                                <TableRow key={member.tag}>
                                  <TableCell className="font-medium">#{member.mapPosition}</TableCell>
                                  <TableCell>{member.name}</TableCell>
                                  <TableCell>TH{member.townhallLevel}</TableCell>
                                  <TableCell className="text-center">
                                    {member.attacks?.length || 0}/2
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {member.attacks?.reduce((sum: number, atk: any) => sum + (atk.stars || 0), 0) || 0}
                                    <Star className="h-3 w-3 inline ml-1 fill-yellow-500 text-yellow-500" />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {warLog && warLog.items && warLog.items.length > 0 && (
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-secondary" />
                      War Log History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Opponent</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Team Size</TableHead>
                            <TableHead className="text-right">Stars</TableHead>
                            <TableHead className="text-right">Destruction</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {warLog.items.map((war: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {war.opponent?.name || 'Unknown'}
                              </TableCell>
                              <TableCell>
                                <span className={`font-semibold ${
                                  war.result === 'win' ? 'text-green-500' : 
                                  war.result === 'lose' ? 'text-red-500' : 
                                  'text-yellow-500'
                                }`}>
                                  {war.result?.toUpperCase() || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>{war.teamSize}v{war.teamSize}</TableCell>
                              <TableCell className="text-right">
                                {war.clan?.stars || 0} - {war.opponent?.stars || 0}
                              </TableCell>
                              <TableCell className="text-right">
                                {war.clan?.destructionPercentage?.toFixed(1) || 0}%
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {war.endTime ? new Date(war.endTime).toLocaleDateString() : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
