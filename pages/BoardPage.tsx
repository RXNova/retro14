import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RetroPage } from './RetroPage';
import { dataService } from '../services/dataService';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { Loader2 } from 'lucide-react';

interface BoardPageProps {
  user: User;
  onSignOut: () => void;
}

export const BoardPage: React.FC<BoardPageProps> = ({ user, onSignOut }) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState<{ id: string; name: string; code: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    if (!/^[a-z0-9-]{4,20}$/i.test(code)) {
      navigate('/', { replace: true });
      return;
    }

    const normalizedCode = code.toLowerCase();
    setLoading(true);

    dataService.joinSprint(normalizedCode).then((s) => {
      if (s) {
        setSprint({ id: s.id, name: s.name, code: s.code });
        supabase
          ?.from('sprint_participants')
          .upsert([{ sprint_id: s.id, user_id: user.id }], { onConflict: 'sprint_id,user_id' })
          .then(({ error }) => {
            if (error) console.error('Error ensuring participant:', error);
          });
      } else {
        console.warn('Board not found');
        navigate('/', { replace: true });
      }
      setLoading(false);
    });
  }, [code, user.id, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-n10">
        <Loader2 className="animate-spin text-b400" size={32} />
      </div>
    );
  }

  if (!sprint) return null;

  return (
    <RetroPage
      user={user}
      sprintId={sprint.id}
      sprintName={sprint.name}
      sprintCode={sprint.code}
      onSwitchSprint={() => navigate('/')}
      onSignOut={onSignOut}
    />
  );
};
