let stats = {
  today: 0,
  yesterday: 0,
  total: 0,
  online: 0,
  users: {},
  lastDate: new Date().toLocaleDateString()
};

export default function handler(req, res) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const now = Date.now();
  const todayStr = new Date().toLocaleDateString();

  if (todayStr !== stats.lastDate) {
    stats.yesterday = stats.today;
    stats.today = 0;
    stats.lastDate = todayStr;
    stats.users = {};
  }

  if (!stats.users[ip]) {
    stats.users[ip] = now;
    stats.today++;
    stats.total++;
  } else {
    stats.users[ip] = now;
  }

  stats.online = Object.values(stats.users).filter(t => now - t < 5 * 60 * 1000).length;

  res.status(200).json({
    today: stats.today,
    yesterday: stats.yesterday,
    total: stats.total,
    online: stats.online
  });
}
