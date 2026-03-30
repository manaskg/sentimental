import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Officer, Zone } from "@/hooks/useDashboardData";
import { UserPlus, X } from "lucide-react";

interface Props {
  officers: Officer[];
  zones: Zone[];
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

const AssignOfficerDialog = ({ officers, zones, open, onClose, onDone }: Props) => {
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [hours, setHours] = useState("8");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableOfficers = officers.filter((o) => o.status === "available" || o.status === "idle");

  const handleAssign = async () => {
    if (!selectedOfficer || !selectedZone) {
      setError("SELECT OFFICER AND ZONE");
      return;
    }
    setLoading(true);
    setError("");

    const shiftEnd = new Date();
    shiftEnd.setHours(shiftEnd.getHours() + parseInt(hours));

    const { error: depErr } = await supabase.from("deployments").insert({
      officer_id: selectedOfficer,
      zone_id: selectedZone,
      shift_end: shiftEnd.toISOString(),
    });

    if (!depErr) {
      await supabase.from("officers").update({ status: "deployed" }).eq("id", selectedOfficer);
    }

    setLoading(false);
    if (depErr) {
      setError(depErr.message.toUpperCase());
    } else {
      onDone();
      onClose();
      setSelectedOfficer("");
      setSelectedZone("");
    }
  };

  if (!open) return null;

  const selectClass =
    "w-full bg-input border border-border rounded px-4 py-3 text-sm text-foreground font-mono-terminal focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="sentinel-border-glow rounded-lg bg-card w-full max-w-md overflow-hidden animate-fade-in">
        <div className="sentinel-top-bar h-1" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <h2 className="font-display text-sm font-bold tracking-[0.2em] text-foreground">ASSIGN OFFICER</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-muted/50 rounded transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">Officer</label>
              <select value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)} className={selectClass}>
                <option value="">Select Officer</option>
                {availableOfficers.map((o) => (
                  <option key={o.id} value={o.id}>{o.name} — {o.badge_number} ({o.status})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">Zone</label>
              <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className={selectClass}>
                <option value="">Select Zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name} — {z.zone_code}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">Shift Duration (Hours)</label>
              <select value={hours} onChange={(e) => setHours(e.target.value)} className={selectClass}>
                {[4, 6, 8, 10, 12].map((h) => (
                  <option key={h} value={h}>{h} Hours</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-accent/10 border border-accent/30 rounded px-4 py-3 text-xs tracking-wider text-accent text-center font-mono-terminal">
                ⚠ {error}
              </div>
            )}

            <button
              onClick={handleAssign}
              disabled={loading}
              className="w-full sentinel-btn-glow border border-primary/40 rounded py-3 text-xs font-display tracking-[0.25em] text-primary uppercase transition-all duration-300 hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "DEPLOYING..." : "CONFIRM DEPLOYMENT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignOfficerDialog;
