import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Play } from "lucide-react";

interface AutoAssignControlsProps {
  onAutoAssign: () => void;
  onRotateNow: () => void;
  rotationInterval: string;
  setRotationInterval: (val: string) => void;
}

export function AutoAssignControls({ 
  onAutoAssign, 
  onRotateNow, 
  rotationInterval, 
  setRotationInterval 
}: AutoAssignControlsProps) {
  return (
    <Card className="mb-6 bg-secondary/20">
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button onClick={onAutoAssign} className="w-full md:w-auto bg-primary">
            <Play className="mr-2 h-4 w-4" /> 
            Auto-Assign Officers
          </Button>
          <div className="text-sm text-muted-foreground hidden lg:block">
            Algorithm uses: Availability, Fatigue, Zone priority
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
          <div className="flex items-center gap-2">
            <Label htmlFor="rotation-interval" className="whitespace-nowrap">Auto Rotation:</Label>
            <Select value={rotationInterval} onValueChange={setRotationInterval}>
              <SelectTrigger id="rotation-interval" className="w-[120px] h-9">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every 1 hr</SelectItem>
                <SelectItem value="2">Every 2 hrs</SelectItem>
                <SelectItem value="4">Every 4 hrs</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={onRotateNow} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Rotate Now
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
