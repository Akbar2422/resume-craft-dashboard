import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReminderData {
  id: string;
  title: string;
  reminderTime: Date;
  status: string;
  note?: string;
}

interface SupabaseReminderData {
  id: string;
  title: string;
  reminder_time: string;
  status: string;
  note?: string | null;
  user_id: string;
  application_id?: string | null;
  created_at: string;
}

export default function JobReminders() {
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    reminderTime: null as Date | null,
    note: ''
  });
  const [editingReminder, setEditingReminder] = useState<ReminderData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('reminder_time', { ascending: true });

    if (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: "Error",
        description: "Could not load reminders",
        variant: "destructive"
      });
      return;
    }

    if (data) {
      const formattedReminders: ReminderData[] = data.map((reminder: SupabaseReminderData) => ({
        id: reminder.id,
        title: reminder.title,
        reminderTime: new Date(reminder.reminder_time),
        status: reminder.status,
        note: reminder.note || undefined
      }));
      
      setReminders(formattedReminders);
    }
  };

  const saveReminder = async () => {
    if (!user || !newReminder.title || !newReminder.reminderTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        title: newReminder.title,
        reminder_time: newReminder.reminderTime.toISOString(),
        note: newReminder.note || null,
        status: 'Pending',
        user_id: user.id
      });

    if (error) {
      console.error('Error saving reminder:', error);
      toast({
        title: "Error",
        description: "Could not save reminder",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Reminder saved successfully"
    });

    fetchReminders();
    setNewReminder({
      title: '',
      reminderTime: null,
      note: ''
    });
  };

  const markReminderCompleted = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .update({ status: 'Completed' })
      .eq('id', id);

    if (error) {
      console.error('Error marking reminder as completed:', error);
      toast({
        title: "Error",
        description: "Could not update reminder",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Reminder marked as completed"
    });
    
    fetchReminders();
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reminder deleted successfully"
      });

      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive"
      });
    }
  };

  const handleEditReminder = async () => {
    if (!editingReminder?.id || !editingReminder.reminderTime) {
      toast({
        title: "Error",
        description: "Missing required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          title: editingReminder.title,
          reminder_time: editingReminder.reminderTime.toISOString(),
          note: editingReminder.note || null
        })
        .eq('id', editingReminder.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reminder updated successfully"
      });

      setIsEditDialogOpen(false);
      setEditingReminder(null);
      fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Application Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <Input 
              placeholder="Enter Job Title"
              value={newReminder.title}
              onChange={(e) => setNewReminder(prev => ({...prev, title: e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reminder Date & Time
            </label>
            <DatePicker 
              date={newReminder.reminderTime}
              setDate={(date) => setNewReminder(prev => ({...prev, reminderTime: date}))}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <Textarea 
              placeholder="Additional notes"
              value={newReminder.note}
              onChange={(e) => setNewReminder(prev => ({...prev, note: e.target.value}))}
            />
          </div>
        </div>
        <Button onClick={saveReminder}>Save Reminder</Button>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Upcoming Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Reminder Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No reminders found
                    </TableCell>
                  </TableRow>
                ) : (
                  reminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell>{reminder.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {reminder.reminderTime.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{reminder.status}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {reminder.status === 'Pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markReminderCompleted(reminder.id)}
                            >
                              Mark Completed
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingReminder(reminder);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReminder(reminder.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingReminder?.title || ''}
                  onChange={(e) => setEditingReminder(prev => 
                    prev ? { ...prev, title: e.target.value } : null
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reminder Time</label>
                <DatePicker
                  date={editingReminder?.reminderTime || null}
                  setDate={(date) => setEditingReminder(prev =>
                    prev ? { ...prev, reminderTime: date } : null
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={editingReminder?.note || ''}
                  onChange={(e) => setEditingReminder(prev =>
                    prev ? { ...prev, note: e.target.value } : null
                  )}
                />
              </div>
              <Button className="w-full" onClick={handleEditReminder}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
