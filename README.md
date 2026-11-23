# Regala Ilusión · Cartel interactivo

Cartel digital interactivo (848 × 1200 px) para la campaña solidaria de Navidad de la **Fundación ITACA** de L’Hospitalet de Llobregat.
Actividad **0612 – Desarrollo web en entorno cliente** · Planeta FP.

Para verlo, abre `index.html` en cualquier navegador moderno. No hace falta instalar nada.

---

## Concepto

**La guirnalda que suena.** El titular «REGALA ILUSIÓN» está formado por 13 bolas de Navidad, una por letra, colgadas de hilos sobre una pared crema. Las bolas se balancean como péndulos reales. El cursor hace de **lámpara**: ilumina la pared y mueve los reflejos y las sombras de cada bola. Al rozarlas, **suenan como campanas**.

Leídas en orden, sus notas forman el principio de **«Noche de paz»**. Cuando se han tocado las 13, la guirnalda toca el villancico sola. Así la idea de *regalar ilusión* se convierte en algo que se puede tocar.

La mitad inferior, en rojo, contiene la información de la campaña: la fecha (**21 de diciembre**), la cita, el texto sobre las donaciones y la llamada a la acción **COLABORA**, que es una etiqueta de regalo que se da la vuelta al pulsarla.

- **Paleta:** rojo `#A52A2A`, crema `#F5EAD5`, verde `#234C3D`, dorado `#D6A84F` y blanco `#FFFFFF`.
- **Tipografías:** Bodoni Moda para las letras y el «21»; Archivo, una tipografía de ancho variable, para los textos.

---

## Eventos de JavaScript utilizados

Todos se registran con `addEventListener()` en la función `registrarEventos()` de `main.js`.

| Evento | Elemento | Función | Para qué sirve |
|---|---|---|---|
| `mouseenter` | cada bola | `encenderAdorno()` | **Interacción 1**: la bola se enciende y suena |
| `mouseleave` | cada bola | `apagarAdorno()` | **Interacción 2**: la bola vuelve a su estado inicial |
| `mousemove` | `#cartel` | `moverRaton()` | **Interacción 3**: luz que sigue al cursor y viento |
| `mouseleave` | `#cartel` | `salirDelCartel()` | La luz vuelve a su posición de reposo |
| `click` | cada bola | `pulsarAdorno()` | La bola da una vuelta en 3D y suelta destellos |
| `click` | botón COLABORA | `pulsarColabora()` | La etiqueta se da la vuelta: «¡Gracias!» |
| `focus` / `blur` | cada bola | `encenderAdorno()` / `apagarAdorno()` | Con el teclado (Tab), igual que pasar el cursor |
| `touchmove` / `touchend` | `#cartel` | `moverRaton()` / `salirDelCartel()` | Lo mismo con el dedo en pantallas táctiles |
| `pointerdown` / `keydown` | `document` | `prepararAudio()` | Activa el sonido, que los navegadores solo permiten tras un gesto del usuario |
| `resize` | `window` | `ajustarEscala()` | Escala el cartel para que quepa siempre en la ventana |

Además, `requestAnimationFrame()` ejecuta en cada fotograma la función `animar()`, que calcula la física de los péndulos, los reflejos y las sombras.

---

## Las tres interacciones

### 1. `mouseenter`: la bola se enciende

Al pasar el cursor por encima de una bola, `encenderAdorno()`:

- le añade la clase `encendida`, que cambia su `transform` (`scale(1.09)`), su `filter` (más brillo y saturación) y su `box-shadow` (un halo dorado);
- pone la letra en blanco y con resplandor;
- sube su `z-index` para que quede por delante de las demás;
- hace sonar su nota, una campana sintetizada con la Web Audio API;
- la marca como tocada (su anilla queda dorada). Cuando están las 13, suena «Noche de paz».

### 2. `mouseleave`: la bola vuelve a su estado inicial

Al retirar el cursor, `apagarAdorno()` quita la clase `encendida` y restablece el `z-index`. Las transiciones de CSS devuelven la bola suavemente, con un pequeño rebote, a su tamaño, brillo y sombra originales.

### 3. `mousemove`: la lámpara y el viento

Al mover el ratón sobre el cartel, `moverRaton()` convierte la posición del cursor a coordenadas del cartel y hace dos cosas:

1. **Mueve la luz.** Un halo cálido sigue al cursor por la pared. En cada fotograma, `animar()` calcula para cada bola la dirección hacia el cursor y:
   - coloca el **reflejo** de la bola apuntando hacia la luz (variables CSS `--hx` y `--hy`);
   - desplaza su **sombra** sobre la pared en sentido contrario, más lejos cuanto más lejos está la lámpara.
2. **Hace viento.** Calcula la velocidad del cursor. Si pasa cerca de una bola o roza su hilo, le transmite ese movimiento. Un gesto lento apenas la mueve y uno rápido la hace balancearse. Cada bola funciona como un péndulo con gravedad y amortiguación, así que las de hilo largo oscilan más despacio que las cortas.

Cuando el cursor sale del cartel, la luz vuelve despacio a su posición inicial. Una brisa suave mantiene la guirnalda en movimiento aunque nadie la toque.

---

## Archivos

```
poster/
├── index.html   → estructura del cartel
├── style.css    → diseño, bolas, etiqueta y animaciones
├── main.js      → guirnalda, física, luz, sonido y eventos
├── README.md    → este documento
└── assets/      → favicon y logotipo de Planeta FP
```
