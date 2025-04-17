
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, User, Award, LogOut } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";

interface ResumeFile {
  name: string;
  url: string;
  content: string;
}

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

// Mock components to fix build errors
const ResumeUploader = ({ onUploadSuccess }: { onUploadSuccess: (file: ResumeFile) => void }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground">Resume uploader component placeholder</p>
          <Button 
            className="mt-4" 
            onClick={() => onUploadSuccess({name: "resume.pdf", url: "#", content: "Sample resume content"})}
          >
            Upload Resume
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ResumeViewer = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Resume viewer component placeholder</p>
      </CardContent>
    </Card>
  );
};

const ResumeTweaker = ({ resumeContent, fileName }: { resumeContent: string, fileName: string }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Resume tweaker component placeholder</p>
        <p>Filename: {fileName}</p>
      </CardContent>
    </Card>
  );
};

const JobTracker = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Job tracker component placeholder</p>
      </CardContent>
    </Card>
  );
};

const CoverLetterGenerator = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Cover letter generator component placeholder</p>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [uploadedResume, setUploadedResume] = useState<ResumeFile | null>(null);
  const [legendPoints, setLegendPoints] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<Array<{user_id: string, total_points: number}>>([]);
  const [gmailToken, setGmailToken] = useState('');
  const [emailResponses, setEmailResponses] = useState<Array<{
    subject: string;
    sender: string;
    bodyPreview: string;
    receivedAt: string;
  }>>([
    {
      subject: "Interview Invitation – Frontend Developer",
      sender: "careers@company.com",
      bodyPreview: "We're happy to invite you for an interview scheduled on...",
      receivedAt: "2025-04-15 09:32 AM"
    }
  ]);
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    reminderTime: null as Date | null,
    note: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchLegendPoints();
      fetchLeaderboard();
      fetchReminders();
    }
  }, [user]);

  const fetchLegendPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('legend_points')
        .select('total_points')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching legend points:', error);
        return;
      }

      setLegendPoints(data?.total_points || 0);
    } catch (error) {
      console.error('Error in fetchLegendPoints:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('legend_points')
        .select('user_id, total_points')
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error in fetchLeaderboard:', error);
    }
  };

  const fetchReminders = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('reminder_time', { ascending: true });

    if (error) {
      console.error('Error fetching reminders:', error);
      return;
    }

    if (data) {
      // Convert Supabase data format to our local state format
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
    if (!user || !newReminder.title || !newReminder.reminderTime) return;

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        title: newReminder.title,
        reminder_time: newReminder.reminderTime.toISOString(),
        note: newReminder.note || null,
        status: 'Pending',
        user_id: user.id // Add user_id to fix insertion error
      });

    if (error) {
      console.error('Error saving reminder:', error);
      return;
    }

    fetchReminders();
    setNewReminder({
      title: '',
      reminderTime: null,
      note: ''
    });
  };

  const markReminderCompleted = async (id: string) => {
    const { data, error } = await supabase
      .from('reminders')
      .update({ status: 'Completed' })
      .eq('id', id);

    if (error) {
      console.error('Error marking reminder as completed:', error);
      return;
    }
    
    fetchReminders();
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleResumeUpload = (fileInfo: ResumeFile) => {
    setUploadedResume(fileInfo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Resume Craft</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                <Award className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">
                  Legend Score: {legendPoints} pts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upload">Upload Resume</TabsTrigger>
            <TabsTrigger value="manage">Manage Resume</TabsTrigger>
            <TabsTrigger value="improve">Improve Resume</TabsTrigger>
            <TabsTrigger value="tracker">Job Tracker</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="hr-responses">HR Responses</TabsTrigger>
            <TabsTrigger value="job-reminders">Job Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <ResumeUploader onUploadSuccess={handleResumeUpload} />
          </TabsContent>
          
          <TabsContent value="manage">
            <ResumeViewer />
          </TabsContent>
          
          <TabsContent value="improve">
            {uploadedResume ? (
              <ResumeTweaker 
                resumeContent={uploadedResume.content}
                fileName={uploadedResume.name}
              />
            ) : (
              <div className="text-center p-12">
                <p className="text-muted-foreground">
                  Please upload a resume first to use the improvement feature
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tracker">
            <JobTracker />
          </TabsContent>
          
          <TabsContent value="cover-letter">
            <CoverLetterGenerator />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Legend Leaderboard</h2>
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.user_id} className="flex items-center space-x-4 py-2 border-b">
                      <span className="text-sm font-medium w-8">{index + 1}.</span>
                      <span className="flex-1 text-sm">
                        {entry.user_id === user?.id ? 'You' : 'User'}
                      </span>
                      <span className="text-sm font-semibold">
                        {entry.total_points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hr-responses">
            <Card>
              <CardHeader>
                <CardTitle>Email Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  🔒 Gmail Integration Not Active Yet. Paste Gmail App Password or OAuth Token below to enable.
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Paste Gmail App Password or OAuth Token
                  </label>
                  <Input 
                    placeholder="Enter Gmail Token" 
                    value={gmailToken}
                    onChange={(e) => setGmailToken(e.target.value)}
                  />
                  <Button disabled>Enable Gmail Sync</Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Example HR Responses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Sender</TableHead>
                          <TableHead>Preview</TableHead>
                          <TableHead>Received At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailResponses.map((response, index) => (
                          <TableRow key={index}>
                            <TableCell>{response.subject}</TableCell>
                            <TableCell>{response.sender}</TableCell>
                            <TableCell>{response.bodyPreview}</TableCell>
                            <TableCell>{response.receivedAt}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="job-reminders">
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
                        {reminders.map((reminder) => (
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
                              {reminder.status === 'Pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => markReminderCompleted(reminder.id)}
                                >
                                  Mark Completed
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
