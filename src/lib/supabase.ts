import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { plataforma, plataformaLista } from '../config/plataforma';
import { ruta } from './rutas';

let cliente: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!plataformaLista) throw new Error('La plataforma no está configurada.');
  cliente ??= createClient(plataforma.supabaseUrl, plataforma.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'xictli-sesion' },
  });
  return cliente;
}

/** "ana.lopez" -> "ana.lopez@alumnos.dominio". Si ya trae @, se usa tal cual. */
export function correoDeUsuario(usuario: string) {
  const limpio = usuario.trim().toLowerCase();
  return limpio.includes('@') ? limpio : `${limpio}@${plataforma.dominioAlumnos}`;
}

export type Perfil = { id: string; nombre: string; rol: 'alumno' | 'docente' | 'admin' };

/** Maestros y administración (personal del centro). */
export const esPersonal = (p: Perfil) => p.rol === 'docente' || p.rol === 'admin';

/** "ana.lopez@alumnos.dominio" -> "ana.lopez"; otros correos quedan igual. */
export function usuarioDeCorreo(correo: string) {
  const sufijo = `@${plataforma.dominioAlumnos}`;
  return correo.endsWith(sufijo) ? correo.slice(0, -sufijo.length) : correo;
}

/** Devuelve usuario y perfil, o manda a la página de inicio de sesión. */
export async function exigirSesion(): Promise<{ usuario: User; perfil: Perfil } | null> {
  if (!plataformaLista) return null;
  const sb = supabase();
  // getUser() valida el token con el servidor (no solo lo lee del navegador).
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) {
    location.replace(`${ruta('/entrar')}?volver=${encodeURIComponent(location.pathname + location.search)}`);
    return null;
  }
  const { data: perfil } = await sb.from('perfiles').select('id, nombre, rol').eq('id', data.user.id).single();
  return { usuario: data.user, perfil: (perfil as Perfil) ?? { id: data.user.id, nombre: '', rol: 'alumno' } };
}

let saliendo = false;
export async function cerrarSesion() {
  if (saliendo) return;
  saliendo = true;
  if (plataformaLista) await supabase().auth.signOut();
  location.replace(ruta('/entrar'));
}

/** Solo permite volver a páginas internas del sitio (evita redirecciones abiertas). */
export function destinoSeguro(valor: string | null) {
  const base = ruta('/plataforma');
  if (!valor || !valor.startsWith(ruta('/')) || valor.startsWith('//') || valor.includes('\\')) return base;
  return valor;
}

export const esUuid = (v: string | null): v is string =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export function fechaCorta(iso: string | null) {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}
