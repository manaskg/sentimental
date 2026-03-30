import { Zone, Officer } from "@/hooks/useDashboardData";
import { X, Shield, AlertTriangle, Users } from "lucide-react";

interface Props {
  zone: Zone | null;
  officers: Officer[];
  onClose: () => void;
}

const ZoneDetailPanel = ({ zone, officers, onClose }: Props) => {
  if (!zone) return null;

  const threatColor = zone.threat_level === "critical"
    ? "text-accent"
    : zone.threat_level === "elevated"
    ? "text-yellow-500"
    : "text-primary";

  const isUnderstaffed = officers.length < zone.min_officers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="sentinel-border-glow rounded-lg bg-card w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="sentinel-top-bar h-1" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-display text-sm font-bold tracking-[0.2em] text-foreground">{zone.name}</h2>
                <p className="font-mono-terminal text-[10px] text-muted-foreground">{zone.zone_code}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-muted/50 rounded transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-muted/30 rounded p-3 text-center">
              <p className={`font-display text-lg font-bold ${threatColor}`}>{zone.threat_level.toUpperCase()}</p>
              <p className="font-mono-terminal text-[10px] text-muted-foreground">THREAT LEVEL</p>
            </div>
            <div className="bg-muted/30 rounded p-3 text-center">
              <p className="font-display text-lg font-bold text-foreground">{officers.length}</p>
              <p className="font-mono-terminal text-[10px] text-muted-foreground">ASSIGNED</p>
            </div>
            <div className="bg-muted/30 rounded p-3 text-center">
              <p className={`font-display text-lg font-bold ${isUnderstaffed ? "text-accent" : "text-primary"}`}>{zone.min_officers}</p>
              <p className="font-mono-terminal text-[10px] text-muted-foreground">MINIMUM REQ</p>
            </div>
          </div>

          {isUnderstaffed && (
            <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded px-4 py-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
              <span className="font-mono-terminal text-xs text-accent">
                UNDERSTAFFED — NEED {zone.min_officers - officers.length} MORE OFFICER(S)
              </span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-display text-xs tracking-[0.2em] text-foreground">ASSIGNED OFFICERS</h3>
            </div>
            {officers.length === 0 ? (
              <p className="font-mono-terminal text-xs text-muted-foreground text-center py-4">NO OFFICERS ASSIGNED</p>
            ) : (
              officers.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-3 py-2.5 rounded hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="font-display text-[9px] text-primary font-bold">
                        {o.name.split(" ").pop()?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-mono-terminal text-xs text-foreground">{o.name}</p>
                      <p className="font-mono-terminal text-[10px] text-muted-foreground">{o.rank} • {o.badge_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          o.fatigue_level > 70 ? "bg-accent" : o.fatigue_level > 40 ? "bg-yellow-500" : "bg-primary"
                        }`}
                        style={{ width: `${o.fatigue_level}%` }}
                      />
                    </div>
                    <p className="font-mono-terminal text-[9px] text-muted-foreground mt-0.5">
                      FATIGUE {o.fatigue_level}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailPanel;
