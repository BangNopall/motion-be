do $$
begin
	if exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'motion24_bestStaff'
			and column_name = 'month'
	) and not exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'motion24_bestStaff'
			and column_name = 'phase'
	) then
		alter table public."motion24_bestStaff" rename column month to phase;
	end if;
end $$;

alter table public."motion24_bestStaff"
	drop constraint if exists "motion24_bestStaff_month_check";

do $$
begin
	if not exists (
		select 1
		from pg_constraint
		where conname = 'motion24_bestStaff_phase_check'
			and conrelid = 'public."motion24_bestStaff"'::regclass
	) then
		alter table public."motion24_bestStaff"
			add constraint "motion24_bestStaff_phase_check" check (phase between 1 and 3);
	end if;
end $$;

alter table public."motion24_bestStaff"
	drop constraint if exists "motion24_bestStaff_month_id_kementerian_key";

do $$
begin
	if not exists (
		select 1
		from pg_constraint
		where conname = 'motion24_bestStaff_phase_id_kementerian_key'
			and conrelid = 'public."motion24_bestStaff"'::regclass
	) then
		alter table public."motion24_bestStaff"
			add constraint "motion24_bestStaff_phase_id_kementerian_key" unique (phase, id_kementerian);
	end if;
end $$;
