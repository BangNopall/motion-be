const assert = require("node:assert/strict");
const test = require("node:test");

const loadWithEnv = (env, fn) => {
	const originalEnv = process.env;
	process.env = { ...originalEnv, ...env };

	try {
		return fn();
	} finally {
		process.env = originalEnv;
	}
};

const createResponse = () => {
	const res = {
		statusCode: 200,
		payload: null,
		status(code) {
			this.statusCode = code;
			return this;
		},
		json(payload) {
			this.payload = payload;
			return this;
		},
	};

	return res;
};

const createRequest = ({ headers = {}, params = {}, user, method = "GET" } = {}) => ({
	headers,
	params,
	user,
	method,
	get(name) {
		return this.headers[String(name).toLowerCase()];
	},
});

test("requireApiKey rejects requests when configured key is missing", () => {
	loadWithEnv({ API_KEY: "server-key" }, () => {
		const { requireApiKey } = require("../middleware/auth.middleware");
		const req = createRequest();
		const res = createResponse();
		let nextCalled = false;

		requireApiKey(req, res, () => {
			nextCalled = true;
		});

		assert.equal(nextCalled, false);
		assert.equal(res.statusCode, 401);
		assert.equal(res.payload.message, "invalid api key");
	});
});

test("requireApiKey accepts x-api-key when it matches configured key", () => {
	loadWithEnv({ API_KEY: "server-key" }, () => {
		const { requireApiKey } = require("../middleware/auth.middleware");
		const req = createRequest({ headers: { "x-api-key": "server-key" } });
		const res = createResponse();
		let nextCalled = false;

		requireApiKey(req, res, () => {
			nextCalled = true;
		});

		assert.equal(nextCalled, true);
		assert.equal(res.statusCode, 200);
	});
});

test("authenticate attaches verified JWT payload to req.user", () => {
	loadWithEnv({ JWT_SECRET: "test-secret" }, () => {
		const { generateToken } = require("../constants/jwt");
		const { authenticate } = require("../middleware/auth.middleware");
		const token = generateToken({ nim: "225150000000001", isAdmin: false });
		const req = createRequest({ headers: { authorization: `Bearer ${token}` } });
		const res = createResponse();
		let nextCalled = false;

		authenticate(req, res, () => {
			nextCalled = true;
		});

		assert.equal(nextCalled, true);
		assert.equal(req.user.nim, "225150000000001");
		assert.equal(req.user.isAdmin, false);
	});
});

test("requireAdmin rejects authenticated non-admin users", () => {
	const { requireAdmin } = require("../middleware/auth.middleware");
	const req = createRequest({ user: { nim: "225150000000001", isAdmin: false } });
	const res = createResponse();
	let nextCalled = false;

	requireAdmin(req, res, () => {
		nextCalled = true;
	});

	assert.equal(nextCalled, false);
	assert.equal(res.statusCode, 403);
	assert.equal(res.payload.message, "admin access required");
});

test("requireSelfOrAdmin allows matching nim users", () => {
	const { requireSelfOrAdmin } = require("../middleware/auth.middleware");
	const req = createRequest({
		params: { nim: "225150000000001" },
		user: { nim: "225150000000001", isAdmin: false },
	});
	const res = createResponse();
	let nextCalled = false;

	requireSelfOrAdmin("nim")(req, res, () => {
		nextCalled = true;
	});

	assert.equal(nextCalled, true);
	assert.equal(res.statusCode, 200);
});
