const ATTENDANCE_STATUS = {
	HADIR: "hadir",
	SURAT_SAKIT: "surat_sakit",
	SAKIT: "sakit",
	IZIN: "izin",
	ALPHA: "alpha",
};

const ATTENDANCE_DEDUCTION = {
	[ATTENDANCE_STATUS.HADIR]: 0,
	[ATTENDANCE_STATUS.SURAT_SAKIT]: 0,
	[ATTENDANCE_STATUS.SAKIT]: 3,
	[ATTENDANCE_STATUS.IZIN]: 3,
	[ATTENDANCE_STATUS.ALPHA]: 10,
};

const normalizeAttendanceStatus = (status) => {
	if (status === true || status === 1 || status === "1") {
		return ATTENDANCE_STATUS.HADIR;
	}
	if (status === false || status === 0 || status === "0") {
		return ATTENDANCE_STATUS.ALPHA;
	}

	const normalized = String(status ?? "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "_");

	if (normalized === "true" || normalized === "hadir") {
		return ATTENDANCE_STATUS.HADIR;
	}
	if (normalized === "false" || normalized === "tidak_hadir") {
		return ATTENDANCE_STATUS.ALPHA;
	}
	if (normalized === "surat_sakit") {
		return ATTENDANCE_STATUS.SURAT_SAKIT;
	}
	if (normalized === "sakit") {
		return ATTENDANCE_STATUS.SAKIT;
	}
	if (normalized === "izin") {
		return ATTENDANCE_STATUS.IZIN;
	}
	if (normalized === "alpha") {
		return ATTENDANCE_STATUS.ALPHA;
	}

	return "";
};

const calculateCommitmentScore = (attendanceRows = []) => {
	const deduction = attendanceRows.reduce((total, item) => {
		const status = normalizeAttendanceStatus(item?.status);
		return total + (ATTENDANCE_DEDUCTION[status] || 0);
	}, 0);

	return Math.max(0, 100 - deduction);
};

module.exports = {
	ATTENDANCE_DEDUCTION,
	ATTENDANCE_STATUS,
	calculateCommitmentScore,
	normalizeAttendanceStatus,
};
