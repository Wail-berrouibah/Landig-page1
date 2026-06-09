function requireAuth(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  next();
}

module.exports = { requireAuth };
