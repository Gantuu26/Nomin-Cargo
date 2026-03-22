/* ========================================
   NOMIN CARGO - Order Form Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ========== GET ORDER TYPE FROM URL ==========
  const urlParams = new URLSearchParams(window.location.search);
  const orderType = urlParams.get('type') || 'standard'; // default to standard
  let isExpress = (orderType === 'express');

  // ========== DOM ELEMENTS ==========
  const badgeContainer = document.getElementById('orderTypeBadgeContainer');
  const descriptionContainer = document.getElementById('orderDescriptionContainer');
  const orderForm = document.getElementById('orderForm');
  const imageUploadArea = document.getElementById('imageUploadArea');
  const imageInput = document.getElementById('imageInput');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const imagePreviewGrid = document.getElementById('imagePreviewGrid');
  const submitBtn = document.getElementById('submitBtn');
  const successContainer = document.getElementById('successContainer');
  const successDetails = document.getElementById('successDetails');

  // ========== STATE ==========
  let uploadedImages = [];
  const MAX_IMAGES = 5;

  // ========== SET BADGE & TYPE TOGGLE ==========
  const btnTypeStandard = document.getElementById('btnTypeStandard');
  const btnTypeExpress = document.getElementById('btnTypeExpress');
  const typeToggleBg = document.getElementById('typeToggleBg');

  function renderOrderType() {
    if (isExpress) {
      if (btnTypeExpress) {
        btnTypeExpress.classList.replace('text-gray-500', 'text-gray-900');
        btnTypeStandard.classList.replace('text-gray-900', 'text-gray-500');
        typeToggleBg.style.transform = 'translateX(100%)';
      }
      if (descriptionContainer) {
        descriptionContainer.className = "mb-8 p-4 bg-amber-50 rounded-xl border border-amber-100 text-[13px] text-amber-900 leading-relaxed font-bold";
        descriptionContainer.innerHTML = "✈️ Экспрэсс ачаа: 10~14 хоногт хүргэгдэнэ (5,500 вон/кг)<br><span class=\"font-medium text-[12px] opacity-80 font-normal\">Та доорх мэдээллийг бөглөж явуулсаны дараа бид таны оруулсан хаягаар ачааг очиж авах болно.</span>";
      }
    } else {
      if (btnTypeStandard) {
        btnTypeStandard.classList.replace('text-gray-500', 'text-gray-900');
        btnTypeExpress.classList.replace('text-gray-900', 'text-gray-500');
        typeToggleBg.style.transform = 'translateX(0)';
      }
      if (descriptionContainer) {
        descriptionContainer.className = "mb-8 p-4 bg-blue-50/70 rounded-xl border border-blue-100 text-[13px] text-blue-900 leading-relaxed font-bold";
        descriptionContainer.innerHTML = "🚢 Энгийн ачаа: 30~45 хоногт хүргэгдэнэ (1,800 вон/кг)<br><span class=\"font-medium text-[12px] opacity-80 font-normal\">Та доорх мэдээллийг бөглөж явуулсаны дараа бид таны оруулсан хаягаар ачааг очиж авах болно.</span>";
      }
    }
  }

  if (btnTypeStandard && btnTypeExpress) {
    btnTypeStandard.addEventListener('click', () => { isExpress = false; renderOrderType(); });
    btnTypeExpress.addEventListener('click', () => { isExpress = true; renderOrderType(); });
  }

  renderOrderType();

  // ========== IMAGE UPLOAD ==========
  imageUploadArea.addEventListener('click', () => {
    if (uploadedImages.length < MAX_IMAGES) imageInput.click();
  });

  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - uploadedImages.length;
    const filesToAdd = files.slice(0, remaining);

    filesToAdd.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          uploadedImages.push({ file, dataUrl: ev.target.result, id: Date.now() + Math.random() });
          renderImagePreviews();
        };
        reader.readAsDataURL(file);
      }
    });
    imageInput.value = '';
  });

  function renderImagePreviews() {
    imagePreviewGrid.innerHTML = '';
    
    uploadedImages.forEach((img, index) => {
      const item = document.createElement('div');
      item.className = 'relative aspect-square rounded-xl overflow-hidden border border-gray-200';
      item.innerHTML = `
        <img src="${img.dataUrl}" alt="Preview" class="w-full h-full object-cover">
        <button type="button" class="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-[14px]" data-index="${index}">✕</button>
      `;
      imagePreviewGrid.appendChild(item);
    });

    if (uploadedImages.length > 0) {
      imagePreviewGrid.classList.remove('hidden');
      imagePreviewGrid.classList.add('grid', 'gap-2', 'mt-4');
      uploadPlaceholder.classList.add('hidden');
      imageUploadArea.classList.remove('py-8');
      imageUploadArea.classList.add('p-4');
    } else {
      imagePreviewGrid.classList.add('hidden');
      imagePreviewGrid.classList.remove('grid', 'gap-2', 'mt-4');
      uploadPlaceholder.classList.remove('hidden');
      imageUploadArea.classList.add('py-8');
      imageUploadArea.classList.remove('p-4');
    }

    if (uploadedImages.length > 0) imageUploadArea.classList.remove('border-red-500', 'bg-red-50');
  }

  imagePreviewGrid.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('button');
    if (deleteBtn) {
      e.stopPropagation();
      uploadedImages.splice(parseInt(deleteBtn.dataset.index), 1);
      renderImagePreviews();
    }
  });

  // ========== WIZARD STATE ==========
  let currentStep = 1;
  const totalSteps = 4;

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const wizardProgress = document.getElementById('wizardProgress');

  function updateWizardUI() {
    document.querySelectorAll('.wizard-step').forEach(step => {
      step.classList.add('hidden');
      step.classList.remove('block');
    });
    
    const activeStep = document.getElementById(`step${currentStep}`);
    if (activeStep) {
      activeStep.classList.remove('hidden');
      activeStep.classList.add('block');
    }

    for (let i = 1; i <= totalSteps; i++) {
      const indicator = document.getElementById(`stepIndicator${i}`);
      const label = document.getElementById(`stepLabel${i}`);
      const line = document.getElementById(`stepLine${i}`);
      
      if (i < currentStep) {
        if (indicator) {
          indicator.className = 'w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[14px] transition-colors';
          indicator.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span>';
        }
        if (label) label.className = 'text-[11px] font-bold text-emerald-500 text-center transition-colors';
        if (line) line.className = 'flex-1 h-0.5 bg-emerald-500 -mx-4 z-0 relative top-[-10px] transition-colors';
      } else if (i === currentStep) {
        if (indicator) {
          indicator.className = 'w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[14px] transition-colors';
          indicator.innerHTML = i;
        }
        if (label) label.className = 'text-[11px] font-bold text-primary text-center transition-colors';
        if (line) line.className = 'flex-1 h-0.5 bg-gray-200 -mx-4 z-0 relative top-[-10px] transition-colors';
      } else {
        if (indicator) {
          indicator.className = 'w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold text-[14px] transition-colors';
          indicator.innerHTML = i;
        }
        if (label) label.className = 'text-[11px] font-bold text-gray-400 text-center transition-colors';
        if (line) line.className = 'flex-1 h-0.5 bg-gray-200 -mx-4 z-0 relative top-[-10px] transition-colors';
      }
    }

    if (currentStep === 1) {
      if (prevBtn) prevBtn.classList.add('hidden');
      if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.className = 'w-full py-3.5 bg-primary text-white rounded-xl font-bold text-[15px] active:scale-[0.98] transition-all';
      }
      if (submitBtn) submitBtn.classList.add('hidden');
    } else if (currentStep === totalSteps) {
      if (prevBtn) {
        prevBtn.classList.add('hidden');
      }
      if (nextBtn) nextBtn.classList.add('hidden');
      if (submitBtn) {
        submitBtn.classList.remove('hidden');
        submitBtn.className = 'w-2/3 py-3.5 bg-primary text-white rounded-xl font-bold text-[15px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20';
      }
    } else {
      if (prevBtn) {
        prevBtn.classList.add('hidden');
      }
      if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.className = 'w-2/3 py-3.5 bg-primary text-white rounded-xl font-bold text-[15px] active:scale-[0.98] transition-all';
      }
      if (submitBtn) submitBtn.classList.add('hidden');
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        currentStep++;
        updateWizardUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentStep--;
      updateWizardUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== FORM VALIDATION ==========
  function validateStep(step) {
    let isValid = true;
    let firstError = null;

    if (step === 1) {
      const branchContainer = document.getElementById('branchSelectContainer');
      const branchError = document.getElementById('branchSelectError');
      if (branchContainer) branchContainer.classList.remove('border-red-500', 'bg-red-50');
      if (branchError) branchError.style.display = 'none';

      const selectedBranch = document.querySelector('input[name="branchSelect"]:checked');
      if (!selectedBranch) {
        if (branchError) branchError.style.display = 'block';
        isValid = false;
        if (!firstError) firstError = branchContainer;
      }
    }

    if (step === 2) {
      const requiredFields = [
        { id: 'senderName' }, { id: 'senderPhone' }, { id: 'senderAddress' }
      ];
      requiredFields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) el.classList.remove('border-red-500', 'bg-red-50');
      });
      document.querySelectorAll('#step2 .error-msg').forEach(el => el.style.display = 'none');

      requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;
        const value = input.value.trim();
        const errorMsg = document.getElementById(field.id + 'Error');
        
        if (!value) {
          input.classList.add('border-red-500', 'bg-red-50');
          if (errorMsg) errorMsg.style.display = 'block';
          isValid = false;
          if (!firstError) firstError = input;
        }
      });
    }

    if (step === 3) {
      const requiredFields = [
        { id: 'itemCategory' }, { id: 'itemQuantity' }
      ];
      requiredFields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) el.classList.remove('border-red-500', 'bg-red-50');
      });
      document.querySelectorAll('#step3 .error-msg').forEach(el => el.style.display = 'none');
      imageUploadArea.classList.remove('border-red-500', 'bg-red-50');

      requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;
        const value = input.value.trim();
        const errorMsg = document.getElementById(field.id + 'Error');
        
        if (!value) {
          input.classList.add('border-red-500', 'bg-red-50');
          if (errorMsg) errorMsg.style.display = 'block';
          isValid = false;
          if (!firstError) firstError = input;
        }
      });

      if (uploadedImages.length === 0) {
        imageUploadArea.classList.add('border-red-500', 'bg-red-50');
        const imgError = document.getElementById('imageError');
        if (imgError) imgError.style.display = 'block';
        isValid = false;
        if (!firstError) firstError = imageUploadArea;
      }
    }

    if (step === 4) {
      const requiredFields = [
        { id: 'receiverName' }, { id: 'receiverPhone' }, { id: 'receiverAddress' }
      ];
      requiredFields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) el.classList.remove('border-red-500', 'bg-red-50');
      });
      document.querySelectorAll('#step4 .error-msg').forEach(el => el.style.display = 'none');

      requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;
        const value = input.value.trim();
        const errorMsg = document.getElementById(field.id + 'Error');
        
        if (!value) {
          input.classList.add('border-red-500', 'bg-red-50');
          if (errorMsg) errorMsg.style.display = 'block';
          isValid = false;
          if (!firstError) firstError = input;
        }
      });
    }

    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (firstError.focus) firstError.focus();
    }

    return isValid;
  }

  // Hide branch error on change
  document.querySelectorAll('input[name="branchSelect"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const branchError = document.getElementById('branchSelectError');
      if (branchError) branchError.style.display = 'none';
    });
  });

  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('border-red-500', 'bg-red-50');
      const errorMsg = document.getElementById(input.id + 'Error');
      if (errorMsg) errorMsg.style.display = 'none';
    });
  });

  // ========== FORM SUBMISSION ==========
  const submitBtnEl = document.getElementById('submitBtn');

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    // Loading State
    const originalText = submitBtnEl.innerHTML;
    submitBtnEl.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> <span>Уншиж байна...</span>';
    submitBtnEl.disabled = true;

    try {
      const orderData = {
        type: isExpress ? 'express' : 'standard',
        branch: document.querySelector('input[name="branchSelect"]:checked').value,
        sender: {
          name: document.getElementById('senderName').value.trim(),
          phone: document.getElementById('senderPhone').value.trim(),
          address: document.getElementById('senderAddress').value.trim(),
        },
        item: { category: document.getElementById('itemCategory').value.trim(), quantity: document.getElementById('itemQuantity').value.trim() },
        receiver: {
          name: document.getElementById('receiverName').value.trim(),
          phone: document.getElementById('receiverPhone').value.trim(),
          address: document.getElementById('receiverAddress').value.trim()
        },
      };

      // 1. Submit Order to Cloudflare Worker
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error || 'Server error occurred');
      const orderId = data.orderId;

      // 2. Upload Images to R2 Bucket
      if (uploadedImages.length > 0) {
        const uploadForm = new FormData();
        uploadForm.append('orderId', orderId);
        uploadedImages.forEach(img => {
          uploadForm.append('images', img.file);
        });

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
           console.error('Image upload failed:', uploadData.error);
        }
      }

      showSuccess({ ...orderData, orderId: orderId });
    } catch (err) {
      alert('Алдаа гарлаа: ' + err.message);
    } finally {
      submitBtnEl.innerHTML = originalText;
      submitBtnEl.disabled = false;
    }
  });

  function showSuccess(data) {
    orderForm.classList.add('hidden');
    
    // Hide wizard progress, title and description
    document.getElementById('headerTitle').textContent = '';
    if (badgeContainer) badgeContainer.classList.add('hidden');
    if (descriptionContainer) descriptionContainer.classList.add('hidden');
    if (wizardProgress) wizardProgress.classList.add('hidden');
    
    // Also hide the order type toggle wrapper (the one with the two buttons and bg)
    const typeToggleContainer = typeToggleBg ? typeToggleBg.parentElement : null;
    if (typeToggleContainer) typeToggleContainer.classList.add('hidden');

    const typeLabel = data.type === 'standard' ? 'Энгийн ачаа' : 'Экспрэсс ачаа';
    const deliveryTime = data.type === 'standard' ? '30~45 хоног' : '10~14 хоног';
    const orderNum = data.orderId || 'NM' + Date.now().toString().slice(-8);

    successDetails.innerHTML = `
      <div class="flex justify-between border-b border-gray-100 pb-2">
        <span class="text-gray-500 text-[13px]">Захиалгын дугаар</span>
        <span class="font-bold text-gray-900 text-[13px]">${orderNum}</span>
      </div>
      <div class="flex justify-between border-b border-gray-100 pb-2 pt-1">
        <span class="text-gray-500 text-[13px]">Тээврийн төрөл</span>
        <span class="font-bold text-gray-900 text-[13px]">${typeLabel}</span>
      </div>
      <div class="flex justify-between border-b border-gray-100 pb-2 pt-1">
        <span class="text-gray-500 text-[13px]">Салбар</span>
        <span class="font-bold text-gray-900 text-[13px]">${data.branch}</span>
      </div>
      <div class="flex justify-between border-b border-gray-100 pb-2 pt-1">
        <span class="text-gray-500 text-[13px]">Илгээгч</span>
        <span class="font-bold text-gray-900 text-[13px]">${data.sender.name}</span>
      </div>
      <div class="flex justify-between border-b border-gray-100 pb-2 pt-1">
        <span class="text-gray-500 text-[13px]">Хүлээн авагч</span>
        <span class="font-bold text-gray-900 text-[13px]">${data.receiver.name}</span>
      </div>
      <div class="flex justify-between border-b border-gray-100 pb-2 pt-1">
        <span class="text-gray-500 text-[13px]">Бараа</span>
        <span class="font-bold text-gray-900 text-[13px]">${data.item.category} (${data.item.quantity}ш)</span>
      </div>
      <div class="flex justify-between pt-1">
        <span class="text-gray-500 text-[13px]">Хүргэлтийн хугацаа</span>
        <span class="font-bold text-gray-900 text-[13px]">${deliveryTime}</span>
      </div>
    `;
    
    successContainer.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

});
