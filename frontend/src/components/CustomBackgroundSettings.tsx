import { Image, Upload, Trash2, RefreshCw, Clock } from 'lucide-react';
import { useCustomBackground } from '../contexts/CustomBackgroundContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface CustomBackgroundSettingsProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
  isUploading: boolean;
}

const CustomBackgroundSettings = ({ onUpload, onDelete, isUploading }: CustomBackgroundSettingsProps) => {
  const {
    enabled,
    toggleEnabled,
    uploadedImages,
    nextImage,
    autoRotate,
    toggleAutoRotate,
    rotationInterval,
    setRotationInterval,
  } = useCustomBackground();

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
        <Image className="h-5 w-5" />
        Background Images
      </h2>
      <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Upload your own images to display as rotating backgrounds at low opacity (20%).
        </p>

        {/* Enable/Disable Toggle */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center gap-3">
            <Image className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Enable Background Images
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Display your uploaded images as backgrounds
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={toggleEnabled}
              disabled={uploadedImages.length === 0}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 transition-colors"
              style={{
                backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-border-secondary)',
                opacity: uploadedImages.length === 0 ? 0.5 : 1,
              }}
              onFocus={(e) => {
                if (uploadedImages.length > 0) {
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
                  transform: enabled ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </div>
          </label>
        </div>

        {/* Auto-Rotate Settings */}
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          {/* Auto-Rotate Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
              <div>
                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Auto-Rotate Images
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Automatically cycle through images
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

          {/* Rotation Interval */}
          {autoRotate && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Rotation interval (minutes):
              </label>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={rotationInterval}
                  onChange={(e) => setRotationInterval(parseInt(e.target.value, 10) || 60)}
                  disabled={!enabled || !autoRotate}
                  className="px-4 py-2 rounded-lg focus:outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                    width: '120px',
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
                  minutes
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                1-1440 minutes (1 minute to 24 hours)
              </p>
            </div>
          )}
        </div>

        {/* Upload Images Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Your Images: ({uploadedImages.length})
            </label>
            <div className="flex gap-2">
              {enabled && uploadedImages.length > 0 && (
                <button
                  onClick={nextImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                  }}
                  title="Next image"
                >
                  <RefreshCw className="h-4 w-4" />
                  Next
                </button>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-text)',
                    opacity: isUploading ? 0.5 : 1,
                  }}
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload Images'}
                </div>
              </label>
            </div>
          </div>

          {/* Image Grid */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-primary)',
                  }}
                >
                  <img
                    src={`${API_URL}${image.url}`}
                    alt={image.original_filename}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => onDelete(image.id)}
                    className="absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                    }}
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div
                    className="absolute bottom-0 left-0 right-0 p-2 text-xs truncate"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                    }}
                  >
                    {image.original_filename}
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadedImages.length === 0 && (
            <div
              className="p-6 text-center rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px dashed var(--color-border-primary)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No images uploaded yet. Upload your own images to use as custom backgrounds!
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue('--color-info')}15`,
            border: '1px solid var(--color-info)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-info)' }}>
            <strong>Tips:</strong> Upload images up to 10MB each. Backgrounds appear at 20% opacity so they don't interfere with readability.
            Multiple images will automatically rotate at your chosen interval, or you can manually cycle through them.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CustomBackgroundSettings;

