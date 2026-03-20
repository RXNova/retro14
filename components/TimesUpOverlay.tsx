
import React, { useEffect, useState } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimesUpOverlayProps {
    onDismiss: () => void;
}

export const TimesUpOverlay: React.FC<TimesUpOverlayProps> = ({ onDismiss }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onDismiss();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
            onClick={() => { setVisible(false); onDismiss(); }}
        >
            <div className="flex flex-col items-center gap-4 select-none animate-in zoom-in-95 duration-500">
                <div className="animate-bounce text-white"><TimerIcon size={80} strokeWidth={1.5} /></div>
                <div className="text-white text-5xl font-black tracking-tight drop-shadow-lg">
                    Time&apos;s Up!
                </div>
                <p className="text-white/60 text-sm">Click anywhere to dismiss</p>
            </div>
        </div>
    );
};
