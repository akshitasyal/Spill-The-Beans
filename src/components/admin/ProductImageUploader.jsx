import { useState } from 'react';
import { Upload, X, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';

export default function ProductImageUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setUploading(true);
    setProgress(10);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Convert files to object URLs for local display mock
          const newUrls = imageFiles.map(file => URL.createObjectURL(file));
          onChange([...images, ...newUrls]);
          return 0;
        }
        return p + 25;
      });
    }, 200);
  };

  const removeImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div style={containerStyles}>
      <label style={labelStyles}>Product Images</label>

      {/* Drag Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={dropzoneStyles}
      >
        <Upload size={32} color="var(--accent-admin-amber)" />
        <p style={{ margin: '0.5rem 0 0.25rem 0', fontWeight: 600, fontSize: '0.875rem' }}>
          Drag & drop images here or <span style={{ color: 'var(--accent-admin-amber)', cursor: 'pointer' }}>browse</span>
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>
          Supports JPEG, PNG, WebP up to 5MB
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="image-file-input"
        />
        <label htmlFor="image-file-input" style={overlayLabelLink}></label>
      </div>

      {/* Uploading progress bar */}
      {uploading && (
        <div style={progressContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <span>Uploading assets...</span>
            <span>{progress}%</span>
          </div>
          <div style={progressTrack}>
            <div style={{ ...progressFill, width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div style={previewGrid}>
          {images.map((img, idx) => (
            <div key={idx} style={previewCard}>
              <img src={img} alt={`Preview ${idx + 1}`} style={previewImg} />
              
              {/* Badge for cover image (first one) */}
              {idx === 0 && <span style={coverBadge}>Cover</span>}

              {/* Order adjustment actions */}
              <div style={actionsContainer}>
                <button
                  type="button"
                  style={actionBtn}
                  onClick={() => moveImage(idx, -1)}
                  disabled={idx === 0}
                  title="Move Image Left"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  style={actionBtn}
                  onClick={() => moveImage(idx, 1)}
                  disabled={idx === images.length - 1}
                  title="Move Image Right"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  type="button"
                  style={{ ...actionBtn, color: '#d32f2f' }}
                  onClick={() => removeImage(idx)}
                  title="Delete Image"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div style={emptyPreview}>
          <ImageIcon size={20} color="var(--text-admin-muted)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-admin-muted)' }}>No images uploaded yet.</span>
        </div>
      )}
    </div>
  );
}

const containerStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '100%'
};

const labelStyles = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)'
};

const dropzoneStyles = {
  border: '2px dashed var(--border-admin)',
  borderRadius: '8px',
  padding: '2rem',
  textAlign: 'center',
  background: 'rgba(253, 224, 193, 0.02)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-color 0.2s ease',
  cursor: 'pointer'
};

const overlayLabelLink = {
  position: 'absolute',
  inset: 0,
  cursor: 'pointer'
};

const progressContainer = {
  background: 'rgba(253,224,193,0.03)',
  border: '1px solid var(--border-admin)',
  padding: '0.75rem',
  borderRadius: '8px'
};

const progressTrack = {
  height: '6px',
  background: 'rgba(253,224,193,0.1)',
  borderRadius: '3px',
  overflow: 'hidden'
};

const progressFill = {
  height: '100%',
  background: 'var(--accent-admin-amber)',
  transition: 'width 0.1s linear'
};

const previewGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: '1rem',
  marginTop: '0.5rem'
};

const previewCard = {
  position: 'relative',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  overflow: 'hidden',
  aspectRatio: '1',
  background: '#1a0a0a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const previewImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const coverBadge = {
  position: 'absolute',
  top: '4px',
  left: '4px',
  background: 'var(--accent-admin-amber)',
  color: '#FFFFFF',
  fontSize: '0.625rem',
  fontWeight: 'bold',
  padding: '0.15rem 0.4rem',
  borderRadius: '4px',
  textTransform: 'uppercase'
};

const actionsContainer = {
  position: 'absolute',
  bottom: '4px',
  right: '4px',
  display: 'flex',
  gap: '0.2rem',
  background: 'rgba(18, 4, 4, 0.85)',
  padding: '0.2rem',
  borderRadius: '6px'
};

const actionBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-bright)',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s ease'
};

const emptyPreview = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '1rem',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  background: 'rgba(253,224,193,0.01)'
};
