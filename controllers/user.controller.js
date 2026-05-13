const model = require("../models/user.model");
const { success, error } = require("../constants/result");

const user = {
	getAllUser: async (_req, res) => {
		model
			.getAllUser()
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.data);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				console.log(err);
				error(res, err);
			});
	},
	getUserByNim: async (req, res) => {
		model
			.getUserByNIM(req.params.nim)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.data);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},
	getUserByKementerianJabatan: async (req, res) => {
		model
			.getUserByKementerianJabatan(req.params)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.data);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},

	getRaporByNim: async (req, res) => {
		model
			.getRaporByNim(req.params.nim)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.data);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},

	getRaporByTurnNim: async (req, res) => {
		model
			.getRaporByTurnNim(req.params)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.data);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},
	getAbsensiByTurnNim: async (req, res) => {
		model
			.getAbsensiByTurnNim(req.params)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.data);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},

	login: async (req, res) => {
		model
			.login(req.body)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.data);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},
	addUser: async (req, res) => {
		model
			.addUser(req.body, req.file)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.msg);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},
	updateUser: async (req, res) => {
		model
			.updateUser(req.body, req.params, req.file)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.msg);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},
	deleteUser: async (req, res) => {
		model
			.deleteUser(req.params)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.msg);
				} else {
					error(res, result.msg);
				}
			})
			.catch((err) => {
				error(res, err);
			});
	},
	isAdmin: async (req, res) => {
		model
			.isAdmin(req.params)
			.then((result) => {
				if (result.status == "ok") {
					success(res, result.data);
				} else {
					return res.status(403).json({
						status: "error",
						data: result.data,
					});
				}
			})
			.catch((err) => {
				return res.status(403).json({
					status: "error",
					data: result.data,
				});
			});
	},
};

module.exports = user;
