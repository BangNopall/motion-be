const model = require("../models/bestStaff.model");
const { success, error } = require("../constants/result");

const bestStaff = {
	getAllBestStaff: async (_req, res) => {
		model
			.getAllBestStaff()
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
	getBestStaffByPhase: async (req, res) => {
		model
			.getBestStaffByPhase(req.params)
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
	addBestStaff: async (req, res) => {
		model
			.addBestStaff(req.body)
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
	updateBestStaff: async (req, res) => {
		model
			.updateBestStaff(req.body, req.params)
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
	deleteBestStaff: async (req, res) => {
		model
			.deleteBestStaff(req.params)
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
};

module.exports = bestStaff;
