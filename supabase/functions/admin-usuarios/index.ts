// Función de Supabase (Edge Function) para la Administración general.
// Crea cuentas de alumnos y maestros, cambia contraseñas y borra cuentas.
//
// Por qué una función: crear usuarios requiere la llave secreta del proyecto
// (service_role), que NUNCA debe ir en la página. Aquí vive del lado del
// servidor, y antes de hacer cualquier cosa se comprueba que quien llama
// tiene sesión y rol 'admin'.
//
// Cómo publicarla: Supabase > Edge Functions > Deploy a new function >
// Via Editor, nómbrala "admin-usuarios", pega este archivo y presiona Deploy.
// (Deja activado "Verify JWT".) La llave secreta la pone Supabase solo.

import { createClient } from 'npm:@supabase/supabase-js@2';

const ORIGENES = ['https://soybran07.github.io', 'http://localhost:4321'];
const DOMINIO_ALUMNOS = 'alumnos.centroxictli.mx';

function cabeceras(origen: string | null) {
  return {
    'Access-Control-Allow-Origin': origen && ORIGENES.includes(origen) ? origen : ORIGENES[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
    'Content-Type': 'application/json',
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function correoDe(entrada: unknown) {
  const v = String(entrada ?? '').trim().toLowerCase();
  if (/^[a-z0-9._-]{3,40}$/.test(v)) return `${v}@${DOMINIO_ALUMNOS}`;
  if (/^[^\s@]{1,64}@[^\s@]+\.[a-z]{2,}$/.test(v) && v.length <= 120) return v;
  return null;
}

Deno.serve(async (req) => {
  const h = cabeceras(req.headers.get('origin'));
  const responder = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: h });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: h });
  if (req.method !== 'POST') return responder({ error: 'Método no permitido' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const secreta = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1) ¿Quién llama? Se valida el token con el servidor de Auth.
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: quien, error: errQuien } = await admin.auth.getUser(token);
  if (errQuien || !quien.user) return responder({ error: 'Sesión no válida' }, 401);
  const { data: perfil } = await admin.from('perfiles').select('rol').eq('id', quien.user.id).single();
  if (perfil?.rol !== 'admin') return responder({ error: 'Solo la administración general puede hacer esto' }, 403);

  let datos: Record<string, unknown>;
  try { datos = await req.json(); } catch { return responder({ error: 'Datos no válidos' }, 400); }

  // 2) Acciones
  if (datos.accion === 'crear') {
    const correo = correoDe(datos.usuario);
    const contrasena = String(datos.contrasena ?? '');
    const nombre = String(datos.nombre ?? '').trim().slice(0, 120);
    const rol = datos.rol === 'docente' ? 'docente' : 'alumno';
    const aulas = Array.isArray(datos.aulas) ? datos.aulas.filter((a) => typeof a === 'string' && UUID.test(a)).slice(0, 50) : [];
    if (!correo) return responder({ error: 'Usuario o correo no válido. Usa solo letras, números, punto o guion, o un correo completo.' }, 400);
    if (contrasena.length < 8 || contrasena.length > 72) return responder({ error: 'La contraseña debe tener entre 8 y 72 caracteres.' }, 400);

    const { data: nuevo, error } = await admin.auth.admin.createUser({
      email: correo, password: contrasena, email_confirm: true, user_metadata: { nombre },
    });
    if (error || !nuevo.user) {
      const repetido = /already|registered|exists/i.test(error?.message ?? '');
      return responder({ error: repetido ? 'Ya existe una cuenta con ese usuario o correo.' : 'No se pudo crear la cuenta.' }, 400);
    }
    // El perfil lo crea el trigger como alumno; aquí se ajustan nombre y rol.
    await admin.from('perfiles').upsert({ id: nuevo.user.id, nombre, rol });
    if (aulas.length) await admin.from('miembros').insert(aulas.map((g) => ({ grupo_id: g, alumno_id: nuevo.user.id })));
    return responder({ ok: true, id: nuevo.user.id, correo });
  }

  if (datos.accion === 'contrasena') {
    const id = String(datos.id ?? '');
    const contrasena = String(datos.contrasena ?? '');
    if (!UUID.test(id)) return responder({ error: 'Cuenta no válida' }, 400);
    if (contrasena.length < 8 || contrasena.length > 72) return responder({ error: 'La contraseña debe tener entre 8 y 72 caracteres.' }, 400);
    const { error } = await admin.auth.admin.updateUserById(id, { password: contrasena });
    return error ? responder({ error: 'No se pudo cambiar la contraseña.' }, 400) : responder({ ok: true });
  }

  if (datos.accion === 'eliminar') {
    const id = String(datos.id ?? '');
    if (!UUID.test(id)) return responder({ error: 'Cuenta no válida' }, 400);
    if (id === quien.user.id) return responder({ error: 'No puedes borrar tu propia cuenta.' }, 400);
    const { error } = await admin.auth.admin.deleteUser(id);
    return error ? responder({ error: 'No se pudo borrar la cuenta.' }, 400) : responder({ ok: true });
  }

  return responder({ error: 'Acción desconocida' }, 400);
});
