import { NavLink } from 'react-router-dom';

const Sidebar = ({ isAdmin, onNavigate }) => {
  const primaryMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠', to: '/dashboard', type: 'route' },
    { key: 'stress', label: 'Stress Management', icon: '🌿', to: '/stress-management', type: 'route' },
    { key: 'academic', label: 'Academic Performance', icon: '📘', to: '/academic-performance', type: 'route' },
    { key: 'ai-quizzes', label: 'AI Quizzes', icon: '🤖', to: '/ai-quizzes', type: 'route' },
    { key: 'flashcards', label: 'Flashcards', icon: '🃏', to: '/flashcards', type: 'route' },
    { key: 'career', label: 'Career Guidance', icon: '🎯', to: '/career-guidance', type: 'route' }
  ];

  const secondaryMenuItems = [
    { key: 'reports', label: isAdmin ? 'Reports' : 'Progress Reports', icon: '📊', to: isAdmin ? '/admin' : null, type: isAdmin ? 'route' : 'placeholder' },
    { key: 'profile', label: 'Profile', icon: '👤', to: '/profile', type: 'route' },
    { key: 'settings', label: 'Settings', icon: '⚙️', type: 'placeholder' }
  ];

  return (
    <aside className="dashboard-sidebar" aria-label="Sidebar">
      <div className="sidebar-logo-section">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo-circle">
            <img src="/logo.png" alt="UniWell Logo" className="sidebar-logo-img" />
          </div>
          <div className="sidebar-logo-text">
            <h1>UniWell</h1>
            <p>Student Management System</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-group-title">Main</p>
        <ul>
          {primaryMenuItems.map((item) => (
            <li key={item.key}>
              {item.type === 'route' ? (
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
                >
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </NavLink>
              ) : (
                <button type="button" className="sidebar-link is-disabled" disabled>
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <nav className="sidebar-nav sidebar-nav-secondary">
        <p className="sidebar-group-title">Account</p>
        <ul>
          {secondaryMenuItems.map((item) => (
            <li key={item.key}>
              {item.type === 'route' ? (
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
                >
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </NavLink>
              ) : (
                <button type="button" className="sidebar-link is-disabled" disabled>
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-wellness-card">
        <p className="wellness-title">Your mind matters.</p>
        <p className="wellness-text">Balance your mind, boost your future.</p>
      </div>
    </aside>
  );
};

export default Sidebar;


















// import { useState, useEffect } from 'react';

// const Sidebar = ({ isAcademicActive = true, onAcademicClick, sidebarOpen, onCloseSidebar }) => {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setMounted(true), 80);
//     return () => clearTimeout(t);
//   }, []);

//   const primaryMenuItems = [
//     { key: 'dashboard', label: 'Dashboard', icon: '🏠', type: 'placeholder' },
//     { key: 'stress', label: 'Stress Management', icon: '🌿', type: 'placeholder' },
//     { key: 'academic', label: 'Academic Performance', icon: '📘', type: 'active' },
//     { key: 'neuro', label: 'Neuro Card', icon: '🧠', type: 'placeholder' },
//     { key: 'quiz', label: 'AI Quizzes', icon: '🤖', type: 'placeholder' },
//     { key: 'career', label: 'Career Guidance', icon: '🎯', type: 'placeholder' }
//   ];

//   const secondaryMenuItems = [
//     { key: 'reports', label: 'Progress Reports', icon: '📊', type: 'placeholder' },
//     { key: 'profile', label: 'Profile', icon: '👤', type: 'placeholder' },
//     { key: 'settings', label: 'Settings', icon: '⚙️', type: 'placeholder' }
//   ];

//   return (
//     <aside className="dashboard-sidebar" aria-label="Sidebar">
//       <div className="sidebar-logo-section">
//         <div className="sidebar-logo-wrap">
//           <div className="sidebar-logo-circle">
//             <img src="/logo.png" alt="UniWell Logo" className="sidebar-logo-img" />
//           </div>
//           <div className="sidebar-logo-text">
//             <h1>UniWell</h1>
//             <p>Student Management System</p>
//           </div>
//         </div>
//       </div>

//       <nav className="sidebar-nav">
//         <p className="sidebar-group-title">Main</p>
//         <ul>
//           {primaryMenuItems.map((item, i) => (
//             <li key={item.key}>
//               {item.type === 'active' ? (
//                 <button
//                   type="button"
//                   onClick={onAcademicClick}
//                   className={`sidebar-link ${isAcademicActive ? 'is-active' : ''}`}
//                   style={{
//                     opacity: mounted ? 1 : 0,
//                     transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
//                     transition: `opacity 0.35s ease ${i * 50 + 100}ms, transform 0.35s ease ${i * 50 + 100}ms, background 0.25s ease`,
//                   }}
//                 >
//                   <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
//                   <span className="sidebar-link-text">{item.label}</span>
//                 </button>
//               ) : (
//                 <button
//                   type="button"
//                   className="sidebar-link is-disabled"
//                   disabled
//                   style={{
//                     opacity: mounted ? 0.68 : 0,
//                     transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
//                     transition: `opacity 0.35s ease ${i * 50 + 100}ms, transform 0.35s ease ${i * 50 + 100}ms`,
//                   }}
//                 >
//                   <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
//                   <span className="sidebar-link-text">{item.label}</span>
//                   <span className="sidebar-soon-badge">Soon</span>
//                 </button>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>

//       <nav className="sidebar-nav sidebar-nav-secondary">
//         <p className="sidebar-group-title">Account</p>
//         <ul>
//           {secondaryMenuItems.map((item, i) => (
//             <li key={item.key}>
//               <button
//                 type="button"
//                 className="sidebar-link is-disabled"
//                 disabled
//                 style={{
//                   opacity: mounted ? 0.68 : 0,
//                   transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
//                   transition: `opacity 0.35s ease ${i * 50 + 400}ms, transform 0.35s ease ${i * 50 + 400}ms`,
//                 }}
//               >
//                 <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
//                 <span className="sidebar-link-text">{item.label}</span>
//                 <span className="sidebar-soon-badge">Soon</span>
//               </button>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       <div className="sidebar-wellness-card">
//         <p className="wellness-title">Your mind matters.</p>
//         <p className="wellness-text">Balance your mind, boost your future.</p>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
