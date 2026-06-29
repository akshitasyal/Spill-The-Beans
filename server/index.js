// ============================================================
//  index.js — HTTP Server Entry Point
//  Spill The Beans Backend API
// ============================================================
import 'dotenv/config';
import app from './app.js';
import prisma from './db/client.js';

const PORT = process.env.PORT || 4000;

async function main() {
  // Verify database connection on startup
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('   Check DATABASE_URL in your .env file');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🔥 Spill The Beans API running`);
    console.log(`   → http://localhost:${PORT}`);
    console.log(`   → Health: http://localhost:${PORT}/health`);
    console.log(`   → Env: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
