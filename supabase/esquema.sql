-- =====================================================================
-- Centro Xictli: base de datos de la plataforma de alumnos (Supabase)
-- =====================================================================
-- Cómo usarlo: en tu proyecto de Supabase abre "SQL Editor", pega todo
-- este archivo y presiona "Run". Se puede volver a correr sin romper nada.
--
-- Seguridad: cada tabla tiene Row Level Security (RLS). La llave pública
-- (anon / publishable) que va en el sitio NO puede leer nada sin una sesión,
-- y cada alumno solo ve sus grupos, sus tareas y sus propias entregas.
-- Solo las cuentas con rol 'docente' pueden crear tareas, ver a todos los
-- alumnos y revisar resultados. Nadie puede cambiarse su propio rol.
-- =====================================================================

-- ---------- Tablas ----------

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '' check (char_length(nombre) <= 120),
  rol text not null default 'alumno' check (rol in ('alumno', 'docente')),
  creado_en timestamptz not null default now()
);

create table if not exists public.grupos (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique check (clave ~ '^[a-z0-9-]{2,40}$'),
  nombre text not null check (char_length(nombre) between 2 and 80),
  descripcion text not null default '' check (char_length(descripcion) <= 300),
  orden int not null default 99
);

create table if not exists public.miembros (
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  alumno_id uuid not null references public.perfiles (id) on delete cascade,
  primary key (grupo_id, alumno_id)
);

create table if not exists public.tareas (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 2 and 120),
  instrucciones text not null default '' check (char_length(instrucciones) <= 2000),
  -- juego: un juego del sitio · tema: una ficha de estudio · enlace: una
  -- página externa (Canva, Drive, YouTube) · texto: el alumno escribe su respuesta.
  tipo text not null check (tipo in ('juego', 'tema', 'enlace', 'texto')),
  referencia text not null default '' check (char_length(referencia) <= 500),
  fecha_entrega date,
  publicada boolean not null default true,
  creado_por uuid references public.perfiles (id) on delete set null default auth.uid(),
  creado_en timestamptz not null default now(),
  -- Los enlaces externos solo pueden ser https (evita enlaces javascript:).
  check (tipo <> 'enlace' or referencia ~ '^https://'),
  check (tipo not in ('juego', 'tema') or referencia ~ '^[a-z0-9-]{1,80}$')
);

create table if not exists public.entregas (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references public.tareas (id) on delete cascade,
  alumno_id uuid not null references public.perfiles (id) on delete cascade default auth.uid(),
  puntaje int check (puntaje >= 0),
  total int check (total > 0 and total <= 1000),
  detalle text not null default '' check (char_length(detalle) <= 200),
  respuesta text not null default '' check (char_length(respuesta) <= 5000),
  completada_en timestamptz not null default now(),
  unique (tarea_id, alumno_id),
  check (puntaje is null or (total is not null and puntaje <= total))
);

create index if not exists miembros_alumno_idx on public.miembros (alumno_id);
create index if not exists tareas_grupo_idx on public.tareas (grupo_id);
create index if not exists entregas_alumno_idx on public.entregas (alumno_id);

-- ---------- Funciones de apoyo ----------

-- ¿La sesión actual es de un docente? (security definer para que las
-- políticas puedan consultarlo sin abrir la tabla de perfiles.)
create or replace function public.es_docente()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'docente');
$$;

-- ¿La sesión actual pertenece a ese grupo?
create or replace function public.es_miembro(g uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.miembros where grupo_id = g and alumno_id = auth.uid());
$$;

revoke all on function public.es_docente() from public, anon;
revoke all on function public.es_miembro(uuid) from public, anon;
grant execute on function public.es_docente() to authenticated;
grant execute on function public.es_miembro(uuid) to authenticated;

-- Cada cuenta nueva recibe un perfil de ALUMNO. El rol nunca se toma de
-- los datos que manda el usuario: solo un docente (o tú en el SQL Editor)
-- puede convertir una cuenta en docente.
create or replace function public.crear_perfil()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)), 120), 'alumno')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ---------- Row Level Security ----------

alter table public.perfiles enable row level security;
alter table public.grupos   enable row level security;
alter table public.miembros enable row level security;
alter table public.tareas   enable row level security;
alter table public.entregas enable row level security;

-- Sin sesión no se ve nada.
revoke all on public.perfiles, public.grupos, public.miembros, public.tareas, public.entregas from anon;
grant select, insert, update, delete on public.perfiles, public.grupos, public.miembros, public.tareas, public.entregas to authenticated;

-- perfiles
drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_docente()));
drop policy if exists perfiles_docente_editar on public.perfiles;
create policy perfiles_docente_editar on public.perfiles for update to authenticated
  using ((select public.es_docente())) with check ((select public.es_docente()));
-- (No hay política de insert ni delete: los perfiles los crea el trigger y
-- se borran al borrar la cuenta en Supabase. Los alumnos no pueden editar su
-- perfil, así que tampoco pueden cambiar su rol.)

-- grupos
drop policy if exists grupos_ver on public.grupos;
create policy grupos_ver on public.grupos for select to authenticated
  using ((select public.es_docente()) or public.es_miembro(id));
drop policy if exists grupos_docente on public.grupos;
create policy grupos_docente on public.grupos for all to authenticated
  using ((select public.es_docente())) with check ((select public.es_docente()));

-- miembros
drop policy if exists miembros_ver on public.miembros;
create policy miembros_ver on public.miembros for select to authenticated
  using (alumno_id = (select auth.uid()) or (select public.es_docente()));
drop policy if exists miembros_docente on public.miembros;
create policy miembros_docente on public.miembros for all to authenticated
  using ((select public.es_docente())) with check ((select public.es_docente()));

-- tareas
drop policy if exists tareas_ver on public.tareas;
create policy tareas_ver on public.tareas for select to authenticated
  using ((select public.es_docente()) or (publicada and public.es_miembro(grupo_id)));
drop policy if exists tareas_docente on public.tareas;
create policy tareas_docente on public.tareas for all to authenticated
  using ((select public.es_docente())) with check ((select public.es_docente()));

-- entregas: el alumno solo crea y actualiza las suyas, y solo de tareas
-- publicadas de sus grupos. El docente ve y puede borrar todas.
drop policy if exists entregas_ver on public.entregas;
create policy entregas_ver on public.entregas for select to authenticated
  using (alumno_id = (select auth.uid()) or (select public.es_docente()));
drop policy if exists entregas_crear on public.entregas;
create policy entregas_crear on public.entregas for insert to authenticated
  with check (
    alumno_id = (select auth.uid())
    and exists (select 1 from public.tareas t where t.id = tarea_id and t.publicada and public.es_miembro(t.grupo_id))
  );
drop policy if exists entregas_actualizar on public.entregas;
create policy entregas_actualizar on public.entregas for update to authenticated
  using (alumno_id = (select auth.uid()))
  with check (
    alumno_id = (select auth.uid())
    and exists (select 1 from public.tareas t where t.id = tarea_id and t.publicada and public.es_miembro(t.grupo_id))
  );
drop policy if exists entregas_docente_borrar on public.entregas;
create policy entregas_docente_borrar on public.entregas for delete to authenticated
  using ((select public.es_docente()));

-- ---------- Grupos iniciales ----------

insert into public.grupos (clave, nombre, descripcion, orden) values
  ('reg-matematicas', 'Regularización de Matemáticas', 'Para ponerse al corriente en matemáticas.', 1),
  ('reg-espanol', 'Regularización de Español', 'Lectura, escritura y ortografía para ponerse al corriente.', 2),
  ('espanol', 'Clase de Español', 'Temas y tareas de la clase de Español.', 3)
on conflict (clave) do nothing;

-- ---------- Tu cuenta de docente ----------
-- 1) Crea tu usuario en Authentication > Users > Add user (con "Auto Confirm").
-- 2) Cambia el correo de abajo por el tuyo, quita los dos guiones del inicio y corre solo esa línea:
-- update public.perfiles set rol = 'docente', nombre = 'Mtro. Brandon' where id = (select id from auth.users where email = 'TU_CORREO@ejemplo.com');
