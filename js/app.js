/**
 * SENA OVA Application Controller - Guía 03 Lógica y Algoritmos
 * Controlador de navegación, progreso, tema, interactivos y autochequeo
 */
(function () {
  "use strict";

  function safeGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function safeSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ }
  }
  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }

  var ALIAS_HASH = {
    inicio: { sec: "intro" },
    m1: { sec: "u1_logica", scroll: "sim1a-card" },
    m2: { sec: "u1_logica", scroll: "sim1b-card" },
    m3: { sec: "u3_ciclicas_traza", scroll: "sim3-card" },
    m4: { sec: "u5_arreglos", scroll: "sim5a-card" },
    m5: { sec: "u6_archivos", scroll: "sim6-card" },
    m6: { sec: "u7_reto_comparador", scroll: "sim7-card" },
    m7: { sec: "evaluacion" }
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (window.ScormConnector) {
      window.ScormConnector.init();
    }

    var navItems = document.querySelectorAll(".sidebar .nav-item");
    var sections = document.querySelectorAll(".content-section");
    var progressBar = document.querySelector(".global-progress-bar");
    var progressPill = document.getElementById("progressPill");
    var themeToggle = document.getElementById("themeToggle");
    var menuToggle = document.getElementById("menuToggle");
    var readerModeToggle = document.getElementById("readerModeToggle");
    var printPageBtn = document.getElementById("printPageBtn");
    var sidebarPrintBtn = document.getElementById("sidebarPrintBtn");
    var readerModeBanner = document.getElementById("readerModeBanner");
    var readerAllBtn = document.getElementById("readerAllBtn");
    var readerPrintBtn = document.getElementById("readerPrintBtn");
    var readerExitBtn = document.getElementById("readerExitBtn");
    var sidebar = document.querySelector(".sidebar");
    var stepPrevBtn = document.getElementById("stepPrevBtn");
    var stepNextBtn = document.getElementById("stepNextBtn");
    var stepCounterLabel = document.getElementById("stepCounterLabel");
    var stepDotsContainer = document.getElementById("stepDotsContainer");
    var primeraCarga = true;
    var secActualId = null;

    var STEPS = [
      { id: "intro", label: "Introducción y Ficha" },
      { id: "u1_logica", label: "Unidad 1 · Lógica y Operadores" },
      { id: "u2_algoritmos_condicionales", label: "Unidad 2 · Algoritmos y Condicionales" },
      { id: "u3_ciclicas_traza", label: "Unidad 3 · Ciclos y Traza" },
      { id: "u4_funciones", label: "Unidad 4 · Funciones y Memoria" },
      { id: "u5_arreglos", label: "Unidad 5 · Arreglos y Matrices" },
      { id: "u6_archivos", label: "Unidad 6 · Archivos CSV y Errores" },
      { id: "u7_reto_comparador", label: "Unidad 7 · Reto y PSeInt ↔ Python" },
      { id: "repaso", label: "Sección 8 · Repaso y Chequeo IE" },
      { id: "evaluacion", label: "Sección 9 · Evaluación y Constancia" },
      { id: "sintesis_glosario", label: "Sección 10 · Síntesis y Glosario" },
      { id: "complementario_software", label: "Sección 11 · Material Compl. y Software" },
      { id: "creditos", label: "Sección 12 · Referencias y Créditos" }
    ];

    var savedVisited = safeGet("ga3_ova_visitadas");
    var visited;
    try {
      visited = new Set(savedVisited ? JSON.parse(savedVisited) : ["intro"]);
    } catch (e) {
      visited = new Set(["intro"]);
    }

    /* ---------------- Tema Claro / Oscuro ---------------- */
    var ICON_MOON = '<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    var ICON_SUN = '<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

    function updateThemeIcon(theme) {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", theme === "dark" ? "#0F1412" : "#00304D");
      if (!themeToggle) return;
      themeToggle.innerHTML = theme === "dark" ? ICON_SUN : ICON_MOON;
      var labelTema = theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
      themeToggle.setAttribute("data-tooltip", labelTema);
      themeToggle.setAttribute("aria-label", labelTema);
      themeToggle.removeAttribute("title");
    }

    function initTheme() {
      var saved = safeGet("ga3_ova_tema");
      var initial = saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", initial);
      updateThemeIcon(initial);
    }

    if (themeToggle) {
      initTheme();
      themeToggle.addEventListener("click", function () {
        var cur = document.documentElement.getAttribute("data-theme") || "light";
        var next = cur === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        safeSet("ga3_ova_tema", next);
        updateThemeIcon(next);
      });
    }

    /* ---------------- Menú Colapsable (Escritorio pantalla completa + Móvil) ---------------- */
    function actualizarEstadoMenuBtn() {
      if (!menuToggle) return;
      var esMovil = window.innerWidth <= 992;
      var visible = esMovil
        ? (sidebar && sidebar.classList.contains("open"))
        : !document.body.classList.contains("sidebar-collapsed");
      menuToggle.setAttribute("aria-expanded", visible ? "true" : "false");
      var tip = visible
        ? "Ocultar menú lateral para ampliar a pantalla completa (Alt + B)"
        : "Mostrar menú lateral de navegación (Alt + B)";
      menuToggle.setAttribute("data-tooltip", tip);
      menuToggle.setAttribute("aria-label", tip);
    }

    function alternarMenuLateral() {
      if (!sidebar) return;
      if (window.innerWidth <= 992) {
        sidebar.classList.toggle("open");
      } else {
        var colapsado = document.body.classList.toggle("sidebar-collapsed");
        safeSet("ga3_ova_sidebar_colapsada", colapsado ? "1" : "0");
      }
      actualizarEstadoMenuBtn();
    }

    if (menuToggle && sidebar) {
      if (window.innerWidth > 992 && safeGet("ga3_ova_sidebar_colapsada") === "1") {
        document.body.classList.add("sidebar-collapsed");
      }
      actualizarEstadoMenuBtn();
      menuToggle.addEventListener("click", alternarMenuLateral);
      document.addEventListener("click", function (e) {
        if (window.innerWidth <= 992 && sidebar.classList.contains("open") &&
            !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove("open");
          actualizarEstadoMenuBtn();
        }
      });
      window.addEventListener("resize", actualizarEstadoMenuBtn);
    }

    /* ---------------- Modo Lectura e Impresión del Navegador ---------------- */
    function setReaderMode(activo) {
      document.body.classList.toggle("reader-mode", Boolean(activo));
      if (!activo) {
        document.body.classList.remove("reader-all-modules");
        if (readerAllBtn) {
          readerAllBtn.setAttribute("aria-pressed", "false");
          readerAllBtn.textContent = "Ver todos los módulos";
        }
      }
      if (readerModeToggle) {
        readerModeToggle.setAttribute("aria-pressed", activo ? "true" : "false");
        readerModeToggle.classList.toggle("is-active", Boolean(activo));
      }
      if (readerModeBanner) {
        if (activo) readerModeBanner.removeAttribute("hidden");
        else readerModeBanner.setAttribute("hidden", "");
      }
    }

    function imprimirContenidoOVA() {
      document.body.classList.remove("printing-certificate");
      window.print();
    }

    if (readerModeToggle) {
      readerModeToggle.addEventListener("click", function () {
        setReaderMode(!document.body.classList.contains("reader-mode"));
      });
    }
    if (readerExitBtn) {
      readerExitBtn.addEventListener("click", function () { setReaderMode(false); });
    }
    if (readerAllBtn) {
      readerAllBtn.addEventListener("click", function () {
        var todos = document.body.classList.toggle("reader-all-modules");
        readerAllBtn.setAttribute("aria-pressed", todos ? "true" : "false");
        readerAllBtn.textContent = todos ? "Ver solo módulo actual" : "Ver todos los módulos";
      });
    }
    [printPageBtn, sidebarPrintBtn, readerPrintBtn].forEach(function (btn) {
      if (btn) btn.addEventListener("click", imprimirContenidoOVA);
    });

    document.addEventListener("keydown", function (e) {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        var k = (e.key || "").toLowerCase();
        if (k === "b") {
          e.preventDefault();
          alternarMenuLateral();
        } else if (k === "l") {
          e.preventDefault();
          setReaderMode(!document.body.classList.contains("reader-mode"));
        }
      }
    });

    /* ---------------- Progreso, Scroll-Reveal y Navegación ---------------- */
    var revealObserver = null;
    if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: "0px 0px -24px 0px" });
    }

    function activarAnimacionesSeccion(sec) {
      if (!sec) return;
      var noAnim = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
        document.documentElement.classList.contains("a11y-sin-animaciones");
      var nodos = sec.querySelectorAll(".sena-card, .photo-card, .hero-banner, .reveal-item");
      nodos.forEach(function (el, idx) {
        if (!el.classList.contains("reveal-item")) {
          el.classList.add("reveal-item", idx % 2 === 0 ? "reveal-up" : "reveal-scale");
        }
        el.style.transitionDelay = noAnim ? "0ms" : Math.min(idx * 55, 220) + "ms";
        if (noAnim || !revealObserver) {
          el.classList.add("is-visible");
        } else {
          el.classList.remove("is-visible");
          revealObserver.observe(el);
          var rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.95) {
            requestAnimationFrame(function () { el.classList.add("is-visible"); });
          }
        }
      });
    }

    function construirPuntosPasoAPaso() {
      if (!stepDotsContainer) return;
      stepDotsContainer.innerHTML = "";
      STEPS.forEach(function (st, idx) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "step-dot";
        dot.setAttribute("aria-label", "Ir al paso " + (idx + 1) + ": " + st.label);
        dot.setAttribute("data-tooltip", "Ir a: " + st.label);
        dot.dataset.stepTarget = st.id;
        dot.addEventListener("click", function () { navigateTo(st.id, true); });
        stepDotsContainer.appendChild(dot);
      });
    }
    construirPuntosPasoAPaso();

    function actualizarBarraPasoAPaso(secId) {
      var idx = STEPS.findIndex(function (s) { return s.id === secId; });
      if (idx < 0) idx = 0;
      var cur = STEPS[idx];
      if (stepCounterLabel) {
        stepCounterLabel.textContent = "Paso " + (idx + 1) + " de " + STEPS.length + " · " + cur.label;
      }
      if (stepPrevBtn) {
        stepPrevBtn.disabled = idx === 0;
        if (idx > 0) {
          stepPrevBtn.dataset.stepId = STEPS[idx - 1].id;
          stepPrevBtn.setAttribute("data-tooltip", "Anterior: " + STEPS[idx - 1].label);
        }
      }
      if (stepNextBtn) {
        stepNextBtn.disabled = idx >= STEPS.length - 1;
        if (idx < STEPS.length - 1) {
          stepNextBtn.dataset.stepId = STEPS[idx + 1].id;
          stepNextBtn.setAttribute("data-tooltip", "Siguiente: " + STEPS[idx + 1].label);
        }
      }
      if (stepDotsContainer) {
        stepDotsContainer.querySelectorAll(".step-dot").forEach(function (dot) {
          var id = dot.dataset.stepTarget;
          dot.classList.toggle("active", id === secId);
          dot.classList.toggle("visited", visited.has(id) && id !== secId);
        });
      }
    }

    if (stepPrevBtn) {
      stepPrevBtn.addEventListener("click", function () {
        if (!stepPrevBtn.disabled && stepPrevBtn.dataset.stepId) navigateTo(stepPrevBtn.dataset.stepId, true);
      });
    }
    if (stepNextBtn) {
      stepNextBtn.addEventListener("click", function () {
        if (!stepNextBtn.disabled && stepNextBtn.dataset.stepId) navigateTo(stepNextBtn.dataset.stepId, true);
      });
    }

    function updateProgress() {
      var total = sections.length || STEPS.length;
      var count = Math.min(total, visited.size);
      var pct = Math.round((count / total) * 100);
      if (progressBar) progressBar.style.width = pct + "%";
      if (progressPill) progressPill.textContent = count + " / " + total + " módulos (" + pct + "%)";
      navItems.forEach(function (item) {
        var t = item.getAttribute("data-target");
        if (visited.has(t)) item.classList.add("completed");
      });
      safeSet("ga3_ova_visitadas", JSON.stringify(Array.from(visited)));
    }

    /* ---------------- Ventanas de Bloques (Min/Max/Cerrar) y Enfoque por Pestañas ---------------- */
    var ICON_WIN_MIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    var ICON_WIN_MAX = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
    var ICON_WIN_RESTORE = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
    var ICON_WIN_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    function restaurarVentanasAlCambiarModulo(nuevoSecId) {
      document.querySelectorAll(".sena-card.is-maximized").forEach(function (c) {
        c.classList.remove("is-maximized");
        var maxBtn = c.querySelector(".win-max");
        if (maxBtn) {
          maxBtn.innerHTML = ICON_WIN_MAX;
          maxBtn.setAttribute("aria-pressed", "false");
          maxBtn.setAttribute("data-tooltip", "Maximizar este bloque para concentrarse sin distracciones");
        }
      });
      if (secActualId && secActualId !== nuevoSecId) {
        document.querySelectorAll(".content-section .sena-card.is-closed").forEach(function (c) {
          c.classList.remove("is-closed");
        });
        sections.forEach(function (s) {
          if (typeof s._syncFocusBar === "function") s._syncFocusBar();
        });
      }
    }

    function initVentanasYEnfoque() {
      sections.forEach(function (sec) {
        var cards = Array.prototype.slice.call(sec.querySelectorAll(":scope > .sena-card"));
        if (!cards.length) return;

        var tabButtons = [];
        var focusMode = "windows";
        var activeTabIdx = 0;

        cards.forEach(function (card, idx) {
          var header = card.querySelector(":scope > .sena-card-header");
          if (!header) return;

          var titleEl = header.querySelector(".card-title");
          var titleTxt = titleEl ? titleEl.textContent.trim() : ("Bloque " + (idx + 1));

          var bodyDiv = document.createElement("div");
          bodyDiv.className = "sena-card-body";
          var nodo = header.nextSibling;
          while (nodo) {
            var sig = nodo.nextSibling;
            bodyDiv.appendChild(nodo);
            nodo = sig;
          }
          card.appendChild(bodyDiv);

          var controls = document.createElement("div");
          controls.className = "window-controls";

          var minBtn = document.createElement("button");
          minBtn.type = "button";
          minBtn.className = "window-btn win-min";
          minBtn.innerHTML = ICON_WIN_MIN;
          minBtn.setAttribute("aria-pressed", "false");
          minBtn.setAttribute("aria-label", "Minimizar bloque: " + titleTxt);
          minBtn.setAttribute("data-tooltip", "Minimizar este bloque");

          var maxBtn = document.createElement("button");
          maxBtn.type = "button";
          maxBtn.className = "window-btn win-max";
          maxBtn.innerHTML = ICON_WIN_MAX;
          maxBtn.setAttribute("aria-pressed", "false");
          maxBtn.setAttribute("aria-label", "Maximizar bloque: " + titleTxt);
          maxBtn.setAttribute("data-tooltip", "Maximizar este bloque para concentrarse sin distracciones");

          var closeBtn = document.createElement("button");
          closeBtn.type = "button";
          closeBtn.className = "window-btn win-close";
          closeBtn.innerHTML = ICON_WIN_CLOSE;
          closeBtn.setAttribute("aria-label", "Cerrar bloque temporalmente: " + titleTxt);
          closeBtn.setAttribute("data-tooltip", "Cerrar bloque temporalmente (se restaura al cambiar de módulo)");

          minBtn.addEventListener("click", function () {
            if (card.classList.contains("is-maximized")) {
              card.classList.remove("is-maximized");
              maxBtn.innerHTML = ICON_WIN_MAX;
              maxBtn.setAttribute("aria-pressed", "false");
            }
            var isMin = card.classList.toggle("is-minimized");
            minBtn.setAttribute("aria-pressed", isMin ? "true" : "false");
            minBtn.setAttribute("data-tooltip", isMin ? "Expandir contenido del bloque" : "Minimizar este bloque");
          });

          maxBtn.addEventListener("click", function () {
            var opening = !card.classList.contains("is-maximized");
            document.querySelectorAll(".sena-card.is-maximized").forEach(function (other) {
              other.classList.remove("is-maximized");
              var omb = other.querySelector(".win-max");
              if (omb) { omb.innerHTML = ICON_WIN_MAX; omb.setAttribute("aria-pressed", "false"); }
            });
            if (opening) {
              card.classList.remove("is-minimized", "is-closed", "is-tab-hidden");
              minBtn.setAttribute("aria-pressed", "false");
              card.classList.add("is-maximized");
              maxBtn.innerHTML = ICON_WIN_RESTORE;
              maxBtn.setAttribute("aria-pressed", "true");
              maxBtn.setAttribute("data-tooltip", "Restaurar tamaño normal (Esc)");
            } else {
              card.classList.remove("is-maximized");
              maxBtn.innerHTML = ICON_WIN_MAX;
              maxBtn.setAttribute("aria-pressed", "false");
              maxBtn.setAttribute("data-tooltip", "Maximizar este bloque para concentrarse sin distracciones");
              if (typeof sec._syncFocusBar === "function") sec._syncFocusBar();
            }
          });

          closeBtn.addEventListener("click", function () {
            card.classList.remove("is-maximized");
            card.classList.add("is-closed");
            maxBtn.innerHTML = ICON_WIN_MAX;
            maxBtn.setAttribute("aria-pressed", "false");
            if (focusMode === "tabs") {
              var nextVis = cards.findIndex(function (c) { return !c.classList.contains("is-closed"); });
              if (nextVis >= 0) activeTabIdx = nextVis;
            }
            if (typeof sec._syncFocusBar === "function") sec._syncFocusBar();
          });

          controls.appendChild(minBtn);
          controls.appendChild(maxBtn);
          controls.appendChild(closeBtn);
          header.appendChild(controls);
        });

        if (cards.length < 2) return;

        var bar = document.createElement("div");
        bar.className = "module-focus-bar";

        var topRow = document.createElement("div");
        topRow.className = "module-focus-top";

        var modeGroup = document.createElement("div");
        modeGroup.className = "module-focus-modes";

        var btnWinMode = document.createElement("button");
        btnWinMode.type = "button";
        btnWinMode.className = "focus-pill-btn active";
        btnWinMode.textContent = "Vista ventanas";
        btnWinMode.setAttribute("data-tooltip", "Ver todos los bloques como ventanas independientes");

        var btnTabMode = document.createElement("button");
        btnTabMode.type = "button";
        btnTabMode.className = "focus-pill-btn";
        btnTabMode.textContent = "Enfoque 1 a la vez (pestañas)";
        btnTabMode.setAttribute("data-tooltip", "Mostrar únicamente un bloque a la vez mediante pestañas para evitar distracciones");

        modeGroup.appendChild(btnWinMode);
        modeGroup.appendChild(btnTabMode);

        var actGroup = document.createElement("div");
        actGroup.className = "module-focus-actions";

        var btnMinAll = document.createElement("button");
        btnMinAll.type = "button";
        btnMinAll.className = "focus-pill-btn";
        btnMinAll.textContent = "Minimizar todo";
        btnMinAll.setAttribute("data-tooltip", "Colapsar todos los bloques de este módulo");

        var btnExpAll = document.createElement("button");
        btnExpAll.type = "button";
        btnExpAll.className = "focus-pill-btn";
        btnExpAll.textContent = "Expandir todo";
        btnExpAll.setAttribute("data-tooltip", "Mostrar el contenido completo de todos los bloques");

        var btnRestore = document.createElement("button");
        btnRestore.type = "button";
        btnRestore.className = "focus-pill-btn restore-btn";
        btnRestore.hidden = true;
        btnRestore.setAttribute("data-tooltip", "Volver a mostrar los bloques cerrados en este módulo");

        actGroup.appendChild(btnMinAll);
        actGroup.appendChild(btnExpAll);
        actGroup.appendChild(btnRestore);
        topRow.appendChild(modeGroup);
        topRow.appendChild(actGroup);

        var tabsRow = document.createElement("div");
        tabsRow.className = "module-focus-tabs";
        tabsRow.setAttribute("role", "tablist");
        tabsRow.hidden = true;

        cards.forEach(function (card, idx) {
          var tEl = card.querySelector(":scope > .sena-card-header .card-title");
          var full = tEl ? tEl.textContent.trim() : ("Bloque " + (idx + 1));
          var shortTxt = full.length > 42 ? full.slice(0, 40) + "…" : full;
          var tBtn = document.createElement("button");
          tBtn.type = "button";
          tBtn.className = "focus-tab-item";
          tBtn.setAttribute("role", "tab");
          tBtn.textContent = shortTxt;
          tBtn.setAttribute("data-tooltip", "Enfocar bloque: " + full);
          tBtn.addEventListener("click", function () {
            card.classList.remove("is-closed", "is-minimized");
            activeTabIdx = idx;
            syncFocusBar();
          });
          tabsRow.appendChild(tBtn);
          tabButtons.push(tBtn);
        });

        bar.appendChild(topRow);
        bar.appendChild(tabsRow);

        var secHeader = sec.querySelector(":scope > .section-header");
        if (secHeader && secHeader.nextSibling) {
          sec.insertBefore(bar, secHeader.nextSibling);
        } else {
          sec.insertBefore(bar, cards[0]);
        }

        function syncFocusBar() {
          var closedCount = 0;
          cards.forEach(function (c, i) {
            if (c.classList.contains("is-closed")) closedCount++;
            if (focusMode === "tabs") {
              c.classList.toggle("is-tab-hidden", i !== activeTabIdx);
              if (i === activeTabIdx) c.classList.remove("is-minimized");
            } else {
              c.classList.remove("is-tab-hidden");
            }
          });
          tabButtons.forEach(function (tb, i) {
            var isAct = i === activeTabIdx;
            tb.classList.toggle("active", isAct);
            tb.setAttribute("aria-selected", isAct ? "true" : "false");
          });
          btnWinMode.classList.toggle("active", focusMode === "windows");
          btnTabMode.classList.toggle("active", focusMode === "tabs");
          tabsRow.hidden = focusMode !== "tabs";
          btnMinAll.hidden = focusMode === "tabs";
          btnExpAll.hidden = focusMode === "tabs";
          btnRestore.hidden = closedCount === 0;
          if (closedCount > 0) btnRestore.textContent = "Restaurar cerradas (" + closedCount + ")";
        }

        btnWinMode.addEventListener("click", function () {
          focusMode = "windows";
          syncFocusBar();
        });
        btnTabMode.addEventListener("click", function () {
          focusMode = "tabs";
          if (cards[activeTabIdx] && cards[activeTabIdx].classList.contains("is-closed")) {
            var firstOpen = cards.findIndex(function (c) { return !c.classList.contains("is-closed"); });
            activeTabIdx = firstOpen >= 0 ? firstOpen : 0;
            cards[activeTabIdx].classList.remove("is-closed");
          }
          syncFocusBar();
        });
        btnMinAll.addEventListener("click", function () {
          cards.forEach(function (c) {
            if (!c.classList.contains("is-closed")) {
              c.classList.remove("is-maximized");
              c.classList.add("is-minimized");
              var mb = c.querySelector(".win-min");
              if (mb) mb.setAttribute("aria-pressed", "true");
            }
          });
        });
        btnExpAll.addEventListener("click", function () {
          cards.forEach(function (c) {
            c.classList.remove("is-minimized");
            var mb = c.querySelector(".win-min");
            if (mb) mb.setAttribute("aria-pressed", "false");
          });
        });
        btnRestore.addEventListener("click", function () {
          cards.forEach(function (c) { c.classList.remove("is-closed"); });
          syncFocusBar();
        });

        sec._syncFocusBar = syncFocusBar;
        sec._enfocarTarjetaId = function (cardId) {
          var idx = cards.findIndex(function (c) { return c.id === cardId; });
          if (idx >= 0) {
            cards[idx].classList.remove("is-closed", "is-minimized");
            activeTabIdx = idx;
            syncFocusBar();
          }
        };
        syncFocusBar();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          var maxCard = document.querySelector(".sena-card.is-maximized");
          if (maxCard) {
            maxCard.classList.remove("is-maximized");
            var mb = maxCard.querySelector(".win-max");
            if (mb) { mb.innerHTML = ICON_WIN_MAX; mb.setAttribute("aria-pressed", "false"); }
          }
        }
      });
    }
    initVentanasYEnfoque();

    function navigateTo(rawTarget, pushHash) {
      var clean = String(rawTarget || "intro").replace(/^#/, "");
      var mapped = ALIAS_HASH[clean];
      var secId = mapped ? mapped.sec : clean;
      var scrollId = mapped && mapped.scroll ? mapped.scroll : null;

      var targetSection = document.getElementById(secId);
      if (!targetSection) {
        secId = "intro";
        targetSection = document.getElementById("intro");
      }

      restaurarVentanasAlCambiarModulo(secId);
      secActualId = secId;
      if (scrollId && typeof targetSection._enfocarTarjetaId === "function") {
        targetSection._enfocarTarjetaId(scrollId);
      }

      function aplicarCambioDOM() {
        sections.forEach(function (s) { s.classList.toggle("active", s.id === secId); });
        navItems.forEach(function (item) {
          var match = item.getAttribute("data-target") === secId;
          item.classList.toggle("active", match);
          if (match) item.setAttribute("aria-current", "page");
          else item.removeAttribute("aria-current");
        });
      }

      var reduceMotion = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
        document.documentElement.classList.contains("a11y-sin-animaciones");

      if (!primeraCarga && typeof document.startViewTransition === "function" && !reduceMotion) {
        document.startViewTransition(aplicarCambioDOM);
      } else {
        aplicarCambioDOM();
      }
      primeraCarga = false;

      visited.add(secId);
      updateProgress();
      actualizarBarraPasoAPaso(secId);
      activarAnimacionesSeccion(targetSection);

      if (window.SenaA11y) {
        if (window.SenaA11y.detenerVoz) window.SenaA11y.detenerVoz();
        if (window.SenaA11y.refrescarSeccion) window.SenaA11y.refrescarSeccion();
      }

      if (sidebar && window.innerWidth <= 992) {
        sidebar.classList.remove("open");
      }
      if (pushHash && history.replaceState) {
        history.replaceState(null, "", "#" + clean);
      }
      var scrollBehavior = reduceMotion ? "auto" : "smooth";
      if (scrollId && document.getElementById(scrollId)) {
        setTimeout(function () {
          document.getElementById(scrollId).scrollIntoView({ behavior: scrollBehavior, block: "start" });
        }, 60);
      } else {
        window.scrollTo({ top: 0, behavior: scrollBehavior });
      }
    }

    document.querySelectorAll("[data-target]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (el.tagName === "A") e.preventDefault();
        navigateTo(el.getAttribute("data-target"), true);
      });
    });

    window.addEventListener("hashchange", function () {
      navigateTo(location.hash || "#intro", false);
    });

    /* ---------------- Acordeones ---------------- */
    document.querySelectorAll(".accordion-header").forEach(function (header) {
      header.addEventListener("click", function () {
        var item = header.parentElement;
        var isAlready = item.classList.contains("active");
        var parent = item.parentElement;
        if (parent && parent.classList.contains("accordion-single")) {
          parent.querySelectorAll(".accordion-item").forEach(function (i) { i.classList.remove("active"); });
        }
        item.classList.toggle("active", !isAlready);
      });
    });

    /* ---------------- Copiar Código ---------------- */
    function copyText(text, btn) {
      function done() {
        var old = btn.innerHTML;
        btn.innerHTML = "✓ ¡Copiado!";
        btn.style.background = "var(--sena-green)";
        setTimeout(function () { btn.innerHTML = old; btn.style.background = ""; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { /* noop */ }
        document.body.removeChild(ta);
      }
    }

    document.querySelectorAll(".terminal-copy-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sel = btn.getAttribute("data-copy-target");
        var target = sel ? document.querySelector(sel) : btn.closest(".terminal-box").querySelector(".terminal-body");
        if (target) copyText(target.innerText || target.textContent, btn);
      });
    });

    /* ---------------- Lightbox para Diagramas ---------------- */
    var photoWrappers = document.querySelectorAll(".photo-wrapper");
    if (photoWrappers.length > 0) {
      var overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML =
        '<div class="modal-content" style="text-align:center;">' +
        '  <button class="modal-close" aria-label="Cerrar">&times;</button>' +
        '  <img id="modalImg" src="" alt="Vista ampliada" style="max-width:100%; max-height:74vh; object-fit:contain; border-radius:8px; background:#fff; padding:8px;">' +
        '  <p id="modalCaption" style="margin-top:12px; font-size:0.92rem; color:var(--text-secondary);"></p>' +
        "</div>";
      document.body.appendChild(overlay);
      var modalImg = overlay.querySelector("#modalImg");
      var modalCap = overlay.querySelector("#modalCaption");

      photoWrappers.forEach(function (wrap) {
        wrap.addEventListener("click", function () {
          var img = wrap.querySelector("img");
          var card = wrap.closest(".photo-card");
          var cap = card && card.querySelector(".photo-caption") ? card.querySelector(".photo-caption").innerText : (img ? img.alt : "");
          if (img) {
            modalImg.src = img.src;
            modalCap.textContent = cap;
            overlay.classList.add("active");
          }
        });
      });

      overlay.querySelector(".modal-close").addEventListener("click", function () { overlay.classList.remove("active"); });
      overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.classList.remove("active"); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && overlay.classList.contains("active")) overlay.classList.remove("active");
      });
    }

    /* ---------------- Flashcards 3D ---------------- */
    document.querySelectorAll(".flash-card").forEach(function (card) {
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", function () { card.classList.toggle("flipped"); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.toggle("flipped");
        }
      });
    });

    /* ---------------- Actividades de Ordenar (Parsons) ---------------- */
    document.querySelectorAll(".order-activity").forEach(function (act) {
      var list = act.querySelector(".order-list");
      var correcto = [];
      try { correcto = JSON.parse(act.dataset.correcto || "[]"); } catch (e) { correcto = []; }
      var res = act.querySelector(".order-result");

      act.querySelectorAll(".order-item").forEach(function (li) {
        var up = li.querySelector(".up");
        var down = li.querySelector(".down");
        if (up) up.addEventListener("click", function () {
          if (li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
          li.classList.remove("ok", "bad");
        });
        if (down) down.addEventListener("click", function () {
          if (li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
          li.classList.remove("ok", "bad");
        });
      });

      var checkBtn = act.querySelector(".order-check");
      if (checkBtn) {
        checkBtn.addEventListener("click", function () {
          var items = Array.from(list.querySelectorAll(".order-item"));
          var bien = 0;
          items.forEach(function (li, idx) {
            var ok = li.dataset.k === String(correcto[idx]);
            li.classList.toggle("ok", ok);
            li.classList.toggle("bad", !ok);
            if (ok) bien++;
          });
          if (res) {
            res.style.color = bien === items.length ? "var(--sena-green-dark)" : "var(--sena-red)";
            res.textContent = bien === items.length
              ? "✓ ¡Excelente! Secuencia 100 % correcta (" + bien + "/" + items.length + ")."
              : "Acertaste " + bien + " de " + items.length + " posiciones. Ajusta las filas marcadas en rojo.";
          }
        });
      }
    });

    /* ---------------- Glosario Interactivo ---------------- */
    var glossaryInput = document.getElementById("glossarySearch");
    var glossaryCat = "todos";
    function filterGlossary() {
      var term = glossaryInput ? glossaryInput.value.toLowerCase().trim() : "";
      document.querySelectorAll(".glossary-item").forEach(function (item) {
        var text = item.innerText.toLowerCase();
        var cat = item.getAttribute("data-cat") || "general";
        var okText = !term || text.indexOf(term) >= 0;
        var okCat = glossaryCat === "todos" || cat === glossaryCat;
        item.style.display = okText && okCat ? "block" : "none";
      });
    }
    if (glossaryInput) {
      glossaryInput.addEventListener("input", filterGlossary);
    }
    document.querySelectorAll(".glossary-filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        glossaryCat = btn.dataset.cat || "todos";
        document.querySelectorAll(".glossary-filter-btn").forEach(function (b) {
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        filterGlossary();
      });
    });

    /* ---------------- Autoverificador Listas de Chequeo (IE-GA3) ---------------- */
    var ieSel = document.getElementById("ie-selector");
    var ieDet = document.getElementById("ie-detalle");
    var EVIDENCIAS = window.OVA_EVIDENCIAS || [];

    function renderIE(idx) {
      if (!ieDet || !EVIDENCIAS.length) return;
      var ev = EVIDENCIAS[idx] || EVIDENCIAS[0];
      var savedRaw = safeGet("ga3_ie_" + ev.codigo);
      var checks = {};
      try { checks = savedRaw ? JSON.parse(savedRaw) : {}; } catch (e) { checks = {}; }

      var html =
        '<div class="callout callout-info" style="margin-top:8px;">' +
        '  <div class="callout-icon"><svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg></div>' +
        '  <div class="callout-body">' +
        '    <div class="callout-title">' + esc(ev.codigo) + " · " + esc(ev.nombre) + " (" + esc(ev.tipo) + ", " + esc(ev.horas) + " h)</div>" +
        '    <div class="callout-text"><strong>Producto esperado:</strong> ' + esc(ev.producto) + "</div>" +
        "  </div>" +
        "</div>" +
        '<ul class="ie-list">';

      ev.indicadores.forEach(function (ind, k) {
        var checked = checks[k] ? "checked" : "";
        html +=
          '<li><label class="ie-item">' +
          '  <input type="checkbox" data-ie-idx="' + k + '" ' + checked + ">" +
          '  <span><strong>Indicador ' + (k + 1) + " (SÍ/NO):</strong> " + esc(ind) + "</span>" +
          "</label></li>";
      });
      html += '</ul><div id="ie-estado"></div>';
      ieDet.innerHTML = html;

      function updateIEEstado() {
        var inputs = ieDet.querySelectorAll('input[type="checkbox"]');
        var total = inputs.length, ok = 0;
        var st = {};
        inputs.forEach(function (inp) {
          var k = inp.dataset.ieIdx;
          st[k] = inp.checked;
          if (inp.checked) ok++;
        });
        safeSet("ga3_ie_" + ev.codigo, JSON.stringify(st));
        var box = document.getElementById("ie-estado");
        if (ok === total) {
          box.innerHTML = '<div class="nota-inline ok">✓ Cumples <strong>' + ok + " de " + total + "</strong> indicadores binarios en SÍ. Tu evidencia " + esc(ev.codigo) + " está lista para entrega.</div>";
        } else {
          box.innerHTML = '<div class="nota-inline warn">Llevas <strong>' + ok + " de " + total + "</strong> indicadores en SÍ. Recuerda que en el SENA la evidencia se aprueba únicamente cuando <strong>todos</strong> los indicadores quedan en SÍ.</div>";
        }
      }

      ieDet.querySelectorAll('input[type="checkbox"]').forEach(function (inp) {
        inp.addEventListener("change", updateIEEstado);
      });
      updateIEEstado();
    }

    if (ieSel && EVIDENCIAS.length) {
      EVIDENCIAS.forEach(function (ev, i) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.textContent = ev.codigo + " — " + ev.nombre;
        ieSel.appendChild(opt);
      });
      ieSel.addEventListener("change", function () { renderIE(parseInt(ieSel.value, 10)); });
      renderIE(0);
    }

    /* ---------------- Motor de Evaluación ---------------- */
    if (window.SenaQuizEngine) {
      new window.SenaQuizEngine({
        containerId: "quizContainer",
        passingScore: 70,
        ovaCode: "OVA-GA3",
        ovaTitle: "Lógica y algoritmos con PSeInt y Python",
        ficha: window.OVA_FICHA || "3490966"
      });
    }

    /* ---------------- Mini-Workbench del Hero ---------------- */
    var wbTabs = document.querySelectorAll(".hero-wb-tab");
    var wbCode = document.getElementById("heroWbCode");
    var wbFoot = document.getElementById("heroWbFoot");
    var WB_SNIPPETS = {
      d01: {
        code: "// PSeInt (Lógica CR1)\naprueba <- (p Y NO q) O r\n\n# Python 3\naprueba = (frecuente and not tiene_deuda) or compra_alta",
        note: "AA1-EV01 · Papelería Sugamuxi"
      },
      d03: {
        code: "// PSeInt (Condicional anidada)\nSi sub >= 300000 Entonces desc <- 10 SiNo desc <- 5 FinSi\n\n# Python 3\nporcentaje = 10 if sub >= 300000 else (5 if sub >= 100000 else 0)",
        note: "AA2-EV01 · Escala de descuentos"
      },
      d05: {
        code: "// PSeInt (Ciclo centinela)\nMientras venta <> 0 Hacer total <- total + venta FinMientras\n\n# Python 3\nwhile venta != 0: total_dia += venta",
        note: "AA2-EV02 · Cierre de caja"
      }
    };
    if (wbTabs.length && wbCode) {
      wbTabs.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.dataset.wb;
          var item = WB_SNIPPETS[key] || WB_SNIPPETS.d01;
          wbTabs.forEach(function (b) { b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
          wbCode.textContent = item.code;
          if (wbFoot) wbFoot.textContent = item.note;
        });
      });
    }

    /* ---------------- Tabs interactivas (.sena-tabs) ---------------- */
    document.querySelectorAll(".sena-tabs").forEach(function (wrap) {
      var btns = Array.prototype.slice.call(wrap.querySelectorAll(".sena-tab-btn"));
      var panels = Array.prototype.slice.call(wrap.querySelectorAll(".sena-tab-panel"));
      function activar(idx) {
        btns.forEach(function (b, i) { b.setAttribute("aria-selected", i === idx ? "true" : "false"); });
        panels.forEach(function (p, i) { p.classList.toggle("active", i === idx); });
      }
      btns.forEach(function (btn, idx) {
        btn.addEventListener("click", function () { activar(idx); });
        btn.addEventListener("keydown", function (e) {
          var nxt = e.key === "ArrowRight" ? (idx + 1) % btns.length
            : (e.key === "ArrowLeft" ? (idx - 1 + btns.length) % btns.length
            : (e.key === "Home" ? 0 : (e.key === "End" ? btns.length - 1 : -1)));
          if (nxt < 0) return;
          e.preventDefault();
          activar(nxt);
          btns[nxt].focus();
        });
      });
    });

    /* ---------------- Carrusel / Slider paso a paso (.sena-slider) ---------------- */
    document.querySelectorAll(".sena-slider").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".sena-slide"));
      var prev = slider.querySelector(".sena-slider-prev");
      var next = slider.querySelector(".sena-slider-next");
      var dotsWrap = slider.querySelector(".sena-slider-dots");
      var status = slider.querySelector(".sena-slider-status");
      var idx = 0;

      if (dotsWrap && !dotsWrap.children.length) {
        slides.forEach(function (_s, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "sena-slider-dot";
          dot.setAttribute("aria-label", "Ir al paso " + (i + 1));
          dot.addEventListener("click", function () { irSlide(i); });
          dotsWrap.appendChild(dot);
        });
      }

      function irSlide(nuevo) {
        idx = Math.max(0, Math.min(slides.length - 1, nuevo));
        slides.forEach(function (s, i) { s.classList.toggle("active", i === idx); });
        if (dotsWrap) {
          Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
            d.classList.toggle("active", i === idx);
          });
        }
        if (status) status.textContent = (idx + 1) + " / " + slides.length;
        if (prev) prev.disabled = idx === 0;
        if (next) next.disabled = idx >= slides.length - 1;
      }

      if (prev) prev.addEventListener("click", function () { irSlide(idx - 1); });
      if (next) next.addEventListener("click", function () { irSlide(idx + 1); });
      irSlide(0);
    });

    /* ---------------- Modals de profundización y Visor Atractivo de Recursos ---------------- */
    var origenModal = null;
    var resViewerModal = document.getElementById("modal-resource-viewer");
    var resModalBadge = document.getElementById("resModalBadge");
    var resModalTitle = document.getElementById("resModalTitle");
    var resModalUrlDisplay = document.getElementById("resModalUrlDisplay");
    var resModalCopyBtn = document.getElementById("resModalCopyBtn");
    var resModalExternalBtn = document.getElementById("resModalExternalBtn");
    var resModalBody = document.getElementById("resModalBody");
    var resModalUrlActual = "";

    function abrirDialogoNativo(dlg) {
      if (!dlg) return;
      origenModal = document.activeElement;
      try {
        if (typeof dlg.showModal === "function") dlg.showModal();
        else dlg.setAttribute("open", "");
      } catch (e) {
        dlg.setAttribute("open", "");
      }
    }

    function cerrarInfoModal(dlg) {
      if (!dlg) return;
      if (dlg.id === "modal-resource-viewer" && resModalBody) {
        resModalBody.innerHTML = "";
      }
      try {
        if (typeof dlg.close === "function" && dlg.open) dlg.close();
        else dlg.removeAttribute("open");
      } catch (e) {
        dlg.removeAttribute("open");
      }
      if (origenModal && origenModal.focus) origenModal.focus();
      origenModal = null;
    }

    function abrirVisorRecursos(cfg) {
      if (!resViewerModal || !resModalBody) return;
      resModalBody.innerHTML = "";
      resModalUrlActual = cfg.url || "#";
      if (resModalBadge) resModalBadge.textContent = cfg.badge || "Recurso educativo";
      if (resModalTitle) resModalTitle.textContent = cfg.title || "Recurso SENA";
      if (resModalUrlDisplay) resModalUrlDisplay.textContent = resModalUrlActual;
      if (resModalExternalBtn) {
        resModalExternalBtn.href = resModalUrlActual;
        resModalExternalBtn.setAttribute("target", "_blank");
        resModalExternalBtn.setAttribute("rel", "noopener noreferrer");
      }

      if (cfg.type === "video" && cfg.videoId) {
        var wrap = document.createElement("div");
        wrap.className = "video-embed-wrap";
        var ifrVid = document.createElement("iframe");
        ifrVid.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(cfg.videoId) + "?rel=0";
        ifrVid.title = cfg.title || "Video educativo";
        ifrVid.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        ifrVid.allowFullscreen = true;
        wrap.appendChild(ifrVid);
        resModalBody.appendChild(wrap);
      } else if (cfg.type === "pdf" || cfg.type === "drive") {
        var frameUrl = resModalUrlActual;
        if (cfg.type === "drive") {
          frameUrl = resModalUrlActual.replace(/\/view.*$/, "/preview");
        }
        var ifrDoc = document.createElement("iframe");
        ifrDoc.className = "doc-preview-frame";
        ifrDoc.src = frameUrl;
        ifrDoc.title = cfg.title || "Vista previa de documento";
        resModalBody.appendChild(ifrDoc);
      } else {
        var showcase = document.createElement("div");
        showcase.className = "external-resource-showcase";
        var h4 = document.createElement("h4");
        h4.textContent = cfg.title || "Recurso externo recomendado";
        var pDesc = document.createElement("p");
        pDesc.textContent = cfg.desc || "Consulta este recurso en una pestaña dedicada del navegador.";
        showcase.appendChild(h4);
        showcase.appendChild(pDesc);
        if (cfg.steps && cfg.steps.length) {
          var ol = document.createElement("ol");
          ol.className = "external-steps-list";
          cfg.steps.forEach(function (st) {
            var li = document.createElement("li");
            li.textContent = st;
            ol.appendChild(li);
          });
          showcase.appendChild(ol);
        }
        var ctaRow = document.createElement("div");
        ctaRow.style.display = "flex";
        ctaRow.style.flexWrap = "wrap";
        ctaRow.style.gap = "10px";
        var cta = document.createElement("a");
        cta.href = resModalUrlActual;
        cta.target = "_blank";
        cta.rel = "noopener noreferrer";
        cta.className = "btn btn-primary";
        cta.textContent = "Abrir sitio oficial en nueva pestaña ↗";
        ctaRow.appendChild(cta);
        showcase.appendChild(ctaRow);
        resModalBody.appendChild(showcase);
      }

      if (cfg.desc && (cfg.type === "video" || cfg.type === "pdf" || cfg.type === "drive")) {
        var note = document.createElement("div");
        note.className = "callout callout-info";
        note.style.marginTop = "12px";
        note.style.marginBottom = "0";
        note.innerHTML =
          '<div class="callout-icon"><svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>' +
          '<div class="callout-body"><div class="callout-text">' + esc(cfg.desc) + " Si prefieres verlo a pantalla completa o descargar, pulsa el botón superior <strong>Abrir en nueva pestaña ↗</strong>.</div></div>";
        resModalBody.appendChild(note);
      }

      abrirDialogoNativo(resViewerModal);
    }

    if (resModalCopyBtn) {
      resModalCopyBtn.addEventListener("click", function () {
        if (resModalUrlActual) copyText(resModalUrlActual, resModalCopyBtn);
      });
    }

    document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dlg = document.getElementById(btn.getAttribute("data-modal-open"));
        abrirDialogoNativo(dlg);
      });
    });

    document.querySelectorAll("[data-video-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var vid = btn.getAttribute("data-video-id");
        abrirVisorRecursos({
          type: "video",
          videoId: vid,
          url: "https://www.youtube.com/watch?v=" + vid,
          badge: "Video educativo · YouTube",
          title: btn.getAttribute("data-video-title") || "Video de apoyo SENA",
          desc: btn.getAttribute("data-video-desc") || ""
        });
      });
    });

    document.querySelectorAll("[data-resource-modal]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        var rawSteps = link.getAttribute("data-res-steps") || "";
        abrirVisorRecursos({
          type: link.getAttribute("data-res-type") || "web",
          url: link.getAttribute("href"),
          badge: link.getAttribute("data-res-badge") || "Recurso SENA",
          title: link.getAttribute("data-res-title") || link.textContent.trim(),
          desc: link.getAttribute("data-res-desc") || "",
          steps: rawSteps ? rawSteps.split("|") : []
        });
      });
    });

    document.querySelectorAll("dialog.sena-info-modal").forEach(function (dlg) {
      dlg.querySelectorAll("[data-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", function () { cerrarInfoModal(dlg); });
      });
      dlg.addEventListener("mousedown", function (e) {
        if (e.target === dlg) cerrarInfoModal(dlg);
      });
      dlg.addEventListener("cancel", function (e) {
        e.preventDefault();
        cerrarInfoModal(dlg);
      });
    });

    /* ---------------- Todos los enlaces externos en nueva pestaña ---------------- */
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href && href.charAt(0) !== "#" && href.indexOf("javascript:") !== 0 && !a.hasAttribute("data-target")) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });

    /* ---------------- Sistema Universal de Tooltips de Ayuda ---------------- */
    function initTooltipsOVA() {
      var MAPA_AUTO_TOOLTIPS = {
        "m1-go": "Generar tabla de verdad completa de la fórmula escrita",
        "m2-go": "Evaluar la expresión paso a paso mostrando los 8 niveles de jerarquía",
        "sim2-eps-check": "Comprobar tu clasificación Entrada – Proceso – Salida",
        "m3-ant": "Retroceder una línea en la prueba de escritorio",
        "m3-sig": "Avanzar una línea y actualizar la tabla de variables",
        "m3-auto": "Reproducir o pausar la ejecución automática paso a paso",
        "m3-fin": "Ejecutar hasta completar todo el algoritmo",
        "sim5b-buscar-btn": "Ejecutar búsqueda secuencial comparando cada posición",
        "sim5b-mat-step": "Recorrer la siguiente celda [fila][columna] de la matriz 2D",
        "sim5b-mat-reset": "Restaurar los valores iniciales de la matriz 2D"
      };
      Object.keys(MAPA_AUTO_TOOLTIPS).forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el.getAttribute("data-tooltip")) el.setAttribute("data-tooltip", MAPA_AUTO_TOOLTIPS[id]);
      });

      document.querySelectorAll("button, .btn, .nav-item, .hero-wb-tab, .sena-tab-btn, .glossary-filter-btn, .accordion-header").forEach(function (el) {
        var t = el.getAttribute("title");
        if (t && !el.getAttribute("data-tooltip")) {
          el.setAttribute("data-tooltip", t);
          if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", t);
        }
        if (el.getAttribute("data-tooltip") && t) el.removeAttribute("title");
      });

      var tipBox = document.createElement("div");
      tipBox.id = "ovaTooltip";
      tipBox.className = "ova-tooltip-portal";
      tipBox.setAttribute("role", "tooltip");
      tipBox.hidden = true;
      document.body.appendChild(tipBox);

      var activoEl = null;

      function obtenerTextoAyuda(el) {
        if (!el) return "";
        if (el.getAttribute("data-tooltip")) return el.getAttribute("data-tooltip");
        if (el.getAttribute("title")) return el.getAttribute("title");
        if (el.getAttribute("aria-label")) return el.getAttribute("aria-label");
        if (el.classList.contains("terminal-copy-btn")) return "Copiar código al portapapeles";
        if (el.classList.contains("up")) return "Subir esta instrucción una posición";
        if (el.classList.contains("down")) return "Bajar esta instrucción una posición";
        if (el.classList.contains("order-check")) return "Verificar si el orden actual de instrucciones es correcto";
        if (el.classList.contains("hero-wb-tab")) return "Cambiar el ejemplo mostrado en PSeInt y Python";
        if (el.classList.contains("sena-tab-btn")) return "Cambiar a esta pestaña de contenido";
        if (el.classList.contains("accordion-header")) return "Expandir o contraer esta sección";
        if (el.classList.contains("nav-item")) return "Ir a: " + el.textContent.replace("✓", "").trim();
        var txt = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (el.tagName === "BUTTON" && txt) return "Acción: " + txt;
        return "";
      }

      function mostrarTooltip(el) {
        var texto = obtenerTextoAyuda(el);
        if (!texto) { ocultarTooltip(); return; }
        activoEl = el;
        tipBox.textContent = texto;
        tipBox.hidden = false;
        tipBox.classList.add("visible");

        var rect = el.getBoundingClientRect();
        var tw = tipBox.offsetWidth || 180;
        var th = tipBox.offsetHeight || 32;
        var left = rect.left + (rect.width / 2) - (tw / 2);
        left = Math.max(8, Math.min(window.innerWidth - tw - 8, left));
        var top = rect.top - th - 8;
        if (top < 8) top = rect.bottom + 8;
        tipBox.style.left = Math.round(left) + "px";
        tipBox.style.top = Math.round(top) + "px";
      }

      function ocultarTooltip() {
        activoEl = null;
        tipBox.classList.remove("visible");
        tipBox.hidden = true;
      }

      var SELS = "[data-tooltip], button, .btn, .nav-item, .hero-wb-tab, .sena-tab-btn, .accordion-header, .glossary-filter-btn";
      document.addEventListener("mouseover", function (e) {
        var el = e.target && e.target.closest ? e.target.closest(SELS) : null;
        if (el && el !== activoEl) mostrarTooltip(el);
      });
      document.addEventListener("mouseout", function (e) {
        if (activoEl && e.target && !activoEl.contains(e.relatedTarget)) ocultarTooltip();
      });
      document.addEventListener("focusin", function (e) {
        var el = e.target && e.target.closest ? e.target.closest(SELS) : null;
        if (el) mostrarTooltip(el);
      });
      document.addEventListener("focusout", ocultarTooltip);
      document.addEventListener("click", ocultarTooltip);
      window.addEventListener("scroll", ocultarTooltip, true);
    }
    initTooltipsOVA();

    /* ---------------- Inicio ---------------- */
    navigateTo(location.hash || "#intro", false);
  });
})();
