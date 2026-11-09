// Conexión de la plataforma de alumnos con Supabase (gratis).
// Los dos valores salen de tu proyecto en Supabase: Project Settings > API.
//
// La "publishable key" (o "anon key") ES PÚBLICA a propósito: así funciona
// Supabase. Lo que protege los datos son las reglas de supabase/esquema.sql.
// NUNCA pegues aquí la "secret key" ni la "service_role key".
export const plataforma = {
  supabaseUrl: '',
  supabaseKey: '',
  // Los alumnos entran con un usuario corto (por ejemplo "ana.lopez").
  // Por dentro se convierte en un correo con este dominio. Al crear la cuenta
  // en Supabase usa ese mismo formato: ana.lopez@alumnos.centroxictli.mx
  dominioAlumnos: 'alumnos.centroxictli.mx',
};

export const plataformaLista = Boolean(plataforma.supabaseUrl && plataforma.supabaseKey);
