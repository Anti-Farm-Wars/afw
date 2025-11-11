import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, Trophy, Star, Award, Swords, Target, Shield, Zap, Crown, Heart, Home, Flame, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getHeroIcon, getTroopIcon, getPetIcon, getSpellIcon } from "@/utils/cocImageMapping";

export default function PlayerLookup() {
  const [playerTag, setPlayerTag] = useState("");
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a stored player tag from clan lookup
    const storedTag = localStorage.getItem('playerLookupTag');
    if (storedTag) {
      setPlayerTag(storedTag);
      localStorage.removeItem('playerLookupTag');
      // Auto-search after a short delay
      setTimeout(() => {
        searchPlayer(storedTag);
      }, 100);
    }
  }, []);

  const searchPlayer = async (tagOverride?: string) => {
    const tagToSearch = tagOverride || playerTag;
    if (!tagToSearch.trim()) {
      toast({
        title: "Error",
        description: "Please enter a player tag",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Clean the tag: remove #, parentheses, URL encoding, and whitespace
      let cleanTag = tagToSearch.trim();
      cleanTag = decodeURIComponent(cleanTag);
      cleanTag = cleanTag.replace(/[#()%]/g, '');
      cleanTag = cleanTag.trim();
      
      const response = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/player/${cleanTag}`
      );
      const data = await response.json();
      
      if (response.ok) {
        console.log('Player Data:', data);
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block animate-bounce text-6xl mb-4">👤</div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-fade-in">
              Player Lookup
            </h1>
            <p className="text-muted-foreground text-lg">
              Search for any Clash of Clans player by tag and view complete stats
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
                <Button onClick={() => searchPlayer()} disabled={loading} variant="hero">
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {playerData && (
            <div className="space-y-6 animate-fade-in">
              {/* Player Header Card */}
              <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-500/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl opacity-10">👤</div>
                <CardHeader className="relative">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl animate-pulse">⚔️</div>
                    <div>
                      <CardTitle className="text-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
                        {playerData.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-mono mt-1">{playerData.tag}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-500/30 text-center hover-scale">
                      <div className="text-3xl mb-2 animate-bounce">🏆</div>
                      <p className="text-xs text-muted-foreground mb-1">Trophies</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                        {playerData.trophies?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Best: {playerData.bestTrophies?.toLocaleString()}</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 text-center hover-scale">
                      <div className="text-3xl mb-2">⭐</div>
                      <p className="text-xs text-muted-foreground mb-1">Experience Level</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        {playerData.expLevel}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 text-center hover-scale">
                      <div className="text-3xl mb-2 animate-pulse">🏰</div>
                      <p className="text-xs text-muted-foreground mb-1">Town Hall</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        TH {playerData.townHallLevel}
                      </p>
                      {playerData.townHallWeaponLevel && (
                        <p className="text-xs text-muted-foreground mt-1">Weapon: {playerData.townHallWeaponLevel}</p>
                      )}
                    </div>

                    <div className="p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30 text-center hover-scale">
                      <div className="text-3xl mb-2 animate-pulse">⚔️</div>
                      <p className="text-xs text-muted-foreground mb-1">War Stars</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        {playerData.warStars?.toLocaleString()}
                      </p>
                    </div>

                    {playerData.builderHallLevel && (
                      <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 text-center hover-scale">
                        <div className="text-3xl mb-2">🏗️</div>
                        <p className="text-xs text-muted-foreground mb-1">Builder Hall</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          BH {playerData.builderHallLevel}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Clan & League Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {playerData.clan && (
                  <Card className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-2 border-indigo-500/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl animate-pulse">🛡️</span>
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                          Clan Information
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        {playerData.clan.badgeUrls?.medium && (
                          <img 
                            src={playerData.clan.badgeUrls.medium} 
                            alt="" 
                            className="h-16 w-16 rounded-lg hover-scale"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-lg">{playerData.clan.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{playerData.clan.tag}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">
                              {playerData.role}
                            </Badge>
                            <Badge variant="outline">
                              Level {playerData.clan.clanLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {playerData.league && (
                  <Card className="bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5 border-2 border-amber-500/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl animate-bounce">👑</span>
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                          League
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        {playerData.league.iconUrls?.medium && (
                          <img 
                            src={playerData.league.iconUrls.medium} 
                            alt="" 
                            className="h-16 w-16 hover-scale"
                          />
                        )}
                        <div>
                          <p className="font-bold text-lg">{playerData.league.name}</p>
                          {playerData.leagueTier && (
                            <div className="mt-2">
                              {playerData.leagueTier.iconUrls?.small && (
                                <img 
                                  src={playerData.leagueTier.iconUrls.small} 
                                  alt="" 
                                  className="h-8 w-8 inline-block mr-2"
                                />
                              )}
                              <span className="text-sm text-muted-foreground">{playerData.leagueTier.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Stats Grid */}
              <Card className="bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 border-2 border-green-500/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl animate-pulse">📊</span>
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      Battle Stats
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 text-center">
                      <div className="text-3xl mb-2">⚔️</div>
                      <p className="text-xs text-muted-foreground mb-1">Attack Wins</p>
                      <p className="text-xl font-bold">{playerData.attackWins?.toLocaleString() || 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 text-center">
                      <div className="text-3xl mb-2">🛡️</div>
                      <p className="text-xs text-muted-foreground mb-1">Defense Wins</p>
                      <p className="text-xl font-bold">{playerData.defenseWins?.toLocaleString() || 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20 text-center">
                      <div className="text-3xl mb-2">💝</div>
                      <p className="text-xs text-muted-foreground mb-1">Donations</p>
                      <p className="text-xl font-bold">{playerData.donations?.toLocaleString() || 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-lg border border-pink-500/20 text-center">
                      <div className="text-3xl mb-2">🎁</div>
                      <p className="text-xs text-muted-foreground mb-1">Received</p>
                      <p className="text-xl font-bold">{playerData.donationsReceived?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabbed Content */}
              <Tabs defaultValue="heroes" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="heroes">👑 Heroes</TabsTrigger>
                  <TabsTrigger value="troops">⚔️ Troops</TabsTrigger>
                  <TabsTrigger value="spells">✨ Spells</TabsTrigger>
                  <TabsTrigger value="pets">🐾 Pets</TabsTrigger>
                  <TabsTrigger value="achievements">🏅 Achievements</TabsTrigger>
                </TabsList>

                {/* Heroes Tab */}
                <TabsContent value="heroes">
                  <Card className="bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 border-2 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl animate-pulse">👑</span>
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                          Heroes & Equipment
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {playerData.heroes && playerData.heroes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {playerData.heroes.map((hero: any) => (
                            <Card key={hero.name} className="bg-gradient-to-br from-background/80 to-background/40 border-border/50 hover-scale">
                              <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="text-3xl">
                                    {getHeroIcon(hero.name)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-sm">{hero.name}</p>
                                    <p className="text-xs text-muted-foreground">{hero.village}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Level</span>
                                    <span className="font-bold">{hero.level} / {hero.maxLevel}</span>
                                  </div>
                                  <Progress value={(hero.level / hero.maxLevel) * 100} className="h-2" />
                                </div>
                                {hero.equipment && hero.equipment.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-border/30">
                                    <p className="text-xs text-muted-foreground mb-2">Equipment:</p>
                                    <div className="space-y-2">
                                      {hero.equipment.map((equip: any) => (
                                        <div key={equip.name} className="flex items-center justify-between text-xs bg-background/50 p-2 rounded">
                                          <span className="flex items-center gap-2">
                                            <span>⚙️</span>
                                            <span>{equip.name}</span>
                                          </span>
                                          <Badge variant="outline" className="text-xs">Lv {equip.level}</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No heroes data available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Troops Tab */}
                <TabsContent value="troops">
                  <Card className="bg-gradient-to-br from-red-500/5 via-orange-500/5 to-amber-500/5 border-2 border-red-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl animate-pulse">⚔️</span>
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                          Troops
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {playerData.troops && playerData.troops.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {playerData.troops
                            .filter((troop: any) => {
                              const isPet = troop.name.toLowerCase().includes('pet') || 
                                           troop.name.toLowerCase().includes('unicorn') ||
                                           troop.name.toLowerCase().includes('yak') ||
                                           troop.name.toLowerCase().includes('phoenix') ||
                                           troop.name.toLowerCase().includes('owl') ||
                                           troop.name.toLowerCase().includes('diggy') ||
                                           troop.name.toLowerCase().includes('frosty') ||
                                           troop.name.toLowerCase().includes('electro owl') ||
                                           troop.name.toLowerCase().includes('mighty yak') ||
                                           troop.name.toLowerCase().includes('l.a.s.s.i');
                              return !isPet && troop.village !== 'builderBase';
                            })
                            .map((troop: any) => (
                            <Card key={troop.name} className="bg-gradient-to-br from-background/80 to-background/40 border-border/50 hover-scale">
                              <CardContent className="pt-4 text-center">
                                <div className="text-2xl mb-2">{getTroopIcon(troop.name)}</div>
                                <p className="text-xs font-semibold mb-2 truncate">{troop.name}</p>
                                <p className="text-sm text-muted-foreground mb-1">{troop.village}</p>
                                <div className="flex items-center justify-center gap-2">
                                  <Badge variant="outline">Lv {troop.level}</Badge>
                                  <span className="text-xs text-muted-foreground">/{troop.maxLevel}</span>
                                </div>
                                <Progress value={(troop.level / troop.maxLevel) * 100} className="h-1 mt-2" />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No troops data available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Spells Tab */}
                <TabsContent value="spells">
                  <Card className="bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 border-2 border-blue-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl animate-pulse">✨</span>
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                          Spells
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {playerData.spells && playerData.spells.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {playerData.spells.map((spell: any) => (
                            <Card key={spell.name} className="bg-gradient-to-br from-background/80 to-background/40 border-border/50 hover-scale">
                              <CardContent className="pt-4 text-center">
                                <div className="text-2xl mb-2">{getSpellIcon(spell.name)}</div>
                                <p className="text-xs font-semibold mb-2 truncate">{spell.name}</p>
                                <p className="text-sm text-muted-foreground mb-1">{spell.village}</p>
                                <div className="flex items-center justify-center gap-2">
                                  <Badge variant="outline">Lv {spell.level}</Badge>
                                  <span className="text-xs text-muted-foreground">/{spell.maxLevel}</span>
                                </div>
                                <Progress value={(spell.level / spell.maxLevel) * 100} className="h-1 mt-2" />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No spells data available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pets Tab */}
                <TabsContent value="pets">
                  <Card className="bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 border-2 border-green-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl animate-bounce">🐾</span>
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          Hero Pets
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const pets = playerData.pets || playerData.heroePets || (playerData.troops?.filter((t: any) => {
                          const isPet = t.name.toLowerCase().includes('pet') || 
                                       t.name.toLowerCase().includes('unicorn') ||
                                       t.name.toLowerCase().includes('yak') ||
                                       t.name.toLowerCase().includes('phoenix') ||
                                       t.name.toLowerCase().includes('owl') ||
                                       t.name.toLowerCase().includes('diggy') ||
                                       t.name.toLowerCase().includes('frosty') ||
                                       t.name.toLowerCase().includes('electro owl') ||
                                       t.name.toLowerCase().includes('mighty yak') ||
                                       t.name.toLowerCase().includes('l.a.s.s.i');
                          return isPet;
                        })) || [];
                        return pets.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pets.map((pet: any) => (
                              <Card key={pet.name} className="bg-gradient-to-br from-background/80 to-background/40 border-border/50 hover-scale">
                                <CardContent className="pt-6">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="text-3xl">{getPetIcon(pet.name)}</div>
                                    <div className="flex-1">
                                      <p className="font-bold text-sm">{pet.name}</p>
                                      <p className="text-xs text-muted-foreground">{pet.village}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Level</span>
                                      <span className="font-bold">{pet.level} / {pet.maxLevel}</span>
                                    </div>
                                    <Progress value={(pet.level / pet.maxLevel) * 100} className="h-2" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No pets data available</p>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements">
                  <Card className="bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5 border-2 border-amber-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl animate-bounce">🏅</span>
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                          Achievements
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {playerData.achievements && playerData.achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                          {playerData.achievements
                            .filter((achievement: any) => achievement.completionInfo)
                            .map((achievement: any) => (
                              <Card key={achievement.name} className="bg-gradient-to-br from-background/80 to-background/40 border-border/50">
                                <CardContent className="pt-4">
                                  <div className="flex items-start gap-3">
                                    <div className="text-2xl">
                                      {achievement.stars >= 3 ? '🌟' : achievement.stars >= 2 ? '⭐' : '✨'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm truncate">{achievement.name}</p>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{achievement.info}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={achievement.completionInfo === 'FINISHED' ? 'default' : 'outline'} className="text-xs">
                                          {achievement.value} / {achievement.target}
                                        </Badge>
                                        <div className="flex gap-0.5">
                                          {Array.from({ length: achievement.stars }).map((_, i) => (
                                            <span key={i} className="text-yellow-500">⭐</span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No achievements data available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Labels */}
              {playerData.labels && playerData.labels.length > 0 && (
                <Card className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-2 border-indigo-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">🏷️</span>
                      <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                        Player Labels
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {playerData.labels.map((label: any) => (
                        <div key={label.name} className="flex items-center gap-2 p-3 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
                          {label.iconUrls?.small && (
                            <img src={label.iconUrls.small} alt="" className="h-6 w-6" />
                          )}
                          <span className="text-sm font-medium">{label.name}</span>
                        </div>
                      ))}
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
