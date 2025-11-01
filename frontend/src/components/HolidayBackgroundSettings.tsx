import { Calendar, Image, RefreshCw } from 'lucide-react';
import { useHoliday } from '../contexts/HolidayContext';

const HolidayBackgroundSettings = () => {
  const {
    enabled,
    daysAhead,
    currentHoliday,
    toggleEnabled,
    setDaysAhead,
    refreshImage,
    isLoading,
    autoRotate,
    toggleAutoRotate,
  } = useHoliday();

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
        <Calendar className="h-5 w-5" />
        Holiday Backgrounds
      </h2>
      <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Automatically display background images that change based on upcoming holidays. Images rotate every hour for variety.
        </p>

        {/* Enable/Disable Toggle */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="flex items-center gap-3">
            <Image className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Enable Holiday Backgrounds
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Show themed backgrounds for upcoming holidays
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={toggleEnabled}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 transition-colors"
              style={{
                backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-border-secondary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-accent)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform"
                style={{
                  transform: enabled ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </div>
          </label>
        </div>

        {/* Days Ahead Setting */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Days ahead to detect holidays:
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="30"
              value={daysAhead}
              onChange={(e) => setDaysAhead(parseInt(e.target.value, 10) || 7)}
              disabled={!enabled}
              className="px-4 py-2 rounded-lg focus:outline-none disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
                width: '100px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              days (0-30)
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            Set to 0 for today only, or higher to detect upcoming holidays
          </p>
        </div>

        {/* Auto-Rotate Toggle */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Auto-Rotate Images
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Automatically change background every hour
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={toggleAutoRotate}
              disabled={!enabled}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 transition-colors"
              style={{
                backgroundColor: autoRotate ? 'var(--color-accent)' : 'var(--color-border-secondary)',
                opacity: !enabled ? 0.5 : 1,
              }}
              onFocus={(e) => {
                if (enabled) {
                  e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-accent)`;
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform"
                style={{
                  transform: autoRotate ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </div>
          </label>
        </div>

        {/* Current Holiday Display */}
        {enabled && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-primary)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Upcoming Holiday:
                </div>
                {isLoading ? (
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    Checking for holidays...
                  </div>
                ) : currentHoliday ? (
                  <div>
                    <div className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                      {currentHoliday.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(currentHoliday.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    {daysAhead === 0 ? 'No holiday today' : `No upcoming holidays within ${daysAhead} days`}
                  </div>
                )}
              </div>
              {currentHoliday && (
                <button
                  onClick={refreshImage}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-text)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                    }
                  }}
                  title="Load a new random image"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Image
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue('--color-info')}15`,
            border: '1px solid var(--color-info)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-info)' }}>
            <strong>How it works:</strong> Holiday backgrounds appear at low opacity (20%) so they don't interfere with readability.
            Images automatically rotate every hour for variety. Uses Picsum Photos for images and Nager.Date for holiday detection (both free services).
            For truly holiday-themed images, use the Custom Background Images feature to upload your own!
          </p>
        </div>
      </div>
    </section>
  );
};

export default HolidayBackgroundSettings;

