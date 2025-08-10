import fetch from 'node-fetch';

const IPHUB_KEY = "Mjg3NzQ6SFBiSjVpVGlyTXFscXRCVjl4NXY4bmxqMW5hRG1UVVM=";
const CAPTCHA_API_KEY = "papa";
const userIPs = new Map();

export default async function handler(req, res) {
  // Authentication
  if (req.headers['x-api-key'] !== CAPTCHA_API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { user_id, bot_token, fingerprint } = req.query;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.connection.remoteAddress;

  // Input validation
  if (!user_id || !bot_token) {
    return res.status(400).json({
      results: {
        error: "Missing user_id or bot_token",
        status: "failed"
      }
    });
  }

  // VPN/Proxy Check
  let vpn = false;
  let countryCode = null;
  let countryName = null;
  try {
    const iphubRes = await fetch(`https://v2.api.iphub.info/ip/${ip}`, {
      headers: { "X-Key": IPHUB_KEY },
    });
    const iphubData = await iphubRes.json();
    vpn = iphubData.block === 1 || iphubData.block === 2;
    countryCode = iphubData.countryCode;
    countryName = iphubData.countryName;
  } catch (err) {
    console.error("IPHub error:", err);
    return res.status(500).json({
      results: {
        error: "IP verification service unavailable",
        status: "failed"
      }
    });
  }

  // Multi-account detection
  let multi_account = false;
  const now = Date.now();
  const sameIPUsers = userIPs.get(ip) || [];
  if (sameIPUsers.length >= 2) multi_account = true;

  // Update IP tracker
  userIPs.set(ip, sameIPUsers
    .filter(entry => now - entry.timestamp < 86400000)
    .concat({ user_id, timestamp: now })
  );

  // Successful response
  return res.status(200).json({
    results: {
      user_hash: fingerprint || "unknown",
      captcha: "ok",
      vpn: vpn ? "yes" : "no",
      ip: ip,
      country_code: countryCode,
      country_name: countryName,
      multi_account: multi_account,
      timestamp: now
    }
  });
      }
