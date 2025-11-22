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
    tileMode,
    toggleTileMode,
  } = useCustomBackground();

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
        <Image className="h-5 w-5" />
        Background Images
      </h2>
      <div className="p-5 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <p className="mb-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Upload images to display as rotating backgrounds at low opacity (20%).
        </p>

        {/* Consolidated Controls Grid */}
        <div className="mb-4 p-3 rounded-lg grid md:grid-cols-2 gap-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          {/* Enable Background Images */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Enable Backgrounds</span>
            </div>
            <button
              onClick={toggleEnabled}
              disabled={uploadedImages.length === 0}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border-primary)',
                borderWidth: '1px',
                opacity: uploadedImages.length === 0 ? 0.5 : 1,
                cursor: uploadedImages.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full transition-transform"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  transform: enabled ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                }}
              />
            </button>
          </div>

          {/* Tile Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Tile Mode</span>
            </div>
            <button
              onClick={toggleTileMode}
              disabled={!enabled}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                backgroundColor: tileMode ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border-primary)',
                borderWidth: '1px',
                opacity: !enabled ? 0.5 : 1,
                cursor: !enabled ? 'not-allowed' : 'pointer',
              }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full transition-transform"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  transform: tileMode ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                }}
              />
            </button>
          </div>

          {/* Auto-Rotate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Auto-Rotate</span>
            </div>
            <button
              onClick={toggleAutoRotate}
              disabled={!enabled}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                backgroundColor: autoRotate ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border-primary)',
                borderWidth: '1px',
                opacity: !enabled ? 0.5 : 1,
                cursor: !enabled ? 'not-allowed' : 'pointer',
              }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full transition-transform"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  transform: autoRotate ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                }}
              />
            </button>
          </div>

          {/* Rotation Interval - inline */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Interval (min)</span>
            </div>
            <input
              type="number"
              min="1"
              max="1440"
              value={rotationInterval}
              onChange={(e) => setRotationInterval(parseInt(e.target.value, 10) || 60)}
              disabled={!enabled || !autoRotate}
              className="px-2 py-1 rounded text-sm focus:outline-none disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
                width: '70px',
              }}
            />
          </div>
        </div>

        {/* Upload Images Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Your Images ({uploadedImages.length})
            </span>
            <div className="flex gap-2">
              {enabled && uploadedImages.length > 0 && (
                <button
                  onClick={nextImage}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
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
                  <RefreshCw className="h-3.5 w-3.5" />
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
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-text)',
                    opacity: isUploading ? 0.5 : 1,
                  }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </div>
              </label>
            </div>
          </div>

          {/* Image Grid */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
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
                    className="w-full h-24 object-cover"
                  />
                  <button
                    onClick={() => onDelete(image.id)}
                    className="absolute top-1 right-1 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                    }}
                    title="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div
                    className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-xs truncate"
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
              className="p-4 text-center rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px dashed var(--color-border-primary)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No images uploaded yet. Upload images to use as custom backgrounds!
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue('--color-info')}15`,
            border: '1px solid var(--color-info)',
          }}
        >
          <p className="text-xs" style={{ color: 'var(--color-info)' }}>
            <strong>Tip:</strong> Upload images up to 10MB. Backgrounds appear at 20% opacity and rotate automatically.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CustomBackgroundSettings;

