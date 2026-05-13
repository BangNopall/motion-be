do $$
begin
	if exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'motion24_absensi'
			and column_name = 'status'
			and data_type = 'boolean'
	) then
		alter table public.motion24_absensi
			alter column status drop default;

		alter table public.motion24_absensi
			alter column status type text
			using case
				when status is true then 'hadir'
				else 'alpha'
			end;
	end if;

	alter table public.motion24_absensi
		alter column status set default 'alpha';

	if not exists (
		select 1
		from pg_constraint
		where conname = 'motion24_absensi_status_check'
	) then
		alter table public.motion24_absensi
			add constraint motion24_absensi_status_check
			check (status in ('hadir', 'surat_sakit', 'sakit', 'izin', 'alpha'));
	end if;
end $$;
