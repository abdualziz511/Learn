import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faSignOutAlt, faBell, faSearch, faBars } from '@fortawesome/free-solid-svg-icons';

const DashboardLayout = ({ children, sidebar: Sidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2);
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: 'المدير العام',
      school_admin: 'مدير المدرسة',
      teacher: 'معلم',
      student: 'طالب',
      parent: 'ولي أمر',
    };
    return labels[role] || role;
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop d-lg-none" 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1040
          }}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`} style={{ 
        width: 'var(--sidebar-width)', 
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="d-flex align-items-center gap-2 mb-1">
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'Cairo, sans-serif', fontWeight: 900, fontSize: 16
            }}>S</div>
            <div>
              <h4 style={{ fontSize: '1rem' }}>المدارس الذكية</h4>
              <div className="text-muted" style={{ fontSize: 10, marginTop: -2 }}>Smart School System</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '0.75rem 1.25rem', marginBottom: '0.5rem' }}>
          <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'var(--primary-light)' }}>
            <div className="avatar" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', fontSize: 12 }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'مستخدم'}
              </div>
              <div className="text-muted" style={{ fontSize: 11 }}>{getRoleLabel(user?.role)}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-grow-1 overflow-y-auto" onClick={() => setIsSidebarOpen(false)}>
          {Sidebar && <Sidebar />}
        </nav>

        {/* Logout at bottom */}
        <div style={{ padding: '0.75rem' }}>
          <button
            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: 'var(--danger)',
              border: '1px solid rgba(239,68,68,0.15) !important',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Header */}
        <header className="dashboard-header d-flex justify-content-between align-items-center py-2 px-3">
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn d-lg-none p-0 text-muted" 
              onClick={() => setIsSidebarOpen(true)}
              style={{ fontSize: '1.5rem' }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                مرحباً، <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0] || 'المستخدم'}</span> 👋
              </div>
              <div className="text-muted d-none d-sm-block" style={{ fontSize: 11 }}>
                {new Date().toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="theme-toggle" onClick={toggleTheme}>
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow-1 p-3 p-md-4" style={{ overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
