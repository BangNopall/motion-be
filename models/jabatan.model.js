const supabase = require("../constants/config");

const jabatan = {
	getAllJabatan: async () => {
		const { data, error } = await supabase
			.from("motion24_jabatan")
			.select("*")
			.order("id_jabatan", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	getJabatanById: async (id) => {
		const { data, error } = await supabase
			.from("motion24_jabatan")
			.select("*")
			.eq("id_jabatan", id);
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	getUserByIdJabatan: async (id) => {
		const { data, error } = await supabase
			.from("motion24_anggotaBEM")
			.select(
				"nim, nama, foto, jabatan:motion24_jabatan(id_jabatan, jabatan), proker:motion24_proker(id_proker, proker), kementerian:motion24_kementerian(kementerian,singkatan, id_kementerian)"
			)
			.eq("id_jabatan", id);
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	getAspekByIdJabatan: async (id) => {
		const { data, error } = await supabase
			.from("motion24_aspek")
			.select("*, sub_aspek:motion24_detailAspek(id_subaspek, sub_aspek, deskripsi)")
			.eq("id_jabatan", id)
			.order("id_aspek", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
};

module.exports = jabatan;
