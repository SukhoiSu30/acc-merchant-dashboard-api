// src/middleware/auth.js
// Authentication middleware using Clerk v2.x
// Uses clerkMiddleware() + getAuth() as Clerk recommends

const { clerkMiddleware, getAuth } = require('@clerk/express');

// Global middleware — attaches `auth` to every request (doesn't block)
const clerkMw = clerkMiddleware();

// Route-level middleware — blocks requests that don't have a valid user
function requireAuth(req, res, next) {
  const auth = getAuth(req);

  if (!auth || !auth.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be signed in to access this resource',
    });
  }

  // User is authenticated — attach userId to request for later use
  req.userId = auth.userId;
  next();
}

// Helper: get the current user ID from the request
function getUserId(req) {
  const auth = getAuth(req);
  return auth?.userId || null;
}

module.exports = {
  clerkMw,
  requireAuth,
  getUserId,
};