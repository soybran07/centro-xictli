// Arranque común de las páginas de la plataforma: valida la sesión con el
// servidor, llena la barra superior y conecta "Cerrar sesión".
import { cerrarSesion, exigirSesion, supabase } from '../lib/supabase';
import { plataformaLista } from '../config/plataforma';

export async function iniciarPlataforma() {
  if (!plataformaLista) return null;
  document.querySelector('[data-salir]')?.addEventListener('click', cerrarSesion);
  const sesion = await exigirSesion();
  if (!sesion) return null;
  const quien = document.querySelector<HTMLElement>('[data-quien]');
  if (quien) quien.textContent = `· ${sesion.perfil.nombre || sesion.usuario.email}`;
  if (sesion.perfil.rol === 'docente') document.querySelectorAll<HTMLElement>('[data-solo-docente]').forEach((e) => (e.hidden = false));
  // Si la sesión se cierra en otra pestaña, salimos también aquí.
  supabase().auth.onAuthStateChange((evento) => { if (evento === 'SIGNED_OUT') cerrarSesion(); });
  document.querySelectorAll<HTMLElement>('[data-cargando]').forEach((e) => (e.hidden = true));
  document.querySelectorAll<HTMLElement>('[data-con-sesion]').forEach((e) => (e.hidden = false));
  return { ...sesion, sb: supabase() };
}
