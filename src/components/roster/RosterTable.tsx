import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export type AssignmentState = "Active" | "Scheduled" | "Completed";

export interface Assignment {
  id: string;
  officerName: string;
  officerId: string;
  zone: string;
  shiftTime: string;
  status: AssignmentState;
}

interface RosterTableProps {
  assignments: Assignment[];
  onDelete: (id: string) => void;
}

export function RosterTable({ assignments, onDelete }: RosterTableProps) {
  const getStatusColor = (status: AssignmentState) => {
    switch (status) {
      case "Active": return "bg-green-500 hover:bg-green-600";
      case "Scheduled": return "bg-blue-500 hover:bg-blue-600";
      case "Completed": return "bg-gray-500 hover:bg-gray-600";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Officer Name</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Shift Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No assignments found.
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.officerName}</TableCell>
                <TableCell>{assignment.officerId}</TableCell>
                <TableCell>{assignment.zone}</TableCell>
                <TableCell>{assignment.shiftTime}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(assignment.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
