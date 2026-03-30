import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, LogOut, Users, AlertTriangle, Activity, Clock,
  UserPlus, RefreshCw, Siren, ChevronRight, MapPin, Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardData, Zone } from "@/hooks/useDashboardData";
import AssignOfficerDialog from "@/components/dashboard/AssignOfficerDialog";
import ZoneDetailPanel from "@/components/dashboard/ZoneDetailPanel";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const { officers, zones, alerts, stats, loading, fetchAll, getOfficersInZone } = useDashboardData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate("/"); return; }
      setUser({ email: session.user.email, full_name: session.user.user_metadata?.full_name || "Operator" });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/"); return; }
      setUser({ email: session.user.email, full_name: session.user.user_metadata?.full_name || "Operator" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleRotateDuty = async () => {
    // Rotate: set all deployed officers back to available, clear active deployments
    const deployed = officers.filter(o => o.status === "deployed");
    if (deployed.length === 0) return;
    for (const o of deployed) {
      await supabase.from("deployments").update({ status: "completed" }).eq("officer_id", o.id).eq("status", "active");
      await supabase.from("officers").update({ status: "available" }).eq("id", o.id);
    }
    await supabase.from("alerts").insert({ message: "Duty rotation completed — all deployments reset", severity: "info" });
    fetchAll();
  };

  const handleEmergencyDeploy = async () => {
    const criticalZones = zones.filter(z => z.threat_level === "critical");
    const available = officers.filter(o => o.status === "available");
    let assigned = 0;
    for (const zone of criticalZones) {
      const current = getOfficersInZone(zone.id).length;
      const needed = zone.min_officers - current;
      for (let i = 0; i < needed && assigned < available.length; i++) {
        const officer = available[assigned];
        const shiftEnd = new Date();
        shiftEnd.setHours(shiftEnd.getHours() + 8);
        await supabase.from("deployments").insert({ officer_id: officer.id, zone_id: zone.id, shift_end: shiftEnd.toISOString() });
        await supabase.from("officers").update({ status: "deployed" }).eq("id", officer.id);
        assigned++;
      }
    }
    await supabase.from("alerts").insert({
      message: `Emergency deploy: ${assigned} officer(s) dispatched to critical zones`,
      severity: "critical",
    });
    fetchAll();
  };

  if (!user) return null;

  const severityIcon = (s: string) =>
    s === "critical" ? "🔴" : s === "warning" ? "🟡" : "🔵";

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-display text-sm font-bold tracking-[0.2em] text-foreground">
                SENTINEL <span className="text-accent">CONTROL</span>
              </h1>
              <p className="font-mono-terminal text-[10px] text-muted-foreground hidden sm:block">
                Main Command Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono-terminal text-xs text-foreground tabular-nums">
                {currentTime.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                {" • "}
                {currentTime.toLocaleTimeString("en-US", { hour12: false })}
              </span>
            </div>

            <div className="relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {stats.unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <span className="font-mono-terminal text-[8px] text-accent-foreground">{stats.unreadAlerts}</span>
                </span>
              )}
            </div>

            <div className="w-px h-6 bg-border" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="font-display text-[10px] text-primary font-bold">
                  {user.full_name?.charAt(0)?.toUpperCase() || "O"}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="font-mono-terminal text-xs text-foreground leading-tight">{user.full_name}</p>
                <p className="font-mono-terminal text-[10px] text-muted-foreground leading-tight">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded border border-accent/30 hover:bg-accent/10 transition-colors group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline font-display text-[10px] tracking-[0.15em] text-accent">LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-fade-in">
            <Shield className="w-10 h-10 text-primary mx-auto mb-3 animate-pulse" />
            <p className="font-display text-xs tracking-[0.2em] text-muted-foreground">LOADING SYSTEMS...</p>
          </div>
        </div>
      ) : (
        <main className="p-4 sm:p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
          {/* Live Deployment Overview */}
          <div>
            <h2 className="font-display text-xs font-bold tracking-[0.2em] text-muted-foreground mb-3">
              LIVE DEPLOYMENT OVERVIEW
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "TOTAL OFFICERS", value: stats.totalOfficers, icon: Users, color: "text-primary" },
                { label: "OFFICERS DEPLOYED", value: stats.deployed, icon: Activity, color: "text-primary" },
                { label: "OFFICERS IDLE", value: stats.idle + stats.available, icon: Users, color: "text-yellow-500" },
                { label: "CRITICAL ZONES", value: stats.criticalZones, icon: AlertTriangle, color: "text-accent" },
              ].map((stat) => (
                <div key={stat.label} className="sentinel-border-glow rounded-lg bg-card p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <p className={`font-display text-2xl sm:text-3xl font-bold ${stat.color} tracking-wider`}>
                    {String(stat.value).padStart(2, "0")}
                  </p>
                  <p className="font-mono-terminal text-[10px] text-muted-foreground tracking-[0.1em] mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-display text-xs font-bold tracking-[0.2em] text-muted-foreground mb-3">
              QUICK ACTIONS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setAssignOpen(true)}
                className="sentinel-border-glow rounded-lg bg-card p-4 flex items-center gap-4 hover:bg-primary/5 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xs tracking-[0.15em] text-foreground">ASSIGN OFFICER</p>
                  <p className="font-mono-terminal text-[10px] text-muted-foreground">Deploy to zone</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </button>

              <button
                onClick={handleRotateDuty}
                className="sentinel-border-glow rounded-lg bg-card p-4 flex items-center gap-4 hover:bg-yellow-500/5 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                  <RefreshCw className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-display text-xs tracking-[0.15em] text-foreground">ROTATE DUTY</p>
                  <p className="font-mono-terminal text-[10px] text-muted-foreground">Reset all shifts</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </button>

              <button
                onClick={handleEmergencyDeploy}
                className="sentinel-border-glow rounded-lg bg-card p-4 flex items-center gap-4 hover:bg-accent/5 transition-all group text-left border-accent/20"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Siren className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-display text-xs tracking-[0.15em] text-foreground">EMERGENCY DEPLOY</p>
                  <p className="font-mono-terminal text-[10px] text-accent">Fill critical zones</p>
                </div>
                <ChevronRight className="w-4 h-4 text-accent ml-auto" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Zone Map - Click to see officers */}
            <div className="lg:col-span-2 sentinel-border-glow rounded-lg bg-card overflow-hidden">
              <div className="sentinel-top-bar h-0.5" />
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xs font-bold tracking-[0.2em] text-foreground">
                    ZONE DEPLOYMENT MAP
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-mono-terminal text-[10px] text-primary">LIVE</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {zones.map((zone) => {
                    const assigned = getOfficersInZone(zone.id).length;
                    const understaffed = assigned < zone.min_officers;
                    const threatColor =
                      zone.threat_level === "critical" ? "border-accent/50 bg-accent/5" :
                      zone.threat_level === "elevated" ? "border-yellow-500/50 bg-yellow-500/5" :
                      "border-border bg-muted/20";

                    return (
                      <button
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`rounded-lg border p-4 text-left transition-all hover:scale-[1.02] ${threatColor}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <MapPin className={`w-4 h-4 ${
                            zone.threat_level === "critical" ? "text-accent" :
                            zone.threat_level === "elevated" ? "text-yellow-500" : "text-primary"
                          }`} />
                          <span className={`font-display text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded ${
                            zone.threat_level === "critical" ? "bg-accent/20 text-accent" :
                            zone.threat_level === "elevated" ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-primary/20 text-primary"
                          }`}>
                            {zone.threat_level.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-display text-[11px] tracking-[0.1em] text-foreground mb-0.5">{zone.zone_code}</p>
                        <p className="font-mono-terminal text-[10px] text-muted-foreground mb-2 truncate">{zone.name}</p>
                        <div className="flex items-center justify-between">
                          <span className={`font-mono-terminal text-xs ${understaffed ? "text-accent" : "text-primary"}`}>
                            {assigned}/{zone.min_officers}
                          </span>
                          <span className="font-mono-terminal text-[9px] text-muted-foreground">OFFICERS</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="sentinel-border-glow rounded-lg bg-card overflow-hidden">
              <div className="sentinel-top-bar h-0.5" />
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xs font-bold tracking-[0.2em] text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent" />
                    ALERTS
                  </h2>
                  <span className="font-mono-terminal text-[10px] text-accent">
                    {stats.unreadAlerts} ACTIVE
                  </span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="font-mono-terminal text-xs text-muted-foreground text-center py-6">
                      NO ACTIVE ALERTS
                    </p>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded px-3 py-3 border transition-colors ${
                          alert.severity === "critical"
                            ? "border-accent/30 bg-accent/5"
                            : alert.severity === "warning"
                            ? "border-yellow-500/30 bg-yellow-500/5"
                            : "border-border bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm mt-0.5">{severityIcon(alert.severity)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono-terminal text-xs text-foreground leading-relaxed">
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {alert.zones && (
                                <span className="font-mono-terminal text-[9px] text-muted-foreground">
                                  {alert.zones.zone_code}
                                </span>
                              )}
                              <span className="font-mono-terminal text-[9px] text-muted-foreground">
                                {new Date(alert.created_at).toLocaleTimeString("en-US", { hour12: false })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Dialogs */}
      <AssignOfficerDialog
        officers={officers}
        zones={zones}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onDone={fetchAll}
      />
      {selectedZone && (
        <ZoneDetailPanel
          zone={selectedZone}
          officers={getOfficersInZone(selectedZone.id)}
          onClose={() => setSelectedZone(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
