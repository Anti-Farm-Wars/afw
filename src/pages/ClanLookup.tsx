import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Shield, Users, Trophy, Star, ExternalLink, Crown, Swords, Award } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function ClanLookup() {
  const [clanTag, setClanTag] = useState("");
  const [clanData, setClanData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [association, setAssociation] = useState<any>(null);
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
