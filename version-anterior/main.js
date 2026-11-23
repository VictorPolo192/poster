/* =====================================================================
   REGALA ILUSIÓN · Fundación ITACA
   main.js — interacciones del cartel con JavaScript vanilla.

   Interacciones principales (todas con addEventListener):
     1. mouseenter sobre el regalo  → activarRegalo()
     2. mouseleave del regalo       → desactivarRegalo()
     3. mousemove sobre el cartel   → moverRaton()  (parallax + foco + destellos)

   Extras: click para abrir el regalo, botón COLABORA, soporte táctil
   y de teclado, animaciones de entrada y movimiento autónomo.
   ===================================================================== */
'use strict';

/* ---------- 1. Configuración ---------- */
const ANCHO = 848;                  // ancho real del cartel
const ALTO = 1200;                  // alto real del cartel
const MARGEN = 16;                  // margen mínimo alrededor del cartel
const ANCHO_TITULAR = 752;          // ancho que debe ocupar cada palabra
const SUAVIDAD = 0.07;              // 0–1: menor = parallax más suave
const DISTANCIA_DESTELLO = 22;      // px recorridos entre partícula y partícula
const MAX_DESTELLOS = 70;           // límite de partículas simultáneas
const ESPERA_REPOSO = 3500;         // ms sin mover el ratón antes del modo autónomo
const COLORES = ['#D6A84F', '#FFFFFF', '#A52A2A', '#D6A84F', '#234C3D'];

const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sinHover = window.matchMedia('(hover: none)').matches;

/* ---------- 2. Referencias al DOM ---------- */
const cartel = document.getElementById('cartel');
const zonaRegalo = document.getElementById('zonaRegalo');
const regalo = document.getElementById('regalo');
const tapa = document.getElementById('tapa');
const rayos = document.getElementById('rayos');
const sombra = document.getElementById('sombra');
const gracias = document.getElementById('gracias');
const foco = document.getElementById('foco');
const capaDestellos = document.getElementById('destellos');
const cta = document.getElementById('cta');
const ctaTexto = document.getElementById('ctaTexto');
const pista = document.getElementById('pista');

// Cada capa guarda su intensidad de movimiento (data-profundidad)
const capas = Array.from(document.querySelectorAll('[data-profundidad]')).map((el) => ({
  el,
  profundidad: Number(el.dataset.profundidad) * (movimientoReducido ? 0.3 : 1),
}));

/* ---------- 3. Estado ---------- */
const estado = {
  escala: 1,
  objetivo: { x: 0, y: 0 },        // posición del ratón normalizada (-1 a 1)
  actual: { x: 0, y: 0 },          // posición suavizada que persigue al objetivo
  ultimoDestello: { x: -999, y: -999 },
  ultimoMovimiento: 0,
  destellosVivos: 0,
  regaloActivo: false,
  temporizadorAbrir: null,
  temporizadorCta: null,
};

/* =====================================================================
   4. Escalado proporcional del cartel
   ===================================================================== */
function ajustarEscala() {
  const anchoDisponible = window.innerWidth - MARGEN * 2;
  const altoDisponible = window.innerHeight - MARGEN * 2;
  // Nunca se agranda por encima del tamaño real: 848 × 1200 a escala 1
  estado.escala = Math.max(0.1, Math.min(1, anchoDisponible / ANCHO, altoDisponible / ALTO));
  document.documentElement.style.setProperty('--escala', estado.escala.toFixed(4));
}

/* =====================================================================
   5. Titular: dividir en letras y ajustar al ancho exacto
   ===================================================================== */
function dividirEnLetras(palabra) {
  const texto = palabra.textContent.trim();
  palabra.textContent = '';
  [...texto].forEach((caracter, i) => {
    const letra = document.createElement('span');
    letra.className = 'letra';
    letra.textContent = caracter;
    letra.style.setProperty('--i', i);
    palabra.appendChild(letra);
  });
}

function ajustarTitular(palabra) {
  // Se mide a 100 px y se calcula el tamaño exacto (offsetWidth ignora el scale)
  palabra.style.fontSize = '100px';
  const ancho = palabra.offsetWidth;
  if (ancho > 0) {
    palabra.style.fontSize = `${(100 * ANCHO_TITULAR / ancho).toFixed(2)}px`;
  }
}

/* =====================================================================
   6. Utilidades
   ===================================================================== */

// Convierte coordenadas de pantalla en coordenadas internas del cartel
function puntoEnCartel(clientX, clientY) {
  const rect = cartel.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / estado.escala,
    y: (clientY - rect.top) / estado.escala,
    nx: ((clientX - rect.left) / rect.width) * 2 - 1,   // -1 (izquierda) a 1 (derecha)
    ny: ((clientY - rect.top) / rect.height) * 2 - 1,   // -1 (arriba) a 1 (abajo)
  };
}

const azar = (min, max) => Math.random() * (max - min) + min;
const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];

// Centro del regalo en coordenadas del cartel
function centroRegalo() {
  return {
    x: zonaRegalo.offsetLeft + zonaRegalo.offsetWidth / 2,
    y: zonaRegalo.offsetTop + zonaRegalo.offsetHeight * 0.55,
  };
}

/* =====================================================================
   7. Partículas y destellos
   ===================================================================== */
function crearDestello(x, y, opciones = {}) {
  if (estado.destellosVivos >= MAX_DESTELLOS) return;

  const {
    tamano = azar(6, 16),
    color = elegir(COLORES),
    dx = azar(-30, 30),
    dy = azar(-50, 10),
    duracion = azar(700, 1200),
    forma = Math.random() < 0.3 ? 'punto' : 'estrella',
  } = opciones;

  const destello = document.createElement('span');
  destello.className = `destello destello--${forma}`;
  destello.style.left = `${x}px`;
  destello.style.top = `${y}px`;
  destello.style.background = color;
  destello.style.setProperty('--tam', `${tamano}px`);
  destello.style.setProperty('--dx', `${dx}px`);
  destello.style.setProperty('--dy', `${dy}px`);
  destello.style.setProperty('--giro', `${azar(-180, 180)}deg`);
  destello.style.setProperty('--dur', `${duracion}ms`);

  capaDestellos.appendChild(destello);
  estado.destellosVivos++;

  destello.addEventListener('animationend', () => {
    destello.remove();
    estado.destellosVivos--;
  }, { once: true });
}

// Ráfaga radial de partículas desde un punto
function lanzarRafaga(x, y, cantidad, fuerza = 120, forma) {
  if (movimientoReducido) cantidad = Math.ceil(cantidad / 4);
  for (let i = 0; i < cantidad; i++) {
    const angulo = (Math.PI * 2 * i) / cantidad + azar(-0.2, 0.2);
    const distancia = azar(fuerza * 0.5, fuerza);
    crearDestello(x, y, {
      tamano: azar(8, 20),
      dx: Math.cos(angulo) * distancia,
      dy: Math.sin(angulo) * distancia,
      duracion: azar(800, 1400),
      forma: forma || (Math.random() < 0.25 ? 'confeti' : 'estrella'),
    });
  }
}

/* =====================================================================
   8. INTERACCIÓN 1 · MOUSEENTER — el regalo se ilumina
   ===================================================================== */
function activarRegalo() {
  if (estado.regaloActivo) return;
  estado.regaloActivo = true;

  // Propiedades visuales modificadas dinámicamente: transform, filter, opacity
  regalo.style.transform = 'scale(1.12) rotate(-6deg)';
  regalo.style.filter = 'drop-shadow(0 0 26px rgba(214, 168, 79, .95)) brightness(1.08)';
  tapa.style.transform = 'translateY(-14px) rotate(-5deg)';
  rayos.style.opacity = '1';
  rayos.style.transform = 'scale(1.05)';
  sombra.style.transform = 'translateX(-50%) scale(.8)';
  sombra.style.opacity = '.55';

  const centro = centroRegalo();
  lanzarRafaga(centro.x, centro.y - 40, 12, 150);
  ocultarPista();
}

/* =====================================================================
   9. INTERACCIÓN 2 · MOUSELEAVE — el regalo vuelve a su estado inicial
   ===================================================================== */
function desactivarRegalo() {
  if (!estado.regaloActivo) return;
  estado.regaloActivo = false;

  regalo.style.transform = 'scale(1) rotate(0deg)';
  regalo.style.filter = 'drop-shadow(0 0 0 rgba(214, 168, 79, 0)) brightness(1)';
  rayos.style.opacity = '0';
  rayos.style.transform = 'scale(.7)';
  sombra.style.transform = 'translateX(-50%) scale(1)';
  sombra.style.opacity = '1';

  // Si el regalo no está abierto, la tapa también baja
  if (!estado.temporizadorAbrir) tapa.style.transform = 'translateY(0) rotate(0deg)';
}

/* Extra: click / toque / Enter — el regalo se abre */
function abrirRegalo() {
  activarRegalo();
  clearTimeout(estado.temporizadorAbrir);

  tapa.style.transform = 'translateY(-70px) rotate(-16deg)';
  gracias.textContent = '¡Gracias por regalar ilusión!';
  gracias.classList.add('visible');

  const centro = centroRegalo();
  lanzarRafaga(centro.x, centro.y - 60, 36, 230);

  estado.temporizadorAbrir = setTimeout(() => {
    estado.temporizadorAbrir = null;
    gracias.classList.remove('visible');
    tapa.style.transform = estado.regaloActivo
      ? 'translateY(-14px) rotate(-5deg)'
      : 'translateY(0) rotate(0deg)';
  }, 2600);
}

/* =====================================================================
   10. INTERACCIÓN 3 · MOUSEMOVE — parallax, foco de luz y destellos
   ===================================================================== */
function moverRaton(clientX, clientY) {
  const p = puntoEnCartel(clientX, clientY);

  // a) Objetivo del parallax (se aplica suavizado en animarParallax)
  estado.objetivo.x = p.nx;
  estado.objetivo.y = p.ny;
  estado.ultimoMovimiento = performance.now();

  // b) El foco de luz sigue al cursor
  foco.style.transform = `translate(${p.x}px, ${p.y}px)`;
  foco.style.opacity = '1';

  // c) Estela de destellos cada cierta distancia recorrida
  if (movimientoReducido) return;
  const recorrido = Math.hypot(p.x - estado.ultimoDestello.x, p.y - estado.ultimoDestello.y);
  if (recorrido > DISTANCIA_DESTELLO) {
    crearDestello(p.x, p.y);
    estado.ultimoDestello = { x: p.x, y: p.y };
  }
}

// Cuando el cursor sale del cartel, todo vuelve suavemente al centro
function salirDelCartel() {
  estado.objetivo.x = 0;
  estado.objetivo.y = 0;
  foco.style.opacity = '0';
}

/* Bucle de animación: interpola y mueve cada capa según su profundidad */
function animarParallax(tiempo) {
  // Modo autónomo: si nadie mueve el ratón, el cartel "respira" solo
  if (!movimientoReducido && tiempo - estado.ultimoMovimiento > ESPERA_REPOSO) {
    estado.objetivo.x = Math.sin(tiempo * 0.00035) * 0.35;
    estado.objetivo.y = Math.cos(tiempo * 0.00027) * 0.25;
  }

  estado.actual.x += (estado.objetivo.x - estado.actual.x) * SUAVIDAD;
  estado.actual.y += (estado.objetivo.y - estado.actual.y) * SUAVIDAD;

  // Las capas se desplazan en sentido contrario al cursor: sensación de profundidad
  for (const { el, profundidad } of capas) {
    const x = (-estado.actual.x * profundidad).toFixed(2);
    const y = (-estado.actual.y * profundidad).toFixed(2);
    el.style.translate = `${x}px ${y}px`;
  }

  requestAnimationFrame(animarParallax);
}

/* =====================================================================
   11. Llamada a la acción: COLABORA
   ===================================================================== */
function pulsarColabora() {
  const centro = {
    x: cta.offsetLeft + cta.closest('.cierre').offsetLeft + cta.offsetWidth / 2,
    y: cta.offsetTop + cta.closest('.cierre').offsetTop + cta.offsetHeight / 2,
  };
  lanzarRafaga(centro.x, centro.y, 24, 140);

  clearTimeout(estado.temporizadorCta);
  cta.classList.add('gracias-cta');
  ctaTexto.textContent = '¡Gracias!';

  estado.temporizadorCta = setTimeout(() => {
    cta.classList.remove('gracias-cta');
    ctaTexto.textContent = 'Colabora';
  }, 2200);
}

/* ---------- Indicación de uso ---------- */
function ocultarPista() {
  pista.classList.add('oculta');
}

/* =====================================================================
   12. Registro de eventos (addEventListener)
   ===================================================================== */
function registrarEventos() {
  // Interacción 1 y 2: el regalo
  regalo.addEventListener('mouseenter', activarRegalo);
  regalo.addEventListener('mouseleave', desactivarRegalo);
  regalo.addEventListener('click', abrirRegalo);

  // Teclado: el foco equivale a pasar el cursor
  regalo.addEventListener('focus', activarRegalo);
  regalo.addEventListener('blur', desactivarRegalo);

  // Interacción 3: movimiento del ratón sobre el cartel
  cartel.addEventListener('mousemove', (evento) => moverRaton(evento.clientX, evento.clientY));
  cartel.addEventListener('mouseleave', salirDelCartel);

  // Táctil: deslizar el dedo produce el mismo parallax
  cartel.addEventListener('touchmove', (evento) => {
    const toque = evento.touches[0];
    if (toque) moverRaton(toque.clientX, toque.clientY);
  }, { passive: true });
  cartel.addEventListener('touchend', salirDelCartel, { passive: true });

  // Táctil: tocar fuera del regalo lo "suelta"
  document.addEventListener('touchstart', (evento) => {
    if (!regalo.contains(evento.target)) desactivarRegalo();
  }, { passive: true });

  // Botón COLABORA
  cta.addEventListener('click', pulsarColabora);

  // Ventana: reescalar el cartel
  window.addEventListener('resize', ajustarEscala);
}

/* =====================================================================
   13. Arranque
   ===================================================================== */
function iniciar() {
  ajustarEscala();
  document.body.classList.add('escala-lista');

  if (sinHover) {
    pista.textContent = 'Toca el regalo · desliza el dedo sobre el cartel';
  }

  const palabras = document.querySelectorAll('[data-letras]');
  palabras.forEach(dividirEnLetras);

  // Se espera a las fuentes para medir el titular con la tipografía correcta
  const fuentesListas = document.fonts ? document.fonts.ready : Promise.resolve();
  fuentesListas.then(() => {
    palabras.forEach(ajustarTitular);
    cartel.classList.add('listo');   // dispara las animaciones de entrada
  });

  registrarEventos();
  requestAnimationFrame(animarParallax);
}

iniciar();
