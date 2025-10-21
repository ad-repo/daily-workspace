import { Link, useLocation } from 'react-router-dom';
import { Calendar, Laptop, Settings, FileText } from 'lucide-react';
import { format } from 'date-fns';

const Navigation = () => {
  const location = useLocation();
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Laptop className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Daily Workspace</span>
          </Link>

          <div className="flex space-x-4">
            <Link
              to={`/day/${today}`}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname.includes('/day')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Laptop className="h-5 w-5" />
              <span className="font-medium">Today</span>
            </Link>

            <Link
              to="/calendar"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/calendar'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Calendar</span>
            </Link>

            <Link
              to="/reports"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/reports'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Reports</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

