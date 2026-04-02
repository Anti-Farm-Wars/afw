import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, Plus, CalendarIcon, Clock, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LEAGUES = ["FWA", "GFL", "FWL", "BZLM"];

interface LeagueSchedule {
  id: string;
  league_name: string;
  spin_time: string;
  notes: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function SyncUpdate() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<LeagueSchedule[]>([]);
  const [filterLeague, setFilterLeague] = useState<string>("all");

  // Form state
  const [leagueName, setLeagueName] = useState("FWA");
  const [spinDate, setSpinDate] = useState<Date>();
  const [spinTime, setSpinTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/staff"); return; }
    setUser(session.user);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    const role = roleData?.role || null;
    setUserRole(role);

    if (role !== "admin" && role !== "primary_admin") {
      navigate("/staff/dashboard");
      toast({ title: "Access Denied", description: "Admin access required", variant: "destructive" });
      return;
    }
    setLoading(false);
    loadSchedules();
  };

  const loadSchedules = async () => {
    const { data } = await supabase
      .from("league_schedules")
      .select("*")
      .order("spin_time", { ascending: false });
    setSchedules((data as LeagueSchedule[]) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spinDate) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }

    const [hours, minutes] = spinTime.split(":").map(Number);
    const spinDateTime = new Date(spinDate);
    spinDateTime.setHours(hours, minutes, 0, 0);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("league_schedules")
          .update({
            league_name: leagueName,
            spin_time: spinDateTime.toISOString(),
            notes: notes || null,
          })
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Success", description: "Schedule updated" });
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from("league_schedules")
          .insert({
            league_name: leagueName,
            spin_time: spinDateTime.toISOString(),
            notes: notes || null,
            created_by: user.id,
          });
        if (error) throw error;
        toast({ title: "Success", description: "Schedule added" });
      }
      resetForm();
      loadSchedules();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (schedule: LeagueSchedule) => {
    setEditingId(schedule.id);
    setLeagueName(schedule.league_name);
    const date = new Date(schedule.spin_time);
    setSpinDate(date);
    setSpinTime(format(date, "HH:mm"));
    setNotes(schedule.notes || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      const { error } = await supabase.from("league_schedules").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Schedule deleted" });
      loadSchedules();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("league_schedules")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: `Status changed to ${status}` });
      loadSchedules();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setLeagueName("FWA");
    setSpinDate(undefined);
    setSpinTime("10:00");
    setNotes("");
    setEditingId(null);
  };

  const formatLocalTime = (utcTime: string) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(utcTime));
  };

  const filtered = filterLeague === "all"
    ? schedules
    : schedules.filter(s => s.league_name === filterLeague);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Sync Update — Manage League Schedules</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add/Edit Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? "Edit Schedule" : "Add Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>League</Label>
                  <Select value={leagueName} onValueChange={setLeagueName}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAGUES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Spin Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !spinDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {spinDate ? format(spinDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={spinDate}
                        onSelect={setSpinDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Spin Time</Label>
                  <Input type="time" value={spinTime} onChange={e => setSpinTime(e.target.value)} />
                </div>

                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Week 3 spin" />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? "Update" : "Add"} Schedule
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Schedule List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  All Schedules
                </CardTitle>
                <Select value={filterLeague} onValueChange={setFilterLeague}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {LEAGUES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No schedules found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>League</TableHead>
                        <TableHead>Spin Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Badge variant="outline" className="font-bold">{s.league_name}</Badge>
                          </TableCell>
                          <TableCell>{formatLocalTime(s.spin_time)}</TableCell>
                          <TableCell>
                            <Select
                              value={s.status}
                              onValueChange={(val) => handleStatusChange(s.id, val)}
                            >
                              <SelectTrigger className="w-28 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{s.notes || "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
        </div>
      </div>
    </div>
  );
}
