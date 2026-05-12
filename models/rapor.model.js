const supabase = require("../constants/config");
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
		const { kehadiran, detail_rapor, nilai } = data;
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
					status: item.status,
				});
			});
			const { error: errKehadiran } = await supabase
				.from("motion24_absensi")
				.upsert(dataKehadiran);
			if (errKehadiran) {
				return { status: "err", msg: errKehadiran };
			}
		}
		if (detail_rapor) {
			let dataDetailRapor = [];
			detail_rapor.forEach((item) => {
				dataDetailRapor.push({
					id_rapor: id_rapor[0].id_rapor,
					id_aspek: item.id_aspek,
					catatan_transparansi: item.transparansi,
				});
			});
			const { error: errDetailRapor } = await supabase
				.from("motion24_transparansi")
				.upsert(dataDetailRapor);
			if (errDetailRapor) {
				return { status: "err", msg: errDetailRapor };
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
		const { kehadiran, detail_rapor, nilai } = data;
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
					status: item.status,
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
		if (detail_rapor) {
			const { error: errDeleteTransparansi } = await supabase
				.from("motion24_transparansi")
				.delete()
				.eq("id_rapor", id);
			if (errDeleteTransparansi) {
				console.log("errDeleteTransparansi", errDeleteTransparansi);
				return { status: "err", msg: errDeleteTransparansi };
			}
			let dataDetailRapor = [];
			detail_rapor.forEach((item) => {
				dataDetailRapor.push({
					id_rapor: id,
					id_aspek: item.id_aspek,
					catatan_transparansi: item.transparansi,
				});
			});
			const { error: errDetailRapor } = await supabase
				.from("motion24_transparansi")
				.upsert(dataDetailRapor);
			if (errDetailRapor) {
				console.log("errDetailRapor", errDetailRapor);
				return { status: "err", msg: errDetailRapor };
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
