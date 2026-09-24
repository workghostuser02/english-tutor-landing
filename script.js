const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});

nav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
});

const form = document.querySelector('#demo-form');
const status = document.querySelector('#form-status');
const requiredFields = form ? [...form.querySelectorAll('[required]')] : [];

const messages = {
  name: 'Введите не меньше двух символов.',
  contact: 'Введите не меньше пяти символов.',
  goal: 'Выберите цель занятий.'
};

function showFieldState(field) {
  const error = document.querySelector(`#${field.id}-error`);
  const valid = field.checkValidity();
  field.setAttribute('aria-invalid', String(!valid));
  if (error) error.textContent = valid ? '' : messages[field.id];
  return valid;
}

requiredFields.forEach((field) => {
  field.addEventListener('blur', () => showFieldState(field));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') showFieldState(field);
  });
  field.addEventListener('change', () => showFieldState(field));
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const validity = requiredFields.map(showFieldState);
  const firstInvalid = requiredFields.find((field) => !field.checkValidity());
  if (firstInvalid) {
    status.hidden = true;
    firstInvalid.focus();
    return;
  }
  status.hidden = false;
  status.textContent = 'Готово: поля заполнены корректно. Это демонстрация — данные не сохранены и никуда не отправлены.';
});
