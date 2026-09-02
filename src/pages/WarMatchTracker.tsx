import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Swords,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Users,
  Percent,
  Search,
  Plus,
  Repeat,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_ROLES = ["primary_admin", "admin", "mod", "war_tracker"];
const STAFF_ROLES = ["primary_admin", "admin", "mod", "staff"];


interface Scan {
  id: string;
  total_clans: number;
  clans_in_war: number;
  successful_matches: number;
  mismatches: number;
  mismatch_percentage: number;
  blacklisted_matches: number;
  association_matches: number;
  status: string;
  created_at: string;
}

interface Result {
  id: string;
  clan_tag: string;
  clan_name: string | null;
  opponent_tag: string | null;
  opponent_name: string | null;
  war_state: string | null;
  is_match: boolean;
  is_blacklisted: boolean;
  is_association: boolean;
}

export default function WarMatchTracker() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [scan, setScan] = useState<Scan | null>(null);
  const [mismatches, setMismatches] = useState<Result[]>([]);
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({});
  const [assocTypes, setAssocTypes] = useState<{ id: string; name: string }[]>([]);
  const [assocTarget, setAssocTarget] = useState<Result | null>(null);
  const [assocType, setAssocType] = useState("");
  const [assocDescription, setAssocDescription] = useState("");
  const [savingAssoc, setSavingAssoc] = useState(false);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/staff");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const roleList = (roles ?? []).map((r) => r.role as string);
      if (!roleList.some((r) => ALLOWED_ROLES.includes(r))) {
        navigate("/staff");
        return;
      }
      setIsStaff(roleList.some((r) => STAFF_ROLES.includes(r)));
      setAuthorized(true);
      setLoading(false);

      const { data: types } = await supabase
        .from("association_types")
        .select("id, name")
        .order("name");
      setAssocTypes(types ?? []);

      await loadLatest();
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);


  const loadLatest = async () => {
    const { data: scans } = await supabase
      .from("war_match_scans")
      .select("*")
      .eq("status", "completed")
      .gt("clans_in_war", 0)
      .order("created_at", { ascending: false })
      .limit(1);

    const latest = (scans as Scan[] | null)?.[0] ?? null;
    setScan(latest);


    if (latest) {
      const { data: results } = await supabase
        .from("war_match_results")
        .select("*")
        .eq("scan_id", latest.id)
        .eq("is_match", false)
        .not("opponent_tag", "is", null)
        .order("clan_name", { ascending: true });
      setMismatches((results as Result[]) ?? []);
    } else {
      setMismatches([]);
    }
  };

  const runScan = async () => {
    setRunning(true);
    toast({
      title: "Scan started",
      description: "Fetching live war data for all tracked clans. This can take a couple of minutes.",
    });
    try {
      const { error } = await supabase.functions.invoke("war-match-tracker");
      if (error) throw error;
      await loadLatest();
      toast({ title: "Scan complete", description: "War match results updated." });
    } catch (err: any) {
      toast({
        title: "Scan failed",
        description: err?.message || "Could not complete the scan.",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mismatches;
    return mismatches.filter(
      (r) =>
        (r.clan_name || "").toLowerCase().includes(q) ||
        (r.clan_tag || "").toLowerCase().includes(q) ||
        (r.opponent_name || "").toLowerCase().includes(q) ||
        (r.opponent_tag || "").toLowerCase().includes(q)
    );
  }, [mismatches, search]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Clans", value: scan?.total_clans ?? 0, icon: Users, tone: "text-foreground" },
    { label: "Clans In War", value: scan?.clans_in_war ?? 0, icon: Swords, tone: "text-foreground" },
    { label: "Successful Matches", value: scan?.successful_matches ?? 0, icon: ShieldCheck, tone: "text-green-500" },
    { label: "Miss Matches", value: scan?.mismatches ?? 0, icon: ShieldAlert, tone: "text-destructive" },
    { label: "Miss Match %", value: `${scan?.mismatch_percentage ?? 0}%`, icon: Percent, tone: "text-destructive" },
    { label: "Blacklisted Matches", value: scan?.blacklisted_matches ?? 0, icon: Ban, tone: "text-red-500" },
    { label: "Association Matches", value: scan?.association_matches ?? 0, icon: ShieldCheck, tone: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Swords className="h-7 w-7 text-primary" />
              War Match Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Compares each tracked FWA clan's live war opponent against the FWA list.
            </p>
            {scan && (
              <p className="text-xs text-muted-foreground mt-1">
                Last scan: {new Date(scan.created_at).toLocaleString()} ·{" "}
                <span className="capitalize">{scan.status}</span>
              </p>
            )}
          </div>
          <Button onClick={runScan} disabled={running} size="lg" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
            {running ? "Scanning..." : "Run Scan"}
          </Button>
        </div>

        {!scan ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No scan has been run yet. Click "Run Scan" to fetch live war data.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              {stats.map((s) => (
                <Card key={s.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <s.icon className="h-3.5 w-3.5" />
                      {s.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${s.tone}`}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                    Non-Matches ({filtered.length})
                  </CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clan or opponent..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No mismatches found for this scan.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tracked Clan</TableHead>
                          <TableHead>Tag</TableHead>
                          <TableHead>Opponent</TableHead>
                          <TableHead>Opponent Tag</TableHead>
                          <TableHead>War State</TableHead>
                          <TableHead>Flags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.clan_name || "—"}</TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                              {r.clan_tag}
                            </TableCell>
                            <TableCell>{r.opponent_name || "Unknown"}</TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                              {r.opponent_tag}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {r.war_state}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {r.is_blacklisted && (
                                  <Badge variant="destructive" className="gap-1">
                                    <Ban className="h-3 w-3" /> Blacklist
                                  </Badge>
                                )}
                                {r.is_association && !r.is_blacklisted && (
                                  <Badge variant="secondary">Association</Badge>
                                )}
                                {!r.is_association && !r.is_blacklisted && (
                                  <span className="text-xs text-muted-foreground">Unknown clan</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
