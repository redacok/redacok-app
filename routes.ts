/**
 * Array of public routes
 * Routes not require an authentication
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verification", "/api/upload"];

/**
 * Array of routes that are used for authentication
 * Will redirect logged User into the Dashboard page
 * @type {string[]}
 */
export const authRoutes = ["/sign-in", "/sign-up", "/auth/error"];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT =
  process.env.NEXT_LOGIN_REDIRECT || "/dashboard";

/**
 * The default redirect path after logged in
 * @type {string}
 */
export const privateRoutes = ["/dashboard"];
