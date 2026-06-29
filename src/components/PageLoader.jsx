import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div style={container}>
      <div style={content}>
        {/* Animated Coffee Cup / Spinner */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear',
          }}
          style={spinner}
        >
          ☕
        </motion.div>
        
        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 0.8,
          }}
          style={text}
        >
          Brewing...
        </motion.div>
      </div>
    </div>
  );
}

const container = {
  position: 'fixed',
  inset: 0,
  background: '#120404',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const content = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const spinner = {
  fontSize: '2.5rem',
  display: 'inline-block',
  transformOrigin: 'center center',
  lineHeight: 1,
};

const text = {
  fontFamily: 'var(--font-heading), serif',
  fontSize: '1rem',
  color: 'var(--text-cream)',
  fontWeight: 'bold',
  letterSpacing: '1px',
};
