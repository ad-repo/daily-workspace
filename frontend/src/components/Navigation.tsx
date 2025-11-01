import { Link, useLocation } from 'react-router-dom';
import { Calendar, Laptop, Settings, FileText, Search, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
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
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: location.pathname === '/' ? 'var(--color-accent)' : 'transparent',
              color: location.pathname === '/' ? 'var(--color-accent-text)' : 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            title="Track the Thing"
          >
            <Laptop className="h-6 w-6" />
            <span className="text-xl font-bold">Track the Thing</span>
          </Link>

          <div className="flex space-x-4">
            {[
              { to: `/day/${today}`, icon: BookOpen, label: dayName, path: '/day/' },
              { to: '/calendar', icon: Calendar, label: 'Calendar', path: '/calendar' },
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
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
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

