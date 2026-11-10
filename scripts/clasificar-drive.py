"""Convierte el listado de RECURSOS_PEDAGOGICOS (Drive) en la biblioteca de Xictli.

Entrada: respuestas JSON de búsqueda de Drive (carpeta drive/) + extra.tsv.
Uso: python3 scripts/clasificar-drive.py <carpeta-con-listados> src/data/biblioteca-drive.json
No toca Drive: solo lee los listados ya descargados y aplica las reglas de abajo.
Salida: biblioteca-drive.json con materia, grados de primaria/secundaria (0 = general),
título limpio, formato y enlace.
"""
import glob, json, re, sys, unicodedata
from collections import Counter

DIR = sys.argv[1]
SALIDA = sys.argv[2]
RAIZ = '1Dvmi3DZv8nIwSgD4lXf2gFnlLUuKR5VM'

archivos = {}
for f in glob.glob(f'{DIR}/mcp*.txt') + glob.glob(f'{DIR}/p00*.json'):
    for x in json.load(open(f))['files']:
        archivos[x['id']] = x
for linea in open(f'{DIR}/extra.tsv'):
    p, i, t = linea.rstrip('\n').split('\t')
    ext = t.rsplit('.', 1)[-1].lower()
    mime = {'pdf': 'application/pdf', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}.get(ext, 'application/pdf')
    archivos.setdefault(i, {'id': i, 'parentId': p, 'title': t, 'mimeType': mime})

carpetas = {i: x for i, x in archivos.items() if x['mimeType'].endswith('folder')}

def ruta(x):
    partes, p, n = [], x.get('parentId'), 0
    while p and p != RAIZ and p in carpetas and n < 8:
        partes.append(carpetas[p]['title']); p = carpetas[p].get('parentId'); n += 1
    if p != RAIZ:
        return None  # fuera del acervo
    return list(reversed(partes))

def sin_acentos(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

# ---------- Exclusiones ----------
PRIVADO = re.compile(r'informe|lista[s]? de|asistencia|ficha descriptiva|calificacion|boleta|expediente|evidencia|whatsapp|img[_-]|reporte de|acta |acuerdo de|alumnos de|resultados de|diagnostico (de|del) grupo|fase_3_diagnostico|comparativa|entrega de grupo|directorio|telefono|agenda', re.I)
NO_MEXICO = re.compile(r'plan de desarrollo curricular|\bpdc\b|ano - |\baño - |valores espiritualidad|cosmovisiones|bolivia|basico - texto|1º básico|chile|peru|uruguay', re.I)
BASURA = re.compile(r'^[\d\W_]+$|^[0-9a-f]{8}-[0-9a-f]{4}|^\d+_\d{6,}|administracion-contable|^\d+\. ?sep$|^rp \d|^inventario|^b\.preguntas$')
CARPETAS_FUERA = {'11_ADMINISTRATIVO Y FORMATOS', '12_BIBLIOTECA PERSONAL', '13_MULTIMEDIA', '14_LIBRO DIGITAL - El Club de la Zanahoria',
                  'DOCUMENTOS BASE', '02_PREESCOLAR', 'RECURSOS PEDAGOGICOS - INVENTARIO'}
SUBCARPETAS_FUERA = re.compile(r'talleres intensivos|eventos y encuentros|carrera docente|preescolar|portadas', re.I)

# ---------- Materia ----------
POR_CARPETA = [
    (r'educacion fisica|educ fisica', 'educacion-fisica'), (r'espanol|lenguajes - esp', 'espanol'), (r'ingles|juegos en ingles', 'ingles'), (r'artes', 'artes'),
    (r'matematicas', 'matematicas'), (r'biologia', 'biologia'), (r'fisica', 'fisica'), (r'quimica', 'quimica'),
    (r'historia', 'historia'), (r'geografia', 'geografia'), (r'formacion civica|etica - formacion', 'civica'),
    (r'educacion fisica', 'educacion-fisica'), (r'tecnologia', 'tecnologia'), (r'tutoria', 'socioemocional'),
    (r'emociones|inclusion|seguridad escolar', 'socioemocional'), (r'vida saludable', 'vida-saludable'),
    (r'efemerides', 'civica'), (r'cte y formacion|consejo tecnico|pedagogia y didactica|nem - plan|proyectos y metodologias|programas analiticos|libro sin recetas|campos formativos', 'docencia'),
    (r'hojas y plantillas|periodico mural', 'docencia'),
]
POR_TITULO = [
    (r'\bexa cie 1\b|\bcie 1\b', 'biologia'), (r'\bexa cie 2\b|\bcie 2\b', 'fisica'), (r'\bexa cie 3\b|\bcie 3\b', 'quimica'),
    (r'\bexa mat\b|\bmate\b|_mat\b|\bmat\b|potencias|exponente|eventos mutuamente|probabilid', 'matematicas'),
    (r'\bexa his\b|\bhis\b|novohispan', 'historia'), (r'\bexa esp\b|\besp\b', 'espanol'),
    (r'\bexa geo\b', 'geografia'), (r'\bexa ing\b', 'ingles'), (r'\bexa fce?\b|libertad|participacion', 'civica'),
    (r'educ(acion)?\.? ?fisica|juegos de educacion fisica|motric', 'educacion-fisica'),
    (r'vida saludable|alimentacion|adicciones|nutric|higiene', 'vida-saludable'),
    (r'socioemocional|emocion|autoestima|tutoria|convivencia|bullying|acoso|ansiedad|estres|autismo|tdah|deficit atencional|ajustes razonables|inclusion|disciplina positiva', 'socioemocional'),
    (r'ingles|english|vocabulary|\bverbs?\b|grammar|fichero digital ingles', 'ingles'),
    (r'quimica|tabla periodica|atomo|enlaces quimicos|reacciones', 'quimica'),
    (r'fisica|newton|energia|movimiento|fuerza|electric|trabajo energia|impulso', 'fisica'),
    (r'biologia|celula|ecosistema|anatomia|ser(es)? vivo|cuerpo humano', 'biologia'),
    (r'conocimiento del medio', 'conocimiento-del-medio'),
    (r'ciencias naturales|experimentos', 'ciencias-naturales'),
    (r'historia|independencia|revolucion|prehispan|virreinato|conquista|porfiriato|reforma', 'historia'),
    (r'geografia|mapa|continente|relieve|poblacion', 'geografia'),
    (r'civica|etica|ciudadan|democracia|derechos|valores|leyes|normas|igualdad|desigualdad|fcye|fce\b|naturaleza y sociedades', 'civica'),
    (r'tecnologia|informatica|computacion|ofimatica|carpinteria|circuitos|corte y confeccion|agricultura|alimentos|contable', 'tecnologia'),
    (r'artes?\b|musica|danza|teatro|visuales|manualidades|dibujo', 'artes'),
    (r'matemat|fraccion|decimal|ecuacion|algebra|geometr|pitagoras|multiplic|division|dividir|suma|resta|numer|calculo|probabilidad|estadistic|razonamiento logico|mcd|mcm|minimo comun|maximo comun|factores primos|porcentaje|proporcional|figuras geometricas|tablas de|acertijos|olimpiada', 'matematicas'),
    (r'espanol|lectura|lector|leer|escritura|escribir|ortograf|gramatic|redaccion|cuento|fabula|poema|poesia|literatura|lenguaje|lengua materna|comprension|textos?\b|ensayo|resumen|noticia|reportaje|debate|mesa redonda|novela|niveles de escritura|alfabetiz|silab|vocales|trazos|leerflix|a leer', 'espanol'),
    (r'nem|plan de estudio|programa sintetico|programa analitico|planeacion|planeaciones|evaluacion|rubrica|cte|consejo tecnico|pedagog|didactic|metodolog|proyectos|campo formativo|campos formativos|ejes articuladores|pda|contenidos|ltg|libros? de texto|dosificacion|secuencia didactica|aprendizaje|evaluar|diagnost|repaso|examen|guia|cuadernillo|cuaderno de actividades|ejercicios|clave y extracto|escenarios', 'docencia'),
]
# Subcarpetas de primaria por campo formativo
CAMPO_PRIMARIA = {'lenguajes': 'espanol', 'saberes y pensamiento cientifico': 'matematicas', 'de lo humano y lo comunitario': 'socioemocional'}

def materia_de(ruta_n, titulo_n):
    # 1) el título manda cuando es claro y específico
    for patron, m in POR_TITULO:
        if re.search(patron, titulo_n):
            # "docencia" por título solo si la carpeta no dice materia
            if m == 'docencia':
                break
            return m
    # 2) la carpeta
    for parte in reversed(ruta_n):
        if parte in CAMPO_PRIMARIA:
            return CAMPO_PRIMARIA[parte]
        for patron, m in POR_CARPETA:
            if re.search(patron, parte):
                return m
    # 3) docencia por título
    for patron, m in POR_TITULO:
        if m == 'docencia' and re.search(patron, titulo_n):
            return 'docencia'
    if ruta_n and re.match(r'0[34579]_|10_', ruta_n[0]):
        return 'docencia'
    return None

# ---------- Nivel y grado ----------
PALABRAS = {'primer': 1, 'primero': 1, 'primera': 1, 'segundo': 2, 'segunda': 2, 'tercer': 3, 'tercero': 3, 'tercera': 3,
            'cuarto': 4, 'quinto': 5, 'sexto': 6}

def grados_de(texto):
    g = set()
    for m in re.finditer(r'(?<![\d.])([1-6])\s*(?:°|º|o\b|er\b|ero\b|do\b|ro\b|to\b|vo\b|\.?\s*grado|\s*sec|sec)', texto):
        g.add(int(m.group(1)))
    for m in re.finditer(r'\b(primer[oa]?|segund[oa]|tercer[oa]?|cuarto|quinto|sexto)\b(?:\s+(?:grado|ano|año|trimestre))?', texto):
        frase = m.group(0)
        if 'trimestre' in frase:
            continue
        g.add(PALABRAS[m.group(1)])
    for m in re.finditer(r'\b([1-6])\s*,\s*([1-6])(?:\s*(?:,|y)\s*([1-6]))?\b', texto):
        g.update(int(x) for x in m.groups() if x)
    return g

def nivel_y_grados(ruta_n, titulo_n):
    texto = ' / '.join(ruta_n + [titulo_n])
    tit_grados = grados_de(titulo_n)
    carpeta_grados = set()
    for parte in ruta_n:
        carpeta_grados |= grados_de(parte)
    gs = tit_grados or carpeta_grados
    fase = {int(x) for x in re.findall(r'fase[_ ]?(\d)', texto)}
    es_sec = bool(re.search(r'secundaria|telesecundaria|\bsec\b|\dsec|secu\b|_secu|exadiag_sec|fase[_ ]?6', texto))
    es_prim = bool(re.search(r'primaria|\bprim\b|_prim_|fase[_ ]?[345]\b|conocimiento del medio', texto))
    if ruta_n and ruta_n[0].startswith('03_primaria'):
        es_prim, es_sec = True, False
    if ruta_n and (ruta_n[0].startswith('04_secundaria') or ruta_n[0].startswith('05_telesecundaria')):
        es_sec, es_prim = True, False
    if ruta_n and ruta_n[0].startswith('07_evaluacion') and len(ruta_n) > 1:
        es_prim, es_sec = ruta_n[1] == 'primaria', ruta_n[1] == 'secundaria'
    prim, sec = [], []
    if es_sec and not es_prim:
        sec = sorted(x for x in gs if x <= 3) or [0]
    elif es_prim and not es_sec:
        prim = sorted(gs) or ([1, 2] if 3 in fase else [3, 4] if 4 in fase else [5, 6] if 5 in fase else [0])
    elif es_prim and es_sec:
        prim, sec = [0], [0]
    else:
        prim, sec = None, None
    return prim, sec

# Materias que solo existen en un nivel o grados (catálogo de la Biblioteca)
GRADOS = {
    'conocimiento-del-medio': ([1, 2], []), 'ciencias-naturales': ([3, 4, 5, 6], []), 'biologia': ([], [1]),
    'fisica': ([], [2]), 'quimica': ([], [3]), 'geografia': ([4, 5, 6], [1]), 'historia': ([4, 5, 6], [1, 2, 3]),
    'tecnologia': ([], [1, 2, 3]),
}

def ajustar(materia, prim, sec):
    if materia in GRADOS:
        vp, vs = GRADOS[materia]
        prim = [g for g in (prim or []) if g == 0 or g in vp] if vp else []
        sec = [g for g in (sec or []) if g == 0 or g in vs] if vs else []
        if materia in ('biologia', 'fisica', 'quimica') and not sec:
            sec = vs
        if materia == 'ciencias-naturales' and not prim:
            prim = [0]
        if materia == 'conocimiento-del-medio' and not prim:
            prim = [0]
        # ciencias de secundaria que no cayeron en su grado
        if not prim and not sec:
            return None, None
    return prim, sec

def limpiar(t):
    t = re.sub(r'\.(pdf|docx?|pptx?|ppsx|xlsx?|md|zip|html?)$', '', t, flags=re.I)
    t = re.sub(r'\.(pdf|docx?)$', '', t, flags=re.I)
    t = re.sub(r'\s*·\s*versi[oó]n \d+.*$', '', t)
    t = re.sub(r'\s*\(\d+\)\s*$', '', t)
    t = re.sub(r'(?<=\D)-\d$', '', t)
    t = t.replace('_', ' ').replace('�', 'í')
    t = re.sub(r'^[a-z]{2}[- ][a-z]{2,3}[- ]\d{6,}[- ]', '', t, flags=re.I)
    t = re.sub(r'[^\w\s.,;:()¿?¡!°º#&+\'"/-]', '', t)
    t = re.sub(r'\s+', ' ', t).strip(' -.')
    return t[:120]

FORMATOS = [('pdf', 'PDF'), ('wordprocessing', 'Word'), ('msword', 'Word'), ('presentation', 'PowerPoint'),
            ('powerpoint', 'PowerPoint'), ('spreadsheet', 'Excel'), ('google-apps.document', 'Documento'),
            ('google-apps.folder', 'Carpeta')]

def formato(m):
    return next((n for k, n in FORMATOS if k in m), None)

salida, vistos, motivos = [], set(), Counter()
for x in archivos.values():
    r = ruta(x)
    if r is None:
        motivos['fuera'] += 1; continue
    es_carpeta = x['mimeType'].endswith('folder')
    if es_carpeta:
        # Solo las carpetas que no se abrieron (nivel 3) se agregan como enlace a carpeta.
        if len(r) < 2:
            continue
    if r and r[0] in CARPETAS_FUERA:
        motivos['carpeta excluida'] += 1; continue
    ruta_n = [sin_acentos(p).replace('_', ' ') if i else sin_acentos(p) for i, p in enumerate(r)]
    if any(SUBCARPETAS_FUERA.search(p) for p in ruta_n):
        motivos['subcarpeta excluida'] += 1; continue
    fmt = formato(x['mimeType'])
    if not fmt:
        motivos['formato'] += 1; continue
    titulo = limpiar(x['title'])
    titulo_n = sin_acentos(titulo)
    if PRIVADO.search(titulo_n) or PRIVADO.search(sin_acentos(x['title'])):
        motivos['privado'] += 1; continue
    if NO_MEXICO.search(titulo_n):
        motivos['no México'] += 1; continue
    if BASURA.search(titulo_n) or len(titulo) < 4:
        motivos['sin nombre útil'] += 1; continue
    materia = materia_de(ruta_n, titulo_n)
    if not materia:
        motivos['sin materia'] += 1; continue
    prim, sec = nivel_y_grados(ruta_n, titulo_n)
    if prim is None:
        prim, sec = [0], [0]
        if materia in ('biologia', 'fisica', 'quimica', 'tecnologia'):
            prim = []
    prim, sec = ajustar(materia, prim, sec)
    if prim is None:
        motivos['fuera de grado'] += 1; continue
    clave = (materia, re.sub(r'[^a-z0-9]', '', titulo_n))
    if clave in vistos:
        motivos['duplicado'] += 1; continue
    vistos.add(clave)
    url = (f"https://drive.google.com/drive/folders/{x['id']}" if es_carpeta else f"https://drive.google.com/file/d/{x['id']}/view")
    salida.append({'titulo': titulo, 'materia': materia, 'primaria': prim, 'secundaria': sec,
                   'formato': fmt, 'url': url, 'carpeta': ' / '.join(r[-2:]) if r else ''})

salida.sort(key=lambda e: (e['materia'], sin_acentos(e['titulo'])))
json.dump(salida, open(SALIDA, 'w'), ensure_ascii=False, separators=(',', ':'))
print('total', len(salida))
print('descartes', dict(motivos))
print('por materia', Counter(e['materia'] for e in salida).most_common())
print('generales', sum(1 for e in salida if e['primaria'] in ([0], []) and e['secundaria'] in ([0], [])))

