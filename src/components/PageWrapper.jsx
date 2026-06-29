import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { pageTransition } from '../lib/animations';

export default function PageWrapper({ children, className, ...props }) {
  useEffect(() => {
    // Smooth scroll position reset exactly on mount (after previous page exits)
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <motion.main
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      {...props}
    >
      {children}
    </motion.main>
  );
}
