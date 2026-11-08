/**
 * Script de arranque (inline, antes del contenido): activa el modo "reveal" para que los
 * elementos animables partan ocultos sin parpadeo. Si en 2,5 s los efectos no se inicializaron
 * (JS bloqueado o con error), lo desactiva y todo el contenido queda visible.
 */
export const REVEAL_BOOT = `(function(){try{var d=document.documentElement;if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('reveal-on');setTimeout(function(){if(!d.classList.contains('reveal-ready'))d.classList.remove('reveal-on')},2500)}catch(e){}})();`;
