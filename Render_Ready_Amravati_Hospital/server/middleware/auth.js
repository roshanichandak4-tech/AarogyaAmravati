const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'amravati_hospital_jwt_secret_key_2026';

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please login as hospital admin.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

module.exports = {
  verifyAdminToken,
  JWT_SECRET
};
