const dotenv = require('dotenv');

dotenv.config();

let db = null;
try {
	const { D1Database } = require('@cloudflare/d1');
	db = new D1Database(process.env.D1_DATABASE_URL);
} catch (e) {
	// Cloudflare D1 library not available in local Node environment.
	// Export null so callers can fallback or skip D1 operations during local dev.
	console.warn('Cloudflare D1 client not available; D1 operations will be disabled in this environment.');
	db = null;
}

module.exports = db;