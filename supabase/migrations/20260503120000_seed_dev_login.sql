-- TEMPORARY DEV LOGIN
-- Creates romano@baiaku.com.br with password '1234' so the team can log in
-- without configuring magic link redirect URLs first. Upgrade to magic link
-- or proper password (8+ chars) before going to production.
--
-- Idempotent: if the user already exists, just confirms the email and resets
-- the password.

do $$
declare
  seed_email text := 'romano@baiaku.com.br';
  seed_password text := '1234';
  existing_id uuid;
  new_id uuid;
begin
  select id into existing_id from auth.users where email = seed_email limit 1;

  if existing_id is not null then
    update auth.users
    set
      encrypted_password = extensions.crypt(seed_password, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
    where id = existing_id;
  else
    new_id := gen_random_uuid();
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_id,
      'authenticated',
      'authenticated',
      seed_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('display_name', 'Romano'),
      false,
      '',
      '',
      '',
      ''
    );
    existing_id := new_id;
  end if;

  -- Ensure editors row exists with chief_editor role.
  insert into public.editors (user_id, email, display_name, role)
  values (existing_id, seed_email, 'Romano', 'chief_editor')
  on conflict (user_id) do update set role = 'chief_editor', display_name = excluded.display_name;
end;
$$;
