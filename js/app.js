import { renderPage, setSelect } from './utils/tools.js';

import {
  validateForm,
  inlineValidity,
  displayMessageForm,
} from './utils/validateForm.js';

/*--- Global Variables --*/
// LocalStorage list users
const storeUsers = 'usersReg';

// Página actual
const pos = window.location.pathname.lastIndexOf('/') + 1;
const pageActual = window.location.pathname.slice(pos);

// Usuario logueado
const userLogged = sessionStorage.getItem('userLogged')
  ? JSON.parse(sessionStorage.getItem('userLogged'))
  : null;
const isLogged = !!userLogged;

// Configuracion del API
const apiConfig = sessionStorage.getItem('apiConfig')
  ? JSON.parse(sessionStorage.getItem('apiConfig'))
  : null;

// Paginación de Películas
let pagination = 1;
const maxPages = 10; // Máximo de páginas que mostramos (1pg=20pel)

function main() {
  // Renderizamos la página
  renderPage(pageActual, isLogged);

  // Lógica de usuario logueado, si no está se redirige a index,
  // en caso contrario, cargamos la página correspondiente
  if (userLogged && pageActual === 'main.html') {
    showContentFilms(pagination);
  } else if (userLogged && pageActual === 'detail.html') {
    //showDetailFilm();
  }

  //-- Nodos de DOM --
  const regForm = document.querySelector('#form-register');
  const logForm = document.querySelector('#form-login');
  const btnLogout = document.querySelector('#btn-logout');
  const btnNextFilms = document.querySelector('#btn-next');
  const btnPrevFilms = document.querySelector('#btn-prev');

  //-- Definición de eventos --
  if (regForm) {
    // Formulario de registro
    const inputs = regForm.querySelectorAll('input');
    const selects = regForm.querySelectorAll('select');
    const comment = regForm.querySelector('textarea');

    // Consulta lista de paises (API REST Countries)
    fetch('https://restcountries.eu/rest/v2/all?fields=nativeName')
      .then(response => response.json())
      .then(data => {
        const dataArr = data.map(ele => ele.nativeName);
        dataArr.unshift('-- PAIS* --', '----------', 'España', '----------');
        setSelect('s-nation', dataArr);
      });

    // Consulta lista de provincias
    fetch(
      'https://raw.githubusercontent.com/IagoLast/pselect/master/data/provincias.json'
    )
      .then(response => response.json())
      .then(data => {
        const dataArr = data.map(ele => ele.nm);
        dataArr.unshift('-- PROVINCIA* --');
        setSelect('s-prov', dataArr);
      });

    inputs.forEach(item => {
      item.addEventListener('focus', formElementManager);
      item.addEventListener('input', formElementManager);
      item.addEventListener('blur', formElementManager);
    });

    selects.forEach(item => {
      item.addEventListener('change', formElementManager);
      item.addEventListener('focus', formElementManager);
      item.addEventListener('blur', formElementManager);
    });

    comment.addEventListener('focus', formElementManager);
    comment.addEventListener('blur', formElementManager);

    // Submit form
    regForm
      .querySelector('#btn-register')
      .addEventListener('click', onClickRegister);
  }

  if (logForm) {
    // Formulario de login
    const inputs = logForm.querySelectorAll('input');

    inputs.forEach(item => {
      item.addEventListener('focus', formElementManager);
      item.addEventListener('input', formElementManager);
      item.addEventListener('blur', formElementManager);
    });

    logForm.querySelector('#btn-login').addEventListener('click', onClickLogin);
  }

  // Si el usuario da click en Logout, borramos los datos
  // de sesion y redirigimos a index
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.clear();
      window.location = `index.html`;
    });
  }

  // Lógica de paginación
  if (btnNextFilms) {
    // Aumentamos o disminuimos la página, el límite
    // lo marca maxPages (variable global)
    btnNextFilms.addEventListener('click', () => {
      if (pagination < maxPages) {
        pagination += 1;
      }
      showContentFilms(pagination);
    });
    btnPrevFilms.addEventListener('click', () => {
      if (pagination > 1) {
        pagination -= 1;
      }
      showContentFilms(pagination);
    });
  }

  //--- Funciones Manejadoras ----

  // Acciones en el formulario de Registro y Login
  // con validación inline
  function formElementManager(ev) {
    if (ev.type === 'focus') {
      ev.target.classList.add('border-focus');
    } else if (ev.type === 'change' || ev.type === 'input') {
      inlineValidity(ev.target);

      if (ev.target.id === 's-nation') {
        const selProv = regForm.querySelector('#s-prov');
        if (ev.target.value === 'España') {
          selProv.disabled = false;
        } else {
          selProv.disabled = true;
          selProv.classList.remove('border-success');
          selProv.classList.remove('border-error');
          selProv.value = '-- PROVINCIA* --';
          selProv.parentElement.nextElementSibling.classList.add('nodisplay');
        }
      }
    } else if (ev.type === 'blur') {
      ev.target.classList.remove('border-focus');
      if (ev.target.type !== 'textarea') {
        inlineValidity(ev.target);
      }
    }
  }

  // Enviar formulario de Registro
  function onClickRegister(ev) {
    ev.preventDefault();
    const dataUser = {};

    const messValForm = regForm.querySelector('.form-field.validate');

    // Validamos el formulario de registro
    if (validateForm(regForm)) return;

    // Si valida recogemos datos y formamos los datos de usuario
    dataUser.gendre = [...regForm.querySelectorAll('[name="genero"]')].filter(
      item => item.checked
    )[0].value;

    dataUser.name = regForm.querySelector('input#i-name').value;

    dataUser.surname = regForm.querySelector('input#i-surname').value;

    dataUser.country = regForm.querySelector('select#s-nation').value;

    if (dataUser.country === 'España') {
      dataUser.region = regForm.querySelector('select#s-prov').value;
    }

    dataUser.phone = regForm.querySelector('input#i-telf').value;

    dataUser.username = regForm.querySelector('input#i-username').value;

    dataUser.email = regForm.querySelector('input#i-email').value;

    dataUser.password = regForm.querySelector('input#i-password').value;

    dataUser.apikey = regForm.querySelector('input#i-apikey').value;

    dataUser.comment = regForm.querySelector('textarea').value;

    console.log(dataUser);

    // Obtenemos los datos del LocalStorage
    const usersArray = window.localStorage.getItem(storeUsers)
      ? JSON.parse(window.localStorage.getItem(storeUsers))
      : [];

    // Incluimos al nuevo usuario y guardamos de nuevo
    usersArray.push(dataUser);
    window.localStorage.setItem(storeUsers, JSON.stringify(usersArray));

    // Mensaje de usuario creado y redirigimos al login
    displayMessageForm(messValForm, 'success', 'Usuario registrado con éxito!');
    setTimeout(() => {
      window.location = 'login.html';
    }, 1000);
  }

  // Enviar formulario de Login
  function onClickLogin(ev) {
    ev.preventDefault();
    const username = logForm.querySelector('#i-username');
    const password = logForm.querySelector('#i-password');

    const messValForm = logForm.querySelector('.form-field.validate');

    // Validamos formulario login
    if (validateForm(logForm)) return;

    // Obtenemos los datos de usuarios guardados
    const usersArray = window.localStorage.getItem(storeUsers)
      ? JSON.parse(window.localStorage.getItem(storeUsers))
      : [];

    // Buscamos el usuario
    const findUser = usersArray.find(item => item.username === username.value);

    // Comprobamos que el usuario esta registrado y su password es correcto
    if (!findUser) {
      displayMessageForm(
        messValForm,
        'error',
        'Este usuario no está registrado!'
      );
    } else if (findUser.password !== password.value) {
      displayMessageForm(messValForm, 'error', 'Password incorrecto!');
    } else {
      // Mostramos login correcto y guardamos el usuario en
      // sessionStorage, lo usamos mientras esté logueado

      displayMessageForm(messValForm, 'success', 'Login correcto!');
      sessionStorage.setItem('userLogged', JSON.stringify(findUser));

      // Guardamos la configuracion del api en sessionStorage
      getAPIConfig(findUser.apikey);

      // redirigimos a la página del contenido
      setTimeout(() => {
        window.location = `main.html`;
      }, 1000);
    }
  }
}

// Muestra la lista de películas con paginación
async function showContentFilms(pag) {
  let url = 'https://api.themoviedb.org/3/movie/popular';
  url += `?api_key=${userLogged.apikey}`;
  url += `&page=${pag}`;
  url += '&language=es-ES';

  // Logica de boton next y prev
  if (pag === 1) {
    document.querySelector('#btn-prev').classList.add('oculto');
  } else if (pag > 1 && pag < maxPages) {
    document.querySelector('#btn-prev').classList.remove('oculto');
    document.querySelector('#btn-next').classList.remove('oculto');
  } else if (pag === maxPages) {
    document.querySelector('#btn-next').classList.add('oculto');
  }

  /*
  fetch()
    .then(resp => {
      console.log(resp);
      if (resp.status < 200 || resp.status >= 300) {
        console.log(resp.statusText);
        throw new Error('HTTP Error ' + resp.status);
      }
      return resp.json();
    })
    .then(data => {
      configApi = data.images;
      procesarPelis()
    })
    .catch(error => console.log(error.message));
*/
  const response = await fetch(url);
  const data = await response.json();

  if (!data) {
    return;
  }

  let html = '';
  data.results.forEach(item => {
    const imagePath = `${apiConfig.images.secure_base_url}w154${item.poster_path}`;
    html += `
    <a href="./detail.html?id=${item.id}" class="card-film">
      <div class="cover-img">
        <img
            src=${imagePath}
            alt=${item.title}
        />
      </div>
      <div class="info-film">
        <p><span>ID:</span> ${item.id}</p>
        <p><span>Titulo:</span> ${item.title}</p>
      </div>
    </a>
    `;
  });

  document.querySelector('div.films').classList.remove('nodisplay');
  document.querySelector('div.films-container').innerHTML = html;
}

// Obtener la config del API con el API key y la guardamos
// como variable de sesion
async function getAPIConfig(apikey) {
  const response = await fetch(
    `https://api.themoviedb.org/3/configuration?api_key=${apikey}`
  );
  const configApi = await response.json();

  sessionStorage.setItem('apiConfig', JSON.stringify(configApi));
}

document.addEventListener('DOMContentLoaded', main);
