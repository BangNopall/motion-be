const supabase = require("../constants/config");
const { normalizeAttendanceStatus } = require("../constants/attendance");

const getRaporDateRange = (raporKe) => {
	switch (Number(raporKe)) {
		case 1:
			return {
				start: "2026-03-01",
				end: "2026-05-31",
			};
		case 2:
			return {
				start: "2026-06-01",
				end: "2026-08-31",
			};
		case 3:
			return {
				start: "2026-09-01",
				end: "2026-11-30",
			};
		default:
			return {
				start: "2026-01-01",
				end: "2026-12-31",
			};
	}
};

const rapor = {
	getAllRapor: async () => {
		const { data, error } = await supabase
			.from("motion24_rapor")
			.select(
				"*, user:motion24_anggotaBEM(nama, id_jabatan, id_kementerian, proker:motion24_proker(id_proker, proker), kementerian:motion24_kementerian(singkatan), jabatan:motion24_jabatan(jabatan))"
			)
			.order("nim");
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", data };
	},
	addRapor: async (data) => {
		const { kehadiran, nilai } = data;
		const { data: id_rapor, error: errRapor } = await supabase
			.from("motion24_rapor")
			.insert({
				rapor_ke: data.rapor_ke,
				hobi: data.hobi,
				kesimpulan_diri: data.kesimpulan_diri,
				keterangan_absen: data.keterangan_absen,
				motivasi: data.motivasi,
				nim: data.nim,
			})
			.select("id_rapor");
		if (errRapor) {
			return { status: "err", msg: errRapor };
		}
			if (kehadiran) {
				let dataKehadiran = [];
				kehadiran.forEach((item) => {
					dataKehadiran.push({
						id_kegiatan: item.id_kegiatan,
						nim: data.nim,
						status: normalizeAttendanceStatus(item.status),
					});
				});
			const { error: errKehadiran } = await supabase
				.from("motion24_absensi")
				.upsert(dataKehadiran);
			if (errKehadiran) {
				return { status: "err", msg: errKehadiran };
			}
		}
		if (nilai) {
			let dataNilai = [];
			nilai.forEach((item) => {
				dataNilai.push({
					id_rapor: id_rapor[0].id_rapor,
					id_subaspek: item.id_subaspek,
					nilai: item.nilai,
				});
			});
			const { error: errNilai } = await supabase
				.from("motion24_nilai")
				.upsert(dataNilai);
			if (errNilai) {
				return { status: "err", msg: errNilai };
			}
		}
		
		return { status: "ok", msg: "success add rapor" };
	},
	editRapor: async ({ id }, data) => {
		const { kehadiran, nilai } = data;
		const { error: errRapor } = await supabase
			.from("motion24_rapor")
			.update({
				rapor_ke: data.rapor_ke,
				hobi: data.hobi,
				kesimpulan_diri: data.kesimpulan_diri,
				keterangan_absen: data.keterangan_absen,
				motivasi: data.motivasi,
				nim: data.nim,
			})
			.eq("id_rapor", id);
		if (errRapor) {
			console.log("errRapor", errRapor);
			return { status: "err", msg: errRapor };
		}
		if (kehadiran) {
			const { error: errDeleteKehadiran } = await supabase
				.from("motion24_absensi")
				.delete()
				.eq("nim", data.nim);
			if (errDeleteKehadiran) {
				console.log("errDeleteKehadiran", errDeleteKehadiran);
				return { status: "err", msg: errDeleteKehadiran };
			}
			//insert new data

				let dataKehadiran = [];
				kehadiran.forEach((item) => {
					dataKehadiran.push({
						id_kegiatan: item.id_kegiatan,
						nim: data.nim,
						status: normalizeAttendanceStatus(item.status),
					});
				});
			const { error: errKehadiran } = await supabase
				.from("motion24_absensi")
				.upsert(dataKehadiran);
			if (errKehadiran) {
				console.log("errKehadiran", errKehadiran);
				return { status: "err", msg: errKehadiran };
			}
		}
		if (nilai) {
			const { error: errDeleteNilai } = await supabase
				.from("motion24_nilai")
				.delete()
				.eq("id_rapor", id);
			if (errDeleteNilai) {
				console.log("errDeleteNilai", errDeleteNilai);
				return { status: "err", msg: errDeleteNilai };
			}
			let dataNilai = [];
			nilai.forEach((item) => {
				dataNilai.push({
					id_rapor: id,
					id_subaspek: item.id_subaspek,
					nilai: item.nilai,
				});
			});
			const { error: errNilai } = await supabase
				.from("motion24_nilai")
				.upsert(dataNilai);
			if (errNilai) {
				console.log("errNilai", errNilai);
				return { status: "err", msg: errNilai };
			}
		}
		return { status: "ok", msg: "success edit rapor" };
	},
	deleteRapor: async ({ id }) => {
		const { data: raporData, error: errGetRapor } = await supabase
			.from("motion24_rapor")
			.select("nim, rapor_ke")
			.eq("id_rapor", id)
			.single();
		if (errGetRapor) {
			return { status: "err", msg: errGetRapor };
		}

		const tanggal = getRaporDateRange(raporData.rapor_ke);
		const { data: kegiatanData, error: errKegiatan } = await supabase
			.from("motion24_kegiatan")
			.select("id_kegiatan")
			.gte("tanggal", tanggal.start)
			.lte("tanggal", tanggal.end);
		if (errKegiatan) {
			return { status: "err", msg: errKegiatan };
		}

		const idKegiatan = (Array.isArray(kegiatanData) ? kegiatanData : [])
			.map((item) => item.id_kegiatan)
			.filter(Boolean);
		if (idKegiatan.length > 0) {
			const { error: errDeleteKehadiran } = await supabase
				.from("motion24_absensi")
				.delete()
				.eq("nim", raporData.nim)
				.in("id_kegiatan", idKegiatan);
			if (errDeleteKehadiran) {
				return { status: "err", msg: errDeleteKehadiran };
			}
		}

		const { error } = await supabase
			.from("motion24_rapor")
			.delete()
			.match({ id_rapor: id });
		if (error) {
			return { status: "err", msg: error };
		}
		return { status: "ok", msg: "success delete rapor" };
	},
};

module.exports = rapor;
