function getDashboard(req, res) {
  return res.json({
    message: `Welcome to the dashboard, ${req.user.email}`,
    stats: {
      totalUsers: 42,
      activeSessions: 7,
    },
  });
}

module.exports = { getDashboard };
