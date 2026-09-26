-- Campus One security hardening migration
-- Apply after supabase-schema.sql in the Supabase SQL editor.
-- Room PIN verification and role assignment must happen server-side.

create or replace function public.enter_room(
  p_room_code text,
  p_role public.user_role,
  p_full_name text,
  p_college text default null,
  p_batch text default null,
  p_cr_pin text default null
)
returns table (code text, college text, batch text, cr_locked boolean, created_by uuid)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.rooms;
  v_code text := upper(trim(p_room_code));
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;
  if v_code !~ '^[A-Z0-9]{4,12}$' or length(trim(p_full_name)) < 2 then
    raise exception 'Invalid room or profile details';
  end if;

  select * into v_room from public.rooms where rooms.code = v_code for update;

  if p_role = 'student' then
    if not found then raise exception 'Room not found'; end if;
    if v_room.cr_locked then raise exception 'This room is not accepting students'; end if;
  elsif p_role = 'cr' then
    if coalesce(length(p_cr_pin), 0) < 4 then raise exception 'A CR PIN of at least 4 characters is required'; end if;
    if not found then
      if nullif(trim(p_college), '') is null then raise exception 'College is required to create a room'; end if;
      insert into public.rooms (code, college, batch, cr_pin_hash, created_by)
      values (v_code, trim(p_college), nullif(trim(p_batch), ''), crypt(p_cr_pin, gen_salt('bf')), auth.uid())
      returning * into v_room;
    elsif v_room.cr_pin_hash is null or crypt(p_cr_pin, v_room.cr_pin_hash) <> v_room.cr_pin_hash then
      raise exception 'Invalid CR PIN';
    end if;
  else
    raise exception 'Invalid role';
  end if;

  insert into public.profiles (id, full_name, role, college, batch, room_code)
  values (auth.uid(), trim(p_full_name), p_role, v_room.college, v_room.batch, v_room.code)
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    college = excluded.college,
    batch = excluded.batch,
    room_code = excluded.room_code;

  return query select v_room.code, v_room.college, v_room.batch, v_room.cr_locked, v_room.created_by;
end;
$$;

revoke all on function public.enter_room(text, public.user_role, text, text, text, text) from public;
grant execute on function public.enter_room(text, public.user_role, text, text, text, text) to authenticated;

drop policy if exists "Rooms are visible to authenticated users" on public.rooms;
create policy "Members can view their room"
on public.rooms for select to authenticated using (
  created_by = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.room_code = rooms.code)
);

drop policy if exists "Profiles are visible to authenticated users" on public.profiles;
create policy "Users can view their profile and room members"
on public.profiles for select to authenticated using (
  id = (select auth.uid())
  or room_code is not null and exists (
    select 1 from public.profiles mine
    where mine.id = (select auth.uid()) and mine.room_code = profiles.room_code
  )
);

drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

