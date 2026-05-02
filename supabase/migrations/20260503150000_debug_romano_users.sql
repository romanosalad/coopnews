-- Debug: list all auth.users rows for romano and current editors rows.
-- Output goes to NOTICE so the CLI shows them. Then ensure every auth.users
-- row for that email has a matching editors row with chief_editor role.

do $$
declare
  seed_email text := 'romano@baiaku.com.br';
  user_record record;
  user_count integer := 0;
begin
  raise notice '== auth.users rows for % ==', seed_email;
  for user_record in
    select id, email, email_confirmed_at, created_at
    from auth.users where email = seed_email
  loop
    user_count := user_count + 1;
    raise notice '  user_id=%, confirmed=%, created=%', user_record.id, user_record.email_confirmed_at, user_record.created_at;

    -- Backfill editors for this auth user. ON CONFLICT (user_id) DO UPDATE
    -- and bypass any email-unique conflict by deleting other rows with the
    -- same email but a different user_id first.
    delete from public.editors where email = seed_email and user_id <> user_record.id;
    insert into public.editors (user_id, email, display_name, role)
    values (user_record.id, seed_email, 'Romano', 'chief_editor')
    on conflict (user_id) do update set role = 'chief_editor', email = excluded.email;
  end loop;
  raise notice 'Total auth.users rows for %: %', seed_email, user_count;

  raise notice '== editors rows for % ==', seed_email;
  for user_record in
    select user_id, email, role from public.editors where email = seed_email or user_id in (select id from auth.users where email = seed_email)
  loop
    raise notice '  user_id=%, email=%, role=%', user_record.user_id, user_record.email, user_record.role;
  end loop;
end;
$$;
