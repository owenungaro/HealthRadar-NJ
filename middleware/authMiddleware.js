
export function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).redirect("/login");  // Redirect to login if not authenticated
  }
  next();
};



export function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  next();
}
