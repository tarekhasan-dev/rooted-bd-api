const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required!",
      });
    }

    const token = authHeader.split(" ")[1];

    // Get BetterAuth configuration
    const authBaseURL = process.env.BETTER_AUTH_URL;

    if (!authBaseURL) {
      console.error("BETTER_AUTH_URL is missing!");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error!",
      });
    }

    // Import jose (ES Module compatible with CommonJS)
    const { jwtVerify, createRemoteJWKSet } = await import("jose");

    // Initialize JWKS only once
    if (!global.betterAuthJWKS) {
      global.betterAuthJWKS = createRemoteJWKSet(
        new URL(`${authBaseURL}/api/auth/jwks`)
      );
    }

    // Verify JWT
    const { payload } = await jwtVerify(
      token,
      global.betterAuthJWKS,
      {
        issuer: authBaseURL,
        audience: authBaseURL,
      }
    );

    // Attach authenticated user information
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };

    if (!req.user.email) {
      return res.status(401).json({
        success: false,
        message: "User email is missing from the token!",
      });
    }

    next();
  } catch (error) {
    console.error("Token Verification Failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token!",
    });
  }
};

module.exports = verifyToken;