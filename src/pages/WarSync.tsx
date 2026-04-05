import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Shield, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LEAGUES = ["FWA", "GFL", "FWL", "BZLM"] as const;

interface LeagueSchedule {
  id: string;
  league_name: string;
  spin_time: string;
  notes: string | null;
  status: string;
  created_at: string;
}

export default function WarSync() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string>("FWA");
  const [schedules, setSchedules] = useState<LeagueSchedule[]>([]);
  const [now, setNow] = useState(new Date());
  const [isBlurred, setIsBlurred] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Anti-screenshot: visibility change detection
  useEffect(() => {
    const handleVisibility = () => {
      setIsBlurred(document.hidden);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 3000);
      }
    };

    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Disable right-click and copy on protected content
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const prevent = (e: Event) => e.preventDefault();
    el.addEventListener("contextmenu", prevent);
    el.addEventListener("copy", prevent);
    el.addEventListener("cut", prevent);

    return () => {
      el.removeEventListener("contextmenu", prevent);
      el.removeEventListener("copy", prevent);
      el.removeEventListener("cut", prevent);
    };
  }, [authorized]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/staff");
        return;
      }
      setUser(session.user);

      // Check if user has any role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles || roles.length === 0) {
        navigate("/staff");
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/staff");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;
    loadSchedules();

    const channel = supabase
      .channel("league_schedules_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "league_schedules" }, () => {
        loadSchedules();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedLeague, authorized]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadSchedules = async () => {
    const { data } = await supabase
      .from("league_schedules")
      .select("*")
      .eq("league_name", selectedLeague)
      .order("spin_time", { ascending: true });
    setSchedules((data as LeagueSchedule[]) || []);
  };

  const formatLocalTime = (utcTime: string) => {
    const date = new Date(utcTime);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(date);
  };

  const getCountdown = (spinTime: string) => {
    const diff = new Date(spinTime).getTime() - now.getTime();
    if (diff <= 0) return "Started";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "default";
      case "in_progress": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "default";
    }
  };

  const upcomingSchedules = schedules.filter(s => s.status === "scheduled" && new Date(s.spin_time) > now);
  const pastSchedules = schedules.filter(s => s.status !== "scheduled" || new Date(s.spin_time) <= now);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const userEmail = user?.email || "authorized";

  return (
    <div className="min-h-screen bg-background">
      <style>{`@media print { .war-sync-protected { display: none !important; } }`}</style>
      <Navbar />
      <div
        ref={contentRef}
        className="war-sync-protected container mx-auto px-4 pt-24 pb-12 transition-all duration-300 relative"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          filter: isBlurred ? "blur(20px)" : "none",
        }}
      >
        {/* Watermark behind content */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden select-none"
          style={{ zIndex: 0, opacity: 0.06 }}
          aria-hidden="true"
        >
          <div className="absolute inset-0" style={{ transform: "rotate(-30deg) scale(1.5)", transformOrigin: "center center" }}>
            <div className="flex flex-col gap-8">
              {Array.from({ length: 30 }).map((_, row) => (
                <div key={row} className="flex gap-16 whitespace-nowrap">
                  {Array.from({ length: 10 }).map((_, col) => (
                    <span key={col} className="text-sm font-bold text-foreground">
                      {userEmail} • {new Date().toLocaleDateString()}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content on top */}
        <div className="relative" style={{ zIndex: 1 }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">War Sync</h1>
          <p className="text-muted-foreground">
            League war spin times in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-3 w-3" />
            <span>Protected content — screenshots disabled</span>
          </div>
        </div>

        {/* League Selector */}
        <div className="flex justify-center gap-3 mb-8">
          {LEAGUES.map((league) => (
            <Button
              key={league}
              variant={selectedLeague === league ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedLeague(league)}
              className="font-bold text-lg px-6"
            >
              <Shield className="h-5 w-5 mr-2" />
              {league}
            </Button>
          ))}
        </div>

        {/* Upcoming Spins */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming Spins — {selectedLeague}
          </h2>
          {upcomingSchedules.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No upcoming spins scheduled for {selectedLeague}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSchedules.map((schedule) => (
                <Card key={schedule.id} className="border-primary/20 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedLeague} War</CardTitle>
                      <Badge variant={statusColor(schedule.status)}>{schedule.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatLocalTime(schedule.spin_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-primary font-bold text-lg">{getCountdown(schedule.spin_time)}</span>
                    </div>
                    {schedule.notes && (
                      <p className="text-sm text-muted-foreground">{schedule.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past / Completed */}
        {pastSchedules.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Past / Completed
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastSchedules.map((schedule) => (
                <Card key={schedule.id} className="opacity-60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedLeague} War</CardTitle>
                      <Badge variant={statusColor(schedule.status)}>{schedule.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatLocalTime(schedule.spin_time)}</span>
                    </div>
                    {schedule.notes && (
                      <p className="text-sm text-muted-foreground">{schedule.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
