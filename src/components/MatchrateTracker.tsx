import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, BarChart3, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrackedClan {
  tag: string;
  name?: string;
  matchType: 'FWA' | 'GFL';
}

export default function MatchrateTracker() {
  const [clanTags, setClanTags] = useState<string>("");
  const [trackedClans, setTrackedClans] = useState<TrackedClan[]>([]);
  const [matchType, setMatchType] = useState<'FWA' | 'GFL'>('FWA');
  const { toast } = useToast();

  const addClanTags = () => {
    if (!clanTags.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one clan tag",
        variant: "destructive",
      });
      return;
    }

    // Split by newlines, commas, or spaces and clean tags
    const tags = clanTags
      .split(/[\n,\s]+/)
      .map(tag => tag.trim().replace(/^#/, ''))
      .filter(tag => tag.length > 0);

    const newClans: TrackedClan[] = tags.map(tag => ({
      tag: `#${tag}`,
      matchType: matchType,
    }));

    setTrackedClans([...trackedClans, ...newClans]);
    setClanTags("");
    
    toast({
      title: "Success",
      description: `Added ${newClans.length} clan(s) to ${matchType} tracking`,
    });
  };

  const removeClan = (tag: string) => {
    setTrackedClans(trackedClans.filter(clan => clan.tag !== tag));
  };

  const fwaClans = trackedClans.filter(c => c.matchType === 'FWA');
  const gflClans = trackedClans.filter(c => c.matchType === 'GFL');

  return (
    <Card className="bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border-2 border-cyan-500/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🎯</span>
          <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Matchrate Tracker
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Clans Section */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Select Match Type:</label>
              <Tabs value={matchType} onValueChange={(v) => setMatchType(v as 'FWA' | 'GFL')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="FWA">
                    <Target className="h-4 w-4 mr-2" />
                    FWA Matchrate
                  </TabsTrigger>
                  <TabsTrigger value="GFL">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    GFL Matchrate
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Enter Clan Tags (one per line, comma, or space separated):</label>
            <Textarea
              placeholder="e.g., #2PP, #ABC123, #XYZ789"
              value={clanTags}
              onChange={(e) => setClanTags(e.target.value)}
              rows={4}
              className="bg-background/50"
            />
          </div>

          <Button onClick={addClanTags} variant="hero" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Clans to Track
          </Button>
        </div>

        {/* Tracked Clans Display */}
        {trackedClans.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FWA Clans */}
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-lg">FWA Tracking</h3>
                  <Badge variant="outline" className="ml-auto">{fwaClans.length} clans</Badge>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {fwaClans.length > 0 ? (
                    fwaClans.map((clan) => (
                      <div
                        key={clan.tag}
                        className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/30"
                      >
                        <span className="text-sm font-mono">{clan.tag}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeClan(clan.tag)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No FWA clans tracked</p>
                  )}
                </div>
              </div>

              {/* GFL Clans */}
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">GFL Tracking</h3>
                  <Badge variant="outline" className="ml-auto">{gflClans.length} clans</Badge>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gflClans.length > 0 ? (
                    gflClans.map((clan) => (
                      <div
                        key={clan.tag}
                        className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/30"
                      >
                        <span className="text-sm font-mono">{clan.tag}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeClan(clan.tag)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No GFL clans tracked</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Tracking Summary</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-background/50 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Total Clans</p>
                  <p className="text-2xl font-bold">{trackedClans.length}</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded">
                  <p className="text-xs text-muted-foreground mb-1">FWA Clans</p>
                  <p className="text-2xl font-bold text-green-500">{fwaClans.length}</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded">
                  <p className="text-xs text-muted-foreground mb-1">GFL Clans</p>
                  <p className="text-2xl font-bold text-blue-500">{gflClans.length}</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Match Rate</p>
                  <p className="text-2xl font-bold text-purple-500">--</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3 p-2 bg-muted/30 rounded">
                💡 Add clan tags to track their matchrate performance in FWA and GFL wars
              </p>
            </div>
          </div>
        )}

        {trackedClans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No clans tracked yet. Add clan tags above to start tracking matchrates.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
