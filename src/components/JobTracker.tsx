
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { PlusCircle, Loader2, Filter } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

type ApplicationStatus = "Applied" | "Interview" | "Rejected" | "Offer";

interface Application {
  id: string;
  job_title: string;
  company: string;
  applied_date: string;
  status: ApplicationStatus;
  notes: string | null;
  resume_id: string | null;
  cover_letter_id: string | null;
  follow_up_date: string | null;
}

export default function JobTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const { toast } = useToast();
  
  // New application form state
  const [newApplication, setNewApplication] = useState({
    job_title: "",
    company: "",
    applied_date: new Date(),
    status: "Applied" as ApplicationStatus,
    notes: "",
    resume_id: "",
    cover_letter_id: "",
    follow_up_date: null as Date | null
  });
  
  // Edit application state
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [availableResumes, setAvailableResumes] = useState<{id: string, name: string}[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  useEffect(() => {
    fetchApplications();
    fetchAvailableResumes();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('applied_date', { ascending: false });
      
      if (error) throw error;
      
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Failed to load applications",
        description: "There was an error loading your job applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableResumes = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;
      
      const { data: resumeVersions, error } = await supabase
        .from('resume_versions')
        .select('id, original_filename');
      
      if (error) throw error;
      
      if (resumeVersions) {
        setAvailableResumes(resumeVersions.map(r => ({
          id: r.id,
          name: r.original_filename
        })));
      }
    } catch (error) {
      console.error('Error fetching available resumes:', error);
    }
  };
  
  const handleAddApplication = async () => {
    try {
      setSubmitLoading(true);
      
      if (!newApplication.job_title || !newApplication.company) {
        toast({
          title: "Missing fields",
          description: "Job title and company are required",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_title: newApplication.job_title,
          company: newApplication.company,
          applied_date: format(newApplication.applied_date, 'yyyy-MM-dd'),
          status: newApplication.status,
          notes: newApplication.notes || null,
          resume_id: newApplication.resume_id || null,
          cover_letter_id: newApplication.cover_letter_id || null,
          follow_up_date: newApplication.follow_up_date ? format(newApplication.follow_up_date, 'yyyy-MM-dd') : null
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Application added",
        description: "Your job application has been added successfully",
      });
      
      // Reset form
      setNewApplication({
        job_title: "",
        company: "",
        applied_date: new Date(),
        status: "Applied" as ApplicationStatus,
        notes: "",
        resume_id: "",
        cover_letter_id: "",
        follow_up_date: null
      });
      
      setIsAddDialogOpen(false);
      
      // Refresh applications list
      fetchApplications();
    } catch (error) {
      console.error('Error adding application:', error);
      toast({
        title: "Failed to add application",
        description: "There was an error adding your job application",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleUpdateApplication = async () => {
    if (!editingApplication) return;
    
    try {
      setSubmitLoading(true);
      
      const { error } = await supabase
        .from('applications')
        .update({
          job_title: editingApplication.job_title,
          company: editingApplication.company,
          status: editingApplication.status,
          notes: editingApplication.notes,
          resume_id: editingApplication.resume_id,
          cover_letter_id: editingApplication.cover_letter_id,
          follow_up_date: editingApplication.follow_up_date
        })
        .eq('id', editingApplication.id);
      
      if (error) throw error;
      
      toast({
        title: "Application updated",
        description: "Your job application has been updated successfully",
      });
      
      setIsEditDialogOpen(false);
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Failed to update application",
        description: "There was an error updating your job application",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleEditClick = (application: Application) => {
    setEditingApplication(application);
    setIsEditDialogOpen(true);
  };

  const filteredApplications = statusFilter === "All" 
    ? applications 
    : applications.filter(app => app.status === statusFilter);
  
  // Status badge color mapping
  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case "Applied": return "bg-blue-500 hover:bg-blue-600";
      case "Interview": return "bg-amber-500 hover:bg-amber-600";
      case "Rejected": return "bg-red-500 hover:bg-red-600";
      case "Offer": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Job Applications Tracker</h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "All")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Job Application</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title *</Label>
                    <Input 
                      id="job_title" 
                      value={newApplication.job_title} 
                      onChange={(e) => setNewApplication({...newApplication, job_title: e.target.value})}
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input 
                      id="company" 
                      value={newApplication.company} 
                      onChange={(e) => setNewApplication({...newApplication, company: e.target.value})}
                      placeholder="e.g. Acme Inc."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Application Date</Label>
                    <DatePicker
                      date={newApplication.applied_date}
                      setDate={(date) => setNewApplication({...newApplication, applied_date: date || new Date()})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newApplication.status} 
                      onValueChange={(value) => setNewApplication({
                        ...newApplication, 
                        status: value as ApplicationStatus
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Offer">Offer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume</Label>
                  <Select 
                    value={newApplication.resume_id} 
                    onValueChange={(value) => setNewApplication({...newApplication, resume_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resume (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {availableResumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>{resume.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Follow-up Date (Optional)</Label>
                    <DatePicker
                      date={newApplication.follow_up_date}
                      setDate={(date) => setNewApplication({...newApplication, follow_up_date: date})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    value={newApplication.notes} 
                    onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                    placeholder="Any additional notes about this application..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddApplication}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Add Application"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center p-8">
              <h3 className="font-medium text-lg mb-2">No job applications found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "All" 
                  ? "Start tracking your job search by adding your first application" 
                  : `No applications with status "${statusFilter}" found`}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Application
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Follow Up</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow 
                      key={application.id}
                      onClick={() => handleEditClick(application)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{application.job_title}</TableCell>
                      <TableCell>{application.company}</TableCell>
                      <TableCell>{format(new Date(application.applied_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(application.status)}>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {application.follow_up_date ? (
                          format(new Date(application.follow_up_date), 'MMM d, yyyy')
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(application);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Application Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Job Application</DialogTitle>
          </DialogHeader>
          {editingApplication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_job_title">Job Title</Label>
                  <Input 
                    id="edit_job_title" 
                    value={editingApplication.job_title} 
                    onChange={(e) => setEditingApplication({
                      ...editingApplication, 
                      job_title: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_company">Company</Label>
                  <Input 
                    id="edit_company" 
                    value={editingApplication.company} 
                    onChange={(e) => setEditingApplication({
                      ...editingApplication, 
                      company: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select 
                  value={editingApplication.status} 
                  onValueChange={(value) => setEditingApplication({
                    ...editingApplication, 
                    status: value as ApplicationStatus
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interview">Interview</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Follow-up Date (Optional)</Label>
                <DatePicker
                  date={editingApplication.follow_up_date ? new Date(editingApplication.follow_up_date) : null}
                  setDate={(date) => setEditingApplication({
                    ...editingApplication, 
                    follow_up_date: date ? format(date, 'yyyy-MM-dd') : null
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea 
                  id="edit_notes" 
                  value={editingApplication.notes || ''} 
                  onChange={(e) => setEditingApplication({
                    ...editingApplication, 
                    notes: e.target.value
                  })}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateApplication}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : "Update Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
