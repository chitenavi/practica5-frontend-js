import {
  templTitle,
  templHeader,
  templFooter,
} from '../templates/templates.js';

export function renderPage(page, logged) {
  // Render titulo de la pagina
  document.querySelector('title').innerText = templTitle.render(page);

  // Render header
  document.querySelector('header').innerHTML = templHeader.render(page, logged);

  // Render footer
  document.querySelector('footer').innerHTML = templFooter.render();
}

export function setSelect(id, data) {
  let html = '';

  data.forEach(element => {
    html += `
        <option>${element}</option>
        `;
  });
  document.querySelector(`#${id}`).innerHTML = html;
}
