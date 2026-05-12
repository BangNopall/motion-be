const supabase = require("../constants/config");
const fetch = require("node-fetch");

const user = {
	getAllUser: async () => {
		const { data, error } = await supabase
			.from("motion24_anggotaBEM")
			.select(
				"nim, nama, foto, proker:motion24_proker(id_proker, proker), jabatan:motion24_jabatan(id_jabatan, jabatan), kementerian:motion24_kementerian(kementerian,singkatan, id_kementerian)"
			)
			.order("id_jabatan", { ascending: true })
			.order("id_kementerian", { ascending: true })
			.order("nim", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	getUserByNIM: async (nim) => {
		const { data, error } = await supabase
			.from("motion24_anggotaBEM")
			.select(
				"nim, nama, foto, proker:motion24_proker(id_proker, proker), jabatan:motion24_jabatan(id_jabatan, jabatan), kementerian:motion24_kementerian(kementerian,singkatan, id_kementerian)"
			)
			.eq("nim", nim)
			.single();
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	getUserByKementerianJabatan: async ({ id_kementerian, id_jabatan }) => {
		const { data, error } = await supabase
			.from("motion24_anggotaBEM")
			.select(
				"nim, nama, foto, proker:motion24_proker(id_proker, proker), jabatan:motion24_jabatan(id_jabatan, jabatan), kementerian:motion24_kementerian(kementerian,singkatan, id_kementerian)"
			)
			.eq("id_kementerian", id_kementerian)
			.eq("id_jabatan", id_jabatan)
			.order("id_kementerian", { ascending: true })
			.order("id_jabatan", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},

	getRaporByNim: async (nim) => {
		const { data, error } = await supabase
			.from("motion24_rapor")
			.select(
				"*, user:motion24_anggotaBEM(nama, foto, proker:motion24_proker(id_proker, proker), jabatan:motion24_jabatan(id_jabatan, jabatan), kementerian:motion24_kementerian(kementerian,singkatan, id_kementerian)) , detail:motion24_transparansi(catatan_transparansi,id_aspek, aspek:motion24_aspekPenilaian(aspek,indikator, sub_aspek:motion24_detailAspek(sub_aspek, deskripsi, nilai:motion24_nilai(nilai))))"
			)
			.eq("nim", nim)
			.order("id_rapor", { ascending: true });
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	getRaporByTurnNim: async ({ nim, turn }) => {
		const { data, error } = await supabase
			.from("motion24_rapor")
			.select(
				"*, user:motion24_anggotaBEM(nama, foto, proker:motion24_proker(id_proker, proker), jabatan:motion24_jabatan(id_jabatan, jabatan), kementerian:motion24_kementerian(kementerian,singkatan, id_kementerian)) , detail:motion24_transparansi(catatan_transparansi,id_aspek, aspek:motion24_aspekPenilaian(aspek,indikator, sub_aspek:motion24_detailAspek(sub_aspek, deskripsi, nilai:motion24_nilai(id_rapor, nilai))))"
			)
			.eq("nim", nim)
			.eq("rapor_ke", turn)
			.order("id_rapor", { ascending: true })
			.single();
		if (error) {
			return { status: "err", msg: error };
		}
		if (data && data.detail && data.detail.length > 0) {
			console.log(data.id_rapor);
			data.detail = data.detail.map(detail => ({
				...detail,
				aspek: {
					...detail.aspek,
					sub_aspek: detail.aspek.sub_aspek.map(sub_aspek => ({
						...sub_aspek,
						nilai: sub_aspek.nilai.filter(n => n.id_rapor === data.id_rapor)
					}))
				}
			}));
		}
	
		return { status: "ok", data };
	},
	getAbsensiByTurnNim: async ({ nim, turn }) => {
		//get count of kegiatan where tanggal between start and end
		let tanggal = null;
		switch (Number(turn)) {
			case 1:
				tanggal = {
					start: "2025-03-01",
					end: "2025-05-31",
				};
				break;
			case 2:
				tanggal = {
					start: "2025-06-1",
					end: "2025-08-31",
				};
				break;
			case 3:
				tanggal = {
					start: "2025-09-1",
					end: "2025-11-30",
				};
				break;
			default:
				tanggal = {
					start: "2025-01-01",
					end: "2025-12-31",
				};
		}
		const { data, error } = await supabase
			.from("motion24_anggotaBEM")
			.select(
				"absensi:motion24_absensi(id_kegiatan,status, kegiatan:motion24_kegiatan(kegiatan, tanggal, created_at))"
			)
			.eq("nim", nim)
			.gte("absensi.kegiatan.tanggal", tanggal.start)
			.lte("absensi.kegiatan.tanggal", tanggal.end)
			.order("id_kegiatan", {
				foreignTable: "motion24_absensi",
				ascending: true,
			})
			.single();
		if (error) {
			return { status: "err", msg: error };
		}
		const dataAbsensi = data.absensi.filter((item) => item.kegiatan !== null);
		const totalKehadiran = dataAbsensi.filter(
			(item) => item.status === true
		).length;
		const totalKegiatan = dataAbsensi.length;
		const persentaseKehadiran =
			totalKegiatan === 0
				? "0.00"
				: ((totalKehadiran / totalKegiatan) * 100).toFixed(2);
		return {
			status: "ok",
			data: {
				nim,
				totalKegiatan,
				totalKehadiran,
				persentaseKehadiran,
				dataAbsensi,
			},
		};
	},
	login: async ({ nim, password }) => {
		try {
			const authUrl =
				process.env.EXTERNAL_AUTH_URL || "https://rest-api.bemfilkomub.cloud";
			const login = await fetch(authUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					nim,
					password,
				}),
			})
				.then((res) => res.json())
				.catch((err) => {
					throw err;
				});
			if (login.message !== "successfully logged in") {
				return { status: "err", msg: login.message };
			}
			const { data, error } = await supabase
				.from("motion24_anggotaBEM")
				.select(
					"nim,nama, proker:motion24_proker(id_proker, proker), jabatan:motion24_jabatan(jabatan, id_jabatan), kementerian:motion24_kementerian(kementerian,singkatan, id_kementerian)"
				)
				.eq("nim", nim)
				.single();

			if (error) {
				throw error;
			}

			if (data) {
				return {
					status: "ok",
					data: {
						prodi: login.data?.prodi,
						token: login.token,
						...data,
					},
				};
			}
			return { status: "err", msg: "not bem member" };
		} catch (err) {
			return { status: "err", msg: err };
		}
	},
	addUser: async (data, file) => {
		const { id_kementerian, nama, id_proker } = data;
		delete data.id_proker;
		data.foto = "";
		if (file && file.size > 0) {
			// Get kementerian
			const {
				data: { singkatan },
			} = await supabase
				.from("motion24_kementerian")
				.select("singkatan")
				.eq("id_kementerian", id_kementerian)
				.single();
			const pathname = `${singkatan}/${nama}`;

			//handle upload file
			const [
				{ error: errUpload },
				{
					data: { publicUrl },
				},
			] = await Promise.all([
				supabase.storage.from("motion24_bucket").upload(pathname, file.buffer, {
					cacheControl: "3600",
					contentType: file.mimetype,
				}),
				supabase.storage.from("motion24_bucket").getPublicUrl(pathname),
			]);

			if (errUpload) {
				return { status: "err", msg: errUpload };
			}

			data.foto = publicUrl;
		}

		const { error } = await supabase.from("motion24_anggotaBEM").insert(data);
		if (error) {
			return { status: "err", msg: error };
		}
		if (id_proker) {
			const prokerData = Array.isArray(id_proker)
				? id_proker.map(Number)
				: id_proker.split(",").map(Number);
			const { error } = await supabase.from("motion24_pjProker").insert(
				prokerData.map((id) => ({
					nim: data.nim,
					id_proker: id,
				}))
			);
			if (error) {
				return { status: "err", msg: error };
			}
		}
		return { status: "ok", msg: "success add user" };
	},
	updateUser: async (data, { nim }) => {
		const { id_proker } = data;
		delete data.id_proker;
		const { error } = await supabase
			.from("motion24_anggotaBEM")
			.update(data)
			.eq("nim", nim);
		if (error) {
			return { status: "err", msg: error };
		}
		if (id_proker) {
			const { data } = await supabase
				.from("motion24_pjProker")
				.select("*")
				.eq("nim", nim);
			if (data.length > 0) {
				const { error } = await supabase
					.from("motion24_pjProker")
					.delete()
					.eq("nim", nim);
				if (error) {
					return { status: "err", msg: error };
				}
			}

			const prokerData = Array.isArray(id_proker)
				? id_proker.map(Number)
				: id_proker.split(",").map(Number);
			const { error } = await supabase
				.from("motion24_pjProker")
				.upsert(
					prokerData.map((id) => ({
						nim,
						id_proker: id,
					}))
				)
				.eq("nim", nim);
			if (error) {
				return { status: "err", msg: error };
			}
		}
		return { status: "ok", msg: "success update user" };
	},
		deleteUser: async ({ nim }) => {
			//delete storage
			const { data } = await supabase
				.from("motion24_anggotaBEM")
				.select("kementerian:motion24_kementerian(singkatan), nama, foto")
				.eq("nim", nim)
				.single();
			if (!data) {
				return { status: "err", msg: "user not found" };
			}
			if (data.foto) {
				const { data: dataFoto, error } = await supabase.storage
					.from("motion24_bucket")
					.remove([`${data.kementerian.singkatan}/${data.nama}`]);
				if (error || dataFoto.length === 0) {
					return { status: "err", msg: "Gagal menghapus foto!" };
			}
		}
		const { error } = await supabase
			.from("motion24_anggotaBEM")
			.delete()
			.eq("nim", nim);
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", msg: "success delete user" };
	},
		isAdmin: async ({ nim }) => {
			const { data, error } = await supabase
				.from("motion24_anggotaBEM")
				.select("id_kementerian, motion24_admin(nim)")
				.eq("nim", `${nim}`);

		if (error || !data || data.length === 0) {
			return { status: "err", data: { isAdmin: false } };
		}

		const user = data[0];

		if (user.motion24_admin || user.id_kementerian === 2) {
			return { status: "ok", data: { isAdmin: true } };
		}

		return { status: "err", data: { isAdmin: false } };
	},
};

module.exports = user;
