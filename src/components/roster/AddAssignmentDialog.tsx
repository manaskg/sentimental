import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Assignment } from "./RosterTable";

interface AddAssignmentDialogProps {
  onAdd: (assignment: Omit<Assignment, "id" | "status">) => void;
  zones: string[];
  officers: { id: string; name: string }[];
  timeSlots: string[];
}

export function AddAssignmentDialog({ onAdd, zones, officers, timeSlots }: AddAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [officerId, setOfficerId] = useState("");
  const [zone, setZone] = useState("");
  const [shiftTime, setShiftTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerId || !zone || !shiftTime) {
      toast.error("Please fill all fields");
      return;
    }

    const selectedOfficer = officers.find(o => o.id === officerId);
    
    if (selectedOfficer) {
      onAdd({
        officerId,
        officerName: selectedOfficer.name,
        zone,
        shiftTime
      });
      setOpen(false);
      setOfficerId("");
      setZone("");
      setShiftTime("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="officer">Officer</Label>
            <Select value={officerId} onValueChange={setOfficerId}>
              <SelectTrigger id="officer">
                <SelectValue placeholder="Select Officer" />
              </SelectTrigger>
              <SelectContent>
                {officers.map(off => (
                  <SelectItem key={off.id} value={off.id}>{off.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zone">Zone</Label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger id="zone">
                <SelectValue placeholder="Select Zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map(z => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift">Shift Time</Label>
            <Select value={shiftTime} onValueChange={setShiftTime}>
              <SelectTrigger id="shift">
                <SelectValue placeholder="Select Time Slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(slot => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-4">Assign Officer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
