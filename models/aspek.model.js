const supabase = require("../constants/config");

const aspek = {
	getAllAspek: async () => {
		const { data, error } = await supabase
			.from("motion24_aspek")
			.select(
				"*, sub_aspek:motion24_detailAspek(id_subaspek, sub_aspek, deskripsi), jabatan:motion24_jabatan(jabatan)"
			)
			.order("id_aspek", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	getAspekById: async (id) => {
		const { data, error } = await supabase
			.from("motion24_aspek")
			.select(
				"*, sub_aspek:motion24_detailAspek(id_subaspek, sub_aspek, deskripsi), jabatan:motion24_jabatan(jabatan)"
			)
			.eq("id_aspek", id)
			.order("id_aspek", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},

	getAspekByCol: async ({ column, value }) => {
		const allowedColumns = ["id_aspek", "aspek", "id_jabatan"];
		if (!allowedColumns.includes(column)) {
			return { status: "err", msg: "invalid column" };
		}

		const query = supabase
			.from("motion24_aspek")
			.select(
				"*, sub_aspek:motion24_detailAspek(id_subaspek, sub_aspek, deskripsi), jabatan:motion24_jabatan(jabatan)"
			)
			.order("id_aspek", { ascending: true });

		const { data, error } =
			column === "id_aspek" || column === "id_jabatan"
				? await query.eq(column, value)
				: await query.ilike(column, `%${value}%`);

		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	addAspek: async (data) => {
		const { error } = await supabase.from("motion24_aspek").insert(data);
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", msg: "success add aspek" };
	},
	updateAspek: async (data, { id }) => {
		const { error } = await supabase
			.from("motion24_aspek")
			.update(data)
			.eq("id_aspek", id);
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", msg: "success update aspek" };
	},
	deleteAspek: async ({ id }) => {
		const { error } = await supabase
			.from("motion24_aspek")
			.delete()
			.eq("id_aspek", id);
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", msg: "success delete aspek" };
	},
};

module.exports = aspek;
