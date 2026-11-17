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
    var sidebar = document.querySelector(".sidebar");
    var stepPrevBtn = document.getElementById("stepPrevBtn");
    var stepNextBtn = document.getElementById("stepNextBtn");
    var stepCounterLabel = document.getElementById("stepCounterLabel");
    var stepDotsContainer = document.getElementById("stepDotsContainer");
    var primeraCarga = true;

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
      themeToggle.title = theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
      themeToggle.setAttribute("aria-label", themeToggle.title);
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

    /* ---------------- Menú Móvil ---------------- */
    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("open");
      });
      document.addEventListener("click", function (e) {
        if (window.innerWidth <= 992 && sidebar.classList.contains("open") &&
            !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove("open");
        }
      });
    }

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
        dot.title = st.label;
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
          stepPrevBtn.title = "Anterior: " + STEPS[idx - 1].label;
        }
      }
      if (stepNextBtn) {
        stepNextBtn.disabled = idx >= STEPS.length - 1;
        if (idx < STEPS.length - 1) {
          stepNextBtn.dataset.stepId = STEPS[idx + 1].id;
          stepNextBtn.title = "Siguiente: " + STEPS[idx + 1].label;
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

    /* ---------------- Modals de profundización (<dialog class="sena-info-modal">) ---------------- */
    var origenModal = null;
    function cerrarInfoModal(dlg) {
      if (!dlg) return;
      try {
        if (typeof dlg.close === "function" && dlg.open) dlg.close();
        else dlg.removeAttribute("open");
      } catch (e) {
        dlg.removeAttribute("open");
      }
      if (origenModal && origenModal.focus) origenModal.focus();
      origenModal = null;
    }

    document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-modal-open");
        var dlg = document.getElementById(id);
        if (!dlg) return;
        origenModal = document.activeElement;
        try {
          if (typeof dlg.showModal === "function") dlg.showModal();
          else dlg.setAttribute("open", "");
        } catch (e) {
          dlg.setAttribute("open", "");
        }
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

    /* ---------------- Descarga de copia HTML 100 % offline autocontenida ---------------- */
    document.querySelectorAll("[data-download-offline]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        try {
          var clone = document.documentElement.cloneNode(true);
          clone.querySelectorAll("dialog[open]").forEach(function (d) { d.removeAttribute("open"); });
          var htmlStr = "<!doctype html>\n" + clone.outerHTML;
          var blob = new Blob([htmlStr], { type: "text/html;charset=utf-8" });
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "OVA_GA3_Logica_y_algoritmos_Offline.html";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        } catch (err) {
          window.open("index.html", "_blank");
        }
      });
    });

    /* ---------------- Inicio ---------------- */
    navigateTo(location.hash || "#intro", false);
  });
})();
