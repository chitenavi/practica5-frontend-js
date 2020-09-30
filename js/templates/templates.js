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
      case 'usuario.html':
        titulo = 'Usuario';
        break;
      default:
        titulo = 'Inicio';
        break;
    }
    return `InfoPelis - ${titulo}`;
  },
};

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
      case 'usuario.html':
        titulo = 'Peliculas más populares';
        menu = `
          <li><a id="btn-logout" href="./index.html">Logout</a></li>
        `;
        break;
      case 'detail.html':
        titulo = 'Info de la Película';
        menu = `
            <li><a href="./usuario.html">Peliculas</a></li>
            <li><a id="btn-logout" href="./index.html">Logout</a></li>
          `;
        break;
      default:
        titulo = 'Bienvenido a InfoPelis';
        if (logged) {
          menu = `
          <li><a href="./usuario.html">Peliculas</a></li>
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

export const templFooter = {
  render: () => {
    return `<p>Todos los derechos reservados. InfoPelis</p>`;
  },
};
