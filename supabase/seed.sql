-- Starter seed for a fresh MOTION Supabase project.
-- Replace these placeholder master values with the real organization data.

insert into public.motion24_kementerian (id_kementerian, kementerian, singkatan)
values
	(1, 'Human Capital Ministry', 'HC'),
	(2, 'Talent Growth Ministry', 'TG'),
	(3, 'Creative Enterprise Ministry', 'CE'),
	(4, 'Social Equity and Environment Ministry', 'SEE'),
	(5, 'Studies and Strategic Action Ministry', 'SSA'),
	(6, 'Student Advocacy and Welfare Ministry', 'SAW'),
	(7, 'Administration and Finance Bureau', 'AF'),
	(8, 'Creative Media and Information Bureau', 'CMI'),
	(9, 'IT Solutions Bureau', 'ITS'),
	(10, 'Internal Resource Empowerment', 'IRE'),
	(11, 'Inter-Agency Affairs Ministry', 'IAA'),
	(12, 'Board of Director', 'BoD')

on conflict (id_kementerian) do update
set
	kementerian = excluded.kementerian,
	singkatan = excluded.singkatan;

insert into public.motion24_jabatan (id_jabatan, jabatan)
values
	(1, 'Staff'),
	(2, 'Chief'),
	(3, 'Vice Chief'),
	(4, 'Director'),
	(5, 'Cabinet Secretary'),
	(6, 'Cabinet Advisor'),
	(7, 'Vice President'),
	(8, 'President')

on conflict (id_jabatan) do update
set jabatan = excluded.jabatan;

insert into public.motion24_proker (id_proker, proker, id_kementerian)
values
	(1, 'Belum Ditentukan', 1)
on conflict (id_proker) do update
set
	proker = excluded.proker,
	id_kementerian = excluded.id_kementerian;

insert into public.motion24_aspek (id_aspek, aspek, indikator, id_jabatan)
values
	(1, 'Kinerja', 'Kontribusi dan tanggung jawab dalam organisasi', 1),
	(2, 'Komunikasi', 'Kejelasan komunikasi dan koordinasi', 1)
on conflict (id_aspek) do update
set
	aspek = excluded.aspek,
	indikator = excluded.indikator,
	id_jabatan = excluded.id_jabatan;

insert into public."motion24_detailAspek" (id_subaspek, id_aspek, sub_aspek, deskripsi)
values
	(1, 1, 'Tanggung Jawab', 'Menjalankan amanah sesuai peran.'),
	(2, 1, 'Inisiatif', 'Aktif mencari solusi dan membantu kebutuhan tim.'),
	(3, 2, 'Koordinasi', 'Menyampaikan informasi dengan jelas dan tepat waktu.')
on conflict (id_subaspek) do update
set
	id_aspek = excluded.id_aspek,
	sub_aspek = excluded.sub_aspek,
	deskripsi = excluded.deskripsi;



select setval(pg_get_serial_sequence('public.motion24_kementerian', 'id_kementerian'), coalesce((select max(id_kementerian) from public.motion24_kementerian), 1), true);
select setval(pg_get_serial_sequence('public.motion24_jabatan', 'id_jabatan'), coalesce((select max(id_jabatan) from public.motion24_jabatan), 1), true);
select setval(pg_get_serial_sequence('public.motion24_proker', 'id_proker'), coalesce((select max(id_proker) from public.motion24_proker), 1), true);
select setval(pg_get_serial_sequence('public.motion24_aspek', 'id_aspek'), coalesce((select max(id_aspek) from public.motion24_aspek), 1), true);
select setval(pg_get_serial_sequence('public."motion24_detailAspek"', 'id_subaspek'), coalesce((select max(id_subaspek) from public."motion24_detailAspek"), 1), true);
