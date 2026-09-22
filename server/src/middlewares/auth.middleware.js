const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ message: 'Missing authorization' })
    const parts = header.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid authorization format' })
    const payload = jwt.verify(parts[1], JWT_SECRET)
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ message: 'Invalid token' })
    req.user = user
    next()
  } catch (err) { return res.status(401).json({ message: 'Invalid token' }) }
}

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) await requireAuth(req, res, () => {})
    if (!req.user) return
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
    next()
  } catch (err) { next(err) }
}

module.exports = { requireAuth, requireAdmin }
