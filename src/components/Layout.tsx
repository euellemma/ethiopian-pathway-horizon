
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true, title }) => {
  const { onboardingCompleted, totalPoints, clearAllData } = useStore();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-horizon-red">Horizon</h1>
        </Link>
        
        {onboardingCompleted && showNavigation && (
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 rounded-full px-4 py-1 flex items-center">
              <span className="font-medium text-sm text-gray-700">
                {totalPoints} points
              </span>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your data, including your profile, progress, and interview records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    clearAllData();
                    window.location.href = '/';
                  }} className="bg-red-600 hover:bg-red-700">
                    Delete All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </header>
      
      {/* Page title */}
      {title && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Horizon - US College Visa Interview Prep
        </p>
      </footer>
    </div>
  );
};

export default Layout;
