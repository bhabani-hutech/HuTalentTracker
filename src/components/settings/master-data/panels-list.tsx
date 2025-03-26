import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { PanelForm } from "./panel-form";
import { usePanels } from "@/lib/api/hooks/usePanels";
import { InterviewPanel } from "@/lib/api/panels";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PanelsList() {
  const { panels, isLoading, deletePanel, isDeleting } = usePanels();
  const [activePanel, setActivePanel] = useState<InterviewPanel | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [panelToDelete, setPanelToDelete] = useState<InterviewPanel | null>(
    null,
  );

  const handleEdit = (panel: InterviewPanel) => {
    setActivePanel(panel);
    setIsFormOpen(true);
  };

  const handleDelete = (panel: InterviewPanel) => {
    setPanelToDelete(panel);
  };

  const confirmDelete = () => {
    if (panelToDelete) {
      deletePanel(panelToDelete.id);
      setPanelToDelete(null);
    }
  };

  const handleFormClose = () => {
    setActivePanel(null);
    setIsFormOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Interview Panels</CardTitle>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Panel
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading panels...</span>
            </div>
          ) : panels && panels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Panel Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {panels.map((panel) => (
                  <TableRow key={panel.id}>
                    <TableCell className="font-medium">{panel.name}</TableCell>
                    <TableCell>
                      {panel.department_name ||
                        (panel.department_id
                          ? `Department ID: ${panel.department_id}`
                          : "N/A")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {panel.member_names?.length ||
                          panel.members?.length ||
                          0}{" "}
                        members
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(panel)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(panel)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No interview panels found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <PanelForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        initialData={activePanel}
      />

      <AlertDialog
        open={!!panelToDelete}
        onOpenChange={(open) => !isDeleting && setPanelToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the interview panel "
              {panelToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
