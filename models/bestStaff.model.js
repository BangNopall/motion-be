const supabase = require("../constants/config");
const cache = require("../helpers/cache");

const bestStaff = {
	getAllBestStaff: async () => {
		const cacheKey = "getAllBestStaff";
		const cachedData = cache.get(cacheKey);
		if (cachedData) return { status: "ok", data: cachedData };

		const { data, error } = await supabase
			.from("motion24_bestStaff")
			.select(
				"id, phase, nim, id_kementerian, staff:motion24_anggotaBEM(nim, nama, foto, kementerian:motion24_kementerian(id_kementerian, singkatan, kementerian))"
			)
			.order("phase", { ascending: true })
			.order("id_kementerian", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		cache.set(cacheKey, data, 300);
		return { status: "ok", data: data };
	},
	getBestStaffByPhase: async ({ phase }) => {
		const cacheKey = `bestStaff_${phase}`;
		const cachedData = cache.get(cacheKey);
		if (cachedData) return { status: "ok", data: cachedData };

		const { data, error } = await supabase
			.from("motion24_bestStaff")
			.select(
				"id, phase, nim, id_kementerian, staff:motion24_anggotaBEM(nim, nama, foto, kementerian:motion24_kementerian(id_kementerian, singkatan, kementerian))"
			)
			.eq("phase", phase)
			.order("id_kementerian", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		cache.set(cacheKey, data, 300);
		return { status: "ok", data: data };
	},

	addBestStaff: async (data) => {
		const { error } = await supabase
			.from("motion24_bestStaff")
			.insert(data);
		if (error) {
			return { status: "err", msg: error };
		}
		cache.clearPrefix("getAllBestStaff");
		cache.clearPrefix("bestStaff_");
		return { status: "ok", msg: "success add best staff" };
	},
	updateBestStaff: async (data, { id }) => {
		const { error } = await supabase
			.from("motion24_bestStaff")
			.update(data)
			.eq("id", id);
		if (error) {
			return { status: "err", msg: error };
		}
		cache.clearPrefix("getAllBestStaff");
		cache.clearPrefix("bestStaff_");
		return { status: "ok", msg: "success update best staff" };
	},
	deleteBestStaff: async ({ id }) => {
		const { error } = await supabase
			.from("motion24_bestStaff")
			.delete()
			.eq("id", id);
		if (error) {
			return { status: "err", msg: error };
		}
		cache.clearPrefix("getAllBestStaff");
		cache.clearPrefix("bestStaff_");
		return { status: "ok", msg: "success delete best staff" };
	},
};

module.exports = bestStaff;
