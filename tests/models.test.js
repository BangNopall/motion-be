const assert = require("node:assert/strict");
const test = require("node:test");

const loadWithMocks = (modulePath, mocks) => {
	const resolvedModule = require.resolve(modulePath);
	delete require.cache[resolvedModule];

	const originals = new Map();
	for (const [request, value] of Object.entries(mocks)) {
		const resolved = require.resolve(request);
		originals.set(resolved, require.cache[resolved]);
		require.cache[resolved] = {
			id: resolved,
			filename: resolved,
			loaded: true,
			exports: value,
		};
	}

	const module = require(modulePath);

	return {
		module,
		restore: () => {
			delete require.cache[resolvedModule];
			for (const [resolved, original] of originals) {
				if (original) {
					require.cache[resolved] = original;
				} else {
					delete require.cache[resolved];
				}
			}
		},
	};
};

test("attendance helpers normalize legacy values and calculate commitment score", () => {
	const {
		calculateCommitmentScore,
		normalizeAttendanceStatus,
	} = require("../constants/attendance");

	assert.equal(normalizeAttendanceStatus(true), "hadir");
	assert.equal(normalizeAttendanceStatus(false), "alpha");
	assert.equal(normalizeAttendanceStatus("Surat Sakit"), "surat_sakit");
	assert.equal(normalizeAttendanceStatus("surat_sakit"), "surat_sakit");

	assert.equal(
		calculateCommitmentScore([
			{ status: "hadir" },
			{ status: "surat_sakit" },
			{ status: "sakit" },
			{ status: "izin" },
			{ status: "alpha" },
		]),
		84
	);
});

test("login rejects unsuccessful upstream auth responses", async () => {
	const fetch = async () => ({
		json: async () => ({ message: "invalid credentials" }),
	});
	const supabase = {
		from() {
			throw new Error("Supabase should not be queried after failed auth");
		},
	};
	const { module: user, restore } = loadWithMocks("../models/user.model", {
		"../constants/config": supabase,
		"node-fetch": fetch,
	});

	try {
		const result = await user.login({ nim: "123", password: "wrong" });

		assert.equal(result.status, "err");
		assert.equal(result.msg, "invalid credentials");
	} finally {
		restore();
	}
});

test("login returns Supabase query errors", async () => {
	const fetch = async () => ({
		json: async () => ({
			message: "successfully logged in",
			data: { prodi: "Teknik Informatika" },
			token: "external-token",
		}),
	});
	const supabaseError = new Error("database unavailable");
	const supabase = {
		from() {
			return {
				select() {
					return this;
				},
				eq() {
					return this;
				},
				async single() {
					return { data: null, error: supabaseError };
				},
			};
		},
	};
	const { module: user, restore } = loadWithMocks("../models/user.model", {
		"../constants/config": supabase,
		"node-fetch": fetch,
	});

	try {
		const result = await user.login({ nim: "123", password: "secret" });

		assert.equal(result.status, "err");
		assert.equal(result.msg, supabaseError);
	} finally {
		restore();
	}
});

test("login accepts successful upstream auth responses without legacy message", async () => {
	const fetch = async () => ({
		json: async () => ({
			success: true,
			data: { prodi: "Teknik Informatika", token: "nested-token" },
		}),
	});
	const supabase = {
		from() {
			return {
				select() {
					return this;
				},
				eq() {
					return this;
				},
				async single() {
					return {
						data: {
							nim: "123",
							nama: "Anggota Test",
							jabatan: { id_jabatan: 1, jabatan: "Staff" },
							kementerian: { id_kementerian: 1, kementerian: "Test" },
						},
						error: null,
					};
				},
			};
		},
	};
	const { module: user, restore } = loadWithMocks("../models/user.model", {
		"../constants/config": supabase,
		"../constants/jwt": {
			generateToken(payload) {
				assert.deepEqual(payload, { nim: "123", isAdmin: false });
				return "backend-token";
			},
		},
		"node-fetch": fetch,
	});

	try {
		const result = await user.login({ nim: "123", password: "secret" });

		assert.equal(result.status, "ok");
		assert.equal(result.data.token, "backend-token");
		assert.equal(result.data.externalToken, "nested-token");
		assert.equal(result.data.isAdmin, false);
		assert.equal(result.data.prodi, "Teknik Informatika");
		assert.equal(result.data.nim, "123");
	} finally {
		restore();
	}
});

test("login returns not bem member when Supabase finds no matching user", async () => {
	const fetch = async () => ({
		json: async () => ({
			success: true,
			data: { prodi: "Teknik Komputer" },
			token: "external-token",
		}),
	});
	const supabase = {
		from() {
			return {
				select() {
					return this;
				},
				eq() {
					return this;
				},
				async single() {
					return {
						data: null,
						error: {
							code: "PGRST116",
							message: "Cannot coerce the result to a single JSON object",
							details: "The result contains 0 rows",
						},
					};
				},
			};
		},
	};
	const { module: user, restore } = loadWithMocks("../models/user.model", {
		"../constants/config": supabase,
		"node-fetch": fetch,
	});

	try {
		const result = await user.login({ nim: "245150307111006", password: "secret" });

		assert.equal(result.status, "err");
		assert.equal(result.msg, "not bem member");
	} finally {
		restore();
	}
});

test("login returns a fallback message when upstream auth omits error text", async () => {
	const fetch = async () => ({
		json: async () => ({ success: false }),
	});
	const supabase = {
		from() {
			throw new Error("Supabase should not be queried after failed auth");
		},
	};
	const { module: user, restore } = loadWithMocks("../models/user.model", {
		"../constants/config": supabase,
		"node-fetch": fetch,
	});

	try {
		const result = await user.login({ nim: "123", password: "wrong" });

		assert.equal(result.status, "err");
		assert.equal(result.msg, "login failed");
	} finally {
		restore();
	}
});

test("getRaporByTurnNim selects detailAspek deskripsi", async () => {
	let selectedColumns = "";
	const supabase = {
		from(table) {
			assert.equal(table, "motion24_rapor");
			return {
				select(columns) {
					selectedColumns = columns;
					return this;
				},
				eq() {
					return this;
				},
				order() {
					return this;
				},
				async single() {
					return { data: { id_rapor: 1 }, error: null };
				},
			};
		},
	};
	const { module: user, restore } = loadWithMocks("../models/user.model", {
		"../constants/config": supabase,
		"node-fetch": async () => ({ json: async () => ({}) }),
	});

	try {
		const result = await user.getRaporByTurnNim({ nim: "123", turn: "1" });

		assert.equal(result.status, "ok");
		assert.match(
			selectedColumns,
			/sub_aspek:motion24_detailAspek\([^)]*deskripsi/
		);
	} finally {
		restore();
	}
});

test("best staff queries use phase instead of month", async () => {
	const calls = [];
	const query = {
		select(columns) {
			calls.push(["select", columns]);
			return this;
		},
		eq(column, value) {
			calls.push(["eq", column, value]);
			return this;
		},
		order(column, options) {
			calls.push(["order", column, options]);
			return this;
		},
		then(resolve) {
			resolve({ data: [], error: null });
		},
	};
	const supabase = {
		from(table) {
			calls.push(["from", table]);
			return query;
		},
	};
	const { module: bestStaff, restore } = loadWithMocks("../models/bestStaff.model", {
		"../constants/config": supabase,
	});

	try {
		await bestStaff.getAllBestStaff();
		await bestStaff.getBestStaffByPhase({ phase: "2" });

		const selectedColumns = calls
			.filter(([method]) => method === "select")
			.map(([, columns]) => columns);

		assert.equal(calls[0][1], "motion24_bestStaff");
		assert.ok(selectedColumns.every((columns) => columns.includes("phase")));
		assert.ok(selectedColumns.every((columns) => !columns.includes("month")));
		assert.ok(
			calls.some(
				([method, column, value]) =>
					method === "eq" && column === "phase" && value === "2"
			)
		);
		assert.ok(
			calls.some(
				([method, column]) => method === "order" && column === "phase"
			)
		);
	} finally {
		restore();
	}
});

test("updateUser replaces an uploaded photo and stores the new public URL", async () => {
	const calls = [];
	const uploadedFile = {
		buffer: Buffer.from("new-photo"),
		mimetype: "image/webp",
		size: 9,
	};
	const supabase = {
		from(table) {
			const query = {
				table,
				select(columns) {
					calls.push({ table, action: "select", columns });
					return this;
				},
				update(payload) {
					calls.push({ table, action: "update", payload });
					return this;
				},
				eq(column, value) {
					calls.push({ table, action: "eq", column, value });
					return this;
				},
				single() {
					return {
						data: {
							nama: "Budi",
							foto: "https://example.test/storage/OLD/Budi",
							kementerian: { singkatan: "OLD" },
						},
						error: null,
					};
				},
				then(resolve) {
					resolve({ error: null, data: [] });
				},
			};
			return query;
		},
		storage: {
			from(bucket) {
				return {
					async upload(path, buffer, options) {
						calls.push({ bucket, action: "upload", path, buffer, options });
						return { error: null };
					},
					getPublicUrl(path) {
						calls.push({ bucket, action: "getPublicUrl", path });
						return { data: { publicUrl: `https://example.test/storage/${path}` } };
					},
					async remove(paths) {
						calls.push({ bucket, action: "remove", paths });
						return { data: paths.map((name) => ({ name })), error: null };
					},
				};
			},
		},
	};
	const { module: user, restore } = loadWithMocks("../models/user.model", {
		"../constants/config": supabase,
		"node-fetch": async () => ({ json: async () => ({}) }),
	});

	try {
		const result = await user.updateUser(
			{ nama: "Budi Baru" },
			{ nim: "123" },
			uploadedFile
		);

		assert.equal(result.status, "ok");
		assert.deepEqual(
			calls.find((call) => call.action === "upload"),
			{
				bucket: "motion24_bucket",
				action: "upload",
				path: "OLD/Budi Baru",
				buffer: uploadedFile.buffer,
				options: {
					cacheControl: "3600",
					contentType: "image/webp",
					upsert: true,
				},
			}
		);
		assert.deepEqual(
			calls.find((call) => call.action === "remove"),
			{
				bucket: "motion24_bucket",
				action: "remove",
				paths: ["OLD/Budi"],
			}
		);
		assert.deepEqual(
			calls.find(
				(call) => call.table === "motion24_anggotaBEM" && call.action === "update"
			).payload,
			{
				nama: "Budi Baru",
				foto: "https://example.test/storage/OLD/Budi Baru",
			}
		);
	} finally {
		restore();
	}
});

test("editRapor stores nilai rows with the route rapor id", async () => {
	const writes = [];
	const supabase = {
		from(table) {
			const query = {
				table,
				update(payload) {
					writes.push({ table, action: "update", payload });
					return this;
				},
				delete() {
					writes.push({ table, action: "delete" });
					return this;
				},
				upsert(payload) {
					writes.push({ table, action: "upsert", payload });
					return this;
				},
				eq() {
					return this;
				},
				then(resolve) {
					resolve({ error: null });
				},
			};
			return query;
		},
	};
	const { module: rapor, restore } = loadWithMocks("../models/rapor.model", {
		"../constants/config": supabase,
	});

	try {
		const result = await rapor.editRapor(
			{ id: 42 },
			{
				rapor_ke: 1,
				hobi: "Membaca",
				kesimpulan_diri: "Baik",
				feedback_c_level: "Perlu lebih aktif memberi insight ke anggota IRE",
				keterangan_absen: "-",
				motivasi: "Semangat",
				nim: "123",
				nilai: [{ id_subaspek: 7, nilai: 90 }],
			}
		);

		assert.equal(result.status, "ok");
		assert.deepEqual(
			writes.find((write) => write.table === "motion24_rapor" && write.action === "update")
				.payload,
			{
				rapor_ke: 1,
				hobi: "Membaca",
				kesimpulan_diri: "Baik",
				feedback_c_level: "Perlu lebih aktif memberi insight ke anggota IRE",
				keterangan_absen: "-",
				motivasi: "Semangat",
				nim: "123",
			}
		);
		assert.deepEqual(
			writes.find((write) => write.table === "motion24_nilai" && write.action === "upsert")
				.payload,
			[{ id_rapor: 42, id_subaspek: 7, nilai: 90 }]
		);
	} finally {
		restore();
	}
});

test("addRapor stores child rows with the inserted rapor id", async () => {
	const writes = [];
	const supabase = {
		from(table) {
			const query = {
				table,
				insert(payload) {
					writes.push({ table, action: "insert", payload });
					return this;
				},
				select() {
					return this;
				},
				upsert(payload) {
					writes.push({ table, action: "upsert", payload });
					return this;
				},
				then(resolve) {
					if (table === "motion24_rapor") {
						resolve({ data: [{ id_rapor: 99 }], error: null });
						return;
					}
					resolve({ error: null });
				},
			};
			return query;
		},
	};
	const { module: rapor, restore } = loadWithMocks("../models/rapor.model", {
		"../constants/config": supabase,
	});

	try {
		const result = await rapor.addRapor({
			rapor_ke: 1,
			hobi: "Membaca",
			kesimpulan_diri: "Baik",
			feedback_c_level: "Sudah mulai konsisten memantik refleksi tim",
			keterangan_absen: "-",
			motivasi: "Semangat",
			nim: "123",
			nilai: [{ id_subaspek: 7, nilai: 90 }],
		});

		assert.equal(result.status, "ok");
		assert.deepEqual(
			writes.find((write) => write.table === "motion24_rapor" && write.action === "insert")
				.payload,
			{
				rapor_ke: 1,
				hobi: "Membaca",
				kesimpulan_diri: "Baik",
				feedback_c_level: "Sudah mulai konsisten memantik refleksi tim",
				keterangan_absen: "-",
				motivasi: "Semangat",
				nim: "123",
			}
		);
		assert.deepEqual(
			writes.find((write) => write.table === "motion24_nilai" && write.action === "upsert")
				.payload,
			[{ id_rapor: 99, id_subaspek: 7, nilai: 90 }]
		);
	} finally {
		restore();
	}
});

test("addRapor stores normalized attendance status labels", async () => {
	const writes = [];
	const supabase = {
		from(table) {
			const query = {
				table,
				insert(payload) {
					writes.push({ table, action: "insert", payload });
					return this;
				},
				select() {
					return this;
				},
				upsert(payload) {
					writes.push({ table, action: "upsert", payload });
					return this;
				},
				then(resolve) {
					if (table === "motion24_rapor") {
						resolve({ data: [{ id_rapor: 99 }], error: null });
						return;
					}
					resolve({ error: null });
				},
			};
			return query;
		},
	};
	const { module: rapor, restore } = loadWithMocks("../models/rapor.model", {
		"../constants/config": supabase,
	});

	try {
		const result = await rapor.addRapor({
			rapor_ke: 1,
			hobi: "Membaca",
			motivasi: "Semangat",
			nim: "123",
			kehadiran: [
				{ id_kegiatan: 1, status: true },
				{ id_kegiatan: 2, status: "Surat Sakit" },
				{ id_kegiatan: 3, status: "Alpha" },
			],
		});

		assert.equal(result.status, "ok");
		assert.deepEqual(
			writes.find(
				(write) => write.table === "motion24_absensi" && write.action === "upsert"
			).payload,
			[
				{ id_kegiatan: 1, nim: "123", status: "hadir" },
				{ id_kegiatan: 2, nim: "123", status: "surat_sakit" },
				{ id_kegiatan: 3, nim: "123", status: "alpha" },
			]
		);
	} finally {
		restore();
	}
});

test("deleteRapor returns Supabase delete errors", async () => {
	const deleteError = new Error("delete failed");
	const supabase = {
		from(table) {
			return {
				select() {
					return this;
				},
				delete() {
					return this;
				},
				eq() {
					return this;
				},
				gte() {
					return this;
				},
				lte() {
					return this;
				},
				in() {
					return this;
				},
				single() {
					return { data: { nim: "123", rapor_ke: 1 }, error: null };
				},
				async match() {
					return { error: deleteError };
				},
				then(resolve) {
					if (table === "motion24_kegiatan") {
						resolve({ data: [{ id_kegiatan: 10 }], error: null });
						return;
					}

					resolve({ error: null });
				},
			};
		},
	};
	const { module: rapor, restore } = loadWithMocks("../models/rapor.model", {
		"../constants/config": supabase,
	});

	try {
		const result = await rapor.deleteRapor({ id: 42 });

		assert.equal(result.status, "err");
		assert.equal(result.msg, deleteError);
	} finally {
		restore();
	}
});

test("deleteRapor deletes attendance rows for the rapor period before deleting the rapor", async () => {
	const calls = [];
	const supabase = {
		from(table) {
			const query = {
				table,
				select(columns) {
					calls.push({ table, action: "select", columns });
					return this;
				},
				delete() {
					calls.push({ table, action: "delete" });
					return this;
				},
				eq(column, value) {
					calls.push({ table, action: "eq", column, value });
					return this;
				},
				gte(column, value) {
					calls.push({ table, action: "gte", column, value });
					return this;
				},
				lte(column, value) {
					calls.push({ table, action: "lte", column, value });
					return this;
				},
				in(column, value) {
					calls.push({ table, action: "in", column, value });
					return this;
				},
				match(value) {
					calls.push({ table, action: "match", value });
					return { error: null };
				},
				single() {
					return { data: { nim: "123", rapor_ke: 1 }, error: null };
				},
				then(resolve) {
					if (table === "motion24_kegiatan") {
						resolve({
							data: [{ id_kegiatan: 10 }, { id_kegiatan: 11 }],
							error: null,
						});
						return;
					}

					resolve({ error: null });
				},
			};
			return query;
		},
	};
	const { module: rapor, restore } = loadWithMocks("../models/rapor.model", {
		"../constants/config": supabase,
	});

	try {
		const result = await rapor.deleteRapor({ id: 42 });

		assert.equal(result.status, "ok");
		assert.deepEqual(
			calls.filter((call) => call.table === "motion24_absensi"),
			[
				{ table: "motion24_absensi", action: "delete" },
				{ table: "motion24_absensi", action: "eq", column: "nim", value: "123" },
				{
					table: "motion24_absensi",
					action: "in",
					column: "id_kegiatan",
					value: [10, 11],
				},
			]
		);
		assert.ok(
			calls.some(
				(call) =>
					call.table === "motion24_kegiatan" &&
					call.action === "gte" &&
					call.column === "tanggal" &&
					call.value === "2026-03-01"
			)
		);
		assert.ok(
			calls.some(
				(call) =>
					call.table === "motion24_kegiatan" &&
					call.action === "lte" &&
					call.column === "tanggal" &&
					call.value === "2026-05-31"
			)
		);
		assert.deepEqual(calls.at(-1), {
			table: "motion24_rapor",
			action: "match",
			value: { id_rapor: 42 },
		});
	} finally {
		restore();
	}
});
