export default function RoastBadge({ roast }) {
  const roastConfig = {
    'Light': { color: '#c8a060', bg: 'rgba(200, 160, 96, 0.12)', border: 'rgba(200, 160, 96, 0.25)' },
    'Medium': { color: '#c07030', bg: 'rgba(192, 112, 48, 0.12)', border: 'rgba(192, 112, 48, 0.25)' },
    'Medium-Dark': { color: '#a05020', bg: 'rgba(160, 80, 32, 0.12)', border: 'rgba(160, 80, 32, 0.25)' },
    'Dark': { color: '#803010', bg: 'rgba(128, 48, 16, 0.15)', border: 'rgba(128, 48, 16, 0.3)' },
    'Extra Dark': { color: '#602000', bg: 'rgba(96, 32, 0, 0.18)', border: 'rgba(96, 32, 0, 0.35)' },
    'Assorted': { color: '#D4880A', bg: 'rgba(212, 136, 10, 0.1)', border: 'rgba(212, 136, 10, 0.2)' },
  };

  const config = roastConfig[roast] || roastConfig['Medium'];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '0.625rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        flexShrink: 0,
      }}
    >
      {roast}
    </span>
  );
}
