// Tokens signed with a known default secret can be forged, so production
// (Vercel) refuses to run without a real JWT_SECRET.
const jwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    throw Object.assign(new Error('JWT_SECRET is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.'), { status: 500 })
  }
  return 'dev-secret'
}

module.exports = { jwtSecret }
