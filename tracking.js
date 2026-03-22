document.addEventListener('DOMContentLoaded', () => {
  const trackingForm = document.getElementById('trackingForm');
  const orderIdInput = document.getElementById('orderIdInput');
  const searchBtn = document.getElementById('searchBtn');
  
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const errorMessage = document.getElementById('errorMessage');
  const resultContainer = document.getElementById('resultContainer');
  const timelineContainer = document.getElementById('timelineContainer');
  
  // Elements to populate
  const resOrderId = document.getElementById('resOrderId');
  const resBadge = document.getElementById('resBadge');
  const resSender = document.getElementById('resSender');
  const resReceiver = document.getElementById('resReceiver');
  const resItem = document.getElementById('resItem');
  const resBranch = document.getElementById('resBranch');

  trackingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = orderIdInput.value.trim().toUpperCase();
    if (!orderId) return;

    // Reset UI
    errorState.classList.add('hidden');
    resultContainer.classList.add('hidden');
    loadingState.classList.remove('hidden');

    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>';
    searchBtn.disabled = true;

    try {
      const res = await fetch(`/api/tracking?id=${encodeURIComponent(orderId)}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error('Захиалга олдсонгүй эсвэл алдаа гарлаа.');
      }

      const order = data.order;
      const logs = data.trackingLogs;

      // Populate Card
      resOrderId.textContent = order.id;
      
      const isComplete = order.status === 'Хүргэгдсэн' || order.status === '배송 완료';
      if (isComplete) {
        resBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700';
        resBadge.textContent = 'Хүргэгдсэн';
      } else {
        resBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-primary';
        resBadge.textContent = 'Тээвэрлэгдэж байна';
      }

      resSender.textContent = order.sender_name;
      resReceiver.textContent = order.receiver_name;
      resItem.textContent = `${order.item_category} (${order.item_quantity}ш)`;
      resBranch.textContent = order.branch;

      // Render Timeline
      timelineContainer.innerHTML = '';
      if (logs && logs.length > 0) {
        logs.forEach((log, index) => {
          const isLatest = index === 0; // assuming logs are sorted DESC
          const date = new Date(log.logged_at);
          const formattedDate = date.toLocaleDateString('mn-MN', { month: '2-digit', day: '2-digit' });
          const formattedTime = date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

          const nodeHtml = `
            <div class="timeline-node flex gap-4 ${isLatest ? 'active' : ''}">
              <div class="flex flex-col items-center z-10">
                <div class="w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${isLatest ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}">
                  <span class="material-symbols-outlined text-[16px] ${isLatest ? 'filled' : ''}">${isLatest ? 'location_on' : 'check'}</span>
                </div>
              </div>
              <div class="flex-1 pb-2">
                <div class="flex justify-between items-start mb-1">
                  <h4 class="font-bold text-[15px] ${isLatest ? 'text-primary' : 'text-gray-900'} leading-tight">${log.status}</h4>
                  <div class="text-[11px] text-gray-400 font-medium text-right leading-tight">
                    <div>${formattedDate}</div>
                    <div>${formattedTime}</div>
                  </div>
                </div>
                ${log.location ? `<div class="text-[12px] font-bold text-gray-500 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">pin_drop</span> ${log.location}</div>` : ''}
                ${log.description ? `<p class="text-[13px] text-gray-600 leading-snug">${log.description}</p>` : ''}
              </div>
            </div>
          `;
          timelineContainer.insertAdjacentHTML('beforeend', nodeHtml);
        });
      }

      // Show Result
      loadingState.classList.add('hidden');
      resultContainer.classList.remove('hidden');

    } catch (err) {
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorMessage.textContent = err.message;
    } finally {
      searchBtn.innerHTML = originalText;
      searchBtn.disabled = false;
    }
  });

  // Check URL parameter for auto-search
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get('id');
  if (idParam) {
    orderIdInput.value = idParam;
    trackingForm.dispatchEvent(new Event('submit'));
  }
});
