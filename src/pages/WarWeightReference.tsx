import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Swords, Crown, Home, Zap } from "lucide-react";

export default function WarWeightReference() {
  // Estimated war weight data for each TH level
  const townHallWeights = [
    { th: 1, baseWeight: 1000, maxWeight: 1200 },
    { th: 2, baseWeight: 1500, maxWeight: 2000 },
    { th: 3, baseWeight: 2000, maxWeight: 3500 },
    { th: 4, baseWeight: 3500, maxWeight: 5000 },
    { th: 5, baseWeight: 5000, maxWeight: 7000 },
    { th: 6, baseWeight: 7000, maxWeight: 10000 },
    { th: 7, baseWeight: 10000, maxWeight: 15000 },
    { th: 8, baseWeight: 15000, maxWeight: 22000 },
    { th: 9, baseWeight: 22000, maxWeight: 32000 },
    { th: 10, baseWeight: 32000, maxWeight: 45000 },
    { th: 11, baseWeight: 45000, maxWeight: 60000 },
    { th: 12, baseWeight: 60000, maxWeight: 75000 },
    { th: 13, baseWeight: 75000, maxWeight: 90000 },
    { th: 14, baseWeight: 90000, maxWeight: 105000 },
    { th: 15, baseWeight: 105000, maxWeight: 125000 },
    { th: 16, baseWeight: 125000, maxWeight: 150000 },
  ];

  // Hero weight contribution (approximate per level)
  const heroWeights = {
    barbarianKing: { weightPerLevel: 280, maxLevel: 95 },
    archerQueen: { weightPerLevel: 280, maxLevel: 95 },
    grandWarden: { weightPerLevel: 250, maxLevel: 70 },
    royalChampion: { weightPerLevel: 250, maxLevel: 45 },
    battleMachine: { weightPerLevel: 200, maxLevel: 35 },
  };

  // Defense weight multipliers
  const defenseWeights = [
    { name: "Cannon", weightPerLevel: 150, maxLevel: 21 },
    { name: "Archer Tower", weightPerLevel: 160, maxLevel: 21 },
    { name: "Mortar", weightPerLevel: 180, maxLevel: 15 },
    { name: "Air Defense", weightPerLevel: 300, maxLevel: 13 },
    { name: "Wizard Tower", weightPerLevel: 250, maxLevel: 16 },
    { name: "Air Sweeper", weightPerLevel: 200, maxLevel: 9 },
    { name: "Hidden Tesla", weightPerLevel: 220, maxLevel: 14 },
    { name: "Bomb Tower", weightPerLevel: 240, maxLevel: 11 },
    { name: "X-Bow", weightPerLevel: 500, maxLevel: 9 },
    { name: "Inferno Tower", weightPerLevel: 800, maxLevel: 9 },
    { name: "Eagle Artillery", weightPerLevel: 1200, maxLevel: 7 },
    { name: "Scattershot", weightPerLevel: 1000, maxLevel: 4 },
    { name: "Monolith", weightPerLevel: 1100, maxLevel: 3 },
    { name: "Multi Archer Tower", weightPerLevel: 180, maxLevel: 3 },
    { name: "Ricochet Cannon", weightPerLevel: 170, maxLevel: 3 },
  ];

  // Troop weight (approximate per level)
  const troopWeights = [
    { name: "Barbarian", weightPerLevel: 10, maxLevel: 12 },
    { name: "Archer", weightPerLevel: 10, maxLevel: 12 },
    { name: "Giant", weightPerLevel: 15, maxLevel: 12 },
    { name: "Goblin", weightPerLevel: 8, maxLevel: 9 },
    { name: "Wall Breaker", weightPerLevel: 12, maxLevel: 12 },
    { name: "Balloon", weightPerLevel: 18, maxLevel: 11 },
    { name: "Wizard", weightPerLevel: 20, maxLevel: 12 },
    { name: "Healer", weightPerLevel: 25, maxLevel: 9 },
    { name: "Dragon", weightPerLevel: 40, maxLevel: 11 },
    { name: "P.E.K.K.A", weightPerLevel: 35, maxLevel: 11 },
    { name: "Baby Dragon", weightPerLevel: 22, maxLevel: 10 },
    { name: "Miner", weightPerLevel: 18, maxLevel: 10 },
    { name: "Electro Dragon", weightPerLevel: 45, maxLevel: 7 },
    { name: "Yeti", weightPerLevel: 30, maxLevel: 6 },
    { name: "Dragon Rider", weightPerLevel: 38, maxLevel: 4 },
    { name: "Electro Titan", weightPerLevel: 50, maxLevel: 3 },
    { name: "Root Rider", weightPerLevel: 42, maxLevel: 3 },
  ];

  // Pet weight contribution
  const petWeights = [
    { name: "L.A.S.S.I", weightPerLevel: 80, maxLevel: 10 },
    { name: "Electro Owl", weightPerLevel: 80, maxLevel: 10 },
    { name: "Mighty Yak", weightPerLevel: 80, maxLevel: 10 },
    { name: "Unicorn", weightPerLevel: 80, maxLevel: 10 },
    { name: "Frosty", weightPerLevel: 80, maxLevel: 10 },
    { name: "Diggy", weightPerLevel: 80, maxLevel: 10 },
    { name: "Poison Lizard", weightPerLevel: 80, maxLevel: 10 },
    { name: "Phoenix", weightPerLevel: 80, maxLevel: 10 },
    { name: "Spirit Fox", weightPerLevel: 80, maxLevel: 10 },
    { name: "Angry Jelly", weightPerLevel: 80, maxLevel: 10 },
    { name: "Sneezy", weightPerLevel: 80, maxLevel: 10 },
  ];

  const calculateTotalHeroWeight = () => {
    return Object.values(heroWeights).reduce((total, hero) => {
      return total + (hero.weightPerLevel * hero.maxLevel);
    }, 0);
  };

  const calculateTotalDefenseWeight = () => {
    return defenseWeights.reduce((total, defense) => {
      return total + (defense.weightPerLevel * defense.maxLevel);
    }, 0);
  };

  const calculateTotalTroopWeight = () => {
    return troopWeights.reduce((total, troop) => {
      return total + (troop.weightPerLevel * troop.maxLevel);
    }, 0);
  };

  const calculateTotalPetWeight = () => {
    return petWeights.reduce((total, pet) => {
      return total + (pet.weightPerLevel * pet.maxLevel);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block animate-bounce text-6xl mb-4">⚖️</div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-fade-in">
              War Weight Reference
            </h1>
            <p className="text-muted-foreground text-lg">
              Estimated war weight data used for matchmaking calculations
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-6 w-6 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Total Hero Weight</p>
                </div>
                <p className="text-3xl font-bold">{calculateTotalHeroWeight().toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-6 w-6 text-red-500" />
                  <p className="text-sm text-muted-foreground">Total Defense Weight</p>
                </div>
                <p className="text-3xl font-bold">{calculateTotalDefenseWeight().toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Swords className="h-6 w-6 text-purple-500" />
                  <p className="text-sm text-muted-foreground">Total Troop Weight</p>
                </div>
                <p className="text-3xl font-bold">{calculateTotalTroopWeight().toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="h-6 w-6 text-green-500" />
                  <p className="text-sm text-muted-foreground">Total Pet Weight</p>
                </div>
                <p className="text-3xl font-bold">{calculateTotalPetWeight().toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="townhall" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="townhall">🏰 Town Hall</TabsTrigger>
              <TabsTrigger value="heroes">👑 Heroes</TabsTrigger>
              <TabsTrigger value="defenses">🛡️ Defenses</TabsTrigger>
              <TabsTrigger value="troops">⚔️ Troops</TabsTrigger>
              <TabsTrigger value="pets">🐾 Pets</TabsTrigger>
            </TabsList>

            {/* Town Hall Tab */}
            <TabsContent value="townhall">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Home className="h-6 w-6" />
                    Town Hall War Weight by Level
                  </CardTitle>
                  <CardDescription>
                    Base and maximum war weight for each Town Hall level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Town Hall Level</TableHead>
                        <TableHead>Base Weight</TableHead>
                        <TableHead>Max Weight (Fully Maxed)</TableHead>
                        <TableHead>Weight Range</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {townHallWeights.map((th) => (
                        <TableRow key={th.th}>
                          <TableCell className="font-bold">
                            <Badge variant="outline">TH {th.th}</Badge>
                          </TableCell>
                          <TableCell>{th.baseWeight.toLocaleString()}</TableCell>
                          <TableCell className="text-primary font-semibold">
                            {th.maxWeight.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            +{(th.maxWeight - th.baseWeight).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Heroes Tab */}
            <TabsContent value="heroes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    Hero War Weight Contribution
                  </CardTitle>
                  <CardDescription>
                    Weight added per hero level upgrade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hero</TableHead>
                        <TableHead>Weight Per Level</TableHead>
                        <TableHead>Max Level</TableHead>
                        <TableHead>Total Max Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(heroWeights).map(([key, hero]) => (
                        <TableRow key={key}>
                          <TableCell className="font-semibold">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{hero.weightPerLevel}</Badge>
                          </TableCell>
                          <TableCell>{hero.maxLevel}</TableCell>
                          <TableCell className="text-primary font-bold">
                            {(hero.weightPerLevel * hero.maxLevel).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Defenses Tab */}
            <TabsContent value="defenses">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-red-500" />
                    Defense War Weight Contribution
                  </CardTitle>
                  <CardDescription>
                    Weight added per defense level upgrade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Defense</TableHead>
                        <TableHead>Weight Per Level</TableHead>
                        <TableHead>Max Level</TableHead>
                        <TableHead>Total Max Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {defenseWeights.map((defense) => (
                        <TableRow key={defense.name}>
                          <TableCell className="font-semibold">{defense.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{defense.weightPerLevel}</Badge>
                          </TableCell>
                          <TableCell>{defense.maxLevel}</TableCell>
                          <TableCell className="text-primary font-bold">
                            {(defense.weightPerLevel * defense.maxLevel).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Troops Tab */}
            <TabsContent value="troops">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Swords className="h-6 w-6 text-purple-500" />
                    Troop War Weight Contribution
                  </CardTitle>
                  <CardDescription>
                    Weight added per troop level upgrade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Troop</TableHead>
                        <TableHead>Weight Per Level</TableHead>
                        <TableHead>Max Level</TableHead>
                        <TableHead>Total Max Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {troopWeights.map((troop) => (
                        <TableRow key={troop.name}>
                          <TableCell className="font-semibold">{troop.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{troop.weightPerLevel}</Badge>
                          </TableCell>
                          <TableCell>{troop.maxLevel}</TableCell>
                          <TableCell className="text-primary font-bold">
                            {(troop.weightPerLevel * troop.maxLevel).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pets Tab */}
            <TabsContent value="pets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-green-500" />
                    Pet War Weight Contribution
                  </CardTitle>
                  <CardDescription>
                    Weight added per pet level upgrade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pet</TableHead>
                        <TableHead>Weight Per Level</TableHead>
                        <TableHead>Max Level</TableHead>
                        <TableHead>Total Max Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {petWeights.map((pet) => (
                        <TableRow key={pet.name}>
                          <TableCell className="font-semibold">{pet.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{pet.weightPerLevel}</Badge>
                          </TableCell>
                          <TableCell>{pet.maxLevel}</TableCell>
                          <TableCell className="text-primary font-bold">
                            {(pet.weightPerLevel * pet.maxLevel).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Calculation Formula */}
          <Card className="mt-8 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5 border-yellow-500/20">
            <CardHeader>
              <CardTitle>War Weight Calculation Formula</CardTitle>
              <CardDescription>How total war weight is estimated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <code className="text-sm">
                  <span className="text-primary font-bold">Total War Weight</span> = 
                  <span className="text-blue-500"> Base TH Weight</span> + 
                  <span className="text-yellow-500"> (Heroes × Level × Weight)</span> + 
                  <span className="text-red-500"> (Defenses × Level × Weight)</span> + 
                  <span className="text-purple-500"> (Troops × Level × Weight)</span> + 
                  <span className="text-green-500"> (Pets × Level × Weight)</span>
                </code>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Note:</strong> These are estimated values based on community research and testing.</p>
                <p>• Higher weight = Harder war matchups</p>
                <p>• Defensive upgrades typically add more weight than offensive upgrades</p>
                <p>• Supercell's exact formula is proprietary and not publicly disclosed</p>
                <p>• Eagles, Infernos, and Scattershots add significant weight</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
