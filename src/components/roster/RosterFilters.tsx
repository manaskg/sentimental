import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RosterFiltersProps {
  filters: {
    date: string;
    eventName: string;
    zone: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{ date: string; eventName: string; zone: string; }>>;
  zones: string[];
}

export function RosterFilters({ filters, setFilters, zones }: RosterFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Filters</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="date-filter">Date</Label>
          <Input 
            id="date-filter" 
            type="date" 
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="event-filter">Event Name</Label>
          <Input 
            id="event-filter" 
            placeholder="Search events..." 
            value={filters.eventName}
            onChange={(e) => setFilters(prev => ({ ...prev, eventName: e.target.value }))}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="zone-filter">Zone</Label>
          <Select 
            value={filters.zone} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, zone: val }))}
          >
            <SelectTrigger id="zone-filter">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
