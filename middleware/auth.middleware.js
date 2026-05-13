const crypto = require("node:crypto");
const { verifyToken } = require("../constants/jwt");

const sendUnauthorized = (res, message = "unauthorized") =>
	res.status(401).json({ status: "error", message });

const sendForbidden = (res, message = "forbidden") =>
	res.status(403).json({ status: "error", message });

const constantTimeEqual = (left, right) => {
	const leftBuffer = Buffer.from(String(left || ""));
	const rightBuffer = Buffer.from(String(right || ""));

	if (leftBuffer.length !== rightBuffer.length) return false;

	return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const getHeader = (req, name) => {
	if (typeof req.get === "function") return req.get(name);
	return req.headers?.[String(name).toLowerCase()];
};

const requireApiKey = (req, res, next) => {
	if (req.method === "OPTIONS") return next();

	const configuredKey = process.env.API_KEY;
	if (!configuredKey) return next();

	const providedKey = getHeader(req, "x-api-key");
	if (!providedKey || !constantTimeEqual(providedKey, configuredKey)) {
		return sendUnauthorized(res, "invalid api key");
	}

	return next();
};

const authenticate = (req, res, next) => {
	if (req.user) return next();

	const authorization = getHeader(req, "authorization") || "";
	const [scheme, token] = authorization.split(/\s+/);

	if (scheme?.toLowerCase() !== "bearer" || !token) {
		return sendUnauthorized(res, "authorization token required");
	}

	try {
		req.user = verifyToken(token);
		return next();
	} catch (_err) {
		return sendUnauthorized(res, "invalid authorization token");
	}
};

const requireAdmin = (req, res, next) => {
	if (!req.user) return authenticate(req, res, () => requireAdmin(req, res, next));

	if (req.user.isAdmin === true) return next();

	return sendForbidden(res, "admin access required");
};

const requireSelfOrAdmin = (paramName = "nim") => (req, res, next) => {
	if (!req.user) {
		return authenticate(req, res, () =>
			requireSelfOrAdmin(paramName)(req, res, next)
		);
	}

	if (req.user.isAdmin === true || String(req.user.nim) === String(req.params[paramName])) {
		return next();
	}

	return sendForbidden(res, "not allowed to access this resource");
};

module.exports = {
	authenticate,
	requireAdmin,
	requireApiKey,
	requireSelfOrAdmin,
};
