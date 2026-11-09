-- =====================================================================
-- Centro Xictli · Migración 002: superusuario, maestros y aulas
-- =====================================================================
-- Córrelo DESPUÉS de esquema.sql, en Supabase > SQL Editor > Run.
-- Se puede correr varias veces sin romper nada.
--
-- Qué cambia:
--   · Nuevo rol 'admin' (superusuario): ve y administra absolutamente todo.
--   · Los maestros ('docente') crean sus propias aulas y solo administran
--     las suyas: sus alumnos, sus actividades y sus resultados.
--   · Los "grupos" pasan a ser aulas: tienen dueño, materia, descripción y color.
--   · Nuevo tipo de actividad 'aviso' (un anuncio en el recorrido, sin entrega).
--   · La primera vez, el docente que ya existía se convierte en admin.
-- =====================================================================

-- ---------- Roles ----------
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol in ('alumno', 'docente', 'admin'));

-- Solo la primera vez: si todavía no hay admin, el docente actual (el dueño
-- del centro) se vuelve superusuario.
update public.perfiles set rol = 'admin'
where rol = 'docente' and not exists (select 1 from public.perfiles where rol = 'admin');

-- ---------- Aulas (antes "grupos") ----------
alter table public.grupos add column if not exists docente_id uuid references public.perfiles (id) on delete set null;
alter table public.grupos add column if not exists materia text not null default '' check (char_length(materia) <= 60);
alter table public.grupos add column if not exists color text not null default 'rosa' check (color in ('rosa', 'negro', 'claro'));
alter table public.grupos add column if not exists creado_en timestamptz not null default now();
alter table public.grupos alter column docente_id set default auth.uid();
alter table public.grupos alter column descripcion type text;
alter table public.grupos drop constraint if exists grupos_descripcion_check;
alter table public.grupos add constraint grupos_descripcion_check check (char_length(descripcion) <= 600);
-- La clave ahora se genera sola si no se manda.
alter table public.grupos alter column clave set default 'aula-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

-- Las aulas que ya existían quedan a cargo del admin.
update public.grupos set docente_id = (select id from public.perfiles where rol = 'admin' order by creado_en limit 1)
where docente_id is null;

update public.grupos set materia = 'Matemáticas' where clave = 'reg-matematicas' and materia = '';
update public.grupos set materia = 'Español' where clave in ('reg-espanol', 'espanol') and materia = '';
update public.grupos set color = 'negro' where clave = 'reg-espanol' and color = 'rosa';
update public.grupos set color = 'claro' where clave = 'espanol' and color = 'rosa';

create index if not exists grupos_docente_idx on public.grupos (docente_id);

-- ---------- Actividades del recorrido ----------
alter table public.tareas drop constraint if exists tareas_tipo_check;
alter table public.tareas add constraint tareas_tipo_check check (tipo in ('juego', 'tema', 'enlace', 'texto', 'aviso'));
alter table public.tareas add column if not exists orden int not null default 0;

-- ---------- Funciones de permisos ----------
create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'); $$;

-- Ahora "docente" incluye al admin (personal del centro).
create or replace function public.es_docente()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.perfiles where id = auth.uid() and rol in ('docente', 'admin')); $$;

-- ¿Puede la sesión actual administrar esta aula? (admin, o el maestro dueño)
create or replace function public.gestiona_aula(g uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
      or exists (select 1 from public.grupos where id = g and docente_id = auth.uid()
                 and exists (select 1 from public.perfiles where id = auth.uid() and rol = 'docente'));
$$;

revoke all on function public.es_admin() from public, anon;
revoke all on function public.gestiona_aula(uuid) from public, anon;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.gestiona_aula(uuid) to authenticated;

-- ---------- Políticas nuevas ----------

-- perfiles: cada quien ve el suyo; el personal (maestros y admin) ve a todos
-- para poder inscribir alumnos. Solo el admin edita perfiles y roles.
drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_docente()));
drop policy if exists perfiles_docente_editar on public.perfiles;
drop policy if exists perfiles_admin_editar on public.perfiles;
create policy perfiles_admin_editar on public.perfiles for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- aulas
drop policy if exists grupos_ver on public.grupos;
create policy grupos_ver on public.grupos for select to authenticated
  using (public.gestiona_aula(id) or public.es_miembro(id));
drop policy if exists grupos_docente on public.grupos;
drop policy if exists grupos_crear on public.grupos;
create policy grupos_crear on public.grupos for insert to authenticated
  with check ((select public.es_admin()) or ((select public.es_docente()) and docente_id = (select auth.uid())));
drop policy if exists grupos_editar on public.grupos;
create policy grupos_editar on public.grupos for update to authenticated
  using (public.gestiona_aula(id))
  with check ((select public.es_admin()) or docente_id = (select auth.uid()));
drop policy if exists grupos_borrar on public.grupos;
create policy grupos_borrar on public.grupos for delete to authenticated
  using (public.gestiona_aula(id));

-- inscripciones
drop policy if exists miembros_ver on public.miembros;
create policy miembros_ver on public.miembros for select to authenticated
  using (alumno_id = (select auth.uid()) or public.gestiona_aula(grupo_id));
drop policy if exists miembros_docente on public.miembros;
drop policy if exists miembros_gestionar on public.miembros;
create policy miembros_gestionar on public.miembros for all to authenticated
  using (public.gestiona_aula(grupo_id)) with check (public.gestiona_aula(grupo_id));

-- actividades
drop policy if exists tareas_ver on public.tareas;
create policy tareas_ver on public.tareas for select to authenticated
  using (public.gestiona_aula(grupo_id) or (publicada and public.es_miembro(grupo_id)));
drop policy if exists tareas_docente on public.tareas;
drop policy if exists tareas_gestionar on public.tareas;
create policy tareas_gestionar on public.tareas for all to authenticated
  using (public.gestiona_aula(grupo_id)) with check (public.gestiona_aula(grupo_id));

-- entregas (crear y actualizar las propias sigue igual que en esquema.sql;
-- un aviso no admite entregas)
drop policy if exists entregas_ver on public.entregas;
create policy entregas_ver on public.entregas for select to authenticated
  using (alumno_id = (select auth.uid())
         or exists (select 1 from public.tareas t where t.id = tarea_id and public.gestiona_aula(t.grupo_id)));
drop policy if exists entregas_crear on public.entregas;
create policy entregas_crear on public.entregas for insert to authenticated
  with check (
    alumno_id = (select auth.uid())
    and exists (select 1 from public.tareas t where t.id = tarea_id and t.publicada and t.tipo <> 'aviso' and public.es_miembro(t.grupo_id))
  );
drop policy if exists entregas_actualizar on public.entregas;
create policy entregas_actualizar on public.entregas for update to authenticated
  using (alumno_id = (select auth.uid()))
  with check (
    alumno_id = (select auth.uid())
    and exists (select 1 from public.tareas t where t.id = tarea_id and t.publicada and t.tipo <> 'aviso' and public.es_miembro(t.grupo_id))
  );
drop policy if exists entregas_docente_borrar on public.entregas;
create policy entregas_docente_borrar on public.entregas for delete to authenticated
  using (exists (select 1 from public.tareas t where t.id = tarea_id and public.gestiona_aula(t.grupo_id)));

-- ---------- Vista para administración general ----------
-- Correo de cada cuenta, visible solo para el admin (la función revisa el rol).
create or replace function public.admin_cuentas()
returns table (id uuid, correo text, ultimo_acceso timestamptz)
language sql stable security definer set search_path = ''
as $$
  select u.id, u.email::text, u.last_sign_in_at
  from auth.users u
  where exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;
revoke all on function public.admin_cuentas() from public, anon;
grant execute on function public.admin_cuentas() to authenticated;
