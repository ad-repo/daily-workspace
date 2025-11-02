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
import { ThemeProvider } from './contexts/ThemeContext';
import { CustomBackgroundProvider } from './contexts/CustomBackgroundContext';
import { TransparentLabelsProvider } from './contexts/TransparentLabelsContext';
import { FullScreenProvider, useFullScreen } from './contexts/FullScreenContext';
import CustomBackground from './components/CustomBackground';

const AppContent = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const today = format(new Date(), 'yyyy-MM-dd');
  const { isFullScreen } = useFullScreen();

  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)', position: 'relative' }}>
        <CustomBackground />
        <Navigation />
        <div 
          className={`mx-auto px-4 py-6 ${isFullScreen ? 'max-w-full' : 'container max-w-7xl'}`}
          style={{ transition: 'max-width 0.3s ease' }}
        >
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
  );
};

function App() {
  return (
    <ThemeProvider>
      <TimezoneProvider>
        <CustomBackgroundProvider>
          <TransparentLabelsProvider>
            <FullScreenProvider>
              <AppContent />
            </FullScreenProvider>
          </TransparentLabelsProvider>
        </CustomBackgroundProvider>
      </TimezoneProvider>
    </ThemeProvider>
  );
}

export default App;

