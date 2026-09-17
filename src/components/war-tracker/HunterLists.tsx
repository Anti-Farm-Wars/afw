import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ban, Crosshair, Download, Moon, Plus, Search, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface HunterRow {
  opponent_tag: string;
  opponent_name: string | null;
  encounters: number;
  first_seen: string;
  last_seen: string;
  days_since_last: number;
  usual_team_size: number | null;
  size_samples: number;
  size_consistency: number | null;
  consistent_composition: boolean;
  association_type: string | null;
  is_blacklisted: boolean;
  top_opponents: string[] | null;
  list_type: string;
}

interface Props {
  isStaff: boolean;
  onAssociate: (clan: { tag: string; name: string | null }) => void;
  refreshKey?: number;
}

const TABS = [
  { key: "hunting", label: "Hunting Clans", icon: Crosshair, hint: "10+ war encounters with FWA clans" },
  { key: "live", label: "Live Hunters", icon: Target, hint: "Active in the last 14 days with a consistent war size" },
  { key: "retired", label: "Retired Hunters", icon: Moon, hint: "Nothing seen for 30+ days" },
];

export function HunterLists({ isStaff, onAssociate, refreshKey = 0 }: Props) {
  const [rows, setRows] = useState<HunterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("hunting");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.rpc("get_hunter_lists");
      if (!active) return;
      setRows(((data ?? []) as any[]).map((r) => ({ ...r, encounters: Number(r.encounters) })));
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const listFor = (key: string) =>
    key === "hunting" ? rows : rows.filter((r) => r.list_type === key);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = listFor(tab);
    if (!q) return base;
    return base.filter(
      (r) =>
        (r.opponent_name || "").toLowerCase().includes(q) ||
        r.opponent_tag.toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, tab]);

  const exportCsv = () => {
    const header = [
      "tag",
      "name",
      "encounters",
      "first_seen",
      "last_seen",
      "days_since_last",
      "usual_team_size",
      "size_consistency",
      "association",
      "blacklisted",
    ];
    const lines = filtered.map((r) =>
      [
        r.opponent_tag,
        `"${(r.opponent_name || "").replace(/"/g, '""')}"`,
        r.encounters,
        r.first_seen,
        r.last_seen,
        r.days_since_last,
        r.usual_team_size ?? "",
        r.size_consistency ?? "",
        r.association_type ?? "",
        r.is_blacklisted,
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-hunters.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-primary" />
            Hunter Lists
          </CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hunter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon" onClick={exportCsv} title="Export CSV">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3">
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="gap-1">
                <t.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                <Badge variant="secondary" className="ml-1">{listFor(t.key).length}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((t) => (
            <TabsContent key={t.key} value={t.key} className="mt-4">
              <p className="text-xs text-muted-foreground mb-3">{t.hint}</p>
              {loading ? (
                <p className="py-8 text-center text-muted-foreground">Loading hunters...</p>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No clans in this list yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clan</TableHead>
                        <TableHead>Tag</TableHead>
                        <TableHead>Encounters</TableHead>
                        <TableHead>First Seen</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Usual Size</TableHead>
                        <TableHead>Flags</TableHead>
                        {isStaff && <TableHead className="text-right">Action</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((r) => (
                        <TableRow key={r.opponent_tag}>
                          <TableCell className="font-medium">{r.opponent_name || "Unknown"}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {r.opponent_tag}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{r.encounters}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(r.first_seen).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(r.last_seen).toLocaleDateString()} ({r.days_since_last}d)
                          </TableCell>
                          <TableCell className="text-xs">
                            {r.usual_team_size ? (
                              <>
                                {r.usual_team_size}v{r.usual_team_size}
                                {r.size_consistency !== null && (
                                  <span className="text-muted-foreground"> · {r.size_consistency}%</span>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground">No data yet</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {r.is_blacklisted && (
                                <Badge variant="destructive" className="gap-1">
                                  <Ban className="h-3 w-3" /> Blacklist
                                </Badge>
                              )}
                              {r.association_type && !r.is_blacklisted && (
                                <Badge variant="secondary">{r.association_type}</Badge>
                              )}
                              {!r.association_type && (
                                <span className="text-xs text-muted-foreground">Unknown clan</span>
                              )}
                            </div>
                          </TableCell>
                          {isStaff && (
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() =>
                                  onAssociate({ tag: r.opponent_tag, name: r.opponent_name })
                                }
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Associate
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
