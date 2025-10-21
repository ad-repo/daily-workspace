import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CalendarView from './components/CalendarView';
import DailyView from './components/DailyView';
import Navigation from './components/Navigation';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Search from './components/Search';
import { format } from 'date-fns';
import { TimezoneProvider } from './contexts/TimezoneContext';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <TimezoneProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Navigation />
          <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Routes>
            <Route
              path="/"
              element={<Navigate to={`/day/${today}`} replace />}
            />
            <Route
              path="/calendar"
              element={
                <CalendarView
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              }
            />
            <Route
              path="/day/:date"
              element={<DailyView />}
            />
            <Route
              path="/reports"
              element={<Reports />}
            />
            <Route
              path="/search"
              element={<Search />}
            />
            <Route
              path="/settings"
              element={<Settings />}
            />
          </Routes>
        </div>
      </div>
    </Router>
    </TimezoneProvider>
  );
}

export default App;

