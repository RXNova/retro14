import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Users, Vote, Timer, Layers, Download,
  ArrowRight, Check,
} from 'lucide-react';

const FEATURES = [
  { icon: <Zap size={16} />,       title: 'Real-time sync',       desc: 'Every card, vote and reaction appears instantly for every participant.' },
  { icon: <Vote size={16} />,      title: 'Structured voting',    desc: 'Set limits, enable anonymous mode, auto-end when everyone is done.' },
  { icon: <Timer size={16} />,     title: 'Built-in timer',       desc: 'Shared countdown visible to the whole room. Pause and resume anytime.' },
  { icon: <Layers size={16} />,    title: 'Card grouping',        desc: 'Drag cards together to surface themes. Merge groups in one drop.' },
  { icon: <Users size={16} />,     title: 'Live participants',    desc: 'See who is in the room, raise hands and manage turn-taking live.' },
  { icon: <Download size={16} />,  title: 'Export results',       desc: 'Download PDF or copy to clipboard. Share with a code, no account to join.' },
];

const STEPS = [
  { n: '1', title: 'Create a board',   desc: 'Name your sprint and get a shareable code in seconds.' },
  { n: '2', title: 'Share the code',   desc: 'Teammates join from any browser — no install, no account needed.' },
  { n: '3', title: 'Run the retro',    desc: 'Add cards, vote, group themes and track action items live.' },
  { n: '4', title: 'Export & wrap up', desc: 'Save results to PDF or clipboard before you close the tab.' },
];


export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-n800">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-n40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

          <a href="#" className="flex items-center gap-2">
            <picture>
              <source srcSet="/logo-auth.svg" type="image/svg+xml" />
              <img src="/logo-auth-40.png" alt="Retro14" className="w-6 h-6" />
            </picture>
            <span className="font-bold text-sm text-n800">Retro14</span>
          </a>

          <button
            onClick={() => navigate('/auth/login')}
            className="px-3.5 py-2 text-xs font-semibold text-n700 border border-n40 hover:border-n100 hover:bg-n10 rounded-[3px] transition-colors"
          >
            Log in
          </button>

        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-16 text-center">
        <img
          src="/landing_image.png"
          alt="Retro14 board"
          className="w-full max-w-xl mx-auto mb-8"
        />

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-n500 border border-n40 bg-n10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-g200" />
            Free &amp; open source
          </span>
          <a
            href="https://github.com/RXNova/retro14"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-n500 border border-n40 bg-n10 px-3 py-1 rounded-full hover:border-n100 hover:text-n800 transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>

        <h1 className="text-4xl md:text-[52px] font-bold tracking-tight text-n800 leading-[1.15] max-w-2xl mx-auto mb-5">
          Retrospectives your<br className="hidden sm:block" /> team will love
        </h1>

        <p className="text-base text-n400 max-w-md mx-auto mb-10 leading-relaxed">
          A real-time collaborative retro tool for agile teams.
          Create a board, share a code, and start in seconds.
        </p>

        <button
          onClick={() => navigate('/auth/register')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-b400 hover:bg-b500 text-white text-sm font-semibold rounded-[3px] transition-colors shadow-sm"
        >
          Get started for free <ArrowRight size={15} />
        </button>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-xs text-n400">
          {['No credit card', 'Self-hostable', 'Real-time sync'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <Check size={11} className="text-g200" strokeWidth={3} />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-n10 border-y border-n40">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-bold text-b400 uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-2xl md:text-3xl font-bold text-n800 tracking-tight max-w-sm">
              Everything a retro needs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-n40">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white p-6 hover:bg-n10 transition-colors">
                <div className="text-b400 mb-4">{f.icon}</div>
                <h3 className="text-sm font-semibold text-n800 mb-1.5">{f.title}</h3>
                <p className="text-xs text-n400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-bold text-b400 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-2xl md:text-3xl font-bold text-n800 tracking-tight max-w-sm">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map(s => (
              <div key={s.n}>
                <div className="w-8 h-8 rounded-full bg-b50 text-b400 text-xs font-bold flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="text-sm font-semibold text-n800 mb-1.5">{s.title}</h3>
                <p className="text-xs text-n400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-n40 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-n400">
          <div className="flex items-center gap-2">
            <picture>
              <source srcSet="/logo-auth.svg" type="image/svg+xml" />
              <img src="/logo-auth-40.png" alt="Retro14" className="w-4 h-4 opacity-50" />
            </picture>
            <span className="font-semibold text-n500">Retro14</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/RXNova/retro14"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-n600 transition-colors"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
            <a href="/terms" className="hover:text-n600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
