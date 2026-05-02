-- Force-create or repair the editor row for romano@baiaku.com.br.
-- The previous seed migration may have hit a unique-on-email conflict that
-- our ON CONFLICT (user_id) clause couldn't catch, leaving auth.users with
-- a valid user but no editors row. This migration deletes any stale editors
-- row for that email and inserts a fresh one tied to the current auth.users.id.

do $$
declare
  seed_email text := 'romano@baiaku.com.br';
  current_user_id uuid;
  editor_count integer;
begin
  -- Get the auth user id.
  select id into current_user_id from auth.users where email = seed_email limit 1;
  raise notice 'romano auth.users.id = %', current_user_id;

  if current_user_id is null then
    raise notice 'No auth.users row for %, aborting.', seed_email;
    return;
  end if;

  -- Show what's currently in editors.
  select count(*) into editor_count from public.editors where email = seed_email or user_id = current_user_id;
  raise notice 'Existing editors rows matching email or user_id: %', editor_count;

  -- Wipe stale rows and reinsert fresh.
  delete from public.editors where email = seed_email or user_id = current_user_id;
  insert into public.editors (user_id, email, display_name, role)
  values (current_user_id, seed_email, 'Romano', 'chief_editor');

  raise notice 'Editor row created for % with role chief_editor.', seed_email;
end;
$$;
