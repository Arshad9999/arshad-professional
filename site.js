const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const compact = matchMedia('(max-width: 820px)');

function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
}
menu.hidden = false;
menu.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') !== 'true'));
});
nav.addEventListener('click', closeMenu);
compact.addEventListener('change', closeMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});

const gallery = document.querySelector('.gallery');
if (gallery) {
  const cards = Array.from(gallery.querySelectorAll('.project-card'));
  const controls = document.querySelector('.gallery-controls');
  const status = document.querySelector('.gallery-status');
  let active = 0;

  function select(index, announce = true) {
    active = (index + cards.length) % cards.length;
    for (const [i, card] of cards.entries()) {
      const offset = (i - active + cards.length) % cards.length;
      card.dataset.slot = ['center', 'right', 'left'][offset];
      const link = card.querySelector('a');
      const selectButton = card.querySelector('button');
      selectButton.hidden = compact.matches || i === active;
      selectButton.tabIndex = -1;
      link.tabIndex = compact.matches || i === active ? 0 : -1;
    }
    controls.hidden = compact.matches;
    if (announce && !compact.matches) {
      status.textContent = cards[active].querySelector('h3').textContent + ', project ' + (active + 1) + ' of ' + cards.length;
    }
  }

  controls.addEventListener('click', event => {
    const control = event.target.closest('[data-step]');
    if (control) select(active + Number(control.dataset.step));
  });
  for (const [index, card] of cards.entries()) {
    card.querySelector('.select-card').addEventListener('click', () => select(index));
  }
  document.querySelector('#work').addEventListener('keydown', event => {
    if (compact.matches || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    if (!gallery.contains(event.target) && !controls.contains(event.target)) return;
    event.preventDefault();
    const target = {ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: cards.length - 1};
    const focusProject = gallery.contains(event.target);
    select(target[event.key]);
    if (focusProject) cards[active].querySelector('a').focus({preventScroll: true});
  });
  compact.addEventListener('change', () => select(active, false));
  gallery.classList.add('ready');
  select(0, false);
}
