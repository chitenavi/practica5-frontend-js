import { renderPage, setSelect } from './utils/tools.js';

// Página actual
const pos = window.location.pathname.lastIndexOf('/') + 1;
const pageActual = window.location.pathname.slice(pos);

// Usuario logueado
const userLogged = sessionStorage.getItem('userLogged')
  ? JSON.parse(sessionStorage.getItem('userLogged'))
  : null;
const isLogged = !!userLogged;

function main() {
  // Renderizamos la página
  renderPage(pageActual, isLogged);
}

document.addEventListener('DOMContentLoaded', main);
