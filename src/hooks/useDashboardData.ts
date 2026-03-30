import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Officer {
  id: string;
  name: string;
  rank: string;
  badge_number: string;
  status: string;
  phone: string | null;
  fatigue_level: number;
}

export interface Zone {
  id: string;
  name: string;
  zone_code: string;
  threat_level: string;
  min_officers: number;
}

export interface Deployment {
  id: string;
  officer_id: string;
  zone_id: string;
  shift_start: string;
  shift_end: string | null;
  status: string;
  officers?: Officer;
  zones?: Zone;
}

export interface Alert {
  id: string;
  zone_id: string | null;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
  zones?: Zone;
}

export function useDashboardData() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [officersRes, zonesRes, deploymentsRes, alertsRes] = await Promise.all([
      supabase.from("officers").select("*"),
      supabase.from("zones").select("*"),
      supabase.from("deployments").select("*, officers(*), zones(*)").eq("status", "active"),
      supabase.from("alerts").select("*, zones(*)").order("created_at", { ascending: false }),
    ]);

    if (officersRes.data) setOfficers(officersRes.data);
    if (zonesRes.data) setZones(zonesRes.data);
    if (deploymentsRes.data) setDeployments(deploymentsRes.data as unknown as Deployment[]);
    if (alertsRes.data) setAlerts(alertsRes.data as unknown as Alert[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "officers" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "deployments" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "zones" }, () => fetchAll())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = {
    totalOfficers: officers.length,
    deployed: officers.filter((o) => o.status === "deployed").length,
    available: officers.filter((o) => o.status === "available").length,
    idle: officers.filter((o) => o.status === "idle").length,
    criticalZones: zones.filter((z) => z.threat_level === "critical").length,
    unreadAlerts: alerts.filter((a) => !a.is_read).length,
  };

  const getOfficersInZone = (zoneId: string) =>
    deployments.filter((d) => d.zone_id === zoneId && d.officers).map((d) => d.officers!);

  return { officers, zones, deployments, alerts, stats, loading, fetchAll, getOfficersInZone };
}
