import { Link, useLocation } from 'react-router-dom';
import { Calendar, Settings, FileText, Search, BookOpen, Columns, Trello } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { useTimezone } from '../contexts/TimezoneContext';

const Navigation = () => {
  const location = useLocation();
  const { timezone } = useTimezone();
  const now = new Date();
  const today = formatInTimeZone(now, timezone, 'yyyy-MM-dd');
  const dayName = formatInTimeZone(now, timezone, 'EEEE'); // Full day name like "Monday"

  return (
    <nav className="shadow-sm" style={{ backgroundColor: 'var(--color-card-bg)', borderBottom: '1px solid var(--color-border-primary)' }}>
      <div className="px-2 sm:px-4" style={{ minWidth: '1200px' }}>
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link 
            to="/" 
            className="flex items-center px-2 py-2 rounded-lg transition-colors"
            style={{
              color: location.pathname === '/' ? 'var(--color-accent)' : 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
            title="Track the Thing"
          >
            <svg width="900" height="240" viewBox="0 0 900 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 sm:h-14 w-auto">
              <g transform="translate(110, 30)">
                <rect x="0" y="0" width="240" height="160" rx="20" stroke="currentColor" strokeWidth="12" fill="none"/>
                <text x="120" y="100" fontFamily="Arial, sans-serif" fontSize="135" fontWeight="bold" fill="currentColor" textAnchor="middle" dominantBaseline="middle">TtT</text>
                <rect x="90" y="160" width="60" height="20" rx="10" fill="currentColor"/>
              </g>
              <text x="400" y="90" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="currentColor">Track</text>
              <text x="400" y="150" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="currentColor">the</text>
              <text x="400" y="210" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="currentColor">Thing</text>
            </svg>
          </Link>

          <div className="flex space-x-1 sm:space-x-2 lg:space-x-4">
            {[
              { to: `/day/${today}`, icon: BookOpen, label: dayName, path: '/day/' },
              { to: '/calendar', icon: Calendar, label: 'Calendar', path: '/calendar' },
              { to: '/lists', icon: Columns, label: 'Lists', path: '/lists' },
              { to: '/kanban', icon: Trello, label: 'Kanban', path: '/kanban' },
              { to: '/search', icon: Search, label: 'Search', path: '/search' },
              { to: '/reports', icon: FileText, label: 'Reports', path: '/reports' },
              { to: '/settings', icon: Settings, label: 'Settings', path: '/settings' },
            ].map(({ to, icon: Icon, label, path }) => {
              const isActive = path === '/day/' ? location.pathname.includes('/day') : location.pathname === path;
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                    color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

