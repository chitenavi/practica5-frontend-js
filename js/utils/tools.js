import {
  templTitle,
  templHeader,
  templFooter,
} from '../templates/templates.js';

// Función de renderizado del HTML
export function renderPage(page, logged) {
  // Render titulo de la pagina
  document.querySelector('title').innerText = templTitle.render(page);

  // Render header
  document.querySelector('header').innerHTML = templHeader.render(page, logged);

  // Render footer
  document.querySelector('footer').innerHTML = templFooter.render();
}

// Función para setear los selects
export function setSelect(id, data) {
  let html = '';

  data.forEach(element => {
    html += `
        <option>${element}</option>
        `;
  });
  document.querySelector(`#${id}`).innerHTML = html;
}

// Obtener la config del API (rutas imagen, tamaños, etc.)
// con el API key y la guardamos como variable de sesion
export async function getAPIConfig(apikey) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/configuration?api_key=${apikey}`
    );
    const configApi = await response.json();
    if (response.status < 200 || response.status >= 300) {
      // console.log(data);
      throw new Error(`ERROR ${response.status}! ${configApi.status_message}`);
    }

    sessionStorage.setItem('apiConfig', JSON.stringify(configApi));
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

// Check de API key válido
export async function checkValidAPIkey(apikey) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}`
    );
    const configApi = await response.json();

    // Si la API Key no es válida, responde 401
    if (response.status === 401) {
      throw new Error(configApi.status_message);
    }
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
}
