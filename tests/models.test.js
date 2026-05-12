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
				keterangan_absen: "-",
				motivasi: "Semangat",
				nim: "123",
				nilai: [{ id_subaspek: 7, nilai: 90 }],
			}
		);

		assert.equal(result.status, "ok");
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
			keterangan_absen: "-",
			motivasi: "Semangat",
			nim: "123",
			nilai: [{ id_subaspek: 7, nilai: 90 }],
			detail_rapor: [{ id_aspek: 2, transparansi: "Jelas" }],
		});

		assert.equal(result.status, "ok");
		assert.deepEqual(
			writes.find((write) => write.table === "motion24_nilai" && write.action === "upsert")
				.payload,
			[{ id_rapor: 99, id_subaspek: 7, nilai: 90 }]
		);
		assert.deepEqual(
			writes.find(
				(write) => write.table === "motion24_transparansi" && write.action === "upsert"
			).payload,
			[{ id_rapor: 99, id_aspek: 2, catatan_transparansi: "Jelas" }]
		);
	} finally {
		restore();
	}
});

test("deleteRapor returns Supabase delete errors", async () => {
	const deleteError = new Error("delete failed");
	const supabase = {
		from() {
			return {
				delete() {
					return this;
				},
				async match() {
					return { error: deleteError };
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
