import { templTitle, templHeader, templFooter } from './templates/templates.js';

// Página actual
const pos = window.location.pathname.lastIndexOf('/') + 1;
const pageActual = window.location.pathname.slice(pos);

// Usuario logueado
const userLogged = sessionStorage.getItem('userLogged')
  ? JSON.parse(sessionStorage.getItem('userLogged'))
  : null;
const isLogged = !!userLogged;

function renderPage(page, logged) {
  // Render titulo de la pagina
  document.querySelector('title').innerText = templTitle.render(page);

  // Render header
  document.querySelector('header').innerHTML = templHeader.render(page, logged);

  // Render footer
  document.querySelector('footer').innerHTML = templFooter.render();
}

function main() {
  // Renderizamos la página
  renderPage(pageActual, isLogged);
}

document.addEventListener('DOMContentLoaded', main);
