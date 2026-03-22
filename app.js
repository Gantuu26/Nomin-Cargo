/* ========================================
   NOMIN CARGO - Application Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ========== BANNER SCROLL (hide scrollbar + start at 2nd card) ==========
  const bannerScroll = document.getElementById('bannerScroll');
  if (bannerScroll) {
    bannerScroll.style.cssText += ';scrollbar-width:none;-ms-overflow-style:none;';
    const style = document.createElement('style');
    style.textContent = '#bannerScroll::-webkit-scrollbar{display:none}';
    document.head.appendChild(style);

    // Scroll to the 2nd card (index 1) on load so both sides peek
    const cards = bannerScroll.querySelectorAll('.snap-center');
    if (cards.length > 1) {
      requestAnimationFrame(() => {
        cards[1].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
      });
    }
  }

  // ========== STATE ==========
  let currentType = 'standard'; // 'standard' | 'express'

  // ========== DOM ELEMENTS ==========
  const cardStandard = document.getElementById('cardStandard');
  const cardExpress = document.getElementById('cardExpress');
  const orderBtn = document.getElementById('orderBtn');

  // ========== CARD SELECTION ==========
  function selectCard(type) {
    currentType = type;

    // Standard card
    if (type === 'standard') {
      cardStandard.classList.add('selected');
      cardStandard.classList.remove('bg-surface-container-low', 'border-gray-100');
      cardStandard.classList.add('bg-white', 'border-primary', 'border-2');
      cardStandard.querySelector('.card-check-icon').classList.remove('hidden');

      cardExpress.classList.remove('selected');
      cardExpress.classList.add('bg-surface-container-low');
      cardExpress.classList.remove('border-primary', 'border-tertiary', 'border-2');
      cardExpress.classList.add('border', 'border-gray-100');
      cardExpress.querySelector('.card-check-icon').classList.add('hidden');

      // Price color
      cardStandard.querySelector('p').classList.add('text-primary');
      cardStandard.querySelector('p').classList.remove('text-on-surface');
      cardExpress.querySelector('p').classList.remove('text-tertiary');
      cardExpress.querySelector('p').classList.add('text-on-surface');
    } else {
      cardExpress.classList.add('selected');
      cardExpress.classList.remove('bg-surface-container-low', 'border-gray-100', 'border');
      cardExpress.classList.add('bg-white', 'border-tertiary', 'border-2');
      cardExpress.querySelector('.card-check-icon').classList.remove('hidden');

      cardStandard.classList.remove('selected');
      cardStandard.classList.remove('border-primary', 'border-2');
      cardStandard.classList.add('bg-surface-container-low', 'border', 'border-gray-100');
      cardStandard.querySelector('.card-check-icon').classList.add('hidden');

      // Price color
      cardExpress.querySelector('p').classList.add('text-tertiary');
      cardExpress.querySelector('p').classList.remove('text-on-surface');
      cardStandard.querySelector('p').classList.remove('text-primary');
      cardStandard.querySelector('p').classList.add('text-on-surface');
    }
  }

  cardStandard.addEventListener('click', () => selectCard('standard'));
  cardExpress.addEventListener('click', () => selectCard('express'));

  // ========== NAVIGATION ==========
  function triggerOrderNavigation() {
    window.location.href = 'order.html?type=' + currentType;
  }

  // Order button
  orderBtn.addEventListener('click', () => triggerOrderNavigation());

  // Nav link for order
  document.querySelectorAll('.nav-link[data-action="order"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      triggerOrderNavigation();
    });
  });

  // Initialize
  selectCard('standard');

});
