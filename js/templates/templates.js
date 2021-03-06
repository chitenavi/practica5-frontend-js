// Título de la página
export const templTitle = {
  render: title => {
    let titulo;
    switch (title) {
      case 'login.html':
        titulo = 'Login';
        break;
      case 'registro.html':
        titulo = 'Registro';
        break;
      case 'main.html':
        titulo = 'Main';
        break;
      default:
        titulo = 'Inicio';
        break;
    }
    return `InfoPelis - ${titulo}`;
  },
};

// Header, cambia en función del usuario logueado
export const templHeader = {
  render: (title, logged = false) => {
    let menu;
    let titulo;
    switch (title) {
      case 'login.html':
        titulo = 'Acceso a InfoPelis';
        menu = `
          <li><a href="./registro.html">Registrar</a></li>
        `;
        break;
      case 'registro.html':
        titulo = 'Crear Cuenta en InfoPelis';
        menu = `
          <li><a href="./login.html">Login</a></li>
        `;
        break;
      case 'main.html':
        titulo = 'Peliculas más populares';
        menu = `
          <li><a id="btn-logout" href="./index.html">Logout</a></li>
        `;
        break;
      case 'detail.html':
        titulo = 'Info de la Película';
        menu = `
            <li><a href="./main.html">Peliculas</a></li>
            <li><a id="btn-logout" href="./index.html">Logout</a></li>
          `;
        break;
      default:
        titulo = 'Bienvenido a InfoPelis';
        if (logged) {
          menu = `
          <li><a href="./main.html">Peliculas</a></li>
          <li><a id="btn-logout" href="./index.html">Logout</a></li>
        `;
        } else {
          menu = `
          <li><a href="./registro.html">Registrar</a></li>
          <li><a href="./login.html">Login</a></li>
        `;
        }
        break;
    }
    return `
    <nav class="menu">
        <div class="logo">
          <a href="./index.html">Home</a>
        </div>
        <ul>
          ${menu}
        </ul>
    </nav>
    <h1 class="title">${titulo}</h1>
    `;
  },
};

// Footer
export const templFooter = {
  render: () => {
    const year = new Date().getFullYear();
    return `<p>Todos los derechos reservados. InfoPelis ${year}</p>`;
  },
};
