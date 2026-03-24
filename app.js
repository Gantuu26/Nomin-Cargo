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

// ========== CUSTOM ALERT (GLOBAL) ==========
window.showCustomAlert = function(message, onConfirm, isError = false) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
  
  const icon = isError ? 'error' : 'info';
  const iconColor = isError ? 'text-red-500 bg-red-50 border-red-100/50' : 'text-primary bg-blue-50 border-blue-100/50';
  const title = isError ? 'Алдаа' : 'Мэдэгдэл';
  const btnColor = isError ? 'bg-red-500' : 'bg-primary';
  
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-6 shadow-elevated max-w-sm w-full text-center relative overflow-hidden transform scale-95 transition-transform duration-300">
      <div class="w-16 h-16 ${iconColor} rounded-2xl flex items-center justify-center mx-auto mb-4 border">
        <span class="material-symbols-outlined text-[32px] filled">${icon}</span>
      </div>
      <h3 class="text-[18px] font-bold text-gray-900 mb-2">${title}</h3>
      <p class="text-[14px] text-slate-500 mb-6 leading-relaxed">${message}</p>
      <button class="w-full py-3.5 ${btnColor} text-white rounded-xl font-bold text-[15px] shadow-btn hover:shadow-lg active:scale-[0.98] transition-all">
        Ойлголоо
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.remove('opacity-0');
    overlay.querySelector('div.bg-white').classList.remove('scale-95');
  });

  overlay.querySelector('button').addEventListener('click', () => {
    overlay.classList.add('opacity-0');
    overlay.querySelector('div.bg-white').classList.add('scale-95');
    setTimeout(() => {
      if(document.body.contains(overlay)) document.body.removeChild(overlay);
      if (onConfirm) onConfirm();
    }, 300);
  });
};

  // ========== NAVIGATION ==========
  function triggerOrderNavigation() {
    const userStr = localStorage.getItem('nomin_user');
    if (!userStr) {
      showCustomAlert('Та захиалга өгөхийн тулд эхлээд нэвтэрч орно уу.', () => {
        window.location.href = 'login';
      });
      return;
    }
    window.location.href = 'order.html?type=' + currentType;
  }

  // Order button
  if (orderBtn) {
    orderBtn.addEventListener('click', () => triggerOrderNavigation());
  }

  // Nav links for order
  document.querySelectorAll('a[href="order"], a[href^="order.html?"], .nav-link[data-action="order"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const userStr = localStorage.getItem('nomin_user');
      if (!userStr) {
        showCustomAlert('Та захиалга өгөхийн тулд эхлээд нэвтэрч орно уу.', () => {
          window.location.href = 'login';
        });
        return;
      }
      const targetHref = link.getAttribute('href');
      if (targetHref && targetHref.startsWith('order.html')) {
        window.location.href = targetHref;
      } else {
        triggerOrderNavigation();
      }
    });
  });
  // Initialize
  selectCard('standard');

});
