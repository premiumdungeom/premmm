const IPHUB_KEY = "Mjg3NzQ6SFBiSjVpVGlyTXFscXRCVjl4NXY4bmxqMW5hRG1UVVM=";
const CAPTCHA_API_KEY = "papa";
const userIPs = new Map(); // This resets on server restart. Use DB for production.

export default async function handler(req, res) {
  // Secure API Key
  if (req.headers['x-api-key'] !== CAPTCHA_API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { user_id, bot_token, fingerprint } = req.query;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.connection.remoteAddress;

  // Input validation
  if (!user_id || !bot_token) {
    return res.status(400).json({
      success: false,
      error: "Missing user_id or bot_token"
    });
