// Funcion que muestra mensaje en formulario
// dependiendo del tipo, error o exito
export function displayMessageForm(element, type, message) {
  element.innerHTML = `<p>${message}</p>`;
  if (type === 'error') {
    element.classList.remove('success-div');
    element.classList.add('error-div');
  } else if (type === 'success') {
    element.classList.add('success-div');
    element.classList.remove('error-div');
  }
  element.classList.remove('nodisplay');
  setTimeout(() => {
    element.classList.add('nodisplay');
  }, 2500);
}

// Función que valida inline, cada elemento por
// separado con su campo de error
export function inlineValidity(element) {
  const error = element.parentElement.nextElementSibling;
  let errorValMessage = '';

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      if (element.type === 'checkbox') {
        errorValMessage = 'Debes aceptar las condiciones';
      } else {
        errorValMessage = 'Campo obligatorio';
      }
    } else if (element.validity.tooShort || element.validity.tooLong) {
      errorValMessage = `Debe contener entre ${element.minLength} y ${element.maxLength} caracteres`;
    } else if (element.validity.badInput) {
      errorValMessage = `Formato incorrecto (Debe ser ${element.type})`;
    } else if (element.validity.typeMismatch) {
      errorValMessage = `${element.type} inválido`;
    }
  } else if (
    element.type === 'select-one' &&
    (element.value === '-- PAIS* --' || element.value === '----------')
  ) {
    errorValMessage = 'Selecciona un País';
  } else if (
    element.type === 'select-one' &&
    element.value === '-- PROVINCIA* --'
  ) {
    errorValMessage = 'Selecciona una Provincia';
  }

  if (errorValMessage) {
    error.firstElementChild.innerHTML = errorValMessage;
    error.classList.remove('nodisplay');
    element.classList.remove('border-success');
    element.classList.add('border-error');
  } else {
    error.classList.add('nodisplay');
    element.classList.add('border-success');
  }
}

// Funcion de validacion de formulario completo
export function validateForm(form) {
  const messValForm = form.querySelector('.form-field.validate');
  const errorObj = {
    hayError: false,
    code: 'error',
    message: 'Por favor, revisa y completa los campos señalados',
  };

  const elementsToValidate = [
    ...form.querySelectorAll('.form-field .i-single-val'),
  ];

  const passOne = form.querySelector('input#i-password');
  const passTwo = form.querySelector('input#i-passconf');
  const region = form.querySelector('select#s-prov');
  const country = form.querySelector('select#s-nation');

  // Validamos todos los campos del form
  if (!form.checkValidity()) {
    elementsToValidate.forEach(item => {
      if (!item.disabled) inlineValidity(item);
    });

    errorObj.hayError = true;
  }

  // Revisamos el país y su provincia si es España
  if (country && !errorObj.hayError) {
    if (
      country.value === '-- PAIS* --' ||
      (country.value === '----------' && !errorObj.hayError)
    ) {
      inlineValidity(country);
      errorObj.hayError = true;
    }

    if (
      country.value === 'España' &&
      region.value === '-- PROVINCIA* --' &&
      !errorObj.hayError
    ) {
      inlineValidity(region);
      errorObj.hayError = true;
    }
  }

  // Checkeamos los campos de password
  if (passOne && passTwo && !errorObj.hayError) {
    if (passOne.value !== passTwo.value && !errorObj.hayError) {
      passOne.classList.add('border-error');
      passTwo.classList.add('border-error');
      passOne.classList.remove('border-success');
      passTwo.classList.remove('border-success');

      errorObj.hayError = true;
      errorObj.message = 'El password debe coincidir, por favor revísalo';
    }
  }

  // Mostramos los errores si los hay
  if (errorObj.hayError) {
    displayMessageForm(messValForm, errorObj.code, errorObj.message);
  }

  // Retornamos si ha habido error o no
  return errorObj.hayError;
}
