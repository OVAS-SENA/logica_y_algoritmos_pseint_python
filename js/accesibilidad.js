/**
 * Sistema de Accesibilidad y Ayuda para Personas con Discapacidad
 * Adaptado al diseno SENA 2026 desde Daom-Projects/sofia-analitica/web/src/accesibilidad
 * Norma: WCAG 2.2 AA/AAA + NTC 5854 · Modo 100% offline + SCORM 1.2
 */
(function () {
  "use strict";

  var CLAVE = "ga3_ova_accesibilidad";

  var ZOOM = [
    { valor: 100, nombre: "Normal" },
    { valor: 115, nombre: "Grande" },
    { valor: 130, nombre: "Más grande" },
    { valor: 150, nombre: "Máximo" }
  ];

  var SATURACION = [
    { filtro: null, nombre: "Normal" },
    { filtro: "grayscale(1)", nombre: "Escala de grises" },
    { filtro: "saturate(.5)", nombre: "Baja" },
    { filtro: "saturate(1.5)", nombre: "Media" },
    { filtro: "saturate(2)", nombre: "Alta" }
  ];

  /* Matrices de correccion "daltonize" (Machado et al., 2009) */
  var DALTONISMO = [
    {
      valor: "protanopia",
      filtroId: "a11y-protanopia",
      nombre: "Protanopia (rojo)",
      ayuda: "No distingue bien el rojo.",
      matriz: "1.000 0.000 0.000 0 0  0.479 0.477 0.044 0 0  0.597 -0.689 1.091 0 0  0 0 0 1 0"
    },
    {
      valor: "deuteranopia",
      filtroId: "a11y-deuteranopia",
      nombre: "Deuteranopia (verde)",
      ayuda: "No distingue bien el verde (la más común).",
      matriz: "1.437 -0.631 0.195 0 0  0.000 1.000 0.000 0 0  -0.184 0.186 0.998 0 0  0 0 0 1 0"
    },
    {
      valor: "tritanopia",
      filtroId: "a11y-tritanopia",
      nombre: "Tritanopia (azul)",
      ayuda: "No distingue bien el azul y el amarillo.",
      matriz: "0.741 -0.407 0.666 0 0  0.075 0.585 0.340 0 0  0.000 0.000 1.000 0 0  0 0 0 1 0"
    }
  ];

  var INTERLINEADO = [
    { valor: null, nombre: "Predeterminado" },
    { valor: "1.5", nombre: "Normal 150 %" },
    { valor: "1.9", nombre: "Amplio 190 %" },
    { valor: "2.5", nombre: "Máximo 250 %" }
  ];

  var INTERLETRADO = [
    { valor: null, nombre: "Predeterminado" },
    { valor: "2px", nombre: "Leve 2 px" },
    { valor: "5px", nombre: "Medio 5 px" },
    { valor: "10px", nombre: "Máximo 10 px" }
  ];

  var FUENTES = [
    { clase: null, nombre: "Normal" },
    { clase: "a11y-dislexia", nombre: "Dislexia (OpenDyslexic)" },
    { clase: "a11y-legible", nombre: "Baja visión (Atkinson)" }
  ];

  /* Iconos SVG de contorno sin relleno (@ICO SENA) */
  var SVG_ICONOS = {
    acceso: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4.5" r="2"/><path d="M5 8.5h14"/><path d="M12 8.5v5.5"/><path d="M9 20l3-6 3 6"/></svg>',
    zoom: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
    contraste: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 7a5 5 0 0 1 0 10"/></svg>',
    saturacion: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    invertir: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    fuente: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    interlineado: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="11" y1="6" x2="21" y2="6"/><line x1="11" y1="12" x2="21" y2="12"/><line x1="11" y1="18" x2="21" y2="18"/><polyline points="4 8 6 6 8 8"/><polyline points="4 16 6 18 8 16"/><line x1="6" y1="6" x2="6" y2="18"/></svg>',
    interletrado: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 14h4l-2-6z"/><path d="M15 14h4l-2-6z"/><polyline points="3 19 21 19"/><polyline points="6 17 3 19 6 21"/><polyline points="18 17 21 19 18 21"/></svg>',
    ojo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    libro: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    foco: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/></svg>',
    rayo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    paleta: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><circle cx="12" cy="15" r="1"/></svg>',
    mano: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 11V6a2 2 0 0 0-4 0v4"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10V5a2 2 0 0 0-4 0v9"/><path d="M6 14l-1.5-1.5a2 2 0 0 0-2.8 2.8L7 21h9a4 4 0 0 0 4-4v-4a2 2 0 0 0-4 0"/></svg>',
    persona: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    enlace: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    titulo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6v12"/><path d="M12 6v12"/><path d="M4 12h8"/><path d="M17 18V8l-2 2"/></svg>',
    negrita: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
    alinear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>',
    imagen: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    guia: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><polyline points="8 7 12 3 16 7"/><polyline points="8 17 12 21 16 17"/></svg>',
    mascara: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>',
    pausa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/></svg>',
    cursor: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3l14 9-6.5 1.5 3.5 7-2.5 1-3.5-7L4 18z"/></svg>',
    voz: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    mapa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="21"/></svg>',
    cerrar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    reiniciar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    reproducir: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>',
    detener: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12"/></svg>'
  };

  function icono(nombre) {
    return SVG_ICONOS[nombre] || SVG_ICONOS.acceso;
  }

  var MOSAICOS = [
    {
      clave: "zoom",
      titulo: "Tamaño de texto",
      icono: "zoom",
      niveles: ZOOM.map(function (z) { return z.nombre + " " + z.valor + " %"; }),
      ayuda: "Agranda textos y controles por pasos: 115 %, 130 % y 150 %."
    },
    {
      clave: "contraste",
      titulo: "Alto contraste",
      icono: "contraste",
      ayuda: "Fondo negro, texto blanco y bordes marcados (AAA)."
    },
    {
      clave: "saturacion",
      titulo: "Saturación",
      icono: "saturacion",
      niveles: SATURACION.map(function (s) { return s.nombre; }),
      ayuda: "Cambia la intensidad de los colores: escala de grises, baja, media o alta."
    },
    {
      clave: "invertir",
      titulo: "Invertir colores",
      icono: "invertir",
      ayuda: "Invierte los colores de la página manteniendo imágenes y diagramas."
    },
    {
      clave: "fuente",
      titulo: "Fuente legible",
      icono: "fuente",
      niveles: FUENTES.map(function (f) { return f.nombre; }),
      ayuda: "Tipografía optimizada para dislexia o baja visión."
    },
    {
      clave: "interlineado",
      titulo: "Espaciado de líneas",
      icono: "interlineado",
      niveles: INTERLINEADO.map(function (i) { return i.nombre; }),
      ayuda: "Más espacio vertical entre líneas: 150 %, 190 % y 250 %."
    },
    {
      clave: "interletrado",
      titulo: "Espaciado de letras",
      icono: "interletrado",
      niveles: INTERLETRADO.map(function (i) { return i.nombre; }),
      ayuda: "Más espacio horizontal entre letras y palabras: 2, 5 y 10 px."
    }
  ];

  var AVANZADAS = [
    { clave: "enlaces", titulo: "Resaltar enlaces", icono: "enlace", ayuda: "Subraya enlaces y botones y les agrega un borde verde." },
    { clave: "titulos", titulo: "Resaltar títulos", icono: "titulo", ayuda: "Destaca encabezados H1-H4 y títulos de tarjetas." },
    { clave: "foco", titulo: "Foco reforzado", icono: "foco", ayuda: "Anillo doble de alto contraste en el elemento con foco." },
    { clave: "negrita", titulo: "Texto en negrita", icono: "negrita", ayuda: "Refuerza el grosor de las letras para lectura con baja visión." },
    { clave: "alinear", titulo: "Alinear a la izquierda", icono: "alinear", ayuda: "Párrafos, listas y títulos alineados a la izquierda." },
    { clave: "sin_imagenes", titulo: "Ocultar imágenes decorativas", icono: "imagen", ayuda: "Oculta elementos meramente decorativos reduciendo ruido visual." },
    { clave: "guia", titulo: "Guía de lectura", icono: "guia", ayuda: "Regla horizontal dorada que sigue el puntero o el foco." },
    { clave: "mascara", titulo: "Máscara de lectura", icono: "mascara", ayuda: "Oscurece la pantalla salvo una franja iluminada de lectura." },
    { clave: "sin_animaciones", titulo: "Pausar animaciones", icono: "pausa", ayuda: "Detiene transiciones, animaciones e imágenes animadas." },
    { clave: "objetivos", titulo: "Objetivos grandes", icono: "mano", ayuda: "Botones, enlaces y casillas de mínimo 44 × 44 px (WCAG 2.5.5)." },
    { clave: "cursor", titulo: "Cursor grande", icono: "cursor", ayuda: "Puntero de alto contraste 40 × 40 px para mejorar visibilidad." }
  ];

  var PERFILES = [
    {
      clave: "baja_vision",
      titulo: "Baja visión",
      icono: "ojo",
      ajustes: { zoom: 2, contraste: true, fuente: 2, foco: true, cursor: true, enlaces: true }
    },
    {
      clave: "dislexia",
      titulo: "Dislexia",
      icono: "libro",
      ajustes: { fuente: 1, interlineado: 2, interletrado: 1, alinear: true, guia: true }
    },
    {
      clave: "tdah",
      titulo: "TDAH",
      icono: "foco",
      ajustes: { mascara: true, sin_animaciones: true, sin_imagenes: true, titulos: true }
    },
    {
      clave: "epilepsia",
      titulo: "Epilepsia",
      icono: "rayo",
      ajustes: { sin_animaciones: true, saturacion: 2 }
    },
    {
      clave: "daltonismo",
      titulo: "Daltonismo",
      icono: "paleta",
      ajustes: { daltonismo: "deuteranopia", enlaces: true }
    },
    {
      clave: "motor",
      titulo: "Motor",
      icono: "mano",
      ajustes: { objetivos: true, cursor: true, foco: true }
    },
    {
      clave: "adulto_mayor",
      titulo: "Adulto mayor",
      icono: "persona",
      ajustes: { zoom: 1, interlineado: 1, objetivos: true, enlaces: true, sin_animaciones: true }
    }
  ];

  var POR_VALOR = { fuente: true, daltonismo: true, saturacion: true };
  var CLAVES_PERFIL = PERFILES.map(function (p) { return p.clave; });
  var NIVELES = {
    zoom: ZOOM.length,
    saturacion: SATURACION.length,
    fuente: FUENTES.length,
    interlineado: INTERLINEADO.length,
    interletrado: INTERLETRADO.length
  };
  var CLAVES = MOSAICOS.map(function (m) { return m.clave; })
    .concat(["daltonismo"])
    .concat(AVANZADAS.map(function (a) { return a.clave; }))
    .concat(["lector", "voz_velocidad", "voz", "perfiles"]);
  var NO_CUENTAN = { voz_velocidad: true, voz: true, perfiles: true };

  var VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  var ATAJOS = [
    { teclas: ["Alt", "A"], codigo: "KeyA", accion: "panel", texto: "Abrir o cerrar el panel de accesibilidad" },
    { teclas: ["Alt", "M"], codigo: "KeyM", accion: "mapa", texto: "Mapa de la página: secciones, tarjetas y títulos" },
    { teclas: ["Alt", "C"], codigo: "KeyC", accion: "contenido", texto: "Ir al contenido principal" },
    { teclas: ["Alt", "N"], codigo: "KeyN", accion: "menu", texto: "Ir al menú principal de la OVA" },
    { teclas: ["Alt", "↓"], codigo: "ArrowDown", accion: "siguiente", texto: "Ir a la tarjeta siguiente" },
    { teclas: ["Alt", "↑"], codigo: "ArrowUp", accion: "anterior", texto: "Ir a la tarjeta anterior" },
    { teclas: ["Esc"], codigo: null, accion: null, texto: "Cerrar el panel, el mapa o una imagen ampliada" }
  ];

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }

  function media(consulta) {
    try {
      return Boolean(window.matchMedia && window.matchMedia(consulta).matches);
    } catch (e) {
      return false;
    }
  }

  function predeterminadas() {
    var base = {};
    CLAVES.forEach(function (c) {
      if (c in NIVELES) base[c] = 0;
      else if (c === "daltonismo" || c === "voz") base[c] = "";
      else if (c === "voz_velocidad") base[c] = 1;
      else if (c === "perfiles") base[c] = [];
      else base[c] = false;
    });
    base.sin_animaciones = media("(prefers-reduced-motion: reduce)");
    base.contraste = media("(prefers-contrast: more)");
    return base;
  }

  function normalizar(datos) {
    var salida = predeterminadas();
    if (!datos || typeof datos !== "object") return salida;
    CLAVES.forEach(function (c) {
      if (!(c in datos)) return;
      if (c in NIVELES) {
        salida[c] = Math.min(NIVELES[c] - 1, Math.max(0, parseInt(datos[c], 10) || 0));
      } else if (c === "daltonismo") {
        var existeD = DALTONISMO.some(function (d) { return d.valor === datos.daltonismo; });
        salida.daltonismo = existeD ? datos.daltonismo : "";
      } else if (c === "voz_velocidad") {
        var v = Number(datos.voz_velocidad);
        salida.voz_velocidad = isFinite(v) ? Math.min(2, Math.max(0.5, Math.round(v * 4) / 4)) : 1;
      } else if (c === "voz") {
        salida.voz = typeof datos.voz === "string" ? datos.voz.slice(0, 200) : "";
      } else if (c === "perfiles") {
        salida.perfiles = Array.isArray(datos.perfiles)
          ? CLAVES_PERFIL.filter(function (k) { return datos.perfiles.indexOf(k) >= 0; })
          : [];
      } else {
        salida[c] = Boolean(datos[c]);
      }
    });
    return salida;
  }

  function cargarEstado() {
    try {
      var raw = localStorage.getItem(CLAVE);
      return raw ? normalizar(JSON.parse(raw)) : predeterminadas();
    } catch (e) {
      return predeterminadas();
    }
  }

  function guardarEstado(e) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(e));
    } catch (err) {
      /* sin almacenamiento */
    }
  }

  function iguales(a, b) {
    return CLAVES.every(function (c) {
      if (c === "perfiles") return (a.perfiles || []).join(",") === (b.perfiles || []).join(",");
      return a[c] === b[c];
    });
  }

  function contarActivas(e) {
    return CLAVES.filter(function (c) {
      if (NO_CUENTAN[c]) return false;
      return (c in NIVELES) ? e[c] > 0 : Boolean(e[c]);
    }).length;
  }

  function describirPerfil(perfil) {
    var opciones = MOSAICOS.concat(AVANZADAS);
    return Object.keys(perfil.ajustes).map(function (c) {
      var v = perfil.ajustes[c];
      if (c === "daltonismo") {
        var d = DALTONISMO.filter(function (x) { return x.valor === v; })[0];
        return "Daltonismo: " + (d ? d.nombre : v);
      }
      var op = opciones.filter(function (o) { return o.clave === c; })[0];
      if (!op) return c;
      return op.niveles ? op.titulo + ": " + op.niveles[v] : op.titulo;
    }).join(", ");
  }

  function encenderPerfil(perfil, actual) {
    var nuevo = normalizar(actual);
    Object.keys(perfil.ajustes).forEach(function (c) {
      var v = perfil.ajustes[c];
      if (typeof v === "number" && !POR_VALOR[c]) {
        nuevo[c] = Math.max(Number(nuevo[c]) || 0, v);
      } else {
        nuevo[c] = v;
      }
    });
    nuevo.perfiles = nuevo.perfiles.filter(function (k) { return k !== perfil.clave; }).concat([perfil.clave]);
    return nuevo;
  }

  function apagarPerfil(perfil, actual) {
    var otros = (actual.perfiles || [])
      .filter(function (k) { return k !== perfil.clave; })
      .map(function (k) { return PERFILES.filter(function (p) { return p.clave === k; })[0]; })
      .filter(Boolean);
    var fabrica = predeterminadas();
    var nuevo = normalizar(actual);
    Object.keys(perfil.ajustes).forEach(function (c) {
      var pedidos = otros.filter(function (p) { return c in p.ajustes; }).map(function (p) { return p.ajustes[c]; });
      if (!pedidos.length) {
        nuevo[c] = fabrica[c];
      } else if (typeof pedidos[0] === "number" && !POR_VALOR[c]) {
        nuevo[c] = Math.max.apply(null, pedidos);
      } else {
        nuevo[c] = pedidos[pedidos.length - 1];
      }
    });
    nuevo.perfiles = (actual.perfiles || []).filter(function (k) { return k !== perfil.clave; });
    return nuevo;
  }

  function anuncioTexto(clave, e) {
    if (clave === "zoom") {
      return e.zoom
        ? "Tamaño de texto: " + ZOOM[e.zoom].nombre + ", paso " + e.zoom + " de " + (ZOOM.length - 1)
        : "Tamaño de texto: Normal";
    }
    if (clave === "saturacion") {
      return e.saturacion
        ? "Saturación: " + SATURACION[e.saturacion].nombre + ", paso " + e.saturacion + " de " + (SATURACION.length - 1)
        : "Saturación: Normal";
    }
    var mapPasos = { fuente: FUENTES, interlineado: INTERLINEADO, interletrado: INTERLETRADO };
    if (mapPasos[clave]) {
      var pasos = mapPasos[clave];
      var m = MOSAICOS.filter(function (x) { return x.clave === clave; })[0];
      return e[clave]
        ? m.titulo + ": " + pasos[e[clave]].nombre + ", paso " + e[clave] + " de " + (pasos.length - 1)
        : m.titulo + ": " + pasos[0].nombre;
    }
    if (clave === "lector") {
      return e.lector
        ? "Lector de pantalla activado. Pase el puntero o mueva el foco para escuchar."
        : "Lector de pantalla desactivado.";
    }
    if (clave === "voz_velocidad") return "Velocidad de lectura: " + String(e.voz_velocidad).replace(".", ",") + "×";
    if (clave === "voz") return e.voz ? "Voz en español cambiada." : "Voz automática seleccionada.";
    if (clave === "daltonismo") {
      var tipo = DALTONISMO.filter(function (d) { return d.valor === e.daltonismo; })[0];
      return tipo ? "Daltonismo: " + tipo.nombre : "Daltonismo: desactivado";
    }
    var op = MOSAICOS.concat(AVANZADAS).filter(function (o) { return o.clave === clave; })[0];
    return (op ? op.titulo : clave) + ": " + (e[clave] ? "activado" : "desactivado");
  }

  /* ---------------- Congelador de imágenes animadas ---------------- */
  var observadorImg = null;
  var ANIMADA_RE = /\.(gif|webp)(?:[?#]|$)/i;

  function congelarImg(img) {
    if (img.dataset.a11ySrc || !ANIMADA_RE.test(img.currentSrc || img.src || "")) return;
    var hacer = function () {
      if (img.dataset.a11ySrc || !img.naturalWidth) return;
      try {
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        var ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        var url = canvas.toDataURL("image/png");
        img.dataset.a11ySrc = img.getAttribute("src") || "";
        if (img.hasAttribute("srcset")) {
          img.dataset.a11ySrcset = img.getAttribute("srcset");
          img.removeAttribute("srcset");
        }
        img.src = url;
      } catch (err) {
        /* origen externo sin CORS */
      }
    };
    if (img.complete && img.naturalWidth) hacer();
    else img.addEventListener("load", hacer, { once: true });
  }

  function descongelarImg(img) {
    if (!("a11ySrc" in img.dataset)) return;
    if ("a11ySrcset" in img.dataset) img.setAttribute("srcset", img.dataset.a11ySrcset);
    img.src = img.dataset.a11ySrc;
    delete img.dataset.a11ySrc;
    delete img.dataset.a11ySrcset;
  }

  function actualizarCongelador(activo) {
    if (activo && !observadorImg && document.body) {
      document.body.querySelectorAll("img").forEach(congelarImg);
      if (typeof MutationObserver === "function") {
        observadorImg = new MutationObserver(function (cambios) {
          cambios.forEach(function (c) {
            c.addedNodes.forEach(function (nodo) {
              if (nodo.nodeType !== 1) return;
              if (nodo.tagName === "IMG") congelarImg(nodo);
              else if (nodo.querySelectorAll) nodo.querySelectorAll("img").forEach(congelarImg);
            });
          });
        });
        observadorImg.observe(document.body, { childList: true, subtree: true });
      }
    } else if (!activo && observadorImg) {
      observadorImg.disconnect();
      observadorImg = null;
      document.querySelectorAll("img[data-a11y-src]").forEach(descongelarImg);
    }
  }

  /* ---------------- Lectura en voz alta (Web Speech API) ---------------- */
  var MAX_TROZO = 200;
  var LEIBLES = "a, button, [role='button'], [role='tab'], [role='switch'], [role='radio'], h1, h2, h3, h4, h5, h6, p, li, td, th, label, img, summary, figcaption, legend, [aria-label]";
  var vozEstado = { hablando: false, pausado: false };
  var vozTurno = 0;
  var elementoResaltado = null;

  function vozSoportada() {
    return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  }

  function idiomaDoc() {
    return document.documentElement.lang || "es-CO";
  }

  function vocesEspanol() {
    if (!vozSoportada()) return [];
    return window.speechSynthesis.getVoices().filter(function (v) {
      return v.lang && v.lang.toLowerCase().indexOf("es") === 0;
    });
  }

  function elegirVoz(uri) {
    var voces = vocesEspanol();
    var lang = idiomaDoc().toLowerCase();
    return voces.filter(function (v) { return uri && v.voiceURI === uri; })[0]
      || voces.filter(function (v) { return v.localService && v.lang.toLowerCase() === lang; })[0]
      || voces.filter(function (v) { return v.localService; })[0]
      || voces[0]
      || null;
  }

  function partirTrozos(texto) {
    var limpio = (texto || "").replace(/\s+/g, " ").trim();
    if (!limpio) return [];
    var frases = limpio.match(/[^.!?;:]+[.!?;:]*\s*/g) || [limpio];
    var salida = [];
    var actual = "";
    frases.forEach(function (frase) {
      for (var i = 0; i < frase.length; i += MAX_TROZO) {
        var parte = frase.slice(i, i + MAX_TROZO);
        if ((actual + parte).length > MAX_TROZO && actual) {
          salida.push(actual.trim());
          actual = "";
        }
        actual += parte;
      }
    });
    if (actual.trim()) salida.push(actual.trim());
    return salida;
  }

  function textoDe(el) {
    if (!el || el.nodeType !== 1) return "";
    var etiqueta = el.getAttribute("aria-label");
    if (etiqueta) return etiqueta.trim();
    if (el.tagName === "IMG") return (el.getAttribute("alt") || "").trim();
    if (["INPUT", "SELECT", "TEXTAREA"].indexOf(el.tagName) >= 0) {
      var nombre = el.labels && el.labels[0] ? textoDe(el.labels[0]) : (el.getAttribute("placeholder") || "");
      var val = el.type === "password" ? "" : (el.tagName === "SELECT" && el.selectedOptions && el.selectedOptions[0] ? el.selectedOptions[0].textContent : el.value);
      return [nombre, val].filter(Boolean).join(": ").trim();
    }
    var copia = el.cloneNode(true);
    copia.querySelectorAll("[aria-hidden='true'], script, style, .a11y-no-leer, .a11y-leer-bloque").forEach(function (n) { n.remove(); });
    return (copia.textContent || "").replace(/\s+/g, " ").trim();
  }

  function quitarResaltado() {
    if (elementoResaltado) {
      elementoResaltado.classList.remove("a11y-leyendo");
      elementoResaltado = null;
    }
  }

  /* ---------------- Controlador principal ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var estado = cargarEstado();
    var dialogoPanel = null;
    var dialogoMapa = null;
    var nodoAnuncio = null;
    var nodoGuia = null;
    var nodoMaskTop = null;
    var nodoMaskBot = null;
    var nodoBarraVoz = null;
    var nodoBtnFlotante = null;
    var origenPanel = null;
    var origenMapa = null;
    var posY = null;
    var ultimaLecturaNarrador = null;
    var timerNarrador = null;

    function avisar(msg) {
      if (!nodoAnuncio || !msg) return;
      nodoAnuncio.textContent = "";
      setTimeout(function () { nodoAnuncio.textContent = msg; }, 20);
    }

    function hablar(texto, opts) {
      opts = opts || {};
      if (!vozSoportada()) return false;
      var partes = partirTrozos(texto);
      var sintesis = window.speechSynthesis;
      sintesis.cancel();
      quitarResaltado();
      var mio = ++vozTurno;
      if (!partes.length) {
        vozEstado = { hablando: false, pausado: false };
        sincronizarControlesVoz();
        return false;
      }
      if (opts.elemento) {
        elementoResaltado = opts.elemento;
        opts.elemento.classList.add("a11y-leyendo");
      }
      var elegida = elegirVoz(opts.voz || estado.voz);
      var vel = opts.velocidad || estado.voz_velocidad || 1;
      var fin = function () {
        if (mio !== vozTurno) return;
        quitarResaltado();
        vozEstado = { hablando: false, pausado: false };
        sincronizarControlesVoz();
      };
      partes.forEach(function (parte, idx) {
        var u = new window.SpeechSynthesisUtterance(parte);
        u.lang = (elegida && elegida.lang) || idiomaDoc();
        if (elegida) u.voice = elegida;
        u.rate = vel;
        if (idx === partes.length - 1) u.onend = fin;
        u.onerror = fin;
        sintesis.speak(u);
      });
      vozEstado = { hablando: true, pausado: false };
      sincronizarControlesVoz();
      return true;
    }

    function pausarVoz() {
      if (!vozSoportada() || !vozEstado.hablando) return;
      window.speechSynthesis.pause();
      vozEstado.pausado = true;
      sincronizarControlesVoz();
    }

    function seguirVoz() {
      if (!vozSoportada() || !vozEstado.hablando) return;
      window.speechSynthesis.resume();
      vozEstado.pausado = false;
      sincronizarControlesVoz();
    }

    function detenerVoz() {
      vozTurno += 1;
      if (vozSoportada()) window.speechSynthesis.cancel();
      quitarResaltado();
      vozEstado = { hablando: false, pausado: false };
      sincronizarControlesVoz();
    }

    /* ---------------- Inyección de utilidades en el DOM ---------------- */
    function crearInfraestructuraDOM() {
      // Filtros SVG para daltonismo
      var svgNS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("class", "a11y-svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      var defs = document.createElementNS(svgNS, "defs");
      DALTONISMO.forEach(function (d) {
        var filter = document.createElementNS(svgNS, "filter");
        filter.setAttribute("id", d.filtroId);
        filter.setAttribute("color-interpolation-filters", "linearRGB");
        var cm = document.createElementNS(svgNS, "feColorMatrix");
        cm.setAttribute("type", "matrix");
        cm.setAttribute("values", d.matriz);
        filter.appendChild(cm);
        defs.appendChild(filter);
      });
      svg.appendChild(defs);
      document.body.appendChild(svg);

      // Región aria-live global
      nodoAnuncio = document.createElement("div");
      nodoAnuncio.id = "a11y-anuncio";
      nodoAnuncio.className = "visually-hidden";
      nodoAnuncio.setAttribute("role", "status");
      nodoAnuncio.setAttribute("aria-live", "polite");
      document.body.appendChild(nodoAnuncio);

      // Guía de lectura y Máscara de lectura
      nodoGuia = document.createElement("div");
      nodoGuia.id = "a11y-guia";
      nodoGuia.className = "a11y-guia";
      nodoGuia.setAttribute("aria-hidden", "true");
      nodoGuia.hidden = true;
      document.body.appendChild(nodoGuia);

      nodoMaskTop = document.createElement("div");
      nodoMaskTop.id = "a11y-mascara-arriba";
      nodoMaskTop.className = "a11y-mascara a11y-mascara-arriba";
      nodoMaskTop.setAttribute("aria-hidden", "true");
      nodoMaskTop.hidden = true;
      document.body.appendChild(nodoMaskTop);

      nodoMaskBot = document.createElement("div");
      nodoMaskBot.id = "a11y-mascara-abajo";
      nodoMaskBot.className = "a11y-mascara a11y-mascara-abajo";
      nodoMaskBot.setAttribute("aria-hidden", "true");
      nodoMaskBot.hidden = true;
      document.body.appendChild(nodoMaskBot);

      // Botón flotante móvil
      nodoBtnFlotante = document.createElement("button");
      nodoBtnFlotante.type = "button";
      nodoBtnFlotante.id = "boton-accesibilidad-movil";
      nodoBtnFlotante.className = "a11y-boton-flotante";
      nodoBtnFlotante.setAttribute("aria-label", "Abrir panel de accesibilidad (Alt + A)");
      nodoBtnFlotante.title = "Accesibilidad (Alt + A)";
      nodoBtnFlotante.innerHTML = icono("acceso") + '<span class="a11y-contador" id="a11y-contador-movil" hidden>0</span>';
      nodoBtnFlotante.addEventListener("click", function () {
        if (panelAbierto()) cerrarPanel(); else abrirPanel();
      });
      document.body.appendChild(nodoBtnFlotante);

      // Barra flotante de voz
      nodoBarraVoz = document.createElement("div");
      nodoBarraVoz.id = "a11y-controles-voz";
      nodoBarraVoz.className = "a11y-controles-voz";
      nodoBarraVoz.setAttribute("role", "toolbar");
      nodoBarraVoz.setAttribute("aria-label", "Controles de lectura en voz alta");
      nodoBarraVoz.hidden = true;
      nodoBarraVoz.innerHTML =
        icono("voz") +
        '<span>Leyendo</span>' +
        '<button type="button" id="a11y-voz-flotante-pausa" aria-label="Pausar lectura">' + icono("pausa") + '<span>Pausar</span></button>' +
        '<button type="button" id="a11y-voz-flotante-detener" aria-label="Detener lectura">' + icono("detener") + '<span>Detener</span></button>';
      document.body.appendChild(nodoBarraVoz);

      nodoBarraVoz.querySelector("#a11y-voz-flotante-pausa").addEventListener("click", function () {
        if (vozEstado.pausado) seguirVoz(); else pausarVoz();
      });
      nodoBarraVoz.querySelector("#a11y-voz-flotante-detener").addEventListener("click", detenerVoz);

      // Diálogo del panel de accesibilidad
      dialogoPanel = document.createElement("dialog");
      dialogoPanel.id = "panel-accesibilidad";
      dialogoPanel.className = "a11y-dialogo";
      dialogoPanel.setAttribute("aria-modal", "true");
      dialogoPanel.setAttribute("aria-labelledby", "a11y-titulo");
      dialogoPanel.setAttribute("aria-describedby", "a11y-subtitulo");
      dialogoPanel.innerHTML = construirHtmlPanel();
      document.body.appendChild(dialogoPanel);

      dialogoPanel.addEventListener("cancel", function (e) {
        e.preventDefault();
        cerrarPanel();
      });
      dialogoPanel.addEventListener("mousedown", function (e) {
        if (e.target === dialogoPanel) cerrarPanel();
      });

      // Diálogo del mapa de la página
      dialogoMapa = document.createElement("dialog");
      dialogoMapa.id = "mapa-pagina";
      dialogoMapa.className = "a11y-mapa";
      dialogoMapa.setAttribute("aria-modal", "true");
      dialogoMapa.setAttribute("aria-labelledby", "a11y-mapa-titulo");
      dialogoMapa.innerHTML =
        '<div class="a11y-mapa-cabecera">' +
        icono("mapa") +
        '<h2 id="a11y-mapa-titulo">Mapa de la página y navegación</h2>' +
        '<button type="button" class="a11y-cerrar" id="a11y-mapa-cerrar" aria-label="Cerrar el mapa de la página">' + icono("cerrar") + '<span>Cerrar</span></button>' +
        '</div>' +
        '<div class="a11y-mapa-cuerpo">' +
        '  <input type="search" id="a11y-mapa-filtro" class="a11y-mapa-filtro" placeholder="Filtrar unidades, tarjetas o títulos..." aria-label="Filtrar elementos del mapa" spellcheck="false">' +
        '  <div id="a11y-mapa-contenido" class="a11y-mapa-cols"></div>' +
        '</div>';
      document.body.appendChild(dialogoMapa);

      dialogoMapa.addEventListener("cancel", function (e) {
        e.preventDefault();
        cerrarMapa();
      });
      dialogoMapa.addEventListener("mousedown", function (e) {
        if (e.target === dialogoMapa) cerrarMapa();
      });
      dialogoMapa.querySelector("#a11y-mapa-cerrar").addEventListener("click", function () { cerrarMapa(); });
      dialogoMapa.querySelector("#a11y-mapa-filtro").addEventListener("input", renderizarMapa);

      enlazarEventosPanel();
    }

    function construirHtmlPanel() {
      var perfHtml = PERFILES.map(function (p) {
        return '<li>' +
          '<button type="button" class="a11y-perfil" data-a11y-perfil="' + p.clave + '" aria-pressed="false" aria-describedby="a11y-perfil-desc-' + p.clave + '">' +
          icono(p.icono) +
          '<span class="a11y-perfil-titulo">' + esc(p.titulo) + '</span>' +
          '</button>' +
          '<p id="a11y-perfil-desc-' + p.clave + '" class="a11y-perfil-descripcion">Activa: ' + esc(describirPerfil(p)) + '.</p>' +
          '</li>';
      }).join("");

      var mosHtml = MOSAICOS.map(function (op) {
        var stepsHtml = op.niveles
          ? '<span class="a11y-mosaico-nivel" data-a11y-nivel="' + op.clave + '">' + esc(op.niveles[0]) + '</span>' +
            '<span class="a11y-pasos" aria-hidden="true">' +
            op.niveles.slice(1).map(function () { return "<span></span>"; }).join("") +
            '</span>'
          : '<span class="a11y-mosaico-nivel" data-a11y-nivel="' + op.clave + '">Desactivado</span>';
        return '<button type="button" class="a11y-mosaico" data-a11y-mosaico="' + op.clave + '" aria-pressed="false" title="' + esc(op.ayuda) + '">' +
          icono(op.icono) +
          '<span class="a11y-mosaico-titulo">' + esc(op.titulo) + '</span>' +
          stepsHtml +
          '</button>';
      }).join("");

      var dalHtml = DALTONISMO.map(function (d, idx) {
        return '<div role="radio" aria-checked="false" tabindex="' + (idx === 0 ? "0" : "-1") + '" class="a11y-radio" data-a11y-daltonismo-opt="' + d.valor + '">' +
          '<span class="a11y-radio-punto" aria-hidden="true"></span>' +
          '<span><span class="a11y-radio-nombre">' + esc(d.nombre) + '</span><span class="a11y-radio-ayuda">' + esc(d.ayuda) + '</span></span>' +
          '</div>';
      }).join("");

      var avzHtml = AVANZADAS.map(function (op) {
        return '<li>' +
          '<button type="button" role="switch" aria-checked="false" class="a11y-interruptor" data-a11y-switch="' + op.clave + '" title="' + esc(op.ayuda) + '">' +
          icono(op.icono) +
          '<span class="a11y-interruptor-texto">' + esc(op.titulo) +
          '<span class="a11y-interruptor-sub">' + esc(op.ayuda) + '</span></span>' +
          '<span class="a11y-switch" aria-hidden="true"></span>' +
          '</button>' +
          '</li>';
      }).join("");

      var atajosHtml = ATAJOS.map(function (a) {
        var k = a.teclas.map(function (t) { return "<kbd>" + esc(t) + "</kbd>"; }).join(" + ");
        return '<div class="a11y-atajo"><dt>' + k + '</dt><dd>' + esc(a.texto) + '</dd></div>';
      }).join("");

      var vozHtml = vozSoportada()
        ? '<button type="button" role="switch" aria-checked="false" class="a11y-interruptor" id="a11y-switch-lector" title="Lee en voz alta lo que está bajo el puntero o recibe el foco.">' +
          icono("voz") +
          '<span class="a11y-interruptor-texto">Lector de pantalla' +
          '<span class="a11y-interruptor-sub">Lee al pasar el puntero, tabular o usar «Leer tarjeta»</span></span>' +
          '<span class="a11y-switch" aria-hidden="true"></span>' +
          '</button>' +
          '<div class="a11y-voz-acciones">' +
          '  <button type="button" class="a11y-voz-btn" id="a11y-leer-seleccion">' + icono("reproducir") + '<span>Leer selección</span></button>' +
          '  <button type="button" class="a11y-voz-btn" id="a11y-leer-tarjeta">' + icono("reproducir") + '<span>Leer tarjeta actual</span></button>' +
          '  <button type="button" class="a11y-voz-btn" id="a11y-leer-seccion">' + icono("reproducir") + '<span>Leer sección</span></button>' +
          '  <button type="button" class="a11y-voz-btn" id="a11y-pausar-voz" disabled>' + icono("pausa") + '<span>Pausar</span></button>' +
          '  <button type="button" class="a11y-voz-btn" id="a11y-detener-voz" disabled>' + icono("detener") + '<span>Detener</span></button>' +
          '</div>' +
          '<div class="a11y-voz-controles">' +
          '  <div class="a11y-voz-campo">' +
          '    <label for="a11y-velocidad">Velocidad de lectura: <strong id="a11y-velocidad-valor">1×</strong></label>' +
          '    <input id="a11y-velocidad" type="range" min="0" max="' + (VELOCIDADES.length - 1) + '" step="1" value="2">' +
          '  </div>' +
          '  <div class="a11y-voz-campo">' +
          '    <label for="a11y-voz-elegida">Voz en español (prefiere voces sin conexión)</label>' +
          '    <select id="a11y-voz-elegida"><option value="">Automática (prefiere voces sin conexión)</option></select>' +
          '  </div>' +
          '</div>'
        : '<p class="a11y-voz-alerta" role="alert">Su navegador no permite leer en voz alta (Web Speech API). Pruebe Chrome, Edge o Firefox actualizado.</p>';

      return '<div class="a11y-panel">' +
        '<div class="a11y-cabecera">' +
        '  <div class="a11y-cabecera-icono">' + icono("acceso") + '</div>' +
        '  <div class="a11y-titulo-wrap">' +
        '    <h2 id="a11y-titulo">Accesibilidad <span class="a11y-atajo-pill">Alt + A</span></h2>' +
        '    <p id="a11y-subtitulo">Ayudas para baja visión, dislexia, TDAH, daltonismo, motor y voz</p>' +
        '  </div>' +
        '  <button type="button" class="a11y-cerrar" id="a11y-panel-cerrar" aria-label="Cerrar panel de accesibilidad">' + icono("cerrar") + '<span>Cerrar</span></button>' +
        '</div>' +
        '<div class="a11y-cuerpo">' +
        '  <section class="a11y-seccion" aria-labelledby="a11y-perfiles-titulo">' +
        '    <h3 id="a11y-perfiles-titulo" class="a11y-subtitulo-grupo">Perfiles para personas con discapacidad</h3>' +
        '    <p class="a11y-subtitulo">Encienden varias ayudas a la vez con un clic. Se pueden combinar y ajustar individualmente.</p>' +
        '    <ul class="a11y-perfiles">' + perfHtml + '</ul>' +
        '    <div class="a11y-perfil-nota" id="a11y-perfil-nota" role="note" hidden></div>' +
        '  </section>' +
        '  <section class="a11y-seccion a11y-voz" aria-labelledby="a11y-voz-titulo">' +
        '    <h3 id="a11y-voz-titulo" class="a11y-subtitulo-grupo">Lectura en voz alta</h3>' +
        vozHtml +
        '  </section>' +
        '  <section class="a11y-seccion" aria-labelledby="a11y-mosaicos-titulo">' +
        '    <h3 id="a11y-mosaicos-titulo" class="a11y-subtitulo-grupo">Ajustes visuales rápidos</h3>' +
        '    <div class="a11y-mosaicos">' + mosHtml + '</div>' +
        '    <div class="a11y-daltonismo">' +
        '      <button type="button" role="switch" aria-checked="false" class="a11y-interruptor" id="a11y-switch-daltonismo" title="Corrige los colores para distinguir mejor rojo, verde o azul.">' +
        icono("ojo") +
        '        <span class="a11y-interruptor-texto">Daltonismo<span class="a11y-interruptor-sub">Corrección de color (Machado et al.)</span></span>' +
        '        <span class="a11y-switch" aria-hidden="true"></span>' +
        '      </button>' +
        '      <div role="radiogroup" aria-label="Tipo de daltonismo" class="a11y-radios" id="a11y-radios-daltonismo" hidden>' + dalHtml + '</div>' +
        '    </div>' +
        '  </section>' +
        '  <section class="a11y-seccion" aria-labelledby="a11y-avz-titulo">' +
        '    <h3 id="a11y-avz-titulo" class="a11y-subtitulo-grupo">Opciones avanzadas</h3>' +
        '    <ul class="a11y-avanzadas">' + avzHtml + '</ul>' +
        '  </section>' +
        '  <section class="a11y-seccion" aria-labelledby="a11y-atajos-titulo">' +
        '    <h3 id="a11y-atajos-titulo" class="a11y-subtitulo-grupo">Atajos de teclado</h3>' +
        '    <dl class="a11y-atajos">' + atajosHtml + '</dl>' +
        '  </section>' +
        '</div>' +
        '<div class="a11y-pie">' +
        '  <button type="button" class="a11y-restaurar" id="a11y-restaurar" disabled>' + icono("reiniciar") + '<span>Restaurar todo (0)</span></button>' +
        '  <button type="button" class="a11y-mapa-boton" id="a11y-abrir-mapa">' + icono("mapa") + '<span>Mapa (Alt + M)</span></button>' +
        '</div>' +
        '</div>';
    }

    function enlazarEventosPanel() {
      dialogoPanel.querySelector("#a11y-panel-cerrar").addEventListener("click", cerrarPanel);
      dialogoPanel.querySelector("#a11y-abrir-mapa").addEventListener("click", function () {
        cerrarPanel();
        abrirMapa();
      });

      dialogoPanel.querySelector("#a11y-restaurar").addEventListener("click", function () {
        detenerVoz();
        estado = predeterminadas();
        aplicarTodo("Configuración restablecida: perfiles y ajustes desactivados.");
      });

      dialogoPanel.querySelectorAll("[data-a11y-perfil]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var clave = btn.getAttribute("data-a11y-perfil");
          var perfil = PERFILES.filter(function (p) { return p.clave === clave; })[0];
          if (!perfil) return;
          var estabaActivo = (estado.perfiles || []).indexOf(clave) >= 0;
          estado = estabaActivo ? apagarPerfil(perfil, estado) : encenderPerfil(perfil, estado);
          aplicarTodo("Perfil " + perfil.titulo + ": " + (estabaActivo ? "desactivado" : "activado"));
        });
      });

      dialogoPanel.querySelectorAll("[data-a11y-mosaico]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var clave = btn.getAttribute("data-a11y-mosaico");
          if (clave in NIVELES) {
            estado[clave] = (estado[clave] + 1) % NIVELES[clave];
          } else {
            estado[clave] = !estado[clave];
          }
          aplicarTodo(anuncioTexto(clave, estado));
        });
      });

      dialogoPanel.querySelector("#a11y-switch-daltonismo").addEventListener("click", function () {
        estado.daltonismo = estado.daltonismo ? "" : "deuteranopia";
        aplicarTodo(anuncioTexto("daltonismo", estado));
      });

      var grupoDal = dialogoPanel.querySelector("#a11y-radios-daltonismo");
      grupoDal.querySelectorAll("[data-a11y-daltonismo-opt]").forEach(function (item) {
        item.addEventListener("click", function () {
          estado.daltonismo = item.getAttribute("data-a11y-daltonismo-opt");
          aplicarTodo(anuncioTexto("daltonismo", estado));
        });
      });
      grupoDal.addEventListener("keydown", function (e) {
        var idx = Math.max(0, DALTONISMO.map(function (d) { return d.valor; }).indexOf(estado.daltonismo));
        var paso = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        var destino = paso
          ? (idx + paso + DALTONISMO.length) % DALTONISMO.length
          : (e.key === "Home" ? 0 : (e.key === "End" ? DALTONISMO.length - 1 : null));
        if (destino === null) return;
        e.preventDefault();
        estado.daltonismo = DALTONISMO[destino].valor;
        aplicarTodo(anuncioTexto("daltonismo", estado));
        var radios = grupoDal.querySelectorAll('[role="radio"]');
        if (radios[destino]) radios[destino].focus();
      });

      dialogoPanel.querySelectorAll("[data-a11y-switch]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var clave = btn.getAttribute("data-a11y-switch");
          estado[clave] = !estado[clave];
          aplicarTodo(anuncioTexto(clave, estado));
        });
      });

      // Eventos de Lectura en voz alta
      var swLector = dialogoPanel.querySelector("#a11y-switch-lector");
      if (swLector) {
        swLector.addEventListener("click", function () {
          estado.lector = !estado.lector;
          if (!estado.lector) detenerVoz();
          aplicarTodo(anuncioTexto("lector", estado));
          if (estado.lector) {
            hablar(anuncioTexto("lector", estado), { velocidad: estado.voz_velocidad, voz: estado.voz });
          }
        });
      }

      var btnSel = dialogoPanel.querySelector("#a11y-leer-seleccion");
      var btnTar = dialogoPanel.querySelector("#a11y-leer-tarjeta");
      var btnSec = dialogoPanel.querySelector("#a11y-leer-seccion");
      var btnPausa = dialogoPanel.querySelector("#a11y-pausar-voz");
      var btnDetener = dialogoPanel.querySelector("#a11y-detener-voz");
      var rngVel = dialogoPanel.querySelector("#a11y-velocidad");
      var selVoz = dialogoPanel.querySelector("#a11y-voz-elegida");

      if (btnSel) {
        btnSel.addEventListener("click", function () {
          var txt = window.getSelection ? window.getSelection().toString() : "";
          if (!hablar(txt)) avisar("No hay texto seleccionado en la página.");
        });
      }
      if (btnTar) {
        btnTar.addEventListener("click", function () {
          var tarjeta = (origenPanel && origenPanel.closest && origenPanel.closest(".sena-card"))
            || document.querySelector(".content-section.active .sena-card");
          if (!tarjeta || !hablar(textoDe(tarjeta), { elemento: tarjeta })) {
            avisar("No se encontró una tarjeta con texto en la sección actual.");
          }
        });
      }
      if (btnSec) {
        btnSec.addEventListener("click", function () {
          var sec = document.querySelector(".content-section.active") || document.getElementById("mainContent");
          if (!sec || !hablar(textoDe(sec), { elemento: sec })) {
            avisar("La sección actual no tiene texto legible.");
          }
        });
      }
      if (btnPausa) {
        btnPausa.addEventListener("click", function () {
          if (vozEstado.pausado) seguirVoz(); else pausarVoz();
        });
      }
      if (btnDetener) btnDetener.addEventListener("click", detenerVoz);
      if (rngVel) {
        rngVel.addEventListener("input", function () {
          estado.voz_velocidad = VELOCIDADES[Number(rngVel.value)] || 1;
          aplicarTodo(anuncioTexto("voz_velocidad", estado));
        });
      }
      if (selVoz) {
        selVoz.addEventListener("change", function () {
          estado.voz = selVoz.value;
          aplicarTodo(anuncioTexto("voz", estado));
        });
        cargarListaVoces();
        if (vozSoportada() && window.speechSynthesis.addEventListener) {
          window.speechSynthesis.addEventListener("voiceschanged", cargarListaVoces);
        }
      }
    }

    function cargarListaVoces() {
      if (!dialogoPanel) return;
      var sel = dialogoPanel.querySelector("#a11y-voz-elegida");
      if (!sel) return;
      var voces = vocesEspanol();
      sel.innerHTML = '<option value="">Automática (prefiere voces sin conexión)</option>' +
        voces.map(function (v) {
          return '<option value="' + esc(v.voiceURI) + '">' + esc(v.name + " (" + v.lang + ")" + (v.localService ? "" : " · en línea")) + "</option>";
        }).join("");
      sel.value = estado.voz || "";
    }

    /* ---------------- Aplicación de clases CSS y UI ---------------- */
    function aplicarEnHtml(e) {
      var raiz = document.documentElement;
      raiz.style.fontSize = e.zoom ? ZOOM[e.zoom].valor + "%" : "";

      ["contraste", "enlaces", "titulos", "foco", "negrita", "alinear", "sin_imagenes", "objetivos", "cursor", "sin_animaciones"].forEach(function (c) {
        raiz.classList.toggle("a11y-" + c.replace(/_/g, "-"), Boolean(e[c]));
      });

      FUENTES.forEach(function (f) {
        if (f.clase) raiz.classList.toggle(f.clase, FUENTES[e.fuente] === f);
      });

      [["interlineado", INTERLINEADO], ["interletrado", INTERLETRADO]].forEach(function (par) {
        var clave = par[0];
        var pasos = par[1];
        var val = pasos[e[clave]].valor;
        raiz.classList.toggle("a11y-" + clave, Boolean(val));
        if (val) raiz.style.setProperty("--a11y-" + clave, val);
        else raiz.style.removeProperty("--a11y-" + clave);
      });

      var dalObj = e.daltonismo ? DALTONISMO.filter(function (d) { return d.valor === e.daltonismo; })[0] : null;
      var filtros = [
        SATURACION[e.saturacion].filtro,
        dalObj ? "url(#" + dalObj.filtroId + ")" : null,
        e.invertir ? "invert(1) hue-rotate(180deg)" : null,
        e.contraste ? "contrast(1.15)" : null
      ].filter(Boolean);

      raiz.classList.toggle("a11y-filtro", filtros.length > 0);
      raiz.classList.toggle("a11y-invertir", Boolean(e.invertir));
      if (filtros.length) raiz.style.setProperty("--a11y-filtro", filtros.join(" "));
      else raiz.style.removeProperty("--a11y-filtro");

      actualizarCongelador(Boolean(e.sin_animaciones));
      actualizarGuiaYMascara();
      sincronizarBotonesTarjeta();
    }

    function actualizarGuiaYMascara() {
      var activoG = Boolean(estado.guia);
      var activoM = Boolean(estado.mascara);
      nodoGuia.hidden = !activoG || posY === null;
      nodoMaskTop.hidden = !activoM || posY === null;
      nodoMaskBot.hidden = !activoM || posY === null;
      if (posY !== null) {
        if (activoG) nodoGuia.style.top = posY + "px";
        if (activoM) {
          var arriba = Math.max(0, posY - 60);
          var abajo = Math.min(window.innerHeight, posY + 60);
          nodoMaskTop.style.height = arriba + "px";
          nodoMaskBot.style.top = abajo + "px";
        }
      }
    }

    function sincronizarPanelUI() {
      var activos = contarActivas(estado);
      var btnHeader = document.getElementById("boton-accesibilidad");
      var badgeHeader = document.getElementById("a11y-contador-header");
      var badgeMovil = document.getElementById("a11y-contador-movil");

      [badgeHeader, badgeMovil].forEach(function (b) {
        if (!b) return;
        b.textContent = String(activos);
        b.hidden = activos === 0;
      });
      if (btnHeader) {
        btnHeader.setAttribute("aria-label", "Accesibilidad (Alt + A)" + (activos ? ", " + activos + " ayudas activas" : ""));
      }

      if (!dialogoPanel) return;

      // Perfiles
      var nombresActivos = [];
      dialogoPanel.querySelectorAll("[data-a11y-perfil]").forEach(function (btn) {
        var clave = btn.getAttribute("data-a11y-perfil");
        var on = (estado.perfiles || []).indexOf(clave) >= 0;
        btn.classList.toggle("activo", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        if (on) {
          var p = PERFILES.filter(function (x) { return x.clave === clave; })[0];
          if (p) nombresActivos.push(p.titulo);
        }
      });
      var nota = dialogoPanel.querySelector("#a11y-perfil-nota");
      if (nota) {
        nota.hidden = nombresActivos.length === 0;
        if (nombresActivos.length) {
          nota.textContent = "Perfiles activos combinados: " + nombresActivos.join(" + ") + ". Puedes ajustar cualquier opción abajo sin perder el perfil.";
        }
      }

      // Mosaicos
      MOSAICOS.forEach(function (op) {
        var btn = dialogoPanel.querySelector('[data-a11y-mosaico="' + op.clave + '"]');
        if (!btn) return;
        var val = estado[op.clave];
        var on = op.niveles ? val > 0 : Boolean(val);
        btn.classList.toggle("activo", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        var lvl = btn.querySelector('[data-a11y-nivel="' + op.clave + '"]');
        if (lvl) lvl.textContent = op.niveles ? op.niveles[val] : (on ? "Activado" : "Desactivado");
        btn.querySelectorAll(".a11y-pasos span").forEach(function (sp, idx) {
          sp.classList.toggle("lleno", idx < val);
        });
      });

      // Daltonismo
      var swDal = dialogoPanel.querySelector("#a11y-switch-daltonismo");
      var rgDal = dialogoPanel.querySelector("#a11y-radios-daltonismo");
      if (swDal && rgDal) {
        var onDal = Boolean(estado.daltonismo);
        swDal.setAttribute("aria-checked", onDal ? "true" : "false");
        rgDal.hidden = !onDal;
        rgDal.querySelectorAll("[data-a11y-daltonismo-opt]").forEach(function (item) {
          var sel = item.getAttribute("data-a11y-daltonismo-opt") === estado.daltonismo;
          item.setAttribute("aria-checked", sel ? "true" : "false");
          item.setAttribute("tabindex", sel ? "0" : "-1");
        });
        if (!onDal && rgDal.firstElementChild) rgDal.firstElementChild.setAttribute("tabindex", "0");
      }

      // Avanzadas
      AVANZADAS.forEach(function (op) {
        var sw = dialogoPanel.querySelector('[data-a11y-switch="' + op.clave + '"]');
        if (sw) sw.setAttribute("aria-checked", estado[op.clave] ? "true" : "false");
      });

      // Voz
      var swLec = dialogoPanel.querySelector("#a11y-switch-lector");
      if (swLec) swLec.setAttribute("aria-checked", estado.lector ? "true" : "false");
      var rng = dialogoPanel.querySelector("#a11y-velocidad");
      var lblVel = dialogoPanel.querySelector("#a11y-velocidad-valor");
      if (rng && lblVel) {
        var idxVel = VELOCIDADES.indexOf(estado.voz_velocidad);
        rng.value = String(idxVel >= 0 ? idxVel : 2);
        lblVel.textContent = String(estado.voz_velocidad).replace(".", ",") + "×";
      }
      var selVoz = dialogoPanel.querySelector("#a11y-voz-elegida");
      if (selVoz) selVoz.value = estado.voz || "";

      // Botón restaurar
      var btnRest = dialogoPanel.querySelector("#a11y-restaurar");
      if (btnRest) {
        var igualFabrica = iguales(estado, predeterminadas());
        btnRest.disabled = igualFabrica && activos === 0;
        btnRest.querySelector("span").textContent = "Restaurar todo (" + activos + ")";
      }
    }

    function sincronizarControlesVoz() {
      if (dialogoPanel) {
        var p = dialogoPanel.querySelector("#a11y-pausar-voz");
        var d = dialogoPanel.querySelector("#a11y-detener-voz");
        if (p) {
          p.disabled = !vozEstado.hablando;
          p.innerHTML = (vozEstado.pausado ? icono("reproducir") : icono("pausa")) + "<span>" + (vozEstado.pausado ? "Seguir" : "Pausar") + "</span>";
        }
        if (d) d.disabled = !vozEstado.hablando;
      }
      if (nodoBarraVoz) {
        nodoBarraVoz.hidden = !vozEstado.hablando || panelAbierto();
        var fp = nodoBarraVoz.querySelector("#a11y-voz-flotante-pausa");
        if (fp) {
          fp.innerHTML = (vozEstado.pausado ? icono("reproducir") : icono("pausa")) + "<span>" + (vozEstado.pausado ? "Seguir" : "Pausar") + "</span>";
        }
      }
    }

    function sincronizarBotonesTarjeta() {
      var mostrar = Boolean(estado.lector) && vozSoportada();
      document.querySelectorAll(".sena-card").forEach(function (card) {
        var header = card.querySelector(".sena-card-header");
        if (!header) return;
        var btn = header.querySelector(".a11y-leer-bloque");
        if (mostrar && !btn) {
          btn = document.createElement("button");
          btn.type = "button";
          btn.className = "a11y-leer-bloque a11y-no-leer";
          btn.innerHTML = icono("voz") + "<span>Leer tarjeta</span>";
          btn.title = "Leer en voz alta esta tarjeta";
          btn.addEventListener("click", function () {
            hablar(textoDe(card), { elemento: card });
          });
          header.appendChild(btn);
        } else if (!mostrar && btn) {
          btn.remove();
        }
      });
    }

    function aplicarTodo(mensajeAviso) {
      guardarEstado(estado);
      aplicarEnHtml(estado);
      sincronizarPanelUI();
      sincronizarControlesVoz();
      if (mensajeAviso) avisar(mensajeAviso);
    }

    /* ---------------- Apertura / cierre de diálogos ---------------- */
    function panelAbierto() {
      return Boolean(dialogoPanel && dialogoPanel.hasAttribute("open"));
    }

    function mapaAbierto() {
      return Boolean(dialogoMapa && dialogoMapa.hasAttribute("open"));
    }

    function abrirDialogoSeguro(dlg) {
      if (!dlg || dlg.hasAttribute("open")) return;
      try {
        if (typeof dlg.showModal === "function") dlg.showModal();
        else dlg.setAttribute("open", "");
      } catch (e) {
        dlg.setAttribute("open", "");
      }
    }

    function cerrarDialogoSeguro(dlg) {
      if (!dlg || !dlg.hasAttribute("open")) return;
      try {
        if (typeof dlg.close === "function") dlg.close();
        else dlg.removeAttribute("open");
      } catch (e) {
        dlg.removeAttribute("open");
      }
    }

    function abrirPanel() {
      if (mapaAbierto()) cerrarMapa();
      origenPanel = document.activeElement;
      abrirDialogoSeguro(dialogoPanel);
      var btnHeader = document.getElementById("boton-accesibilidad");
      if (btnHeader) btnHeader.setAttribute("aria-expanded", "true");
      var btnCerrar = dialogoPanel.querySelector("#a11y-panel-cerrar");
      if (btnCerrar) btnCerrar.focus();
      sincronizarControlesVoz();
    }

    function cerrarPanel() {
      cerrarDialogoSeguro(dialogoPanel);
      var btnHeader = document.getElementById("boton-accesibilidad");
      if (btnHeader) btnHeader.setAttribute("aria-expanded", "false");
      sincronizarControlesVoz();
      if (origenPanel && origenPanel.isConnected && origenPanel.focus) origenPanel.focus();
      else if (btnHeader && btnHeader.focus) btnHeader.focus();
    }

    /* ---------------- Mapa de la página y saltos ---------------- */
    function limpio(t) {
      return (t || "").replace(/\s+/g, " ").trim();
    }

    function ocultoMapa(el) {
      return Boolean(el.closest("[hidden], [aria-hidden='true'], dialog:not([open]), .content-section:not(.active)"));
    }

    function irAElemento(el) {
      if (!el) return false;
      if (!el.matches("a[href], button, input, select, textarea, [tabindex]")) {
        el.setAttribute("tabindex", "-1");
      }
      el.focus({ preventScroll: true });
      if (el.scrollIntoView) el.scrollIntoView({ block: "start", behavior: "auto" });
      return true;
    }

    function renderizarMapa() {
      var cont = dialogoMapa.querySelector("#a11y-mapa-contenido");
      var filtroInp = dialogoMapa.querySelector("#a11y-mapa-filtro");
      var q = filtroInp ? filtroInp.value.toLowerCase().trim() : "";

      // Columna 1: Unidades del menú + tarjetas de la sección activa
      var secItems = [];
      document.querySelectorAll(".sidebar .nav-item").forEach(function (a) {
        var t = limpio(a.textContent).replace(/✓/g, "").trim();
        if (!q || t.toLowerCase().indexOf(q) >= 0) {
          secItems.push({ tipo: a.classList.contains("active") ? "Activa" : "Unidad", texto: t, target: a.getAttribute("data-target"), navEl: a });
        }
      });

      var regItems = [];
      document.querySelectorAll(".content-section.active .sena-card").forEach(function (card) {
        var tit = card.querySelector(".card-title") || card.querySelector("h2, h3, h4");
        var texto = tit ? limpio(tit.textContent) : "Tarjeta";
        if (!q || texto.toLowerCase().indexOf(q) >= 0) {
          regItems.push({ tipo: "Tarjeta", texto: texto, el: card });
        }
      });

      var headItems = [];
      var secActiva = document.querySelector(".content-section.active");
      if (secActiva) {
        secActiva.querySelectorAll("h1, h2, h3, h4").forEach(function (h) {
          if (ocultoMapa(h)) return;
          var txt = limpio(h.textContent);
          if (!txt || (q && txt.toLowerCase().indexOf(q) < 0)) return;
          headItems.push({ nivel: Number(h.tagName.slice(1)) || 2, texto: txt, el: h });
        });
      }

      var htmlCol1 = '<section><h4>Secciones de la OVA (' + secItems.length + ')</h4><ul class="a11y-mapa-lista">';
      secItems.forEach(function (item, idx) {
        htmlCol1 += '<li><button type="button" class="a11y-mapa-item" data-mapa-nav="' + idx + '">' +
          '<span class="a11y-mapa-tipo">' + esc(item.tipo) + '</span><span>' + esc(item.texto) + '</span></button></li>';
      });
      htmlCol1 += '</ul></section>';

      var htmlCol2 = '<section><h4>Tarjetas en pantalla (' + regItems.length + ')</h4><ul class="a11y-mapa-lista">';
      regItems.forEach(function (r, idx) {
        htmlCol2 += '<li><button type="button" class="a11y-mapa-item" data-mapa-reg="' + idx + '">' +
          '<span class="a11y-mapa-tipo">Tarjeta</span><span>' + esc(r.texto) + '</span></button></li>';
      });
      htmlCol2 += '</ul><h4 style="margin-top:0.85rem;">Títulos visibles (' + headItems.length + ')</h4><ul class="a11y-mapa-lista">';
      headItems.forEach(function (h, idx) {
        htmlCol2 += '<li style="padding-left:' + ((Math.min(h.nivel, 4) - 1) * 0.7) + 'rem;">' +
          '<button type="button" class="a11y-mapa-item" data-mapa-head="' + idx + '">' +
          '<span class="a11y-mapa-tipo">H' + h.nivel + '</span><span>' + esc(h.texto) + '</span></button></li>';
      });
      htmlCol2 += '</ul></section>';

      cont.innerHTML = htmlCol1 + htmlCol2;

      cont.querySelectorAll("[data-mapa-nav]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var item = secItems[Number(btn.getAttribute("data-mapa-nav"))];
          if (item && item.navEl) {
            item.navEl.click();
            cerrarMapa(document.getElementById("mainContent"));
          } else {
            cerrarMapa();
          }
        });
      });
      cont.querySelectorAll("[data-mapa-reg]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var item = regItems[Number(btn.getAttribute("data-mapa-reg"))];
          cerrarMapa(item ? item.el : null);
        });
      });
      cont.querySelectorAll("[data-mapa-head]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var item = headItems[Number(btn.getAttribute("data-mapa-head"))];
          cerrarMapa(item ? item.el : null);
        });
      });
    }

    function abrirMapa() {
      origenMapa = panelAbierto() ? origenPanel : document.activeElement;
      if (panelAbierto()) cerrarPanel();
      renderizarMapa();
      abrirDialogoSeguro(dialogoMapa);
      var f = dialogoMapa.querySelector("#a11y-mapa-filtro");
      if (f) f.focus();
    }

    function cerrarMapa(destino) {
      cerrarDialogoSeguro(dialogoMapa);
      var volver = origenMapa;
      origenMapa = null;
      setTimeout(function () {
        if (!(destino && irAElemento(destino)) && volver && volver.focus) volver.focus();
      }, 10);
    }

    function irAlContenido() {
      return irAElemento(document.getElementById("mainContent") || document.querySelector("main"));
    }

    function irAlMenu() {
      var menu = document.querySelector(".sidebar");
      if (!menu) return false;
      var foco = menu.querySelector("[aria-current='page'], .nav-item.active, .nav-item");
      return irAElemento(foco || menu);
    }

    function irATarjeta(paso) {
      var tarjetas = Array.prototype.slice.call(document.querySelectorAll(".content-section.active .sena-card"));
      if (!tarjetas.length) return false;
      var activo = document.activeElement;
      var i = -1;
      tarjetas.some(function (t, idx) {
        if (t === activo || t.contains(activo)) { i = idx; return true; }
        return false;
      });
      if (i === -1) return irAElemento(paso > 0 ? tarjetas[0] : tarjetas[tarjetas.length - 1]);
      var sig = Math.min(Math.max(i + paso, 0), tarjetas.length - 1);
      return irAElemento(tarjetas[sig]);
    }

    /* ---------------- Listeners globales ---------------- */
    var btnHeader = document.getElementById("boton-accesibilidad");
    if (btnHeader) {
      btnHeader.addEventListener("click", function () {
        if (panelAbierto()) cerrarPanel(); else abrirPanel();
      });
    }

    window.addEventListener("mousemove", function (e) {
      if (!estado.guia && !estado.mascara) return;
      posY = e.clientY;
      actualizarGuiaYMascara();
    });

    document.addEventListener("focusin", function (e) {
      if (estado.guia || estado.mascara) {
        var rect = e.target && e.target.getBoundingClientRect ? e.target.getBoundingClientRect() : null;
        if (rect && rect.height) {
          posY = rect.top + rect.height / 2;
          actualizarGuiaYMascara();
        }
      }
      if (estado.lector && vozSoportada() && !panelAbierto() && !mapaAbierto()) {
        clearTimeout(timerNarrador);
        if (e.target && e.target !== ultimaLecturaNarrador) {
          ultimaLecturaNarrador = e.target;
          var txt = textoDe(e.target);
          if (txt) hablar(txt);
        }
      }
    });

    document.addEventListener("mouseover", function (e) {
      if (!estado.lector || !vozSoportada() || panelAbierto() || mapaAbierto()) return;
      clearTimeout(timerNarrador);
      var el = e.target && e.target.closest ? e.target.closest(LEIBLES) : null;
      if (!el || el === ultimaLecturaNarrador) return;
      timerNarrador = setTimeout(function () {
        ultimaLecturaNarrador = el;
        var txt = textoDe(el);
        if (txt) hablar(txt);
      }, 350);
    });

    window.addEventListener("keydown", function (e) {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var atajo = ATAJOS.filter(function (a) { return a.codigo && a.codigo === e.code; })[0];
      if (!atajo) return;
      if (e.code.indexOf("Arrow") === 0 && e.target && e.target.closest && e.target.closest("input, textarea, select")) return;
      e.preventDefault();
      if (atajo.accion === "panel") {
        if (panelAbierto()) cerrarPanel(); else abrirPanel();
      } else if (atajo.accion === "mapa") {
        if (mapaAbierto()) cerrarMapa(); else abrirMapa();
      } else if (panelAbierto() || mapaAbierto()) {
        return;
      } else if (atajo.accion === "contenido") {
        irAlContenido();
      } else if (atajo.accion === "menu") {
        irAlMenu();
      } else if (atajo.accion === "siguiente") {
        irATarjeta(1);
      } else if (atajo.accion === "anterior") {
        irATarjeta(-1);
      }
    });

    /* Inicialización */
    crearInfraestructuraDOM();
    aplicarTodo("");

    window.SenaA11y = {
      abrir: abrirPanel,
      cerrar: cerrarPanel,
      abrirMapa: abrirMapa,
      cerrarMapa: cerrarMapa,
      estado: function () { return normalizar(estado); },
      refrescarSeccion: function () {
        sincronizarBotonesTarjeta();
      },
      detenerVoz: detenerVoz
    };
  });
})();
