# REGALA ILUSIÓN · The Interactive Poster

Cartel digital interactivo para la **Fundación ITACA** de L’Hospitalet de Llobregat.
Actividad **0612 – Desarrollo web en entorno cliente**.

---

## 1. Concepto creativo

**«REGALA ILUSIÓN»**: un regalo de Navidad, verde y dorado, flota dentro de un gran círculo rojo, como un sol, entre las dos palabras del titular.
La composición se inspira en el cartelismo editorial contemporáneo y en *The Moving Poster*. Combina una tipografía display muy contundente, una retícula limpia, formas geométricas planas y pequeños destellos que dan vida al cartel.

- **Titular**: «REGALA» en rojo y «ILUSIÓN» en verde, ajustados al ancho exacto de la retícula (752 px).
- **Elemento central**: el regalo, que reacciona al cursor, se ilumina y se abre.
- **Sello giratorio** dorado con la fecha: *21 de diciembre*.
- **Cita**: «Esta Navidad, tu pequeño gesto puede cambiar una sonrisa».
- **Texto lateral**: «Un pequeño gesto · una gran sonrisa».
- **Llamada a la acción**: botón **COLABORA**.
- **Identidad**: identificación tipográfica «FUNDACIÓN ITACA». No se ha inventado ningún logotipo; el bloque de marca de la cabecera es el espacio reservado para el logotipo oficial.

### Paleta

| Color | Hex | Uso |
|---|---|---|
| Rojo navideño oscuro | `#A52A2A` | «REGALA», círculo, botón |
| Crema cálido | `#F5EAD5` | Fondo del cartel |
| Verde oscuro | `#234C3D` | «ILUSIÓN», regalo, textos |
| Dorado | `#D6A84F` | Lazo, sello, estrellas, rayos |
| Blanco | `#FFFFFF` | Destellos y brillos |

### Tipografías (Google Fonts)

- **Anton**: display condensada para el titular, el sello y el botón.
- **Instrument Serif** (cursiva): la cita, con un tono editorial y cálido.
- **DM Sans**: textos, cabecera y pie.

## 2. Objetivo de la campaña

Sensibilizar sobre la importancia de las **donaciones económicas** que permiten comprar regalos de Navidad para **niños y niñas en riesgo de exclusión social**, con el **21 de diciembre** como fecha de referencia de la campaña.

## 3. Tecnologías

- **HTML5**: estructura semántica del cartel (`header`, `h1`, `section`, `footer`, `button`).
- **CSS3**: variables, grid y flexbox, transiciones, `@keyframes`, `clip-path`, `mix-blend-mode` y `prefers-reduced-motion`.
- **JavaScript vanilla**: eventos con `addEventListener()`, `requestAnimationFrame` y creación dinámica de elementos.
- **SVG**: regalo, estrellas, sello con texto circular y textura de papel.

No hay frameworks ni dependencias que instalar. Las fuentes se cargan desde Google Fonts y, sin conexión, se usan tipografías de sistema como alternativa.

## 4. Estructura de archivos

```
interactive-poster/
├── index.html      → estructura del cartel
├── style.css       → diseño, composición, responsive, transiciones y animaciones
├── main.js         → eventos, interacciones, parallax y partículas
├── README.md       → esta documentación
└── assets/
    ├── grano.svg   → textura de papel (acabado de cartel impreso)
    └── favicon.svg → icono de la pestaña
```

## 5. Interacciones con JavaScript

Todas se registran en `registrarEventos()` con `addEventListener()` y se gestionan con funciones propias.

### 5.1 `mouseenter`: `activarRegalo()`

Al pasar el cursor por encima del regalo:

- `transform` cambia a `scale(1.12) rotate(-6deg)`: el regalo crece y gira.
- `filter` aplica un resplandor dorado (`drop-shadow`) y un `brightness` mayor.
- La **tapa** se levanta ligeramente (`transform` del grupo SVG).
- Los **rayos de luz** pasan de `opacity: 0` a `1` y se expanden.
- La **sombra** se reduce, como si el regalo se elevara.
- Sale una pequeña ráfaga de destellos.

Las transiciones CSS, con una curva de rebote, hacen que el cambio sea suave.

### 5.2 `mouseleave`: `desactivarRegalo()`

Al retirar el cursor, JavaScript devuelve todas las propiedades a su valor inicial: `scale(1) rotate(0deg)`, filtro sin brillo, rayos con `opacity: 0`, tapa cerrada y sombra completa. La misma transición CSS hace que la vuelta sea fluida.

### 5.3 `mousemove`: `moverRaton()` + `animarParallax()`

Al mover el ratón sobre el cartel ocurren tres cosas:

1. **Parallax**: la posición del cursor se normaliza entre -1 y 1. Cada capa tiene un atributo `data-profundidad` (de 4 a 66) que define su intensidad de movimiento. `animarParallax()` interpola la posición en cada fotograma (`requestAnimationFrame`) y mueve cada capa en sentido contrario al cursor con la propiedad `translate`. Las formas de fondo se mueven poco y las estrellas pequeñas mucho, lo que crea profundidad.
2. **Foco de luz**: una luz cálida (`mix-blend-mode: soft-light`) sigue al cursor.
3. **Estela de destellos**: cada 22 px de recorrido se crea una partícula, una estrella o un punto, que se desvanece y se elimina del DOM. Como máximo hay 70 a la vez.

Al salir del cartel (`mouseleave` sobre `#cartel`), todo vuelve suavemente al centro.

### 5.4 Interacciones adicionales

- **Clic en el regalo** (`abrirRegalo()`): la tapa salta, sale confeti y aparece «¡Gracias por regalar ilusión!».
- **Botón COLABORA** (`pulsarColabora()`): ráfaga de destellos y el texto cambia a «¡Gracias!».
- **Animaciones de entrada**: el titular aparece letra a letra y el resto de bloques en cascada.
- **Movimiento autónomo**: el anillo y el sello giran, el regalo flota, las estrellas centellean y, tras 3,5 s sin mover el ratón, el parallax se mueve solo. El cartel tiene vida aunque nadie interactúe.
- **Tamaño exacto del titular**: `ajustarTitular()` mide cada palabra y calcula su `font-size` para que ocupe exactamente el ancho de la retícula.

## 6. Accesibilidad y dispositivos táctiles

- El regalo y COLABORA son elementos `<button>`: se pueden usar con el teclado (Tab, Enter o Espacio). Con el teclado, el foco equivale a pasar el cursor.
- En pantallas táctiles, tocar el regalo lo ilumina y lo abre, y deslizar el dedo produce el parallax (`touchmove`).
- `prefers-reduced-motion`: se desactivan las animaciones continuas y la estela, y el parallax se reduce al 30 %.
- Los elementos decorativos llevan `aria-hidden="true"`, el titular tiene `aria-label` y el mensaje de agradecimiento se anuncia con `aria-live`.
- Los textos tienen un contraste alto: verde o rojo oscuro sobre crema.

## 7. Cómo ejecutar el proyecto

1. Descarga o clona la carpeta del proyecto.
2. Abre `index.html` con doble clic en cualquier navegador moderno (Chrome, Edge, Firefox o Safari).

También puedes usar la extensión **Live Server** de Visual Studio Code: clic derecho sobre `index.html` → *Open with Live Server*.

No hace falta instalar nada.

## 8. Cómo visualizar el cartel

- El cartel mide **848 × 1200 px** (proporción A3) y aparece siempre **centrado y completo**.
- Si la ventana es más pequeña, `ajustarEscala()` lo reduce de forma proporcional. Nunca se deforma ni se recorta y nunca supera su tamaño real.
- **Para capturarlo a tamaño real**, usa una ventana de al menos 880 × 1232 px. Con las DevTools (F12) puedes inspeccionar el elemento `#cartel` → clic derecho → *Capture node screenshot* para obtener una imagen exacta de 848 × 1200 px.
