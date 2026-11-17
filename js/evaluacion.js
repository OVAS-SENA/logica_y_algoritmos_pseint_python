/**
 * SenaQuizEngine - Motor de Práctica por Bloques y Evaluación Certificable
 * Servicio Nacional de Aprendizaje - SENA · Guía 03 ADSO
 * Todas las preguntas son inéditas para la OVA y distintas del banco reservado.
 */
(function (global) {
  "use strict";

  /* Texto con `código` en línea: se escapa y luego se marca como <code>. */
  function fmt(t) {
    return esc(t).replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }

  /* =========================================================================
     MODO A: 24 PREGUNTAS DE PRÁCTICA POR BLOQUES (6 BLOQUES × 4 PREGUNTAS)
     ========================================================================= */
  var PRACTICA_BLOQUES = [
    {
      titulo: "1. Lógica y operadores",
      preguntas: [
        {
          pregunta: "En lógica proposicional, ¿cuándo resulta VERDADERO el bicondicional p ↔ q?",
          codigo: "",
          opciones: [
            "Solo cuando p y q son verdaderas.",
            "Cuando p y q tienen el mismo valor de verdad (ambas V o ambas F).",
            "Únicamente cuando p es falsa y q es verdadera.",
            "Siempre es verdadero sin importar p y q."
          ],
          correcta: 1,
          feedback: "El bicondicional (p ↔ q) es V cuando ambos componentes coinciden: V ↔ V = V y F ↔ F = V."
        },
        {
          pregunta: "Según la segunda ley de De Morgan, la expresión ¬(p ∨ q) es lógicamente equivalente a:",
          codigo: "",
          opciones: ["¬p ∨ ¬q", "¬p ∧ ¬q", "p ∧ ¬q", "¬p → q"],
          correcta: 1,
          feedback: "Negar una disyunción equivale a conjuntar las negaciones: ¬(p ∨ q) ≡ ¬p ∧ ¬q."
        },
        {
          pregunta: "¿Qué resultado produce esta expresión en PSeInt aplicando la jerarquía de operadores?",
          codigo: "15 MOD 4 + 2 ^ 3 * 2",
          opciones: ["19", "22", "13", "38"],
          correcta: 0,
          feedback: "Primero potencia 2^3 = 8; luego izquierda a derecha nivel 3: 15 MOD 4 = 3 y 8 * 2 = 16; al final 3 + 16 = 19."
        },
        {
          pregunta: "En la tabla 20 (p. 52) del CF07 aparece una errata conocida en la operación 2 + 12 * 20 + 9. ¿Cuál es el resultado matemáticamente correcto?",
          codigo: "2 + 12 * 20 + 9",
          opciones: ["289", "35", "251", "460"],
          correcta: 2,
          feedback: "12 * 20 = 240 (no 24 como dice la errata impresa); luego 2 + 240 + 9 = 251."
        }
      ]
    },
    {
      titulo: "2. Algoritmos y diagramas",
      preguntas: [
        {
          pregunta: "En el modelo Entrada – Proceso – Salida (EPS) de la factura de la Papelería Sugamuxi, el cálculo `valorIva <- subtotal * 0.19` corresponde a:",
          codigo: "",
          opciones: ["Una entrada de usuario", "Una etapa del proceso", "Una salida en pantalla", "Un ciclo centinela"],
          correcta: 1,
          feedback: "Transformar el subtotal en valor de IVA es parte del procesamiento de datos antes de mostrar la salida."
        },
        {
          pregunta: "En la simbología estándar de diagramas de flujo de PSeInt, ¿qué representa el paralelogramo?",
          codigo: "",
          opciones: [
            "Una operación aritmética o asignación",
            "El inicio y el fin del algoritmo",
            "Una instrucción de lectura (Leer) o escritura (Escribir)",
            "Una estructura repetitiva Para"
          ],
          correcta: 2,
          feedback: "El paralelogramo simboliza las operaciones de entrada (Leer) y salida (Escribir)."
        },
        {
          pregunta: "Si al iniciar una prueba de escritorio `a = 4` y `b = 7`, ¿con qué valores terminan tras ejecutar estas tres líneas?",
          codigo: "aux <- a\na <- b\nb <- aux",
          opciones: ["a = 4, b = 4", "a = 7, b = 7", "a = 7, b = 4", "a = 11, b = 7"],
          correcta: 2,
          feedback: "El patrón con variable auxiliar `aux` intercambia los valores de `a` y `b` sin perder ninguno."
        },
        {
          pregunta: "¿Qué diferencia existe entre una variable y una constante como `IVA = 0.19`?",
          codigo: "",
          opciones: [
            "La constante no puede usarse en multiplicaciones.",
            "El valor de la variable cambia durante la ejecución; el de la constante se mantiene fijo.",
            "Las constantes solo guardan texto y las variables solo números.",
            "En Python las constantes generan error si llevan mayúsculas."
          ],
          correcta: 1,
          feedback: "Una constante representa un valor fijo durante todo el algoritmo (por convención se escribe en MAYÚSCULAS)."
        }
      ]
    },
    {
      titulo: "3. Secuenciales y condicionales",
      preguntas: [
        {
          pregunta: "¿Por qué conviene evitar resultados terminados en .5 al comparar redondeos entre PSeInt y Python?",
          codigo: "",
          opciones: [
            "Porque Python no tiene la función round().",
            "Porque PSeInt redondea .5 alejándose de cero y Python usa redondeo al par más cercano.",
            "Porque PSeInt no acepta números decimales.",
            "Porque .5 siempre genera ZeroDivisionError."
          ],
          correcta: 1,
          feedback: "Python aplica round-half-to-even (`round(2.5) == 2`), mientras PSeInt aplica redondeo comercial clásico (`redon(2.5) == 3`)."
        },
        {
          pregunta: "¿Qué imprime este fragmento en Python cuando `monto = 120000`?",
          codigo: "if monto >= 300000:\n    desc = 10\nelif monto >= 100000:\n    desc = 5\nelse:\n    desc = 0\nprint(desc)",
          opciones: ["10", "5", "0", "15"],
          correcta: 1,
          feedback: "120000 no es >= 300000, pasa al `elif`, cumple >= 100000 y asigna desc = 5."
        },
        {
          pregunta: "¿Cómo se traduce correctamente la estructura `Segun op Hacer` de PSeInt en los lineamientos de Python de la guía?",
          codigo: "",
          opciones: [
            "Con un ciclo while True",
            "Con una cadena if / elif / else",
            "Con una función recursiva",
            "Con try / except"
          ],
          correcta: 1,
          feedback: "La guía pide traducir `Según` a `if / elif / else` (y menciona `match` solo como referencia de Python 3.10+)."
        },
        {
          pregunta: "En Python, ¿qué evalúa `input('¿Carné? (S/N): ').strip().upper() == 'S'` si el usuario digita `'  s '`?",
          codigo: "",
          opciones: ["False", "True", "Error de tipo", "'S'"],
          correcta: 1,
          feedback: "`.strip()` elimina espacios externos y `.upper()` convierte a mayúscula, produciendo `'S' == 'S'` -> `True`."
        }
      ]
    },
    {
      titulo: "4. Estructuras cíclicas",
      preguntas: [
        {
          pregunta: "¿Qué secuencia exacta genera `for k in range(10, 0, -3):` en Python?",
          codigo: "",
          opciones: ["10, 7, 4, 1", "10, 7, 4, 1, -2", "10, 8, 6, 4, 2", "10, 7, 4"],
          correcta: 0,
          feedback: "Inicia en 10, resta 3 en cada paso y se detiene antes de llegar a 0 o menos: 10, 7, 4, 1."
        },
        {
          pregunta: "Al traducir `Repetir … Hasta Que opcion = 5` de PSeInt a Python usando `while True:`, ¿qué condición va dentro del `if` antes del `break`?",
          codigo: "",
          opciones: ["if opcion != 5: break", "if opcion == 5: break", "if opcion > 5: continue", "while opcion == 5:"],
          correcta: 1,
          feedback: "En PSeInt `Hasta Que` termina cuando la condición se hace verdadera, igual que `if condicion: break` en Python."
        },
        {
          pregunta: "¿Qué diferencia funcional hay entre un contador y una bandera dentro de un ciclo?",
          codigo: "",
          opciones: [
            "El contador siempre disminuye y la bandera siempre aumenta.",
            "El contador cuenta ocurrencias con incrementos fijos; la bandera es un booleano que registra si un evento ocurrió.",
            "La bandera solo funciona en ciclos Para.",
            "El contador guarda decimales y la bandera guarda listas."
          ],
          correcta: 1,
          feedback: "Por ejemplo, `num_ventas += 1` es contador, mientras `hubo_venta_grande = True` es bandera."
        },
        {
          pregunta: "Para validar que la edad esté entre 0 y 120 antes de continuar, ¿qué patrón es el más adecuado?",
          codigo: "",
          opciones: [
            "Un `if` simple sin ciclo",
            "Un ciclo `while` que vuelve a pedir el dato mientras esté fuera de rango",
            "Un ciclo `for` de 120 iteraciones",
            "Convertir la edad a cadena con str()"
          ],
          correcta: 1,
          feedback: "Un ciclo `while` (o `while True` con `break`) garantiza no avanzar hasta obtener un dato válido."
        }
      ]
    },
    {
      titulo: "5. Funciones y arreglos",
      preguntas: [
        {
          pregunta: "En Python, si una función calcula un subtotal pero usa `print(total)` en lugar de `return total`, ¿qué recibe quien la invoca en `x = calcular()`?",
          codigo: "",
          opciones: ["El número calculado", "0", "None", "Un SyntaxError"],
          correcta: 2,
          feedback: "Toda función sin sentencia `return` devuelve automáticamente `None` en Python."
        },
        {
          pregunta: "¿Qué muestra este código al trabajar con una lista (objeto mutable)?",
          codigo: "def agregar(items):\n    items.append(\"Lápiz\")\n\nlista = [\"Cuaderno\"]\nagregar(lista)\nprint(len(lista))",
          opciones: ["1", "2", "0", "Error de ámbito"],
          correcta: 1,
          feedback: "Al modificar la lista recibida con `.append()`, cambia la lista original (comportamiento análogo a referencia)."
        },
        {
          pregunta: "Si en PSeInt (perfil Flexible) un vector tiene 5 productos en posiciones 1 a 5, ¿en qué índices están el primero y el último en Python?",
          codigo: "",
          opciones: ["1 y 5", "0 y 5", "0 y 4", "1 y 4"],
          correcta: 2,
          feedback: "En Python una lista de longitud `n = 5` usa índices de `0` a `n - 1` (0 a 4)."
        },
        {
          pregunta: "Al ordenar por burbuja un inventario representado con cuatro vectores paralelos (`codigos`, `nombres`, `precios`, `stock`), ¿qué cuidado es obligatorio?",
          codigo: "",
          opciones: [
            "Ordenar únicamente el vector `precios` para ir más rápido.",
            "Intercambiar las posiciones `j` y `j + 1` en los cuatro vectores al mismo tiempo.",
            "Borrar primero el vector de códigos.",
            "Convertir la matriz en un archivo .txt."
          ],
          correcta: 1,
          feedback: "Si solo intercambias `precios`, cada precio quedaría asociado al producto equivocado."
        }
      ]
    },
    {
      titulo: "6. Archivos y excepciones",
      preguntas: [
        {
          pregunta: "¿Por qué en la demostración `d08_clientes_simulado.psc` se usan vectores para simular el archivo?",
          codigo: "",
          opciones: [
            "Porque PSeInt es más rápido que Python con archivos.",
            "Porque PSeInt no maneja lectura ni escritura de archivos en disco.",
            "Porque los archivos CSV no tienen filas.",
            "Porque Python no tiene listas."
          ],
          correcta: 1,
          feedback: "El diseño de la lógica CRUD se prueba en PSeInt con vectores paralelos y la persistencia real se codifica en Python."
        },
        {
          pregunta: "Al usar `csv.DictWriter` en Windows y Linux dentro de `with open(…, newline=\"\", encoding=\"utf-8\")`, ¿por qué se pasa `newline=\"\"`?",
          codigo: "",
          opciones: [
            "Para que el archivo quede en una sola línea sin saltos.",
            "Para evitar que queden líneas en blanco adicionales entre filas del CSV.",
            "Para cifrar los datos del archivo.",
            "Para leer únicamente la primera columna."
          ],
          correcta: 1,
          feedback: "El módulo `csv` gestiona sus propios fines de línea; omitir `newline=\"\"` suele generar filas vacías intercaladas en Windows."
        },
        {
          pregunta: "En el patrón CRUD, cuando un aprendiz elige la opción 'Eliminar' y confirma que desea borrar el registro en posición `pos`, ¿qué secuencia ejecuta Python?",
          codigo: "",
          opciones: [
            "clientes.append(pos) y abrir con modo 'r'",
            "clientes.pop(pos) y luego reescribir el CSV completo con guardar(clientes) en modo 'w'",
            "Abrir con modo 'a' y escribir una línea vacía",
            "Llamar a int() dentro de un except"
          ],
          correcta: 1,
          feedback: "Se elimina el elemento de la lista en memoria (`pop(pos)`) y se reescribe el archivo completo en modo `'w'`."
        },
        {
          pregunta: "En un bloque `try / except` que lee un menú numérico con `int(input('Opción: '))`, ¿qué excepción captura cuando el usuario digita `'hola'`?",
          codigo: "",
          opciones: ["FileNotFoundError", "KeyError", "ValueError", "ZeroDivisionError"],
          correcta: 2,
          feedback: "`int('hola')` lanza `ValueError` porque la cadena no es convertible a entero."
        }
      ]
    }
  ];

  /* =========================================================================
     MODO B: EVALUACIÓN CERTIFICABLE (18 PREGUNTAS INTEGRADORAS INÉDITAS)
     ========================================================================= */
  var CERT_PREGUNTAS = [
    {
      pregunta: "1. Si `p = V`, `q = F` y `r = V`, ¿qué valor produce la regla de crédito `(p ∧ ¬q) ∨ r`?",
      codigo: "",
      opciones: ["Falso", "Verdadero", "Indefinido", "Error lógico"],
      correcta: 1,
      feedback: "¬q es V; p ∧ ¬q es V; y V ∨ V da Verdadero."
    },
    {
      pregunta: "2. ¿Qué clasificación corresponde a la fórmula `(p ∧ ¬p) ∧ q`?",
      codigo: "",
      opciones: ["Tautología", "Contingencia", "Contradicción", "Proposición atómica"],
      correcta: 2,
      feedback: "Como `p ∧ ¬p` siempre es F, toda la conjunción es F en el 100 % de las filas (contradicción)."
    },
    {
      pregunta: "3. ¿Cuál es el resultado de `10 - 2 ^ 3 + 12 / 4 * 2` en PSeInt?",
      codigo: "",
      opciones: ["8", "3.5", "14", "1"],
      correcta: 0,
      feedback: "Potencia 2^3=8; luego izq→der 12/4=3 y 3*2=6; finalmente 10 - 8 + 6 = 8."
    },
    {
      pregunta: "4. ¿Qué figura del diagrama de flujo representa el cálculo `descuento <- subtotal * porcentaje / 100`?",
      codigo: "",
      opciones: ["Óvalo", "Paralelogramo", "Rectángulo", "Rombo"],
      correcta: 2,
      feedback: "Las asignaciones y procesos aritméticos van dentro de un rectángulo."
    },
    {
      pregunta: "5. Dada la siguiente traza inicial (`a = 5`, `b = 2`), ¿qué muestra la línea `Escribir`?",
      codigo: "a <- a + b\nb <- a * 2\na <- b - a\nEscribir a, \"-\", b",
      opciones: ["7-14", "5-10", "7-10", "14-7"],
      correcta: 0,
      feedback: "a pasa a 7; b pasa a 14; luego a = 14 - 7 = 7. Muestra `7-14`."
    },
    {
      pregunta: "6. En Python, ¿qué imprime este bloque si `codigo = \"P02\"` y `cantidad = 4`?",
      codigo: "if codigo == \"P01\":\n    precio = 4500\nelif codigo == \"P02\":\n    precio = 1200\nelse:\n    precio = 800\nprint(precio * cantidad)",
      opciones: ["18000", "4800", "3200", "1200"],
      correcta: 1,
      feedback: "Entra en el `elif codigo == \"P02\"`, asigna `precio = 1200` y multiplica `1200 * 4 = 4800`."
    },
    {
      pregunta: "7. Al leer un precio decimal desde teclado en Python para operar con él, ¿qué conversión se debe usar?",
      codigo: "",
      opciones: ["str(input())", "bool(input())", "float(input())", "len(input())"],
      correcta: 2,
      feedback: "`float(input())` convierte el texto ingresado en número real con decimales."
    },
    {
      pregunta: "8. ¿Qué valor final tiene `contador` al terminar este programa en Python?",
      codigo: "contador = 0\nfor i in range(1, 10, 2):\n    if i > 3:\n        contador += 1\nprint(contador)",
      opciones: ["5", "3", "4", "2"],
      correcta: 1,
      feedback: "`range(1, 10, 2)` produce 1, 3, 5, 7, 9. Los mayores que 3 son 5, 7 y 9 (3 iteraciones)."
    },
    {
      pregunta: "9. En un ciclo controlado por centinela (`venta <> 0`), ¿por qué se realiza un `Leer venta` antes del `Mientras` y otro al final del cuerpo del ciclo?",
      codigo: "",
      opciones: [
        "Para leer siempre el doble de ventas.",
        "Para evaluar la primera entrada antes de entrar y actualizar la variable al final de cada vuelta.",
        "Porque PSeInt prohíbe leer dentro de un Mientras.",
        "Para reiniciar el acumulador a cero en cada vuelta."
      ],
      correcta: 1,
      feedback: "La lectura adelantada alimenta la primera evaluación del `Mientras` y la lectura final evita ciclos infinitos."
    },
    {
      pregunta: "10. En PSeInt, ¿qué palabra clave define un módulo que NO retorna ningún valor al algoritmo principal?",
      codigo: "",
      opciones: ["Funcion r <- Nombre()", "SubProceso Nombre()", "Retornar", "Dimension"],
      correcta: 1,
      feedback: "Un procedimiento sin retorno se declara con `SubProceso Nombre(parametros)` (sin `variable <-`)."
    },
    {
      pregunta: "11. ¿Qué valor muestra el `print` final en este programa de Python?",
      codigo: "def ajustar(x):\n    x = x + 5\n    return x\n\nn = 10\najustar(n)\nprint(n)",
      opciones: ["15", "10", "5", "None"],
      correcta: 1,
      feedback: "`ajustar(n)` retorna 15, pero ese valor no se asignó a `n`, y el entero `n` se comporta por valor: sigue valiendo 10."
    },
    {
      pregunta: "12. Para qué sirve el comentario entre triples comillas `\"\"\"…\"\"\"` en la primera línea de una función en Python?",
      codigo: "",
      opciones: [
        "Para hacer que la función sea más rápida.",
        "Es el docstring que documenta qué hace la función, sus parámetros y su retorno.",
        "Para convertir la función en un ciclo.",
        "Para ignorar errores de sintaxis dentro de la función."
      ],
      correcta: 1,
      feedback: "El docstring documenta el propósito de la función y es consultable con `help(funcion)`."
    },
    {
      pregunta: "13. Si `precios = [4500, 1200, 800, 3500]`, ¿qué devuelve `precios[-1]` en Python?",
      codigo: "",
      opciones: ["4500", "3500", "1200", "IndexError"],
      correcta: 1,
      feedback: "En Python los índices negativos recorren desde el final: `-1` es el último elemento (3500)."
    },
    {
      pregunta: "14. En el método de la burbuja aplicado a una lista de `n = 5` elementos, ¿cuántas pasadas externas como máximo realiza el ciclo exterior?",
      codigo: "",
      opciones: ["5 pasadas", "4 pasadas (n - 1)", "10 pasadas", "1 pasada"],
      correcta: 1,
      feedback: "Con `n - 1 = 4` pasadas quedan fijados los 4 mayores al final y el primero queda automáticamente ordenado."
    },
    {
      pregunta: "15. Dada la matriz `ventas = [[10, 20], [5, 15], [8, 12]]`, ¿cuál es el total de la columna 1 (índice 1 en Python)?",
      codigo: "",
      opciones: ["30", "23", "47", "20"],
      correcta: 2,
      feedback: "Columna índice 1 suma `20 + 15 + 12 = 47`."
    },
    {
      pregunta: "16. Si necesitas añadir una nueva línea de bitácora al final de `registro.txt` sin borrar las líneas anteriores, ¿qué modo usas en `open()`?",
      codigo: "",
      opciones: ["\"r\"", "\"w\"", "\"a\"", "\"r+\" borrando todo"],
      correcta: 2,
      feedback: "El modo `\"a\"` (append) añade datos al final conservando el contenido previo."
    },
    {
      pregunta: "17. Al leer un CSV con `csv.DictReader(f)`, cada elemento de la lista resultante se accede como:",
      codigo: "",
      opciones: [
        "Una matriz numérica únicamente",
        "Un diccionario usando el nombre de la columna como clave (ej. fila['precio'])",
        "Una cadena sin separar comas",
        "Un archivo binario"
      ],
      correcta: 1,
      feedback: "`csv.DictReader` usa la primera fila de encabezados como claves de cada diccionario de registro."
    },
    {
      pregunta: "18. En el Reto Integrador (`AA3-EV01`), ¿cuál de los siguientes requisitos garantiza que los datos no se pierdan al cerrar el programa?",
      codigo: "",
      opciones: [
        "Usar variables globales en memoria RAM solamente",
        "Guardar la lista de registros en un archivo CSV tras cada operación de registro, modificación o eliminación",
        "Imprimir los resultados con `print()` antes de salir",
        "Usar un ciclo `for` infinito"
      ],
      correcta: 1,
      feedback: "La persistencia se logra leyendo el archivo CSV al iniciar y guardando los cambios en disco cada vez que se modifican los datos."
    }
  ];

  function SenaQuizEngine(config) {
    this.containerId = (config && config.containerId) || "quizContainer";
    this.passingScore = (config && config.passingScore) || 70;
    this.ovaCode = (config && config.ovaCode) || "OVA-GA3";
    this.ovaTitle = (config && config.ovaTitle) || "Lógica y algoritmos con PSeInt y Python";
    this.ficha = (config && config.ficha) || "3490966";
    this.mode = "cert"; // 'practica' o 'cert'
    this.activeBlock = 0;
    this.isSubmitted = false;
    this.init();
  }

  SenaQuizEngine.prototype.init = function () {
    this.container = document.getElementById(this.containerId);
    if (!this.container) return;
    this.renderShell();
  };

  SenaQuizEngine.prototype.renderShell = function () {
    var self = this;
    var ICON_DOC = '<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
    this.container.innerHTML =
      '<div class="sena-card" style="border-top: 4px solid var(--sena-green);">' +
      '  <div class="sena-card-header">' +
      '    <div class="card-title-group">' +
      '      <div class="card-icon">' + ICON_DOC + '</div>' +
      '      <div>' +
      '        <h3 class="card-title">Centro de práctica y evaluación certificable</h3>' +
      '        <p class="card-sub">Todas las preguntas son inéditas de práctica y repaso (distintas al cuestionario oficial de Classroom).</p>' +
      '      </div>' +
      '    </div>' +
      '    <div id="quizScoreBadge" style="display:none; font-size:0.86rem; font-weight:700; padding:6px 14px; border-radius:var(--radius-full); font-variant-numeric:tabular-nums;"></div>' +
      '  </div>' +
      '  <div class="tabs" id="evalTabs" role="tablist">' +
      '    <button type="button" data-mode="practica" aria-selected="' + (this.mode === "practica" ? "true" : "false") + '">Modo Práctica por Bloques (24 preguntas)</button>' +
      '    <button type="button" data-mode="cert" aria-selected="' + (this.mode === "cert" ? "true" : "false") + '">Evaluación Certificable y Constancia (18 preguntas · ≥' + this.passingScore + '%)</button>' +
      '  </div>' +
      '  <div id="quizBody"></div>' +
      '</div>';

    this.container.querySelectorAll("#evalTabs button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        self.mode = btn.dataset.mode;
        self.isSubmitted = false;
        self.renderShell();
      });
    });

    if (this.mode === "practica") {
      this.renderPractica();
    } else {
      this.renderCert();
    }
  };

  SenaQuizEngine.prototype.renderPractica = function () {
    var self = this;
    var body = document.getElementById("quizBody");
    var badge = document.getElementById("quizScoreBadge");
    if (badge) badge.style.display = "none";

    var tabsHtml = '<div class="tabs" id="pracBlockTabs">';
    PRACTICA_BLOQUES.forEach(function (b, idx) {
      tabsHtml += '<button type="button" data-b="' + idx + '" aria-selected="' + (idx === self.activeBlock ? "true" : "false") + '">' + esc(b.titulo) + "</button>";
    });
    tabsHtml += "</div>";

    var bloque = PRACTICA_BLOQUES[this.activeBlock];
    var qHtml = '<form id="pracForm" style="display:flex; flex-direction:column; gap:16px;">';
    bloque.preguntas.forEach(function (q, idx) {
      qHtml +=
        '<div class="feature-item" id="pqBox_' + idx + '">' +
        '  <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:10px;">' +
        '    <span style="background:var(--sena-blue); color:#fff; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.82rem; font-weight:700; flex-shrink:0;">' + (idx + 1) + "</span>" +
        '    <div style="flex:1;"><strong>' + fmt(q.pregunta) + "</strong>" +
        (q.codigo ? '<pre class="code-panel" style="margin-top:8px;">' + esc(q.codigo) + "</pre>" : "") +
        "    </div>" +
        "  </div>" +
        '  <div style="display:flex; flex-direction:column; gap:8px; margin-left:36px;">';
      q.opciones.forEach(function (op, oIdx) {
        qHtml +=
          '<label id="popt_' + idx + "_" + oIdx + '" style="display:flex; align-items:center; gap:10px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:9px 12px; cursor:pointer;">' +
          '  <input type="radio" name="prac_' + idx + '" value="' + oIdx + '" style="accent-color:var(--sena-green);">' +
          '  <span style="font-size:0.9rem;">' + fmt(op) + "</span>" +
          "</label>";
      });
      qHtml +=
        '  </div>' +
        '  <div id="pfeed_' + idx + '" style="display:none; margin-top:10px; margin-left:36px;" class="nota-inline"></div>' +
        "</div>";
    });

    qHtml +=
      '<div style="display:flex; gap:12px; flex-wrap:wrap;">' +
      '  <button type="button" id="btnCalPrac" class="btn btn-primary">✓ Calificar bloque actual</button>' +
      '  <button type="button" id="btnResetPrac" class="btn btn-secondary">🔄 Limpiar respuestas</button>' +
      "</div>" +
      '<div id="pracSummary"></div>' +
      "</form>";

    body.innerHTML = tabsHtml + qHtml;

    body.querySelectorAll("#pracBlockTabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        self.activeBlock = parseInt(b.dataset.b, 10);
        self.renderPractica();
      });
    });

    document.getElementById("btnCalPrac").addEventListener("click", function () {
      var bien = 0;
      bloque.preguntas.forEach(function (q, idx) {
        var sel = document.querySelector('input[name="prac_' + idx + '"]:checked');
        var val = sel ? parseInt(sel.value, 10) : -1;
        var ok = val === q.correcta;
        if (ok) bien++;
        var feed = document.getElementById("pfeed_" + idx);
        feed.style.display = "block";
        feed.className = "nota-inline " + (ok ? "ok" : "mal");
        feed.innerHTML = (ok ? "<strong>✓ ¡Correcto!</strong> " : (sel ? "<strong>✗ Incorrecto.</strong> " : "<strong>⚠ Sin responder.</strong> ") + "Respuesta: <em>" + fmt(q.opciones[q.correcta]) + "</em>. ") + fmt(q.feedback);
        var corrLabel = document.getElementById("popt_" + idx + "_" + q.correcta);
        if (corrLabel) {
          corrLabel.style.borderColor = "var(--sena-green)";
          corrLabel.style.background = "var(--sena-green-subtle)";
        }
      });
      var sum = document.getElementById("pracSummary");
      var aprobado = bien >= 3;
      sum.innerHTML = '<div class="nota-inline ' + (aprobado ? "ok" : "warn") + '">Obtuviste <strong>' + bien + " de " + bloque.preguntas.length + "</strong> en " + esc(bloque.titulo) + ". " + (aprobado ? "¡Dominas este bloque!" : "Te recomendamos repasar la unidad antes del cuestionario oficial.") + "</div>";
    });

    document.getElementById("btnResetPrac").addEventListener("click", function () {
      self.renderPractica();
    });
  };

  SenaQuizEngine.prototype.renderCert = function () {
    var self = this;
    var body = document.getElementById("quizBody");
    var ICON_CAP = '<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
    var html =
      '<div class="callout callout-info" id="quizModeControls">' +
      '  <div class="callout-icon">' + ICON_CAP + '</div>' +
      '  <div class="callout-body">' +
      '    <div class="callout-title">Evaluación Integradora de la OVA (18 preguntas · Mínimo ' + this.passingScore + '%)</div>' +
      '    <div class="callout-text">Al responder todas las preguntas y obtener al menos ' + this.passingScore + '%, se registrará tu avance en SCORM 1.2 y se habilitará tu <strong>Constancia de Aprobación Virtual</strong> imprimible.</div>' +
      '  </div>' +
      "</div>" +
      '<form id="quizForm" style="display:flex; flex-direction:column; gap:18px;">';

    CERT_PREGUNTAS.forEach(function (q, idx) {
      html +=
        '<div class="feature-item" id="qBox_' + idx + '">' +
        '  <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:10px;">' +
        '    <span style="background:var(--sena-blue); color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.84rem; font-weight:700; flex-shrink:0;">' + (idx + 1) + "</span>" +
        '    <div style="flex:1;"><h4 style="font-size:0.97rem; font-weight:600; line-height:1.45;">' + fmt(q.pregunta.replace(/^\d+\.\s*/, "")) + "</h4>" +
        (q.codigo ? '<pre class="code-panel" style="margin-top:8px;">' + esc(q.codigo) + "</pre>" : "") +
        "    </div>" +
        "  </div>" +
        '  <div style="display:flex; flex-direction:column; gap:8px; margin-left:38px;">';
      q.opciones.forEach(function (opc, opcIdx) {
        html +=
          '<label id="opt_' + idx + "_" + opcIdx + '" style="display:flex; align-items:center; gap:10px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:9px 13px; cursor:pointer;">' +
          '  <input type="radio" name="question_' + idx + '" value="' + opcIdx + '" style="accent-color:var(--sena-green); width:17px; height:17px;">' +
          '  <span style="font-size:0.9rem;">' + fmt(opc) + "</span>" +
          "</label>";
      });
      html +=
        '  </div>' +
        '  <div id="feedback_' + idx + '" style="display:none; margin-top:10px; margin-left:38px;" class="nota-inline"></div>' +
        "</div>";
    });

    html +=
      '  <div id="quizAlert" style="display:none;" class="nota-inline warn"></div>' +
      '  <div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap; margin-top:8px;">' +
      '    <button type="button" id="btnSubmitQuiz" class="btn btn-primary" style="padding:12px 28px;">Calificar evaluación</button>' +
      '    <button type="button" id="btnRetryQuiz" class="btn btn-secondary" style="display:none;">Reintentar evaluación</button>' +
      "  </div>" +
      "</form>" +
      '<div id="certificateContainer" style="display:none;"></div>';

    body.innerHTML = html;

    document.getElementById("btnSubmitQuiz").addEventListener("click", function () { self.evaluateCert(); });
    document.getElementById("btnRetryQuiz").addEventListener("click", function () {
      self.isSubmitted = false;
      var badge = document.getElementById("quizScoreBadge");
      if (badge) badge.style.display = "none";
      self.renderCert();
      self.container.scrollIntoView({ behavior: "smooth" });
    });

    CERT_PREGUNTAS.forEach(function (_, qIdx) {
      var radios = document.getElementsByName("question_" + qIdx);
      radios.forEach(function (r) {
        r.addEventListener("change", function () {
          if (self.isSubmitted) return;
          CERT_PREGUNTAS[qIdx].opciones.forEach(function (__, oIdx) {
            var lbl = document.getElementById("opt_" + qIdx + "_" + oIdx);
            if (lbl) lbl.style.borderColor = "var(--border-color)";
          });
          var selLbl = document.getElementById("opt_" + qIdx + "_" + r.value);
          if (selLbl) selLbl.style.borderColor = "var(--sena-green)";
        });
      });
    });
  };

  SenaQuizEngine.prototype.evaluateCert = function () {
    var answered = 0;
    CERT_PREGUNTAS.forEach(function (_, idx) {
      if (document.querySelector('input[name="question_' + idx + '"]:checked')) answered++;
    });

    var alertBox = document.getElementById("quizAlert");
    if (answered < CERT_PREGUNTAS.length) {
      alertBox.style.display = "block";
      alertBox.innerHTML = "⚠ Responde todas las preguntas antes de calificar. Llevas <strong>" + answered + " de " + CERT_PREGUNTAS.length + "</strong>.";
      alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    alertBox.style.display = "none";
    this.isSubmitted = true;

    var correctCount = 0;
    CERT_PREGUNTAS.forEach(function (q, idx) {
      var sel = document.querySelector('input[name="question_' + idx + '"]:checked');
      var userVal = parseInt(sel.value, 10);
      var ok = userVal === q.correcta;
      if (ok) correctCount++;

      var fb = document.getElementById("feedback_" + idx);
      var qBox = document.getElementById("qBox_" + idx);
      fb.style.display = "block";
      if (ok) {
        fb.className = "nota-inline ok";
        fb.innerHTML = "<strong>✓ ¡Correcto!</strong> " + fmt(q.feedback);
        qBox.style.borderColor = "var(--sena-green)";
      } else {
        fb.className = "nota-inline mal";
        fb.innerHTML = "<strong>✗ Incorrecto.</strong> Respuesta correcta: <em>" + fmt(q.opciones[q.correcta]) + "</em>.<br>" + fmt(q.feedback);
        qBox.style.borderColor = "var(--sena-red)";
      }
      var corrLbl = document.getElementById("opt_" + idx + "_" + q.correcta);
      if (corrLbl) {
        corrLbl.style.background = "var(--sena-green-subtle)";
        corrLbl.style.borderColor = "var(--sena-green)";
        corrLbl.style.fontWeight = "600";
      }
    });

    var pct = Math.round((correctCount / CERT_PREGUNTAS.length) * 100);
    var passed = pct >= this.passingScore;

    if (global.ScormConnector) {
      global.ScormConnector.setScore(pct, passed);
    }

    var badge = document.getElementById("quizScoreBadge");
    if (badge) {
      badge.style.display = "inline-block";
      badge.style.background = passed ? "var(--sena-green)" : "var(--sena-red)";
      badge.style.color = "#FFFFFF";
      badge.textContent = "Puntaje: " + pct + "% (" + correctCount + "/" + CERT_PREGUNTAS.length + " · " + (passed ? "APROBADO" : "NO APROBADO") + ")";
    }

    document.getElementById("btnSubmitQuiz").style.display = "none";
    document.getElementById("btnRetryQuiz").style.display = "inline-flex";
    document.querySelectorAll('#quizForm input[type="radio"]').forEach(function (r) { r.disabled = true; });

    if (passed) {
      this.renderCertificate(pct, correctCount);
    } else {
      var cert = document.getElementById("certificateContainer");
      cert.style.display = "block";
      cert.innerHTML = '<div class="nota-inline mal" style="margin-top:16px;">Obtuviste <strong>' + pct + "%</strong>. Necesitas al menos <strong>" + this.passingScore + "%</strong> para generar la constancia. Revisa la retroalimentación y pulsa <strong>Reintentar Evaluación</strong>.</div>";
      cert.scrollIntoView({ behavior: "smooth" });
    }
  };

  SenaQuizEngine.prototype.renderCertificate = function (pct, correctCount) {
    var cert = document.getElementById("certificateContainer");
    var today = new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
    cert.style.display = "block";
    cert.innerHTML =
      '<div class="certificate-box">' +
      '  <div class="certificate-header">SERVICIO NACIONAL DE APRENDIZAJE – SENA | REGIONAL BOYACÁ | CENTRO MINERO</div>' +
      '  <h2 class="certificate-title">CONSTANCIA DE APROBACIÓN VIRTUAL</h2>' +
      '  <div style="font-size:0.95rem; opacity:0.9;">Se deja constancia de que el aprendiz (haz clic para escribir tu nombre completo):</div>' +
      '  <div class="certificate-name" contenteditable="true" spellcheck="false" title="Haz clic para escribir tu nombre">NOMBRE DEL APRENDIZ SENA</div>' +
      '  <div class="certificate-body">' +
      '    Completó el recorrido formativo y aprobó la evaluación integradora del Objeto Virtual de Aprendizaje:' +
      '    <br><strong style="color:var(--sena-yellow); font-size:1.12rem; display:inline-block; margin:8px 0;">' + esc(this.ovaTitle) + "</strong>" +
      '    <br>Programa: <strong>ADSO (228118)</strong> · Ficha: <strong>' + esc(this.ficha) + "</strong> · Guía 03 (RAP 592376-03)" +
      '    <br>Calificación obtenida: <strong>' + pct + " / 100</strong> (" + correctCount + " de " + CERT_PREGUNTAS.length + " aciertos) · Fecha: <strong>" + esc(today) + "</strong>" +
      "  </div>" +
      '  <div class="certificate-seal">✓</div>' +
      '  <div style="margin-top:14px; font-size:0.78rem; opacity:0.8; letter-spacing:0.6px;">' +
      '    Instructor Responsable: Diego Alonso Ojeda Medina · Centro Minero – Sogamoso' +
      "  </div>" +
      '  <button type="button" id="printCertBtn" class="btn btn-secondary" data-tooltip="Imprimir o guardar únicamente esta constancia en PDF" style="margin-top:18px;">Imprimir o guardar constancia en PDF</button>' +
      "</div>";
    var printCertBtn = document.getElementById("printCertBtn");
    if (printCertBtn) {
      printCertBtn.addEventListener("click", function () {
        document.body.classList.add("printing-certificate");
        var limpiarPrint = function () { document.body.classList.remove("printing-certificate"); };
        window.addEventListener("afterprint", limpiarPrint, { once: true });
        window.print();
        setTimeout(limpiarPrint, 1200);
      });
    }
    cert.scrollIntoView({ behavior: "smooth" });
  };

  /* Reparte la posición de la respuesta correcta entre a–d (semilla fija = ficha), como en el
     banco reservado: sin esto la mayoría de las respuestas quedaba en «b». */
  function balancear(lista, semilla) {
    var x = semilla;
    function azar() { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }
    var destinos = lista.map(function (_, i) { return i % 4; });
    for (var i = destinos.length - 1; i > 0; i--) {
      var j = Math.floor(azar() * (i + 1)), t = destinos[i];
      destinos[i] = destinos[j]; destinos[j] = t;
    }
    lista.forEach(function (q, k) {
      var d = destinos[k] % q.opciones.length, aux = q.opciones[d];
      q.opciones[d] = q.opciones[q.correcta];
      q.opciones[q.correcta] = aux;
      q.correcta = d;
    });
  }
  balancear(PRACTICA_BLOQUES.reduce(function (a, b) { return a.concat(b.preguntas); }, []), 3490966);
  balancear(CERT_PREGUNTAS, 3490966);

  global.SenaQuizEngine = SenaQuizEngine;
})(window);
