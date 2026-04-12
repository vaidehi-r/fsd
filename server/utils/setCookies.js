/**
 * Set authentication cookies on the response.
 * Access token is available to JS (used by Axios interceptor).
 * Refresh token is httpOnly for security.
 */
export const setCookies = (res, accessToken, refreshToken) => {
  // Access token cookie — readable by JS for SPA
  res.cookie('accessToken', accessToken, {
    httpOnly: false, // Frontend needs to read this for Axios
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token cookie — httpOnly for security
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clear authentication cookies.
 */
export const clearCookies = (res) => {
  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
};
