/**
 * Simuladores Interactivos de la OVA · Guía 03 Lógica y Algoritmos
 * Módulos:
 *  1A. Generador de Tablas de Verdad
 *  1B. Evaluador Paso a Paso de Jerarquía de Operadores
 *  2.  Analizador EPS (Entrada-Proceso-Salida) y Árbol de Decisiones
 *  3.  Prueba de Escritorio Paso a Paso (6 algoritmos con PSeInt y Python)
 *  4.  Visualizador de Memoria: Paso por Valor vs Referencia y Menú Modular
 *  5A. Ordenamiento por Burbuja Paso a Paso
 *  5B. Vectores Paralelos (Índice 1 vs 0) y Calculadora de Matrices 2D
 *  6.  Simulador CRUD en Archivo CSV y Control de Excepciones
 *  7.  Comparador PSeInt <-> Python (d01-d09) con Consola Real
 */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }
  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }
  function vf(b) {
    return '<span class="' + (b ? "V" : "F") + '">' + (b ? "V" : "F") + "</span>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSim1A_Tablas();
    initSim1B_Jerarquia();
    initSim2_EPSyDecisiones();
    initSim3_PruebaEscritorio();
    initSim4_FuncionesMemoria();
    initSim5A_Burbuja();
    initSim5B_VectoresYMatrices();
    initSim6_CSV();
    initSim7_Comparador();
  });

  /* =========================================================================
     SIMULADOR 1A: TABLAS DE VERDAD
     ========================================================================= */
  function initSim1A_Tablas() {
    if (!$("m1-f")) return;

    function lexer(s) {
      var t = [], i = 0;
      s = s.replace(/<->|<=>/g, "↔").replace(/->|=>/g, "→").replace(/\[/g, "(").replace(/\]/g, ")");
      while (i < s.length) {
        var c = s[i];
        if (/\s/.test(c)) { i++; continue; }
        var pal = /^[A-Za-zÁÉÍÓÚáéíóú]+/.exec(s.slice(i));
        if (pal) {
          var w = pal[0], W = w.toUpperCase();
          if (W === "NO" || W === "NOT") t.push("¬");
          else if (W === "Y" || W === "AND") t.push("∧");
          else if (W === "O" || W === "OR") t.push("∨");
          else if (/^[a-z]$/.test(w)) t.push(w);
          else throw "No reconozco «" + w + "». Usa letras minúsculas sueltas (p, q, r, s).";
          i += w.length;
          continue;
        }
        if ("¬~!".indexOf(c) >= 0) { t.push("¬"); i++; continue; }
        if ("∧&^".indexOf(c) >= 0) { t.push("∧"); i++; continue; }
        if ("∨|".indexOf(c) >= 0) { t.push("∨"); i++; continue; }
        if ("→↔()".indexOf(c) >= 0) { t.push(c); i++; continue; }
        throw "Símbolo no válido: «" + c + "»";
      }
      return t;
    }

    var NIV = { "↔": 1, "→": 2, "∨": 3, "∧": 4 };
    function parser(t) {
      var k = 0;
      function prim() {
        var x = t[k];
        if (x === undefined) throw "La fórmula está incompleta.";
        if (x === "¬") { k++; return { op: "¬", a: prim() }; }
        if (x === "(") {
          k++;
          var e = expr(1);
          if (t[k] !== ")") throw "Falta cerrar un paréntesis.";
          k++;
          e.par = true;
          return e;
        }
        if (/^[a-z]$/.test(x)) { k++; return { v: x }; }
        throw "Esperaba una letra, ¬ o un paréntesis y encontré «" + x + "».";
      }
      function expr(min) {
        var izq = prim();
        while (k < t.length && NIV[t[k]] >= min) {
          var op = t[k], n = NIV[op]; k++;
          var der = expr(op === "→" ? n : n + 1);
          izq = { op: op, a: izq, b: der };
        }
        return izq;
      }
      var r = expr(1);
      if (k < t.length) throw "Sobra «" + t[k] + "» al final.";
      return r;
    }

    function txt(n, raiz) {
      if (n.v) return n.v;
      if (n.op === "¬") return "¬" + txt(n.a);
      var s = txt(n.a) + " " + n.op + " " + txt(n.b);
      return raiz ? s : "(" + s + ")";
    }

    function ev(n, val) {
      if (n.v) return val[n.v];
      if (n.op === "¬") return !ev(n.a, val);
      var a = ev(n.a, val), b = ev(n.b, val);
      return { "∧": a && b, "∨": a || b, "→": !a || b, "↔": a === b }[n.op];
    }

    function subs(n, lista) {
      if (n.v) return;
      if (n.a) subs(n.a, lista);
      if (n.b) subs(n.b, lista);
      var s = txt(n, true);
      if (lista.indexOf(s) < 0) lista.push(s);
      n.etq = s;
    }

    function nodos(n, l) {
      if (n.v) return;
      if (n.a) nodos(n.a, l);
      if (n.b) nodos(n.b, l);
      if (l.every(function (x) { return x.etq !== n.etq; })) l.push(n);
    }

    function generar() {
      var res = $("m1-res");
      try {
        var tokens = lexer($("m1-f").value), arbol = parser(tokens);
        var letras = Array.from(new Set(tokens.filter(function (x) { return /^[a-z]$/.test(x); }))).sort();
        if (!letras.length) throw "La fórmula no tiene letras proposicionales.";
        if (letras.length > 5) throw "Máximo 5 letras (32 filas).";
        subs(arbol, []);
        var cols = [];
        nodos(arbol, cols);
        var h = '<div class="tabla-scroll"><table class="ova-table centro"><tr>' +
          letras.map(function (l) { return "<th>" + l + "</th>"; }).join("") +
          cols.map(function (c) { return "<th>" + esc(c.etq) + "</th>"; }).join("") + "</tr>";
        var filas = 1 << letras.length, nV = 0;
        for (var f = 0; f < filas; f++) {
          var val = {};
          letras.forEach(function (l, i) { val[l] = !((f >> (letras.length - 1 - i)) & 1); });
          h += "<tr>" + letras.map(function (l) { return "<td>" + vf(val[l]) + "</td>"; }).join("") +
            cols.map(function (c) { return "<td>" + vf(ev(c, val)) + "</td>"; }).join("") + "</tr>";
          if (ev(arbol, val)) nV++;
        }
        h += "</table></div>";
        var clase = nV === filas
          ? "una <strong>tautología</strong>: la columna principal es V en las " + filas + " filas"
          : nV === 0
            ? "una <strong>contradicción</strong>: la columna principal es F en todas las filas"
            : "una <strong>contingencia</strong>: resulta V en " + nV + " de " + filas + " filas";
        res.innerHTML = "<p><strong>" + letras.length + "</strong> proposiciones simples → 2<sup>" + letras.length + "</sup> = <strong>" + filas + "</strong> combinaciones posibles.</p>" +
          h + '<div class="nota-inline ok">Clasificación: la fórmula es ' + clase + ".</div>";
      } catch (e) {
        res.innerHTML = '<div class="nota-inline mal">' + esc(e) + "</div>";
      }
    }

    $("m1-go").addEventListener("click", generar);
    $("m1-f").addEventListener("keydown", function (e) { if (e.key === "Enter") generar(); });
    document.querySelectorAll("[data-ins]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = $("m1-f"), p = i.selectionStart || i.value.length;
        i.value = i.value.slice(0, p) + b.dataset.ins + i.value.slice(p);
        i.focus();
      });
    });
    document.querySelectorAll("[data-ej]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        $("m1-f").value = a.dataset.ej;
        generar();
      });
    });
    generar();
  }

  /* =========================================================================
     SIMULADOR 1B: JERARQUÍA DE OPERADORES PASO A PASO
     ========================================================================= */
  function initSim1B_Jerarquia() {
    if (!$("m2-e")) return;
    var NIVEL = { "^": 2, "*": 3, "/": 3, "MOD": 3, "+": 4, "-": 4, "=": 5, "<>": 5, "<": 5, ">": 5, "<=": 5, ">=": 5, "NO": 6, "Y": 7, "O": 8 };
    var NOMBRE = { 2: "Potencia", 3: "Multiplicación, división o módulo", 4: "Suma o resta", 5: "Operador relacional", 6: "Negación lógica", 7: "Conjunción lógica (Y)", 8: "Disyunción lógica (O)" };

    function lexer(s, vars) {
      var t = [], i = 0, m;
      while (i < s.length) {
        var r = s.slice(i);
        if (/^\s/.test(r)) { i++; continue; }
        if ((m = /^\d+(\.\d+)?/.exec(r))) { t.push({ n: parseFloat(m[0]) }); i += m[0].length; continue; }
        if ((m = /^(<>|<=|>=|!=|==|\*\*|[()^*/+\-=<>%])/.exec(r))) {
          var o = { "!=": "<>", "==": "=", "**": "^", "%": "MOD" }[m[0]] || m[0];
          t.push({ o: o });
          i += m[0].length;
          continue;
        }
        if ((m = /^[A-Za-z_áéíóúñÁÉÍÓÚÑ]\w*/.exec(r))) {
          var W = m[0].toUpperCase(), w = m[0];
          if (W === "MOD") t.push({ o: "MOD" });
          else if (W === "NO" || W === "NOT") t.push({ o: "NO" });
          else if (W === "Y" || W === "AND") t.push({ o: "Y" });
          else if (W === "O" || W === "OR") t.push({ o: "O" });
          else if (W === "VERDADERO" || W === "TRUE") t.push({ vl: true });
          else if (W === "FALSO" || W === "FALSE") t.push({ vl: false });
          else if (Object.prototype.hasOwnProperty.call(vars, w)) t.push({ n: vars[w], nom: w });
          else throw "La variable «" + w + "» no tiene valor. Defínela en el campo de variables.";
          i += w.length;
          continue;
        }
        throw "Símbolo no válido: «" + r[0] + "»";
      }
      return t;
    }

    function parser(t) {
      var k = 0;
      function prim() {
        var x = t[k];
        if (!x) throw "La expresión está incompleta.";
        if (x.o === "(") {
          k++;
          var e = expr(8);
          if (!t[k] || t[k].o !== ")") throw "Falta cerrar un paréntesis.";
          k++;
          return { par: e };
        }
        if (x.o === "-") {
          k++;
          var p = prim();
          if (p.n !== undefined) return { n: -p.n };
          return { op: "-", a: { n: 0 }, b: p };
        }
        if (x.o === "NO") { k++; return { op: "NO", a: expr(6) }; }
        if (x.n !== undefined || x.vl !== undefined) { k++; return x.vl !== undefined ? { vl: x.vl } : { n: x.n }; }
        throw "No esperaba «" + (x.o || "?") + "» en esa posición.";
      }
      function expr(max) {
        var izq = prim();
        while (k < t.length && t[k].o && NIVEL[t[k].o] && NIVEL[t[k].o] <= max && t[k].o !== "NO") {
          var op = t[k].o, n = NIVEL[op]; k++;
          var der = op === "^" ? expr(n) : expr(n - 1);
          izq = { op: op, a: izq, b: der };
        }
        return izq;
      }
      var r = expr(8);
      if (k < t.length) throw "Sobra «" + (t[k].o || t[k].n) + "».";
      return r;
    }

    function fmt(v) {
      if (typeof v === "boolean") return v ? "V" : "F";
      return Number.isInteger(v) ? String(v) : String(Math.round(v * 10000) / 10000);
    }
    function lit(n) { return n.n !== undefined || n.vl !== undefined; }
    function val(n) { return n.n !== undefined ? n.n : n.vl; }
    function txt(n) {
      if (lit(n)) return fmt(val(n));
      if (n.par) return "(" + txt(n.par) + ")";
      if (n.op === "NO") return "NO " + txt(n.a);
      return txt(n.a) + " " + n.op + " " + txt(n.b);
    }
    function aplicar(n) {
      if (n.op === "NO") {
        if (typeof val(n.a) !== "boolean") throw "NO solo se aplica a valores lógicos.";
        return !val(n.a);
      }
      var a = val(n.a), b = val(n.b);
      var logicos = n.op === "Y" || n.op === "O";
      if (logicos && (typeof a !== "boolean" || typeof b !== "boolean")) throw n.op + " necesita dos valores lógicos (V o F).";
      if (NIVEL[n.op] <= 4 && (typeof a === "boolean" || typeof b === "boolean")) throw "No se puede operar aritméticamente un valor lógico.";
      switch (n.op) {
        case "^": return Math.pow(a, b);
        case "*": return a * b;
        case "/": if (b === 0) throw "División por cero."; return a / b;
        case "MOD": if (b === 0) throw "MOD por cero."; return a % b;
        case "+": return a + b;
        case "-": return a - b;
        case "=": return a === b;
        case "<>": return a !== b;
        case "<": return a < b;
        case ">": return a > b;
        case "<=": return a <= b;
        case ">=": return a >= b;
        case "Y": return a && b;
        case "O": return a || b;
      }
    }
    function candidatos(n, prof, lista) {
      if (lit(n)) return;
      if (n.par) { candidatos(n.par, prof + 1, lista); return; }
      if (n.a) candidatos(n.a, prof, lista);
      if (n.b) candidatos(n.b, prof, lista);
      if (lit(n.a) && (!n.b || lit(n.b))) lista.push({ nodo: n, prof: prof, nivel: NIVEL[n.op], orden: lista.length });
    }
    function quitarParentesis(n) {
      if (n.par) { var x = quitarParentesis(n.par); if (lit(x)) return x; n.par = x; return n; }
      if (n.a) n.a = quitarParentesis(n.a);
      if (n.b) n.b = quitarParentesis(n.b);
      return n;
    }

    function evaluar() {
      var res = $("m2-res");
      try {
        var vars = {};
        $("m2-v").value.split(",").forEach(function (p) {
          if (!p.trim()) return;
          var m = /^\s*([A-Za-z_]\w*)\s*(=|<-)\s*(-?\d+(\.\d+)?)\s*$/.exec(p);
          if (!m) throw "Variables: escribe «nombre = número», separadas por coma.";
          vars[m[1]] = parseFloat(m[3]);
        });
        var arbol = parser(lexer($("m2-e").value, vars)), pasos = [], guarda = 0;
        arbol = quitarParentesis(arbol);
        while (!lit(arbol) && guarda++ < 200) {
          var c = [];
          candidatos(arbol, 0, c);
          c.sort(function (x, y) { return (y.prof - x.prof) || (x.nivel - y.nivel) || (x.orden - y.orden); });
          var elegido = c[0].nodo, operacion = txt(elegido), r = aplicar(elegido);
          Object.keys(elegido).forEach(function (k) { delete elegido[k]; });
          if (typeof r === "boolean") elegido.vl = r; else elegido.n = r;
          arbol = quitarParentesis(arbol);
          pasos.push({
            que: NOMBRE[c[0].nivel] + (c[0].prof ? " (dentro de paréntesis)" : ""),
            op: operacion,
            r: fmt(r),
            queda: txt(arbol)
          });
        }
        var h = '<div class="tabla-scroll"><table class="ova-table"><tr><th>Paso</th><th>Nivel que se resuelve</th><th>Operación</th><th>Expresión resultante</th></tr>';
        pasos.forEach(function (p, i) {
          h += "<tr><td><strong>" + (i + 1) + "</strong></td><td>" + esc(p.que) + '</td><td><span class="expr">' + esc(p.op) + " → " + esc(p.r) + '</span></td><td><span class="expr">' + esc(p.queda) + "</span></td></tr>";
        });
        h += "</table></div>";
        var py = $("m2-e").value
          .replace(/\^/g, "**")
          .replace(/\bMOD\b/gi, "%")
          .replace(/<>/g, "!=")
          .replace(/(^|[^<>!=])=(?!=)/g, "$1==")
          .replace(/\bNO\b/gi, "not")
          .replace(/\bY\b/gi, "and")
          .replace(/\bO\b/gi, "or");
        res.innerHTML = (pasos.length ? h : "") +
          '<div class="nota-inline ok">Resultado final: <strong>' +
          (typeof val(arbol) === "boolean" ? (val(arbol) ? "Verdadero" : "Falso") : fmt(val(arbol))) +
          '</strong> · Equivalente en Python: <span class="expr">' + esc(py) + "</span></div>";
      } catch (e) {
        res.innerHTML = '<div class="nota-inline mal">' + esc(e) + "</div>";
      }
    }

    $("m2-go").addEventListener("click", evaluar);
    $("m2-e").addEventListener("keydown", function (e) { if (e.key === "Enter") evaluar(); });
    document.querySelectorAll("[data-m2ej]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        $("m2-e").value = a.dataset.m2ej;
        $("m2-v").value = a.dataset.m2vars || "";
        evaluar();
      });
    });
    evaluar();
  }

  /* =========================================================================
     SIMULADOR 2: ANALIZADOR EPS Y ÁRBOL DE DECISIONES
     ========================================================================= */
  function initSim2_EPSyDecisiones() {
    var epsSel = $("sim2-eps-sel");
    if (epsSel) {
      var CASOS_EPS = [
        {
          titulo: "Factura rápida (Papelería Sugamuxi · d02)",
          desc: "Calcular subtotal, IVA del 19 % y total a pagar según producto, cantidad y precio unitario.",
          elementos: [
            { txt: "Nombre del producto (Caracter / str)", bien: "E" },
            { txt: "Cantidad comprada (Entero / int)", bien: "E" },
            { txt: "Precio unitario (Real / float)", bien: "E" },
            { txt: "subtotal <- cantidad * precio_unitario", bien: "P" },
            { txt: "valor_iva <- subtotal * 0.19", bien: "P" },
            { txt: "total <- subtotal + valor_iva", bien: "P" },
            { txt: "Mostrar subtotal, IVA y total a pagar", bien: "S" }
          ]
        },
        {
          titulo: "Liquidación de horas extras en taller de Sogamoso",
          desc: "Leer horas trabajadas y tarifa por hora; si supera 40 h, pagar las extras al 150 % y mostrar salario neto.",
          elementos: [
            { txt: "Horas trabajadas en la semana (Real / float)", bien: "E" },
            { txt: "Valor de la hora ordinaria (Real / float)", bien: "E" },
            { txt: "Si horas > 40 Entonces calcular recargo 1.5", bien: "P" },
            { txt: "salario <- horas_normales * tarifa + extras * tarifa * 1.5", bien: "P" },
            { txt: "Imprimir desprendible con salario total", bien: "S" }
          ]
        },
        {
          titulo: "Control de temperatura en invernadero de Tibasosa",
          desc: "Leer lectura del sensor en °C; determinar si está en rango óptimo (15 a 24 °C) o activar alerta.",
          elementos: [
            { txt: "Temperatura medida por el sensor (Real / float)", bien: "E" },
            { txt: "Evaluar Si temp >= 15 Y temp <= 24", bien: "P" },
            { txt: "Mensaje de estado: «Rango óptimo» o «Activar ventilación»", bien: "S" }
          ]
        }
      ];

      CASOS_EPS.forEach(function (c, idx) {
        var o = document.createElement("option");
        o.value = idx;
        o.textContent = c.titulo;
        epsSel.appendChild(o);
      });

      function pintarEPS() {
        var caso = CASOS_EPS[parseInt(epsSel.value, 10)] || CASOS_EPS[0];
        var html = '<p class="callout-text" style="margin-bottom:10px;"><strong>Enunciado:</strong> ' + esc(caso.desc) + "</p>" +
          '<div class="tabla-scroll"><table class="ova-table"><tr><th>Elemento del problema</th><th>Clasificación EPS</th><th>Estado</th></tr>';
        caso.elementos.forEach(function (el, k) {
          html += '<tr><td>' + esc(el.txt) + '</td><td><select class="sim-select eps-pick" data-k="' + k + '" aria-label="Clasificación EPS para ' + esc(el.txt) + '">' +
            '<option value="">-- Selecciona --</option>' +
            '<option value="E">Entrada (Leer)</option>' +
            '<option value="P">Proceso (Calcular / Decidir)</option>' +
            '<option value="S">Salida (Escribir)</option>' +
            '</select></td><td id="eps-st-' + k + '">—</td></tr>';
        });
        html += "</table></div>";
        $("sim2-eps-body").innerHTML = html;
        $("sim2-eps-res").innerHTML = "";
      }

      epsSel.addEventListener("change", pintarEPS);
      $("sim2-eps-check").addEventListener("click", function () {
        var caso = CASOS_EPS[parseInt(epsSel.value, 10)] || CASOS_EPS[0];
        var bien = 0;
        caso.elementos.forEach(function (el, k) {
          var sel = document.querySelector('.eps-pick[data-k="' + k + '"]');
          var ok = sel && sel.value === el.bien;
          if (ok) bien++;
          $("eps-st-" + k).innerHTML = ok ? '<span class="V">✓ Correcto</span>' : '<span class="F">✗ Revisa</span>';
        });
        $("sim2-eps-res").innerHTML = '<div class="nota-inline ' + (bien === caso.elementos.length ? "ok" : "warn") + '">Clasificaste <strong>' + bien + " de " + caso.elementos.length + "</strong> elementos del análisis EPS.</div>";
      });
      pintarEPS();
    }

    if ($("sim2-tree-sub")) {
      function evaluarArbol() {
        var sub = parseFloat($("sim2-tree-sub").value) || 0;
        var est = $("sim2-tree-est").value === "S";
        var pago = $("sim2-tree-pago").value;
        var pct = 0, rama1 = "";
        if (sub >= 300000) { pct = 10; rama1 = "Rama 1 verdadera: subtotal >= 300000 → porcentaje = 10 %"; }
        else if (sub >= 100000) { pct = 5; rama1 = "Rama 1 falsa → Rama 2 verdadera (elif): subtotal >= 100000 → porcentaje = 5 %"; }
        else { pct = 0; rama1 = "Rama 1 y 2 falsas → else: porcentaje = 0 %"; }
        var extra = est ? "Condicional simple verdadera (carné='S'): +2 % adicional → " + (pct + 2) + " %" : "Condicional simple falsa (carné='N'): sin bono adicional";
        if (est) pct += 2;
        var desc = sub * pct / 100;
        var neto = sub - desc;
        var recargo = pago === "2" ? neto * 0.03 : 0;
        var ramaPago = pago === "1" ? "Según opción 1: Efectivo (sin recargo)"
          : pago === "2" ? "Según opción 2: Tarjeta (+3 % recargo = $" + Math.round(recargo).toLocaleString("es-CO") + ")"
          : "Según opción 3: Transferencia bancaria (sin recargo)";

        $("sim2-tree-out").innerHTML =
          '<div class="nota-inline ok">' +
          "<strong>Camino lógico ejecutado:</strong><br>" +
          "1. " + esc(rama1) + "<br>" +
          "2. " + esc(extra) + "<br>" +
          "3. " + esc(ramaPago) + "<br>" +
          "<strong>Descuento:</strong> $" + Math.round(desc).toLocaleString("es-CO") +
          " · <strong>Total final a pagar:</strong> $" + Math.round(neto + recargo).toLocaleString("es-CO") +
          "</div>";
      }
      $("sim2-tree-sub").addEventListener("input", evaluarArbol);
      $("sim2-tree-est").addEventListener("change", evaluarArbol);
      $("sim2-tree-pago").addEventListener("change", evaluarArbol);
      evaluarArbol();
    }
  }

  /* =========================================================================
     SIMULADOR 3: PRUEBA DE ESCRITORIO PASO A PASO (6 ALGORITMOS)
     ========================================================================= */
  function initSim3_PruebaEscritorio() {
    if (!$("m3-p")) return;

    function num(x) { var n = parseFloat(String(x).replace(",", ".")); if (isNaN(n)) throw "Escribe un número válido."; return n; }
    function ent(x, a, b) { var n = num(x); if (!Number.isInteger(n) || n < a || n > b) throw "Escribe un entero entre " + a + " y " + b + "."; return n; }

    var PROG = {
      factura: {
        ent: [["cantidad", "3"], ["precio", "4500"]],
        cod: [
          "IVA <- 0.19",
          "Leer cantidad, precio",
          "subtotal <- cantidad * precio",
          "valorIva <- subtotal * IVA",
          "total <- subtotal + valorIva",
          "Escribir \"Subtotal: \", subtotal",
          "Escribir \"Total: \", total"
        ],
        py: [
          "IVA = 0.19",
          "cantidad = int(input()); precio = float(input())",
          "subtotal = cantidad * precio",
          "valor_iva = subtotal * IVA",
          "total = subtotal + valor_iva",
          "print('Subtotal:', subtotal)",
          "print('Total:', total)"
        ],
        vars: ["cantidad", "precio", "subtotal", "valorIva", "total"],
        correr: function (e, P) {
          var v = {}; P(0, v);
          v.cantidad = ent(e[0], 1, 1000); v.precio = num(e[1]); P(1, v);
          v.subtotal = v.cantidad * v.precio; P(2, v);
          v.valorIva = Math.round(v.subtotal * 0.19 * 100) / 100; P(3, v);
          v.total = Math.round((v.subtotal + v.valorIva) * 100) / 100; P(4, v);
          P(5, v, null, "Subtotal: " + v.subtotal);
          P(6, v, null, "Total: " + v.total);
        }
      },
      descuento: {
        ent: [["subtotal", "150000"], ["carné (S/N)", "S"]],
        cod: [
          "Leer subtotal",
          "Leer respuesta",
          "Si subtotal >= 300000 Entonces",
          "    porcentaje <- 10",
          "SiNo",
          "    Si subtotal >= 100000 Entonces",
          "        porcentaje <- 5",
          "    SiNo",
          "        porcentaje <- 0",
          "    FinSi",
          "FinSi",
          "Si Mayusculas(respuesta) = \"S\" Entonces",
          "    porcentaje <- porcentaje + 2",
          "FinSi",
          "descuento <- subtotal * porcentaje / 100",
          "Escribir porcentaje, \" % ($\", descuento, \")\"",
          "Escribir \"Total: $\", subtotal - descuento"
        ],
        py: [
          "subtotal = float(input())",
          "respuesta = input().strip().upper()",
          "if subtotal >= 300000:",
          "    porcentaje = 10",
          "else:",
          "    if subtotal >= 100000:",
          "        porcentaje = 5",
          "    else:",
          "        porcentaje = 0",
          "# fin else",
          "# fin if",
          "if respuesta == 'S':",
          "    porcentaje = porcentaje + 2",
          "# fin if",
          "descuento = subtotal * porcentaje / 100",
          "print(f'{porcentaje} % (${descuento})')",
          "print(f'Total: ${subtotal - descuento}')"
        ],
        vars: ["subtotal", "respuesta", "porcentaje", "descuento"],
        correr: function (e, P) {
          var v = {}, sub = num(e[0]); v.subtotal = sub; P(0, v);
          v.respuesta = e[1].trim().toUpperCase(); P(1, v);
          var c1 = sub >= 300000; P(2, v, "subtotal >= 300000 → " + (c1 ? "V" : "F"));
          if (c1) { v.porcentaje = 10; P(3, v); }
          else {
            var c2 = sub >= 100000; P(5, v, "subtotal >= 100000 → " + (c2 ? "V" : "F"));
            if (c2) { v.porcentaje = 5; P(6, v); } else { v.porcentaje = 0; P(8, v); }
          }
          var c3 = v.respuesta === "S"; P(11, v, "respuesta == 'S' → " + (c3 ? "V" : "F"));
          if (c3) { v.porcentaje += 2; P(12, v); }
          v.descuento = sub * v.porcentaje / 100; P(14, v);
          P(15, v, null, v.porcentaje + " % ($" + v.descuento + ")");
          P(16, v, null, "Total: $" + (sub - v.descuento));
        }
      },
      pago: {
        ent: [["total", "100000"], ["opción (1-3)", "2"]],
        cod: [
          "Leer total, opcion",
          "Segun opcion Hacer",
          "    1: pagar <- total",
          "    2: pagar <- total * 1.03",
          "    3: pagar <- total",
          "    De Otro Modo: Escribir \"Opción inválida\"",
          "FinSegun",
          "Escribir \"A pagar: $\", pagar"
        ],
        py: [
          "total = float(input()); opcion = int(input())",
          "# selección múltiple con if / elif / else",
          "if opcion == 1: pagar = total",
          "elif opcion == 2: pagar = total * 1.03",
          "elif opcion == 3: pagar = total",
          "else: print('Opción inválida')",
          "# fin selección",
          "print('A pagar: $', pagar)"
        ],
        vars: ["total", "opcion", "pagar"],
        correr: function (e, P) {
          var v = { total: num(e[0]), opcion: ent(e[1], 1, 9) }; P(0, v);
          P(1, v, "Evalúa Segun opcion = " + v.opcion);
          if (v.opcion === 1) { v.pagar = v.total; P(2, v, "Coincide caso 1"); P(7, v, null, "A pagar: $" + v.pagar); }
          else if (v.opcion === 2) { v.pagar = Math.round(v.total * 1.03 * 100) / 100; P(3, v, "Coincide caso 2 (+3 %)"); P(7, v, null, "A pagar: $" + v.pagar); }
          else if (v.opcion === 3) { v.pagar = v.total; P(4, v, "Coincide caso 3"); P(7, v, null, "A pagar: $" + v.pagar); }
          else { P(5, v, "De Otro Modo", "Opción inválida"); }
        }
      },
      suma: {
        ent: [["n", "4"]],
        cod: [
          "Leer n",
          "suma <- 0",
          "i <- 1",
          "Mientras i <= n Hacer",
          "    suma <- suma + i",
          "    i <- i + 1",
          "FinMientras",
          "Escribir \"Suma: \", suma"
        ],
        py: [
          "n = int(input())",
          "suma = 0",
          "i = 1",
          "while i <= n:",
          "    suma = suma + i",
          "    i = i + 1",
          "# fin while",
          "print('Suma:', suma)"
        ],
        vars: ["n", "suma", "i"],
        correr: function (e, P) {
          var v = { n: ent(e[0], 0, 25) }; P(0, v);
          v.suma = 0; P(1, v);
          v.i = 1; P(2, v);
          while (true) {
            var c = v.i <= v.n;
            P(3, v, "i <= n → " + (c ? "V (vuelta " + v.i + ")" : "F → sale"));
            if (!c) break;
            v.suma += v.i; P(4, v);
            v.i += 1; P(5, v);
          }
          P(7, v, null, "Suma: " + v.suma);
        }
      },
      primo: {
        ent: [["n", "9"]],
        cod: [
          "Leer n",
          "esPrimo <- n >= 2",
          "Para i <- 2 Hasta n - 1 Hacer",
          "    Si n MOD i = 0 Entonces",
          "        esPrimo <- Falso",
          "    FinSi",
          "FinPara",
          "Si esPrimo Entonces",
          "    Escribir n, \" es primo\"",
          "SiNo",
          "    Escribir n, \" no es primo\"",
          "FinSi"
        ],
        py: [
          "n = int(input())",
          "es_primo = n >= 2",
          "for i in range(2, n):",
          "    if n % i == 0:",
          "        es_primo = False",
          "    # fin if",
          "# fin for",
          "if es_primo:",
          "    print(n, 'es primo')",
          "else:",
          "    print(n, 'no es primo')",
          "# fin if"
        ],
        vars: ["n", "i", "n MOD i", "esPrimo"],
        correr: function (e, P) {
          var v = { n: ent(e[0], 1, 50) }; P(0, v);
          v.esPrimo = v.n >= 2; P(1, v);
          for (var i = 2; i <= v.n - 1; i++) {
            v.i = i; v["n MOD i"] = v.n % i; P(2, v, "i = " + i);
            var c = v.n % i === 0; P(3, v, "n MOD i = 0 → " + (c ? "V" : "F"));
            if (c) { v.esPrimo = false; P(4, v); }
          }
          if (v.n - 1 < 2) P(2, v, "el ciclo Para no se ejecuta");
          P(7, v, "esPrimo → " + (v.esPrimo ? "V" : "F"));
          if (v.esPrimo) P(8, v, null, v.n + " es primo");
          else P(10, v, null, v.n + " no es primo");
        }
      },
      ventas: {
        ent: [["ventas (separadas por coma, termina en 0)", "120000, -500, 80000, 0"]],
        cod: [
          "totalDia <- 0",
          "numVentas <- 0",
          "Leer venta",
          "Mientras venta <> 0 Hacer",
          "    Mientras venta < 0 Hacer",
          "        Escribir \"No puede ser negativo\"",
          "        Leer venta",
          "    FinMientras",
          "    Si venta <> 0 Entonces",
          "        totalDia <- totalDia + venta",
          "        numVentas <- numVentas + 1",
          "        Leer venta",
          "    FinSi",
          "FinMientras",
          "Escribir numVentas, \" ventas · $\", totalDia"
        ],
        py: [
          "total_dia = 0",
          "num_ventas = 0",
          "venta = float(input())",
          "while venta != 0:",
          "    while venta < 0:",
          "        print('No puede ser negativo')",
          "        venta = float(input())",
          "    # fin validación",
          "    if venta != 0:",
          "        total_dia += venta",
          "        num_ventas += 1",
          "        venta = float(input())",
          "    # fin if",
          "# fin while",
          "print(f'{num_ventas} ventas · ${total_dia}')"
        ],
        vars: ["venta", "totalDia", "numVentas"],
        correr: function (e, P) {
          var datos = e[0].split(",").map(function (x) { return num(x); }), idx = 0, v = {};
          if (datos[datos.length - 1] !== 0) datos.push(0);
          v.totalDia = 0; P(0, v);
          v.numVentas = 0; P(1, v);
          v.venta = datos[idx++]; P(2, v);
          while (true) {
            var c = v.venta !== 0;
            P(3, v, "venta <> 0 → " + (c ? "V" : "F"));
            if (!c) break;
            while (true) {
              var neg = v.venta < 0;
              P(4, v, "venta < 0 → " + (neg ? "V (inválido)" : "F (válido)"));
              if (!neg) break;
              P(5, v, null, "No puede ser negativo");
              v.venta = idx < datos.length ? datos[idx++] : 0; P(6, v);
            }
            var c2 = v.venta !== 0;
            P(8, v, "venta <> 0 → " + (c2 ? "V" : "F"));
            if (c2) {
              v.totalDia += v.venta; P(9, v);
              v.numVentas += 1; P(10, v);
              v.venta = idx < datos.length ? datos[idx++] : 0; P(11, v);
            }
          }
          P(14, v, null, v.numVentas + " ventas · $" + v.totalDia);
        }
      }
    };

    var pasos = [], k = -1, prog, timer = null;

    function detenerAuto() {
      if (timer) { clearInterval(timer); timer = null; }
      if ($("m3-auto")) $("m3-auto").textContent = "▶▶ Auto";
    }

    function pintarEntradas() {
      detenerAuto();
      prog = PROG[$("m3-p").value];
      $("m3-ent").innerHTML = prog.ent.map(function (e, i) {
        return '<div><label class="sim-label" for="m3-e' + i + '">' + esc(e[0]) + '</label><input class="sim-input" id="m3-e' + i + '" name="m3_e' + i + '" value="' + esc(e[1]) + '" size="' + Math.max(8, e[1].length + 2) + '" autocomplete="off" spellcheck="false"></div>';
      }).join("");
      $("m3-cod").innerHTML = prog.cod.map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("");
      if ($("m3-cod-py")) $("m3-cod-py").innerHTML = prog.py.map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("");
      $("m3-tab").innerHTML = "";
      $("m3-sal").textContent = "";
      $("m3-nota").textContent = "Pulsa «Iniciar» para generar la prueba de escritorio.";
      pasos = []; k = -1; botones();
    }

    function iniciar() {
      detenerAuto();
      pasos = [];
      try {
        var e = prog.ent.map(function (_, i) { return $("m3-e" + i).value; });
        prog.correr(e, function (linea, v, cond, sal) {
          pasos.push({ linea: linea, v: JSON.parse(JSON.stringify(v)), cond: cond, sal: sal });
          if (pasos.length > 400) throw "Demasiados pasos: usa datos más pequeños.";
        });
        k = 0;
        pintar();
      } catch (err) {
        $("m3-nota").innerHTML = '<span class="F">' + esc(err) + "</span>";
      }
    }

    function celda(x) { return x === undefined ? "" : typeof x === "boolean" ? vf(x) : esc(x); }

    function pintar() {
      var p = pasos[k];
      $("m3-cod").querySelectorAll("span").forEach(function (s, i) { s.classList.toggle("on", i === p.linea); });
      if ($("m3-cod-py")) $("m3-cod-py").querySelectorAll("span").forEach(function (s, i) { s.classList.toggle("on", i === p.linea); });
      $("m3-nota").innerHTML = "<strong>Paso " + (k + 1) + " de " + pasos.length + "</strong> · Línea " + (p.linea + 1) + (p.cond ? " · <strong>" + esc(p.cond) + "</strong>" : "");
      $("m3-sal").textContent = pasos.slice(0, k + 1).filter(function (x) { return x.sal; }).map(function (x) { return x.sal; }).join("\n") || "(sin salida aún)";
      var h = '<table class="ova-table centro"><tr><th>#</th><th>Instrucción</th><th>Evaluación</th>' +
        prog.vars.map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") + "<th>Salida</th></tr>";
      pasos.slice(0, k + 1).forEach(function (x, i) {
        h += '<tr class="' + (i === k ? "actual" : "") + '"><td>' + (i + 1) + '</td><td class="izq"><code>' + esc(prog.cod[x.linea].trim()) + "</code></td><td>" + esc(x.cond || "") + "</td>" +
          prog.vars.map(function (n) { return "<td>" + celda(x.v[n]) + "</td>"; }).join("") + '<td class="izq">' + esc(x.sal || "") + "</td></tr>";
      });
      $("m3-tab").innerHTML = h + "</table>";
      botones();
    }

    function botones() {
      $("m3-ant").disabled = k <= 0;
      $("m3-sig").disabled = k < 0 || k >= pasos.length - 1;
      $("m3-fin").disabled = $("m3-sig").disabled;
      if ($("m3-auto")) $("m3-auto").disabled = $("m3-sig").disabled;
    }

    $("m3-p").addEventListener("change", pintarEntradas);
    $("m3-ini").addEventListener("click", iniciar);
    $("m3-sig").addEventListener("click", function () { detenerAuto(); if (k < pasos.length - 1) { k++; pintar(); } });
    $("m3-ant").addEventListener("click", function () { detenerAuto(); if (k > 0) { k--; pintar(); } });
    $("m3-fin").addEventListener("click", function () { detenerAuto(); k = pasos.length - 1; pintar(); });
    if ($("m3-auto")) {
      $("m3-auto").addEventListener("click", function () {
        if (timer) { detenerAuto(); return; }
        $("m3-auto").textContent = "⏸ Pausar";
        timer = setInterval(function () {
          if (k < pasos.length - 1) { k++; pintar(); }
          else detenerAuto();
        }, 650);
      });
    }
    pintarEntradas();
  }

  /* =========================================================================
     SIMULADOR 4: MEMORIA DE FUNCIONES (VALOR VS REFERENCIA) Y REFACTOR MENÚ
     ========================================================================= */
  function initSim4_FuncionesMemoria() {
    if (!$("sim4-cod")) return;

    var PASOS_VAL = [
      {
        linea: 0,
        scope: "main",
        desc: "En el programa principal se crea `puntos = 10` (entero, inmutable en Python).",
        mainVars: [{ n: "puntos", v: "10", ch: true }, { n: "lista_puntos", v: "[10]", ch: true }],
        fnTitle: "Sin llamada activa",
        fnVars: [],
        consola: ""
      },
      {
        linea: 1,
        scope: "fn",
        desc: "Se llama a `sumar_valor(puntos)`. Python/PSeInt pasa una COPIA del valor 10 al parámetro local `p`.",
        mainVars: [{ n: "puntos", v: "10" }, { n: "lista_puntos", v: "[10]" }],
        fnTitle: "Ámbito local: sumar_valor(p)",
        fnVars: [{ n: "p (copia)", v: "10", ch: true }],
        consola: ""
      },
      {
        linea: 2,
        scope: "fn",
        desc: "Dentro de `sumar_valor`, `p <- p + 1` cambia la variable local `p` a 11. ¡La variable `puntos` del principal NO cambia!",
        mainVars: [{ n: "puntos", v: "10" }, { n: "lista_puntos", v: "[10]" }],
        fnTitle: "Ámbito local: sumar_valor(p)",
        fnVars: [{ n: "p (copia)", v: "11", ch: true }],
        consola: ""
      },
      {
        linea: 3,
        scope: "main",
        desc: "Termina `sumar_valor` y se destruye `p`. Al imprimir `puntos`, sigue valiendo 10.",
        mainVars: [{ n: "puntos", v: "10" }, { n: "lista_puntos", v: "[10]" }],
        fnTitle: "Ámbito destruido",
        fnVars: [],
        consola: "Después de sumar_valor: 10"
      },
      {
        linea: 4,
        scope: "fn",
        desc: "Ahora se llama a `sumar_referencia(lista_puntos)` (en PSeInt: `Por Referencia`). El parámetro apunta al MISMO objeto en memoria.",
        mainVars: [{ n: "puntos", v: "10" }, { n: "lista_puntos", v: "[10]" }],
        fnTitle: "Ámbito local: sumar_referencia(lp)",
        fnVars: [{ n: "lp (misma ref.)", v: "-> [10]", ch: true }],
        consola: "Después de sumar_valor: 10"
      },
      {
        linea: 5,
        scope: "fn",
        desc: "`lp[0] = lp[0] + 1` modifica el objeto compartido en memoria: ahora contiene [11] tanto en la función como en el principal.",
        mainVars: [{ n: "puntos", v: "10" }, { n: "lista_puntos", v: "[11]", ch: true }],
        fnTitle: "Ámbito local: sumar_referencia(lp)",
        fnVars: [{ n: "lp (misma ref.)", v: "-> [11]", ch: true }],
        consola: "Después de sumar_valor: 10"
      },
      {
        linea: 6,
        scope: "main",
        desc: "Termina `sumar_referencia`. Al imprimir `lista_puntos[0]`, conserva el cambio: muestra 11.",
        mainVars: [{ n: "puntos", v: "10" }, { n: "lista_puntos", v: "[11]" }],
        fnTitle: "Programa terminado",
        fnVars: [],
        consola: "Después de sumar_valor: 10\nDespués de sumar_referencia: 11"
      }
    ];

    var COD_SIM4 = [
      "puntos = 10; lista_puntos = [10]",
      "sumar_valor(puntos)          # PSeInt: Por Valor",
      "    p = p + 1                # modifica solo la copia",
      "print('Después de sumar_valor:', puntos)",
      "sumar_referencia(lista_puntos) # PSeInt: Por Referencia",
      "    lp[0] = lp[0] + 1        # modifica el objeto original",
      "print('Después de sumar_referencia:', lista_puntos[0])"
    ];

    $("sim4-cod").innerHTML = COD_SIM4.map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("");
    var idx = 0;

    function renderSim4() {
      var s = PASOS_VAL[idx];
      $("sim4-cod").querySelectorAll("span").forEach(function (sp, i) { sp.classList.toggle("on", i === s.linea); });
      $("sim4-desc").innerHTML = "<strong>Paso " + (idx + 1) + " de " + PASOS_VAL.length + ":</strong> " + esc(s.desc).replace(/`([^`]+)`/g, "<code>$1</code>");
      $("sim4-box-main").className = "mem-box" + (s.scope === "main" ? " active-scope" : "");
      $("sim4-box-fn").className = "mem-box" + (s.scope === "fn" ? " active-scope" : "");
      $("sim4-mem-main").innerHTML = s.mainVars.map(function (v) {
        return '<div class="mem-var' + (v.ch ? " changed" : "") + '"><span>' + esc(v.n) + "</span><span>" + esc(v.v) + "</span></div>";
      }).join("");
      $("sim4-fn-title").textContent = s.fnTitle;
      $("sim4-mem-fn").innerHTML = s.fnVars.length
        ? s.fnVars.map(function (v) { return '<div class="mem-var' + (v.ch ? " changed" : "") + '"><span>' + esc(v.n) + "</span><span>" + esc(v.v) + "</span></div>"; }).join("")
        : '<p style="font-size:0.84rem; color:var(--text-muted); margin:0;">(Sin marco de llamada en la pila)</p>';
      $("sim4-sal").textContent = s.consola || "(sin salida aún)";
      $("sim4-ant").disabled = idx <= 0;
      $("sim4-sig").disabled = idx >= PASOS_VAL.length - 1;
    }

    $("sim4-ant").addEventListener("click", function () { if (idx > 0) { idx--; renderSim4(); } });
    $("sim4-sig").addEventListener("click", function () { if (idx < PASOS_VAL.length - 1) { idx++; renderSim4(); } });
    $("sim4-rst").addEventListener("click", function () { idx = 0; renderSim4(); });
    renderSim4();

    /* Sub-tabs Simulador 4 (Memoria vs Refactor Menú) */
    document.querySelectorAll("[data-sim4tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var t = btn.dataset.sim4tab;
        document.querySelectorAll("[data-sim4tab]").forEach(function (b) { b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
        $("sim4-panel-valor").style.display = t === "valor" ? "block" : "none";
        $("sim4-panel-menu").style.display = t === "menu" ? "block" : "none";
      });
    });
  }

  /* =========================================================================
     SIMULADOR 5A: MÉTODO DE LA BURBUJA
     ========================================================================= */
  function initSim5A_Burbuja() {
    if (!$("m4-v")) return;
    var pasos = [], k = -1, timer = null;

    function parar() {
      if (timer) { clearInterval(timer); timer = null; }
      if ($("m4-auto")) $("m4-auto").textContent = "▶▶ Auto";
    }

    function cargar() {
      parar();
      var v = $("m4-v").value.split(",").map(function (x) { return parseFloat(x); });
      if (v.some(isNaN) || v.length < 2 || v.length > 10) {
        $("m4-nota").innerHTML = '<span class="F">Escribe entre 2 y 10 números separados por coma.</span>';
        return;
      }
      pasos = [{ arr: v.slice(), txt: "Vector inicial.", fijos: 0 }];
      var n = v.length, inter = 0;
      for (var i = 0; i < n - 1; i++) {
        for (var j = 0; j < n - 1 - i; j++) {
          var antes = v.slice(), s = v[j] > v[j + 1];
          if (s) { var aux = v[j]; v[j] = v[j + 1]; v[j + 1] = aux; inter++; }
          pasos.push({
            arr: v.slice(), antes: antes, i: i + 1, j: j + 1, comp: [j, j + 1], s: s,
            fijos: j === n - 2 - i ? i + 1 : i,
            txt: "Pasada " + (i + 1) + ", j = " + (j + 1) + ": ¿" + antes[j] + " > " + antes[j + 1] + "? " + (s ? "Sí → se intercambian." : "No → quedan igual.")
          });
        }
      }
      pasos.push({
        arr: v.slice(),
        txt: "Ordenado en " + (n - 1) + " pasadas, " + (pasos.length - 1) + " comparaciones y " + inter + " intercambios.",
        fijos: n
      });
      k = 0;
      pintar();
    }

    function pintar() {
      var p = pasos[k], max = Math.max.apply(null, p.arr.map(Math.abs)) || 1, n = p.arr.length;
      $("m4-bar").innerHTML = p.arr.map(function (x, i) {
        var c = p.comp && p.comp.indexOf(i) >= 0 ? " comp" : (i >= n - p.fijos ? " fijo" : "");
        return '<div class="barra' + c + '" style="height:' + Math.max(22, Math.abs(x) / max * 155) + 'px">' + esc(x) + "</div>";
      }).join("");
      $("m4-nota").textContent = "Paso " + (k + 1) + " de " + pasos.length + ". " + p.txt;
      var h = '<table class="ova-table centro"><tr><th>Pasada (i)</th><th>j</th><th>Compara</th><th>¿Intercambia?</th><th>Estado del vector</th></tr>';
      pasos.slice(1, k + 1).forEach(function (x, idx) {
        if (!x.antes) return;
        h += '<tr class="' + (idx + 1 === k ? "actual" : "") + '"><td>' + x.i + "</td><td>" + x.j + "</td><td>" +
          x.antes[x.comp[0]] + " &gt; " + x.antes[x.comp[1]] + "</td><td>" + (x.s ? "Sí" : "No") + "</td><td>[" + x.arr.join(", ") + "]</td></tr>";
      });
      $("m4-tab").innerHTML = h + "</table>";
      $("m4-ant").disabled = k <= 0;
      $("m4-sig").disabled = k >= pasos.length - 1;
      $("m4-fin").disabled = $("m4-sig").disabled;
      if ($("m4-auto")) $("m4-auto").disabled = $("m4-sig").disabled;
    }

    $("m4-ini").addEventListener("click", cargar);
    $("m4-sig").addEventListener("click", function () { parar(); if (k < pasos.length - 1) { k++; pintar(); } });
    $("m4-ant").addEventListener("click", function () { parar(); if (k > 0) { k--; pintar(); } });
    $("m4-fin").addEventListener("click", function () { parar(); k = pasos.length - 1; pintar(); });
    if ($("m4-auto")) {
      $("m4-auto").addEventListener("click", function () {
        if (timer) { parar(); return; }
        $("m4-auto").textContent = "⏸ Pausar";
        timer = setInterval(function () {
          if (k < pasos.length - 1) { k++; pintar(); } else parar();
        }, 550);
      });
    }
    cargar();
  }

  /* =========================================================================
     SIMULADOR 5B: VECTORES PARALELOS (ÍNDICE 1 vs 0) Y MATRICES 2D
     ========================================================================= */
  function initSim5B_VectoresYMatrices() {
    var invBody = $("sim5b-inv-body");
    if (invBody) {
      var DATA = [
        ["P01", "Cuaderno", 4500, 40],
        ["P02", "Lápiz", 1200, 120],
        ["P03", "Borrador", 800, 75],
        ["P04", "Carpeta", 3500, 18],
        ["P05", "Regla", 2000, 30]
      ];
      function renderInv(hlIdx) {
        invBody.innerHTML = DATA.map(function (r, idx) {
          return '<tr class="' + (hlIdx === idx ? "actual" : "") + '">' +
            "<td><strong>" + (idx + 1) + "</strong></td><td><strong>" + idx + "</strong></td>" +
            "<td><code>" + r[0] + "</code></td><td>" + esc(r[1]) + "</td><td>$" + r[2].toLocaleString("es-CO") + "</td><td>" + r[3] + "</td></tr>";
        }).join("");
      }
      renderInv(-1);
      $("sim5b-buscar-btn").addEventListener("click", function () {
        var q = $("sim5b-buscar-inp").value.trim().toUpperCase();
        var pasos = [], found = -1;
        for (var i = 0; i < DATA.length; i++) {
          var match = DATA[i][0] === q;
          pasos.push("i(PSeInt)=" + (i + 1) + " / i(Python)=" + i + " → ¿" + DATA[i][0] + " == " + q + "? " + (match ? "Sí (encontrado)" : "No"));
          if (match) { found = i; break; }
        }
        renderInv(found);
        $("sim5b-buscar-msg").innerHTML = '<div class="nota-inline ' + (found >= 0 ? "ok" : "mal") + '">' +
          pasos.map(esc).join("<br>") + "<br><strong>" +
          (found >= 0 ? "Resultado: posición PSeInt = " + (found + 1) + " · posición Python = " + found + " (" + DATA[found][1] + " $" + DATA[found][2].toLocaleString("es-CO") + ")"
            : "Resultado: posición = 0 en PSeInt / -1 en Python (Producto no encontrado).") +
          "</strong></div>";
      });
    }

    var matContainer = $("sim5b-mat-wrap");
    if (matContainer) {
      var VENDEDORES = ["Ana", "Luis", "Marta"];
      var M = [[12, 15, 9, 20], [8, 11, 14, 10], [16, 13, 12, 18]];
      var stepF = -1, stepC = -1;

      function renderMatriz() {
        var colTotals = [0, 0, 0, 0], granTotal = 0;
        var html = '<table class="ova-table centro"><tr><th>Vendedor \\ Semana</th><th>S1 (c=0)</th><th>S2 (c=1)</th><th>S3 (c=2)</th><th>S4 (c=3)</th><th>Total Fila</th></tr>';
        for (var f = 0; f < 3; f++) {
          var rowTotal = 0;
          html += "<tr><td class='izq'><strong>" + VENDEDORES[f] + "</strong> <small>(f=" + f + " / PSeInt " + (f + 1) + ")</small></td>";
          for (var c = 0; c < 4; c++) {
            var val = M[f][c];
            rowTotal += val;
            colTotals[c] += val;
            granTotal += val;
            var act = f === stepF && c === stepC ? " cell-active" : "";
            html += '<td class="matrix-cell' + act + '"><input type="number" min="0" max="999" data-f="' + f + '" data-c="' + c + '" value="' + val + '" aria-label="Ventas de ' + esc(VENDEDORES[f]) + ' en semana ' + (c + 1) + '"></td>';
          }
          html += "<td><strong>" + rowTotal + "</strong></td></tr>";
        }
        html += "<tr><td class='izq'><strong>Total Columna</strong></td>" +
          colTotals.map(function (t) { return "<td><strong>" + t + "</strong></td>"; }).join("") +
          '<td style="background:var(--sena-green-subtle);"><strong>' + granTotal + "</strong></td></tr></table>";
        matContainer.innerHTML = html;

        matContainer.querySelectorAll("input").forEach(function (inp) {
          inp.addEventListener("change", function () {
            var ff = parseInt(inp.dataset.f, 10), cc = parseInt(inp.dataset.c, 10);
            M[ff][cc] = Math.max(0, parseInt(inp.value, 10) || 0);
            renderMatriz();
          });
        });

        if (stepF >= 0 && stepC >= 0) {
          $("sim5b-mat-msg").innerHTML = '<div class="nota-inline ok">Celda activa: Python <code>ventas[' + stepF + "][" + stepC + "]</code> · PSeInt <code>ventas[" + (stepF + 1) + "," + (stepC + 1) + "]</code> = <strong>" + M[stepF][stepC] + "</strong></div>";
        } else {
          $("sim5b-mat-msg").innerHTML = '<div class="nota-inline ok">Edita cualquier celda para recalcular totales por fila y por columna, o pulsa «Siguiente celda» para recorrer por filas.</div>';
        }
      }

      $("sim5b-mat-step").addEventListener("click", function () {
        if (stepF < 0) { stepF = 0; stepC = 0; }
        else {
          stepC++;
          if (stepC >= 4) { stepC = 0; stepF++; }
          if (stepF >= 3) { stepF = 0; stepC = 0; }
        }
        renderMatriz();
      });
      $("sim5b-mat-reset").addEventListener("click", function () {
        M = [[12, 15, 9, 20], [8, 11, 14, 10], [16, 13, 12, 18]];
        stepF = -1; stepC = -1;
        renderMatriz();
      });
      renderMatriz();
    }
  }

  /* =========================================================================
     SIMULADOR 6: ARCHIVOS CSV Y EXCEPCIONES
     ========================================================================= */
  function initSim6_CSV() {
    if (!$("m5-antes")) return;
    var INICIAL = [
      ["1001", "Rosa Tibaquirá", "3101112233"],
      ["1002", "Iván Chaparro", "3204445566"],
      ["1003", "Nidia Sogamoso", "3157778899"]
    ];
    var datos, existe;

    function csv() {
      return existe ? ["documento,nombre,telefono"].concat(datos.map(function (r) { return r.join(","); })).join("\n") : "(el archivo clientes.csv no existe en disco)";
    }
    function buscar(doc) {
      for (var i = 0; i < datos.length; i++) if (datos[i][0] === doc) return i;
      return -1;
    }
    function msg(t, ok) {
      $("m5-msg").innerHTML = '<div class="nota-inline ' + (ok ? "ok" : "mal") + '">' + esc(t) + "</div>";
    }

    var PY = {
      leer: 'try:\n    with open("clientes.csv", "r", newline="", encoding="utf-8") as f:\n        clientes = list(csv.DictReader(f))\nexcept FileNotFoundError:\n    clientes = []   # el programa no se detiene',
      guardar: 'with open("clientes.csv", "w", newline="", encoding="utf-8") as f:\n    escritor = csv.DictWriter(f, fieldnames=["documento", "nombre", "telefono"])\n    escritor.writeheader()\n    escritor.writerows(clientes)',
      registrar: 'if not documento.isdigit(): print("El documento debe tener solo números.")\nelif buscar(clientes, documento) != -1: print("Ese documento ya está registrado.")\nelse:\n    clientes.append({"documento": documento, "nombre": nombre, "telefono": telefono})',
      buscar: 'pos = buscar(clientes, documento)   # -1 si no existe',
      modificar: 'pos = buscar(clientes, documento)\nclientes[pos]["telefono"] = nuevo_telefono',
      eliminar: 'pos = buscar(clientes, documento)\neliminado = clientes.pop(pos)',
      valueerror: 'try:\n    opcion = int(input("Opción: "))\nexcept ValueError:\n    print("Error controlado: debe escribir un número entero.")'
    };

    function operar(op) {
      var antes = csv(), doc = $("m5-doc").value.trim(), nom = $("m5-nom").value.trim(), tel = $("m5-tel").value.trim(), py = [];
      if (op === "reiniciar") {
        datos = INICIAL.map(function (r) { return r.slice(); });
        existe = true;
        msg("Archivo restaurado con 3 clientes iniciales.", true);
      } else if (op === "borrar") {
        existe = false; datos = [];
        msg("Se simuló archivo inexistente: Python captura FileNotFoundError y devuelve una lista vacía sin bloquearse.", true);
        py = [PY.leer];
      } else if (op === "valerr") {
        msg("Simulación de entrada inválida (ej. escribir «abc» donde va un número): el bloque try/except ValueError atrapa el fallo y vuelve a pedir el dato.", true);
        py = [PY.valueerror];
      } else {
        py.push(PY.leer);
        if (op === "registrar") {
          if (!/^\d+$/.test(doc)) msg("El documento debe tener solo números.", false);
          else if (buscar(doc) >= 0) msg("Ese documento ya está registrado.", false);
          else if (!nom) msg("Escribe el nombre.", false);
          else if (!/^\d{7,10}$/.test(tel)) msg("Escribe un teléfono de 7 a 10 dígitos.", false);
          else {
            datos.push([doc, nom.replace(/,/g, " "), tel]);
            existe = true;
            msg("Cliente registrado y archivo reescrito con modo 'w'.", true);
            py.push(PY.registrar, PY.guardar);
          }
        } else {
          var pos = buscar(doc);
          py.push(PY[op]);
          if (pos < 0) msg("No existe un cliente con el documento «" + doc + "».", false);
          else if (op === "buscar") msg("Encontrado en posición " + pos + ": " + datos[pos].join(" · "), true);
          else if (op === "modificar") {
            if (!/^\d{7,10}$/.test(tel)) msg("Escribe un teléfono de 7 a 10 dígitos.", false);
            else { datos[pos][2] = tel; msg("Teléfono actualizado.", true); py.push(PY.guardar); }
          } else if (op === "eliminar") {
            var r = datos.splice(pos, 1)[0];
            msg("Eliminado: " + r[1] + " (archivo reescrito sin esa fila).", true);
            py.push(PY.guardar);
          }
        }
      }
      $("m5-antes").textContent = antes;
      $("m5-desp").textContent = csv();
      $("m5-py").textContent = py.join("\n\n") || "# Archivo listo";
    }

    document.querySelectorAll("[data-op]").forEach(function (b) {
      b.addEventListener("click", function () { operar(b.dataset.op); });
    });
    operar("reiniciar");
  }

  /* =========================================================================
     SIMULADOR 7: COMPARADOR PSEINT <-> PYTHON (d01-d09)
     ========================================================================= */
  function initSim7_Comparador() {
    var tabs = $("m6-tabs");
    if (!tabs) return;
    var EJEMPLOS = window.OVA_EJEMPLOS || [];

    function ver(i) {
      tabs.querySelectorAll("button").forEach(function (b, k) {
        b.setAttribute("aria-selected", k === i ? "true" : "false");
      });
      var ej = EJEMPLOS[i];
      if (!ej) return;
      $("m6-psc").textContent = ej.psc || "(Sin .psc: PSeInt no maneja archivos.)";
      $("m6-py").textContent = ej.py || "";
      if ($("m6-sal")) $("m6-sal").textContent = ej.salida || "(Salida de prueba no registrada)";
    }

    EJEMPLOS.forEach(function (e, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.textContent = e.titulo;
      b.addEventListener("click", function () { ver(i); });
      tabs.appendChild(b);
    });
    if (EJEMPLOS.length) ver(0);
  }
})();
