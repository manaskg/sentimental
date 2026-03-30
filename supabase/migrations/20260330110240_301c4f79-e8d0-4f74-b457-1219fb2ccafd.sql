
-- Officers table
CREATE TABLE public.officers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rank text NOT NULL DEFAULT 'Constable',
  badge_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'deployed', 'idle', 'off_duty')),
  phone text,
  fatigue_level integer NOT NULL DEFAULT 0 CHECK (fatigue_level >= 0 AND fatigue_level <= 100),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Zones table
CREATE TABLE public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  zone_code text NOT NULL UNIQUE,
  threat_level text NOT NULL DEFAULT 'normal' CHECK (threat_level IN ('normal', 'elevated', 'critical')),
  min_officers integer NOT NULL DEFAULT 2,
  latitude double precision,
  longitude double precision,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Deployments table
CREATE TABLE public.deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id uuid REFERENCES public.officers(id) ON DELETE CASCADE NOT NULL,
  zone_id uuid REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
  shift_start timestamptz NOT NULL DEFAULT now(),
  shift_end timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'emergency')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Alerts table
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.zones(id) ON DELETE SET NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies: authenticated users can read all
CREATE POLICY "Authenticated users can read officers" ON public.officers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert officers" ON public.officers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update officers" ON public.officers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete officers" ON public.officers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read zones" ON public.zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert zones" ON public.zones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update zones" ON public.zones FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read deployments" ON public.deployments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert deployments" ON public.deployments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update deployments" ON public.deployments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete deployments" ON public.deployments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read alerts" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alerts" ON public.alerts FOR UPDATE TO authenticated USING (true);

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.officers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deployments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zones;

-- Seed zones
INSERT INTO public.zones (name, zone_code, threat_level, min_officers) VALUES
  ('Central Command', 'ZONE-A', 'normal', 4),
  ('North Perimeter', 'ZONE-B', 'elevated', 3),
  ('East Checkpoint', 'ZONE-C', 'normal', 2),
  ('South Gate', 'ZONE-D', 'critical', 5),
  ('West Corridor', 'ZONE-E', 'normal', 2),
  ('VIP Sector', 'ZONE-F', 'elevated', 4);

-- Seed officers
INSERT INTO public.officers (name, rank, badge_number, status, fatigue_level) VALUES
  ('Sgt. R. Sharma', 'Sergeant', 'OPS-001', 'deployed', 45),
  ('Const. A. Patel', 'Constable', 'OPS-002', 'deployed', 30),
  ('Insp. K. Roy', 'Inspector', 'OPS-003', 'available', 10),
  ('Const. M. Singh', 'Constable', 'OPS-004', 'deployed', 72),
  ('Const. D. Gupta', 'Constable', 'OPS-005', 'idle', 55),
  ('SI. P. Das', 'Sub-Inspector', 'OPS-006', 'deployed', 38),
  ('Const. S. Nair', 'Constable', 'OPS-007', 'available', 15),
  ('Const. J. Verma', 'Constable', 'OPS-008', 'deployed', 60),
  ('ASI. B. Ghosh', 'ASI', 'OPS-009', 'idle', 80),
  ('Const. L. Kumar', 'Constable', 'OPS-010', 'off_duty', 20);

-- Seed deployments (link deployed officers to zones)
INSERT INTO public.deployments (officer_id, zone_id, shift_start, shift_end)
SELECT o.id, z.id, now() - interval '4 hours', now() + interval '4 hours'
FROM public.officers o, public.zones z
WHERE o.badge_number = 'OPS-001' AND z.zone_code = 'ZONE-A';

INSERT INTO public.deployments (officer_id, zone_id, shift_start, shift_end)
SELECT o.id, z.id, now() - interval '3 hours', now() + interval '5 hours'
FROM public.officers o, public.zones z
WHERE o.badge_number = 'OPS-002' AND z.zone_code = 'ZONE-B';

INSERT INTO public.deployments (officer_id, zone_id, shift_start, shift_end)
SELECT o.id, z.id, now() - interval '6 hours', now() + interval '2 hours'
FROM public.officers o, public.zones z
WHERE o.badge_number = 'OPS-004' AND z.zone_code = 'ZONE-D';

INSERT INTO public.deployments (officer_id, zone_id, shift_start, shift_end)
SELECT o.id, z.id, now() - interval '2 hours', now() + interval '6 hours'
FROM public.officers o, public.zones z
WHERE o.badge_number = 'OPS-006' AND z.zone_code = 'ZONE-A';

INSERT INTO public.deployments (officer_id, zone_id, shift_start, shift_end)
SELECT o.id, z.id, now() - interval '5 hours', now() + interval '3 hours'
FROM public.officers o, public.zones z
WHERE o.badge_number = 'OPS-008' AND z.zone_code = 'ZONE-D';

-- Seed alerts
INSERT INTO public.alerts (zone_id, message, severity) VALUES
  ((SELECT id FROM public.zones WHERE zone_code='ZONE-D'), 'Zone D understaffed — need 3 more officers', 'critical'),
  ((SELECT id FROM public.zones WHERE zone_code='ZONE-B'), 'Officer fatigue high in Zone B', 'warning'),
  ((SELECT id FROM public.zones WHERE zone_code='ZONE-A'), 'Shift ending soon for 2 officers', 'info'),
  ((SELECT id FROM public.zones WHERE zone_code='ZONE-D'), 'Unauthorized movement detected', 'critical'),
  ((SELECT id FROM public.zones WHERE zone_code='ZONE-F'), 'VIP Sector perimeter breach attempt', 'warning');
