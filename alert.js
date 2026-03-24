// ========== CUSTOM ALERT (GLOBAL) ==========
window.showCustomAlert = function(message, onConfirm, isError = false) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
  
  const icon = isError ? 'error' : 'info';
  const iconColor = isError ? 'text-red-500 bg-red-50 border-red-100/50' : 'text-primary bg-blue-50 border-blue-100/50';
  const title = isError ? 'Алдаа' : 'Мэдэгдэл';
  const btnColor = isError ? 'bg-red-500' : 'bg-primary';
  
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-sm w-full text-center relative overflow-hidden transform scale-95 transition-transform duration-300 border border-slate-100">
      <div class="w-16 h-16 ${iconColor} rounded-2xl flex items-center justify-center mx-auto mb-4 border">
        <span class="material-symbols-outlined text-[32px] filled">${icon}</span>
      </div>
      <h3 class="text-[18px] font-bold text-gray-900 mb-2">${title}</h3>
      <p class="text-[14px] text-slate-500 mb-6 leading-relaxed">${message}</p>
      <button class="w-full py-3.5 ${btnColor} text-white rounded-xl font-bold text-[15px] shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:shadow-lg active:scale-[0.98] transition-all">
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
