/**
 * Apply pending Prisma migrations during the build when a database is
 * configured. DATABASE_URL/DIRECT_URL are only set in the Vercel Production
 * environment, so preview builds and local builds without a database skip
 * this step instead of failing.
 */
const { execSync } = require('child_process');

if (!process.env.DATABASE_URL) {
  console.log('[migrate-deploy] DATABASE_URL not set — skipping prisma migrate deploy.');
  process.exit(0);
}

execSync('npx prisma migrate deploy', { stdio: 'inherit' });
