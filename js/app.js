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
const maxPages = 10; // Máximo de páginas que mostramos (1pag = 20pel)

function main() {
  // Renderizamos la página
  renderPage(pageActual, isLogged);

  // Lógica de usuario logueado, si no está se no permitimos
  // entrar al contenido y redirigimos a index. Si está,
  // cargamos el contenido según la página
  if (isLogged && pageActual === 'main.html') {
    showContentFilms(pagination);
  } else if (isLogged && pageActual === 'detail.html') {
    showDetailFilm();
  } else if (
    !isLogged &&
    (pageActual === 'main.html' || pageActual === 'detail.html')
  ) {
    window.location = `index.html`;
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
    const btnOpenModalCond = document.querySelector('#btn-open-cond');
    const btnCloseModalCond = document.querySelector('#btn-close-cond');
    const countryDefault = [
      '-- PAIS* --',
      '----------',
      'España',
      '----------',
      'Otro',
    ];
    const provDefault = ['-- PROVINCIA* --', 'Madrid', 'Otra'];

    // Consulta lista de paises (API REST Countries)
    fetch('https://restcountries.eu/rest/v2/all?fields=nativeName')
      .then(response => response.json())
      .then(data => {
        const countryArr = data.map(ele => ele.nativeName);
        countryArr.unshift('-- PAIS* --', '----------', 'España', '----------');
        setSelect('s-nation', countryArr);
      })
      .catch(err => {
        // Si hay error en la consulta cargamos la opcion por defecto,
        // no depender de un API de terceros para registrar
        console.log(err);
        setSelect('s-nation', countryDefault);
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
      })
      .catch(err => {
        // Si hay error en la consulta cargamos la opcion por defecto
        console.log(err);
        setSelect('s-prov', provDefault);
      });

    // Modal condiciones, mostrar y ocultar
    btnCloseModalCond.addEventListener('click', () => {
      //console.log(ev);
      document.querySelector('#modal1').classList.remove('is-visible');
    });
    btnOpenModalCond.addEventListener('click', () => {
      //console.log(ev);
      document.querySelector('#modal1').classList.add('is-visible');
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

    // Submit form
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
  async function onClickRegister(ev) {
    ev.preventDefault();
    const dataUser = {};

    const messValForm = regForm.querySelector('.form-field.validate');

    // Validamos el formulario de registro
    if (validateForm(regForm)) return;

    // Evaluamos que sea un API key válido
    dataUser.apikey = regForm.querySelector('input#i-apikey').value;
    if (!(await checkValidAPIkey(dataUser.apikey))) {
      displayMessageForm(
        messValForm,
        'error',
        'El API key no es válido!, por favor revísalo'
      );
      return;
    }

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
      // Guardamos la configuracion del api en sessionStorage
      if (!getAPIConfig(findUser.apikey)) {
        displayMessageForm(messValForm, 'error', 'Error de conexion a la API');
        return;
      }

      // Mostramos login correcto y guardamos el usuario en
      // sessionStorage, lo usamos mientras esté logueado
      displayMessageForm(messValForm, 'success', 'Login correcto!');
      sessionStorage.setItem('userLogged', JSON.stringify(findUser));

      // redirigimos a la página del contenido
      setTimeout(() => {
        window.location = `main.html`;
      }, 1000);
    }
  }
}

// Muestra la lista de películas con paginación
async function showContentFilms(pag) {
  try {
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

    // Hacemos la consulta
    const response = await fetch(url);

    // Obtenemos los datos de respuesta
    const data = await response.json();

    // Comprobamos si hubo error, para tal caso generamos el mensaje
    if (response.status < 200 || response.status >= 300) {
      // console.log(data);
      throw new Error(`ERROR ${response.status}! ${data.status_message}`);
    }

    // Generamos el html de las películas obtenidas
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

    // Mostarmos contenido
    document.querySelector('div.films-container').innerHTML = html;
    document.querySelector('div.films').classList.remove('nodisplay');
  } catch (err) {
    // Mostramos el error
    // console.dir(err);
    document.querySelector('div.err-msg').innerHTML = `<h2>${err.message}</h2>`;
    document.querySelector('div.err-msg').classList.remove('nodisplay');
  }
}

// Muestra los detalles de una película en una página independiente
async function showDetailFilm() {
  try {
    // Obtenemos los parametros de la query string,
    // en la query debe venir siempre el id de la
    // pelicula, porque en el contenido ya lo generamos
    const params = new URLSearchParams(window.location.search);

    let url = 'https://api.themoviedb.org/3/movie';
    url += `/${params.get('id')}`;
    url += `?api_key=${userLogged.apikey}`;
    url += `&language=es-ES`;

    // Hacemos consulta de info detallada
    const response = await fetch(url);

    // Obtenemos los datos de respuesta
    const dataFilm = await response.json();

    // Comprobamos si hubo error, para tal caso generamos el mensaje
    if (response.status < 200 || response.status >= 300) {
      // console.log(data);
      throw new Error(`ERROR ${response.status}! ${dataFilm.status_message}`);
    }

    //console.log(dataFilm);

    const html = `
        <h2>${dataFilm.title}</h2>
        <div>
          <img src="${apiConfig.images.secure_base_url}w780${dataFilm.backdrop_path}" alt="" />
        </div>
  
        <div class="film-info">
          <h3>Genero</h3>
          <p>${dataFilm.genres[0].name}</p>
          <h3>Sinopsis</h3>
          <p>
            ${dataFilm.overview}
          </p>
          <p>
            <span>Fecha de lanzamiento:</span> ${dataFilm.release_date}
            <span>Puntuación media:</span> ${dataFilm.vote_average}
          </p>
        </div>
      `;
    document.querySelector('div.detail-container').innerHTML = html;
    document
      .querySelector('div.detail-container')
      .classList.remove('nodisplay');
  } catch (err) {
    // Mostramos el error
    // console.dir(err);
    document.querySelector('div.err-msg').innerHTML = `<h2>${err.message}</h2>`;
    document.querySelector('div.err-msg').classList.remove('nodisplay');
  }
}

// Obtener la config del API (rutas imagen, tamaños, etc.)
// con el API key y la guardamos como variable de sesion
async function getAPIConfig(apikey) {
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
async function checkValidAPIkey(apikey) {
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

// Con todo el documento cargado, lanzamos main
document.addEventListener('DOMContentLoaded', main);
