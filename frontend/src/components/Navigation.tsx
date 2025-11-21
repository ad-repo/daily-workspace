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
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link 
            to="/" 
            className="flex items-center px-2 py-2 rounded-lg transition-opacity"
            style={{
              opacity: location.pathname === '/' ? 1 : 0.7
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.opacity = '0.7';
              }
            }}
            title="Track the Thing"
          >
            <img 
              src="/logo.png" 
              alt="Track the Thing" 
              className="h-12 sm:h-14 w-auto"
            />
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

