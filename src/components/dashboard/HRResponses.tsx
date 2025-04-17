
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EmailResponse {
  subject: string;
  sender: string;
  bodyPreview: string;
  receivedAt: string;
}

export default function HRResponses() {
  const [gmailToken, setGmailToken] = useState('');
  const [emailResponses] = useState<EmailResponse[]>([
    {
      subject: "Interview Invitation – Frontend Developer",
      sender: "careers@company.com",
      bodyPreview: "We're happy to invite you for an interview scheduled on...",
      receivedAt: "2025-04-15 09:32 AM"
    }
  ]);

  return (
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
  );
}
