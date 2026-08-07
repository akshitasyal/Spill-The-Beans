import { useNavigate } from 'react-router-dom';
import { ProductVariantDTO } from '../../types/product';
import './VariantSelector.css';

interface VariantSelectorProps {
  variants: ProductVariantDTO[];
  currentFlavour: string | null;
  currentSize: string | null;
  basePath?: string;
}

/**
 * Builds unique flavour and size lists from variant data (no hardcoding).
 * Handles navigation with smart fallback:
 *   - Flavour click → preserve current size if available, else use first available size
 *   - Size click   → preserve current flavour; button disabled if combination missing
 */
export default function VariantSelector({
  variants,
  currentFlavour,
  currentSize,
  basePath = '/products',
}: VariantSelectorProps) {
  const navigate = useNavigate();

  // ── Derive unique flavour and size lists from DB data ────────────────────
  // Flavours are filtered by the currently selected size so only valid options show
  const flavours: string[] = [];
  const sizes: string[] = [];

  for (const v of variants) {
    // Flavours: only those available in the current size
    if (v.size === currentSize && v.flavour && !flavours.includes(v.flavour)) {
      flavours.push(v.flavour);
    }
    // Sizes: all unique sizes regardless of flavour
    if (v.size && !sizes.includes(v.size)) sizes.push(v.size);
  }

  // ── Navigation helpers ───────────────────────────────────────────────────
  const findVariant = (flavour: string | null, size: string | null) =>
    variants.find((v) => v.flavour === flavour && v.size === size) ?? null;

  const handleFlavourClick = (flavour: string) => {
    if (flavour === currentFlavour) return;
    const target = findVariant(flavour, currentSize);
    // Flavours shown are already filtered to currentSize, so target always exists
    if (target) navigate(`${basePath}/${target.slug}`);
  };

  const handleSizeClick = (size: string) => {
    if (size === currentSize) return;
    // Try to preserve current flavour in new size
    let target = findVariant(currentFlavour, size);
    // Fallback: current flavour doesn't exist in new size → use first available
    if (!target) target = variants.find((v) => v.size === size) ?? null;
    if (target) navigate(`${basePath}/${target.slug}`);
  };

  // A size is available if ANY variant exists for it (enabling all size buttons)
  const isSizeAvailable = (size: string) =>
    variants.some((v) => v.size === size);

  if (variants.length === 0) return null;

  return (
    <div className="variant-selector">
      {/* ── Flavour section ─────────────────────────────────────────── */}
      {flavours.length > 0 && (
        <div className="variant-selector__group">
          <p className="variant-selector__label">
            Flavour: <strong>{currentFlavour ?? '—'}</strong>
          </p>
          <div className="variant-selector__grid">
            {flavours.map((flavour) => (
              <button
                key={flavour}
                id={`flavour-btn-${flavour.toLowerCase().replace(/\s+/g, '-')}`}
                className={[
                  'variant-btn',
                  flavour === currentFlavour ? 'variant-btn--active' : '',
                ].join(' ')}
                onClick={() => handleFlavourClick(flavour)}
                aria-pressed={flavour === currentFlavour}
                aria-label={`Select flavour: ${flavour}`}
              >
                {flavour}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Size section ────────────────────────────────────────────── */}
      {sizes.length > 0 && (
        <div className="variant-selector__group">
          <p className="variant-selector__label">
            Size: <strong>{currentSize ?? '—'}</strong>
          </p>
          <div className="variant-selector__grid variant-selector__grid--size">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              const isActive = size === currentSize;
              return (
                <button
                  key={size}
                  id={`size-btn-${size.toLowerCase().replace(/\s+/g, '-')}`}
                  className={[
                    'variant-btn',
                    isActive ? 'variant-btn--active' : '',
                    !available && !isActive ? 'variant-btn--disabled' : '',
                  ].join(' ')}
                  onClick={() => handleSizeClick(size)}
                  disabled={!available && !isActive}
                  aria-pressed={isActive}
                  aria-label={`Select size: ${size}`}
                  title={!available ? `${size} not available for ${currentFlavour}` : undefined}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
