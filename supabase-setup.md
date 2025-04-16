
# Supabase Setup Instructions

## Storage Setup

### 1. Create "resumes" Storage Bucket
1. Go to the Storage section in your Supabase dashboard
2. Click "Create Bucket" and name it "resumes"
3. Set Access Control to "Authenticated users only"

### 2. Set up Row Level Security (RLS) Policies
After creating the bucket, add these policies:

#### For SELECT operations (downloading resumes):
```sql
CREATE POLICY "Users can view their own resumes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### For INSERT operations (uploading resumes):
```sql
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'resumes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.extension(name) = 'pdf')
    AND (octet_length(contents) < 5242880) -- 5MB limit
);
```

#### For UPDATE operations (replacing resumes):
```sql
CREATE POLICY "Users can update their own resumes" 
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'resumes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'resumes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.extension(name) = 'pdf')
    AND (octet_length(contents) < 5242880)
);
```

#### For DELETE operations:
```sql
CREATE POLICY "Users can delete their own resumes" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'resumes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Authentication Setup

1. Go to Authentication → Settings in your Supabase dashboard
2. Ensure "Email" provider is enabled
3. Configure site URL and redirect URLs if needed
4. Customize email templates (optional)

## Testing the Setup

After implementing these settings, your application should:

1. Allow users to sign up and log in with email/password
2. Create user-specific folders in the "resumes" bucket automatically 
3. Allow users to upload/view/delete only their own resumes
