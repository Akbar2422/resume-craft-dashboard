import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Upload, Download } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <h1 className="text-xl font-bold text-gray-900">Resume Craft</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between py-16">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Manage your resume simply and securely
              </h2>
              <p className="mt-5 text-xl text-gray-500">
                Upload, store, and access your resume anytime, anywhere. 
                Perfect for job seekers who want to have their professional documents ready at a moment's notice.
              </p>
              <div className="mt-8 flex space-x-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="px-8"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="px-8"
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="rounded-lg bg-gray-100 p-8 shadow-lg w-full max-w-md">
                <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-6">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Easy Upload</h3>
                      <p className="text-sm text-gray-500">
                        Upload your resume in seconds and keep it securely stored
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Download className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Instant Access</h3>
                      <p className="text-sm text-gray-500">
                        Access and download your resume whenever you need it
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 Resume Craft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
