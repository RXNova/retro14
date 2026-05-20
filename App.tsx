import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { BoardPage } from './pages/BoardPage';
import { Terms } from './pages/Terms';
import { SprintSelection } from './components/SprintSelection';
import RequireAuth from './components/RequireAuth';

import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { dataService } from './services/dataService';
import { stringToColor } from './utils/colorUtils';
import { User } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Auth session
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return; }

    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // User profile + realtime sync
  useEffect(() => {
    if (!session?.user?.id) return;

    dataService.getUser(session.user.id).then(async (u) => {
      if (u) {
        setDbUser(u);
      } else {
        const newUser: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          color: stringToColor(session.user.id),
          role: 'Team Member',
          isHandRaised: false,
        };
        await dataService.upsertUser(newUser);
        setDbUser(newUser);
      }
    });

    const channel = supabase!
      .channel(`user:${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'retro_users', filter: `id=eq.${session.user.id}` }, (payload) => {
        if (payload.new) {
          const u = payload.new as any;
          setDbUser({
            id: u.id,
            name: u.name,
            color: u.color,
            role: u.role,
            isHandRaised: u.is_hand_raised || false,
            handRaisedAt: u.hand_raised_at ? new Date(u.hand_raised_at).getTime() : undefined,
          });
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [session]);

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    setDbUser(null);
    navigate('/auth/login');
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-n10">
        <Loader2 className="animate-spin text-b400" size={32} />
      </div>
    );
  }

  const appUser: User = session ? {
    id: session.user.id,
    name: dbUser?.name || session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
    role: dbUser?.role || 'Team Member',
    color: dbUser?.color || stringToColor(session.user.id),
    isHandRaised: dbUser?.isHandRaised || false,
    handRaisedAt: dbUser?.handRaisedAt,
  } : { id: 'temp', name: 'temp', role: 'Team Member', color: '#000', isHandRaised: false };

  const redirectPath = location.state?.from?.pathname || '/';

  return (
    <Routes>
      <Route path="/terms" element={<Terms />} />
      <Route path="/auth/*" element={<AuthPage session={session} redirectPath={redirectPath} />} />
      <Route path="/" element={
        session
          ? <SprintSelection user={appUser} onSprintSelected={(id, name, code) => navigate(`/${code}`)} onCancel={undefined} />
          : <LandingPage />
      } />
      <Route path="/:code" element={
        session
          ? <BoardPage user={appUser} onSignOut={handleSignOut} />
          : <RequireAuth />
      } />
    </Routes>
  );
};

export default App;
