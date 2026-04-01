import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const specializationNames = {
  it: 'Information Technology',
  se: 'Software Engineering',
  ds: 'Data Science',
  cyber: 'Cyber Security',
  im: 'Interactive Media',
  cs: 'Computer Science',
  csne: 'CSNE',
  ise: 'ISE',
};

const specializationEmojis = {
  it: '🖥️',
  se: '💻',
  ds: '📊',
  cyber: '🔐',
  im: '🎨',
  cs: '🧑‍💻',
  csne: '🌐',
  ise: '💼',
};

const navItems = [
  {
    id: 'calculator',
    label: 'GPA Calculator',
    shortLabel: 'Calculator',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-6.75V4.5A2.25 2.25 0 0012.75 2h-1.5A2.25 2.25 0 009 4.5v.75m6.75 0h-6.75m6.75 0v13.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V5.25" />
      </svg>
    ),
  },
  {
    id: 'analyzer',
    label: 'Analyzer',
    shortLabel: 'Analyzer',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    id: 'predictor',
    label: 'Target Predictor',
    shortLabel: 'Predictor',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
];

const Layout = ({ children, activeTab, onTabChange }) => {
  const { specialization, syllabusType } = useParams();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const specName = specializationNames[specialization] || 'Unknown';
  const specEmoji = specializationEmojis[specialization] || '📚';
  const syllabusLabel = syllabusType === 'new' ? 'New Syllabus' : 'Old Syllabus';

  return (
    <div className="min-h-screen bg-[#F7F9FB]">

      {/* Top bar — shows active program + sub-tab navigation */}
      <div className="sticky top-0 z-30 bg-[#F7F9FB]/90 backdrop-blur-md border-b border-gray-200/40">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Top row: breadcrumb + program badge */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#6B7280] font-medium">Academic Performance</span>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-semibold text-[#1C2A39]">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>

            {/* Active program badge */}
            <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200/80 rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-base">{specEmoji}</span>
              <span className="text-xs font-semibold text-[#1C2A39]">{specName}</span>
              <span className="text-[10px] text-[#6B7280] bg-[#F7F9FB] px-2 py-0.5 rounded-full font-medium">
                {syllabusLabel}
              </span>
              <button
                onClick={() => navigate('/')}
                className="text-[10px] font-semibold text-[#6B7280] hover:text-[#1E3A5F] transition-colors ml-1"
              >
                Change
              </button>
            </div>
          </div>

          {/* Sub-tabs row */}
          <div className="flex items-center gap-1 pb-2 -mb-px overflow-x-auto scrollbar-none">
            {navItems.map((item, i) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                    transition-all duration-200 ease-out whitespace-nowrap
                    ${isActive
                      ? 'bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73] text-white shadow-md shadow-[#1E3A5F]/15'
                      : 'text-[#6B7280] hover:text-[#1C2A39] hover:bg-white/80'
                    }
                  `}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                    transition: `opacity 0.35s ease ${i * 60 + 100}ms, transform 0.35s ease ${i * 60 + 100}ms, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease`,
                  }}
                >
                  <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#6B7280]'}`}>
                    {item.icon}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div
        className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease 150ms, transform 0.5s ease 150ms',
        }}
      >
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200/60">
        <div className="flex items-center justify-around px-2 h-16 pb-safe">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-[64px] relative
                  transition-all duration-200
                  ${isActive ? 'text-[#1E3A5F]' : 'text-[#6B7280]'}
                `}
              >
                {isActive && (
                  <span className="absolute inset-x-1 inset-y-0 rounded-xl bg-[#1E3A5F]/8" />
                )}
                <span className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`relative text-[10px] font-semibold ${isActive ? 'text-[#1E3A5F]' : 'text-[#6B7280]'}`}>
                  {item.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#2BB673]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile bottom nav spacer */}
      <div className="sm:hidden h-16" />
    </div>
  );
};

export default Layout;