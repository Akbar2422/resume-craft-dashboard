

## Supabase Setup Instructions

To set up the Supabase backend for this application:

1. **Create a "resumes" Storage Bucket**:
   - In your Supabase dashboard, go to the Storage section
   - Create a new bucket named "resumes"
   - Set the bucket permissions to allow authenticated users to upload/download
   - RLS policies should be configured to ensure users can only access their own files

2. **Auth Setup**:
   - Confirm Email/Password authentication is enabled in Authentication settings
   - Customize email templates and redirect URLs as needed

3. **Access Control**:
   - The app uses user IDs as folder names for file storage
   - Each user can only access files in their own folder
