// Servicios del Centro Xictli. Cambia aquí los textos y aparecen solos en
// Inicio y en la página de Servicios.

export const servicios = [
  {
    titulo: 'Pedagogía',
    texto: 'Revisamos cómo aprende cada alumno y qué necesita para avanzar. Con eso definimos un plan claro, sin fórmulas iguales para todos.',
  },
  {
    titulo: 'Regularización',
    texto: 'Clases para ponerse al corriente en lo que más cuesta, desde las tablas de multiplicar hasta la comprensión de lectura y la redacción.',
  },
  {
    titulo: 'Apoyo para dar clases',
    texto: 'Acompañamos a maestras y maestros con planeaciones de la NEM, materiales y juegos digitales listos para llevar al salón.',
  },
];

// Qué se trabaja en cada nivel. "materias" son temas concretos, no una lista cerrada.
export const porNivel = [
  {
    nivel: 'primaria',
    titulo: 'Primaria',
    resumen: 'Bases firmes para que la escuela deje de ser una lucha.',
    materias: [
      'Lectura y escritura: comprensión lectora, ortografía y redacción',
      'Matemáticas: tablas, operaciones, fracciones y problemas',
      'Acompañamiento de tareas y proyectos escolares',
    ],
  },
  {
    nivel: 'secundaria',
    titulo: 'Secundaria',
    resumen: 'Nuestra especialidad: Español y los proyectos de la Nueva Escuela Mexicana.',
    materias: [
      'Español: debate, ensayo, autobiografía, crónica, periódico de opinión',
      'Comprensión lectora y escritura argumentativa',
      'Matemáticas para ponerse al corriente',
      'Rescate de calificaciones y preparación de exámenes trimestrales',
    ],
  },
  {
    nivel: 'preparatoria',
    titulo: 'Preparatoria',
    resumen: 'Escribir bien y llegar listo al siguiente paso.',
    materias: [
      'Redacción de ensayos, reportes y textos académicos',
      'Técnicas de estudio y organización',
      'Preparación para exámenes de admisión (área de lenguaje)',
    ],
  },
  {
    nivel: 'docentes',
    titulo: 'Docentes',
    resumen: 'Donde la pedagogía y el software se encuentran.',
    materias: [
      'Planeación por proyectos con campos formativos y ejes articuladores',
      'Juegos y actividades digitales hechos a la medida de tu grupo',
      'Uso de Canva, Educaplay, Kahoot e inteligencia artificial en el aula',
      'Diseño de rúbricas, listas de cotejo e instrumentos de evaluación',
    ],
  },
];

export const pasos = [
  { titulo: 'Diagnóstico', texto: 'Una primera sesión para conocer al alumno: qué sabe, qué le cuesta y cómo aprende mejor (visual, auditivo o haciendo).' },
  { titulo: 'Plan a la medida', texto: 'Definimos metas cortas y medibles, alineadas con lo que piden en su escuela.' },
  { titulo: 'Clases y juegos', texto: 'Explicamos con ejemplos cercanos y practicamos con los juegos del sitio, también desde casa.' },
  { titulo: 'Seguimiento', texto: 'La familia sabe cómo va su hijo o hija y cómo apoyar sin pelear con la tarea.' },
];
