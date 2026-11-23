# REGALA ILUSIÓN · The Interactive Poster

Cartel digital interactivo para la **Fundación ITACA** de L’Hospitalet de Llobregat.
Actividad **0612 – Desarrollo web en entorno cliente**.

---

## 1. Concepto creativo

**«La guirnalda que suena»**. El titular no está escrito: **cuelga**. Cada letra de «REGALA ILUSIÓN» es una bola de Navidad colgada de un hilo. Las bolas se balancean con física real, el cursor funciona como una **lámpara** que ilumina la pared y mueve los reflejos y las sombras de cada adorno, y al rozarlas **suenan como campanas de cristal**.

Leídas en orden, las 13 bolas forman el principio de **«Noche de paz»**. Si el usuario las toca todas, la guirnalda toca el villancico ella sola. El mensaje de la campaña se convierte en algo que se puede tocar: *regalar ilusión* es literalmente hacer sonar el cartel.

- **Mitad superior (pared crema)**: la guirnalda. Dos filas de adornos (REGALA / ILUSIÓN) colgados a distintas alturas, con tres colores y cuatro motivos (lisa, franjas, lunares, gajos).
- **Mitad inferior (bloque rojo)**: la información. Un gran **21** en Bodoni cursiva dorada, *de diciembre*, la cita, el texto de la campaña y la marca.
- **Llamada a la acción**: **COLABORA** es una **etiqueta de regalo** atada con un cordel. Se balancea al pasar el cursor y se da la vuelta para decir «¡Gracias!».
- **Logotipo de Planeta FP** en una franja crema al pie del cartel (en negro y naranja se lee bien sobre crema; sobre el rojo se perdería).
- **Identidad**: identificación tipográfica «FUNDACIÓN ITACA». No se ha inventado ningún logotipo; ese bloque es el espacio reservado para el logotipo oficial.

### Paleta

| Color | Hex | Uso |
|---|---|---|
| Rojo navideño oscuro | `#A52A2A` | Bloque inferior, bolas rojas |
| Crema cálido | `#F5EAD5` | Pared, textos sobre rojo |
| Verde oscuro | `#234C3D` | Bolas verdes, texto de la etiqueta |
| Dorado | `#D6A84F` | «21», bolas doradas, casquillos, etiqueta |
| Blanco | `#FFFFFF` | Reflejos y destellos |

### Tipografías (Google Fonts)

- **Bodoni Moda**: didona de alto contraste para las letras de las bolas, el «21» y la cita. Recuerda a la rotulación clásica de las tiendas en Navidad. Se usa su eje de tamaño óptico (`opsz`): trazos más gruesos dentro de las bolas y más finos en el «21».
- **Archivo**: grotesca de **ancho variable** (`font-stretch` de 62 % a 125 %). Se usa ancha y negra para «DE DICIEMBRE», «COLABORA» e «ITACA», y normal para los textos.

## 2. Objetivo de la campaña

Sensibilizar sobre la importancia de las **donaciones económicas** que permiten comprar regalos de Navidad para **niños y niñas en riesgo de exclusión social**, con el **21 de diciembre** como fecha de referencia de la campaña.

## 3. Tecnologías

- **HTML5**: estructura semántica (`h1`, `section`, `button`, `aria-live`).
- **CSS3**: variables (también dentro de degradados), grid, `clip-path`, transformaciones 3D (`rotateY`, `backface-visibility`), `@keyframes` y `prefers-reduced-motion`.
- **JavaScript vanilla**: eventos con `addEventListener()`, creación dinámica del DOM, bucle con `requestAnimationFrame`, una simulación física sencilla y la **Web Audio API**.

No hay frameworks ni dependencias. Las fuentes se cargan desde Google Fonts y, sin conexión, se usan tipografías de sistema.

## 4. Estructura de archivos

```
poster/
├── index.html         → estructura del cartel
├── style.css          → diseño, adornos, etiqueta, animaciones
├── main.js            → guirnalda, física, luz, sonido e interacciones
├── README.md          → esta documentación
├── assets/
│   ├── favicon.svg    → icono de la pestaña
│   └── logo-planeta-fp.png → logotipo de Planeta FP
└── version-anterior/  → primera versión del cartel (el regalo central)
```

## 5. Interacciones con JavaScript

Los 13 adornos se crean en `crearGuirnalda()` a partir del array `ADORNOS` (letra, posición, largo del hilo, tamaño, color, motivo y nota). Todos los eventos se registran en `registrarEventos()` con `addEventListener()`.

### 5.1 `mouseenter` sobre un adorno: `encenderAdorno()`

- La bola recibe la clase `encendida`: `transform: scale(1.09)`, `filter: brightness(1.14) saturate(1.1)` y un `box-shadow` dorado que la hace brillar.
- La letra pasa a blanco con un resplandor (`color`, `text-shadow`).
- El adorno sube de capa (`z-index`) para quedar por delante de sus vecinos.
- Suena su **campanada**, sintetizada con Web Audio: cuatro osciladores con relaciones inarmónicas (1 · 2,76 · 5,4 · 8,93), como una campana, que se apagan a distinto ritmo.
- El adorno se marca como tocado y su anilla queda dorada, para que se vea cuánto falta.

### 5.2 `mouseleave` del adorno: `apagarAdorno()`

Se quita la clase `encendida` y se restablece el `z-index`. Las transiciones CSS (con una curva de rebote) devuelven la bola a su tamaño, brillo y sombra originales.

### 5.3 `mousemove` sobre el cartel: `moverRaton()`

1. **La lámpara**: el cursor es la fuente de luz. Un halo cálido lo sigue por la pared y, en cada fotograma, `animar()` calcula para cada bola:
   - el **reflejo**: la dirección hacia la luz se transforma a las coordenadas locales de la bola (que está girada un ángulo θ) y se escribe en las variables `--hx` / `--hy`, que mueven los degradados del brillo;
   - la **sombra** sobre la pared: se desplaza en sentido contrario a la luz, y más cuanto más lejos está la lámpara.
2. **El viento**: se calcula la velocidad del cursor. Si pasa cerca de una bola o **roza un hilo** (distancia a un segmento), le transmite su velocidad tangencial. Un movimiento lento apenas la mueve y un gesto rápido la hace oscilar. Los hilos se pueden «pulsar» como cuerdas.

Al salir del cartel (`mouseleave` sobre `#cartel`), la luz vuelve despacio a su posición de reposo, una «ventana» arriba a la izquierda.

### 5.4 Física de los adornos

Cada adorno es un péndulo: `θ'' = −(g / L) · (sen θ − brisa)`, integrado con Euler semiimplícito y amortiguado. Como `g` es fijo, los hilos largos oscilan más despacio que los cortos. La **brisa** es una onda lenta que recorre la guirnalda de izquierda a derecha: el cartel se mueve aunque nadie lo toque.

### 5.5 Interacciones adicionales

- **Clic en un adorno** (`pulsarAdorno()`): campanada fuerte, impulso, una vuelta completa en 3D (`rotateY`) y destellos.
- **Villancico oculto** (`tocarVillancico()`): al tocar los 13 adornos, la guirnalda toca «Noche de paz» con su ritmo de 3/4 (array `VILLANCICO`), cada bola se enciende al sonar y aparece un mensaje de agradecimiento.
- **COLABORA** (`pulsarColabora()`): la etiqueta da la vuelta (`rotateY(180deg)`) y enseña «¡Gracias!», con destellos y dos notas.
- **Entrada**: los adornos caen uno a uno con rebote y después aparecen sus sombras; el bloque rojo entra en cascada.
- **Botón de sonido** fuera del cartel, para silenciarlo.

## 6. Accesibilidad y dispositivos táctiles

- Cada adorno es un `<button>` con `aria-label` («Adorno con la letra R»). Con el teclado (Tab) el foco equivale a pasar el cursor, y Enter o Espacio equivalen al clic.
- El titular real es un `<h1>` oculto visualmente con el texto «Regala ilusión».
- Los navegadores solo permiten reproducir sonido después de un gesto del usuario: el audio se activa con el primer clic, toque o pulsación de tecla.
- En pantallas táctiles, tocar un adorno lo enciende y lo hace sonar, y deslizar el dedo mueve la luz y empuja los adornos.
- `prefers-reduced-motion`: los adornos se quedan quietos (sin péndulo, ni brisa, ni vueltas). La luz y los brillos siguen funcionando.

## 7. Cómo ejecutar el proyecto

Abre `index.html` en cualquier navegador moderno, o usa **Live Server** de Visual Studio Code. No hace falta instalar nada.

## 8. Cómo visualizar el cartel

- El cartel mide **848 × 1200 px** (proporción A3) y aparece siempre centrado y completo; si la ventana es más pequeña, `ajustarEscala()` lo reduce proporcionalmente.
- **Para capturarlo a tamaño real**, usa una ventana de al menos 880 × 1256 px y abre `index.html#captura`, que se salta la animación de entrada. Con las DevTools (F12): clic derecho sobre `#cartel` → *Capture node screenshot*.
