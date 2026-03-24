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
      // Fetch real data from API
      const [oRes, cRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/containers')
      ]);
      
      if (!oRes.ok || !cRes.ok) throw new Error('Мэдээлэл татахад алдаа гарлаа');

      const orders = await oRes.json();
      const containers = await cRes.json();

      const order = orders.find(o => (o.order_id || o.orderId || '').toUpperCase() === orderId);
      
      if (!order) {
        throw new Error('Захиалга олдсонгүй (Олдсонгүй).');
      }

      let containerStatus = order.status || 'checking'; // Default
      const cId = order.container_id || order.containerId;
      if (cId) {
         const c = containers.find(x => x.id === cId);
         if (c) containerStatus = c.status;
      }

      const STATUSES = {
         'checking': 'Шалгаж байна',
         'picking_up': 'Хаягаар очиж байна',
         'loaded': 'Контейнерт ачигдлаа',
         'departed': 'Инчоноос хөдөлсөн',
         'in_transit': 'Ачаа замдаа явж байна',
         'arrived': 'Монголд ачаа буусан',
         'delivered': 'Хүргэгдсэн'
      };

      const STATUS_TIMELINE = [
         'checking', 'picking_up', 'loaded', 'departed', 'in_transit', 'arrived', 'delivered'
      ];

      resOrderId.textContent = order.order_id || order.orderId;
      
      const isComplete = containerStatus === 'delivered' || containerStatus === 'arrived';
      const statusLabel = STATUSES[containerStatus] || 'Шалгаж байна';

      if (isComplete) {
         resBadge.className = 'px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-700';
         resBadge.textContent = statusLabel;
      } else {
         resBadge.className = 'px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-100 text-primary';
         resBadge.textContent = statusLabel;
      }

      resSender.textContent = order.sender_name || (order.sender ? order.sender.name : 'Тодорхойгүй');
      resReceiver.textContent = order.receiver_name || (order.receiver ? order.receiver.name : 'Тодорхойгүй');
      resItem.textContent = `${order.item_category || (order.item ? order.item.category : '')} (${order.item_quantity || (order.item ? order.item.quantity : 1)}ш)`;
      resBranch.textContent = order.branch || 'Улаанбаатар';

      // Generate mock logs for ALL statuses
      let logs = [];
      const currentIdx = STATUS_TIMELINE.indexOf(containerStatus);
      
      // Loop from the end to the beginning so that 'arrived' is at the top
      for(let i = STATUS_TIMELINE.length - 2; i >= 0; i--) { // skip 'delivered' for now to match exactly 6 admin statuses
         const st = STATUS_TIMELINE[i];
         const isCompleted = i <= currentIdx;
         const isCurrent = i === currentIdx;
         
         let dStr = '';
         if (isCompleted) {
            const basetime = order.date ? new Date(order.date).getTime() : Date.now();
            const d = new Date(basetime + (i * 3600000 * 24)); // add days
            dStr = d.toISOString();
         }

         logs.push({
            status: STATUSES[st],
            logged_at: dStr,
            location: (st === 'departed' || st === 'loaded') ? 'Инчон, БНСУ' : ((st === 'arrived') ? 'Улаанбаатар, МНГ' : ''),
            description: '',
            isCompleted: isCompleted,
            isCurrent: isCurrent
         });
      }

      // Render Timeline
      timelineContainer.innerHTML = '';
      if (logs.length > 0) {
        logs.forEach((log, index) => {
          const isLastNode = index === logs.length - 1;
          let dateHtml = '';
          if (log.isCompleted && log.logged_at) {
             const date = new Date(log.logged_at);
             const mo = String(date.getMonth() + 1).padStart(2, '0');
             const da = String(date.getDate()).padStart(2, '0');
             let hr = date.getHours();
             const ampm = hr >= 12 ? '오후' : '오전';  
             hr = hr % 12; hr = hr ? hr : 12;
             const min = String(date.getMinutes()).padStart(2, '0');
             dateHtml = `<div>${mo}. ${da}.</div><div>${ampm} ${String(hr).padStart(2,'0')}:${min}</div>`;
          }

          const activeClasses = log.isCurrent ? 'bg-primary text-white border-primary shadow-md' : 'bg-primary/10 text-primary border-transparent';
          const inactiveClasses = 'bg-slate-100 text-slate-300 border-white';
          
          const iconCircle = log.isCompleted 
             ? (log.isCurrent ? `<span class="material-symbols-outlined text-[16px] filled">location_on</span>` : `<span class="material-symbols-outlined text-[16px]">check</span>`)
             : `<span class="material-symbols-outlined text-[16px] opacity-0">check</span>`;

          const circleColor = log.isCompleted ? (log.isCurrent ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600') : inactiveClasses;
          
          // Next log in sequence determines color of the line pointing downwards
          const connectorColor = log.isCompleted && !log.isCurrent ? 'bg-slate-200' : 'bg-slate-100';

          const nodeHtml = `
            <div class="timeline-node flex gap-4 ${log.isCurrent ? 'active' : ''}">
              <div class="flex flex-col items-center z-10 relative">
                ${!isLastNode ? `<div class="w-0.5 absolute top-6 bottom-0 ${connectorColor} -z-10" style="left: 50%; transform: translateX(-50%); height: calc(100% + 10px);"></div>` : ''}
                <div class="w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 relative z-10 ${circleColor}">
                  ${iconCircle}
                </div>
              </div>
              <div class="flex-1 pb-6 pt-1">
                <div class="flex justify-between items-start mb-1">
                  <h4 class="font-bold text-[15px] ${log.isCurrent ? 'text-primary' : (log.isCompleted ? 'text-gray-900' : 'text-slate-400')} leading-tight">${log.status}</h4>
                  <div class="text-[11px] ${log.isCompleted ? 'text-slate-500' : 'text-slate-300'} font-medium text-right leading-tight min-w-[45px]">
                    ${dateHtml}
                  </div>
                </div>
                ${log.location ? `<div class="text-[12px] font-bold ${log.isCurrent ? 'text-primary' : (log.isCompleted ? 'text-gray-500' : 'text-slate-300')} mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">pin_drop</span> ${log.location}</div>` : ''}
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
