import React from 'react';
import { Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { Auth } from '../components/Auth';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { AlertCircle } from 'lucide-react';

interface AuthPageProps {
  session: Session | null;
  redirectPath: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ session, redirectPath }) => {
  if (!isSupabaseConfigured) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-n10 p-4 text-center">
        <AlertCircle size={48} className="text-r500 mb-4" />
        <h1 className="text-2xl font-bold text-n800 mb-2">Configuration Required</h1>
        <p className="text-n600 max-w-md">
          Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
        </p>
      </div>
    );
  }

  if (session) return <Navigate to={redirectPath} replace />;

  return <Auth />;
};
