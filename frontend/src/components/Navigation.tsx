import { Link, useLocation } from 'react-router-dom';
import { Calendar, Laptop, Settings, FileText, Search, BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { useTimezone } from '../contexts/TimezoneContext';
import { useFullScreen } from '../contexts/FullScreenContext';

const Navigation = () => {
  const location = useLocation();
  const { timezone } = useTimezone();
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const now = new Date();
  const today = formatInTimeZone(now, timezone, 'yyyy-MM-dd');
  const dayName = formatInTimeZone(now, timezone, 'EEEE'); // Full day name like "Monday"
  const isOnDayView = location.pathname.includes('/day/');

  return (
    <nav className="shadow-sm" style={{ backgroundColor: 'var(--color-card-bg)', borderBottom: '1px solid var(--color-border-primary)' }}>
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors"
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
            <span className="text-xl font-bold hidden sm:inline">Track the Thing</span>
          </Link>

          <div className="flex space-x-1 sm:space-x-2 lg:space-x-4">
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
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium hidden sm:inline">{label}</span>
                </Link>
              );
            })}

            {/* Full-screen toggle - only show on day view and desktop */}
            {isOnDayView && (
              <button
                onClick={toggleFullScreen}
                className="hidden sm:flex items-center px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
                title={isFullScreen ? "Exit full screen" : "Enter full screen"}
              >
                {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

