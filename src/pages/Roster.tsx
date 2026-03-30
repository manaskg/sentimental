import { useState } from "react";
import { toast } from "sonner";
import { RosterFilters } from "@/components/roster/RosterFilters";
import { RosterTable, Assignment, AssignmentState } from "@/components/roster/RosterTable";
import { AddAssignmentDialog } from "@/components/roster/AddAssignmentDialog";
import { AutoAssignControls } from "@/components/roster/AutoAssignControls";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ZONES = ["Gate A", "Gate B", "Gate C", "Patrol 1", "CCTV Room", "Main Hall"];
const TIME_SLOTS = ["08:00 - 12:00", "12:00 - 16:00", "16:00 - 20:00", "20:00 - 00:00"];
const OFFICERS = [
  { id: "101", name: "Rahul Singh" },
  { id: "102", name: "Amit Kumar" },
  { id: "103", name: "Sneha Patel" },
  { id: "104", name: "Karan Desai" },
  { id: "105", name: "Pooja Sharma" },
  { id: "106", name: "Vikram Rathore" },
  { id: "107", name: "Anita Raj" },
  { id: "108", name: "Suresh Menon" },
];

export default function Roster() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      officerId: "101",
      officerName: "Rahul Singh",
      zone: "Gate A",
      shiftTime: "08:00 - 12:00",
      status: "Active"
    }
  ]);
  
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    eventName: "",
    zone: "All"
  });

  const [rotationInterval, setRotationInterval] = useState("off");

  const filteredAssignments = assignments.filter(a => {
    if (filters.zone !== "All" && a.zone !== filters.zone) return false;
    // Assuming eventName and date are handled generally for demo, we are showing all matching the minimal currently.
    return true;
  });

  const handleAddAssignment = (newAssignment: Omit<Assignment, "id" | "status">) => {
    // Conflict Detection: Double-booked
    const isDoubleBooked = assignments.some(
      a => a.officerId === newAssignment.officerId && a.shiftTime === newAssignment.shiftTime
    );

    if (isDoubleBooked) {
      toast.error(`Conflict: ${newAssignment.officerName} is double-booked for ${newAssignment.shiftTime}!`);
      return;
    }

    const assignment: Assignment = {
      ...newAssignment,
      id: Math.random().toString(36).substring(7),
      status: "Scheduled"
    };

    setAssignments([...assignments, assignment]);
    toast.success("Assignment added successfully");
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    toast.success("Assignment removed");
  };

  const handleAutoAssign = () => {
    toast.info("Triggering Auto-Assign Algorithm...");
    
    // Simplistic Algorithm: Fill empty zones for the currently selected date/event (simplified without full date logic).
    // Let's ensure "08:00 - 12:00" shift has all zones covered.
    
    const targetShift = "08:00 - 12:00";
    const currentAssignments = assignments.filter(a => a.shiftTime === targetShift);
    const assignedZones = currentAssignments.map(a => a.zone);
    const understaffedZones = ZONES.filter(z => !assignedZones.includes(z));

    if (understaffedZones.length === 0) {
      toast.success("No understaffed zones for 08:00 - 12:00.");
      return;
    }

    const assignedOfficers = currentAssignments.map(a => a.officerId);
    let availableOfficers = OFFICERS.filter(o => !assignedOfficers.includes(o.id));

    // Sort by fatigue (in real scenario, tracking total hours, here we randomize)
    availableOfficers = availableOfficers.sort(() => 0.5 - Math.random());

    const newAssignments: Assignment[] = [];
    
    understaffedZones.forEach(zone => {
      if (availableOfficers.length > 0) {
        const officer = availableOfficers.pop()!;
        newAssignments.push({
          id: Math.random().toString(36).substring(7),
          officerId: officer.id,
          officerName: officer.name,
          zone: zone,
          shiftTime: targetShift,
          status: "Scheduled"
        });
      } else {
        toast.warning(`Zone ${zone} remains understaffed! No officers available.`);
      }
    });

    if (newAssignments.length > 0) {
      setAssignments(prev => [...prev, ...newAssignments]);
      toast.success(`Auto-assigned ${newAssignments.length} officers to cover zones.`);
    }
  };

  const handleRotateNow = () => {
    toast.info("Rotating officers across zones...");
    // Rotate the zones of active/scheduled assignments for the next time slot or just shuffle zones.
    // For demo: shuffle zones of all assignments.
    const zonesOnly = assignments.map(a => a.zone);
    // basic rotate array
    const rotatedZones = [...zonesOnly.slice(1), zonesOnly[0]];

    const rotatedAssignments = assignments.map((a, index) => ({
      ...a,
      zone: rotatedZones[index] || a.zone
    }));

    setAssignments(rotatedAssignments as Assignment[]);
    toast.success("Rotation applied successfully");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roster Management</h1>
          <p className="text-muted-foreground mt-1">Create & manage duty schedules effectively.</p>
        </div>
        <AddAssignmentDialog 
          onAdd={handleAddAssignment} 
          zones={ZONES} 
          officers={OFFICERS} 
          timeSlots={TIME_SLOTS} 
        />
      </div>

      <AutoAssignControls 
        onAutoAssign={handleAutoAssign}
        onRotateNow={handleRotateNow}
        rotationInterval={rotationInterval}
        setRotationInterval={setRotationInterval}
      />

      <RosterFilters filters={filters} setFilters={setFilters} zones={ZONES} />

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-xl">Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <RosterTable assignments={filteredAssignments} onDelete={handleDeleteAssignment} />
        </CardContent>
      </Card>
    </div>
  );
}
