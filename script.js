window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.fade-in, .fade-in-right').forEach(el => {
    el.style.animationPlayState = 'running';
  });

  const bgImages = ['img_body/1.jpg', 'img_body/1.png'];
  const bgSlider = document.querySelector('.bg-slider');
  let currentBgIndex = 1;
  if (bgSlider && bgImages.length > 0) {
    bgSlider.style.backgroundImage = `url('${bgImages[currentBgIndex]}')`;
    setInterval(() => {
      currentBgIndex = (currentBgIndex + 1) % bgImages.length;
      bgSlider.style.backgroundImage = `url('${bgImages[currentBgIndex]}')`;
    }, 3000);
  }

  const servicesToggle = document.getElementById('servicesToggle');
  const megaMenu = document.getElementById('servicesDropdown');
  const closeBtn = document.getElementById('closeMenu');
  
  function closeMegaMenu() {
    if(megaMenu) megaMenu.classList.remove('show');
  }

  if (servicesToggle && megaMenu) {
    servicesToggle.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      megaMenu.classList.toggle('show');
    });
    if (closeBtn) closeBtn.addEventListener('click', closeMegaMenu);
    document.addEventListener('click', (e) => {
      if (megaMenu.classList.contains('show') && !servicesToggle.contains(e.target)) {
        if (e.target === megaMenu || e.target.classList.contains('carousel-track')) {
          closeMegaMenu();
        }
      }
    });
  }

  // ==========================================
  // THUẬT TOÁN 60FPS - CAROUSEL
  // ==========================================
  const cards = document.querySelectorAll('.service-card');
  let currentPos = 0;        
  let targetPos = 0;         
  let isLocked = false;      
  let hoveredCardIndex = -1; 
  let hoverTimeouts = [];

  let isDragging = false;
  let startX = 0, lastX = 0, lastTime = 0;
  let momentum = 0;

  const autoSpinSpeed = 0.0012; 
  const maxSpinSpeed = 0.04;    
  const lerpFactor = 0.03;      

  const viewToggle = document.getElementById('viewToggle');
  const track = document.querySelector('.carousel-track');
  const arrows = document.querySelectorAll('.slider-arrow');
  let isGridView = false;

  if (viewToggle) {
    viewToggle.addEventListener('change', (e) => {
      isGridView = e.target.checked;
      if (isGridView) {
        track.classList.add('grid-view');
        arrows.forEach(arr => arr.classList.add('hidden'));
      } else {
        track.classList.remove('grid-view');
        arrows.forEach(arr => arr.classList.remove('hidden'));
      }
    });
  }

  if (track) {
    track.addEventListener('touchstart', (e) => {
      if (isGridView) return;
      isDragging = true; isLocked = false;
      startX = e.touches[0].clientX;
      lastX = startX; lastTime = Date.now();
      momentum = 0; 
    }, {passive: true});

    track.addEventListener('touchmove', (e) => {
      if (!isDragging || isGridView) return;
      let currentX = e.touches[0].clientX;
      let deltaX = currentX - lastX;
      
      currentPos -= deltaX * 0.00009; 
      
      let now = Date.now();
      let dt = now - lastTime;
      if (dt > 0) {
        momentum = -(deltaX / dt) * 0.05; 
      }
      
      lastX = currentX; lastTime = now;
    }, {passive: true});

    track.addEventListener('touchend', () => {
      if (isGridView) return;
      isDragging = false;
    });
  }

  function renderCarousel() {
    if (isGridView) {
      cards.forEach(card => {
        card.style.transform = ''; card.style.opacity = '';
        card.style.filter = ''; card.style.zIndex = '';
        card.classList.remove('active');
      });
      requestAnimationFrame(renderCarousel);
      return; 
    }

    let isMobile = window.innerWidth <= 768;
    let isCenteredAndHovered = false;

    if (hoveredCardIndex !== -1) {
      let d = Math.abs(currentPos - hoveredCardIndex);
      if (d > cards.length / 2) d = cards.length - d;
      if (d < 0.05) isCenteredAndHovered = true; 
    }

    if (Math.abs(momentum) > 0.001) {
      currentPos += momentum;
      momentum *= 0.94;
      targetPos = currentPos;
      isLocked = false; 
    } else if (!isLocked && !isCenteredAndHovered && !isDragging) {
      currentPos += autoSpinSpeed;
      targetPos = currentPos;
    } else if (isLocked && !isDragging) {
      let diff = targetPos - currentPos;
      if (diff > cards.length / 2) diff -= cards.length;
      if (diff < -cards.length / 2) diff += cards.length;

      let step = diff * lerpFactor;
      if (step > maxSpinSpeed) step = maxSpinSpeed;
      if (step < -maxSpinSpeed) step = -maxSpinSpeed;

      currentPos += step;
      if (Math.abs(diff) < 0.005) {
        currentPos = targetPos; 
        isLocked = false;
      }
    }

    if (currentPos >= cards.length) { currentPos -= cards.length; targetPos -= cards.length; }
    if (currentPos < 0) { currentPos += cards.length; targetPos += cards.length; }

    cards.forEach((card, i) => {
      let offset = i - currentPos;
      if (offset > cards.length / 2) offset -= cards.length;
      if (offset < -cards.length / 2) offset += cards.length;
      
      let absOffset = Math.abs(offset);
      let sign = Math.sign(offset);
      let x = 0, scale = 1, opacity = 1, blur = 0, zIndex = 5;

      if (isMobile) {
        if (absOffset <= 1) {
          x = absOffset * 65; scale = 0.95 - (absOffset * 0.45); opacity = 1 - (absOffset * 0.15); blur = 0; zIndex = 5 - absOffset;
        } else if (absOffset <= 2) {
          let t = absOffset - 1; x = 65 + (t * 40); scale = 0.5 - (t * 0.15); opacity = 0.85 - (t * 0.3); blur = 0; zIndex = 4 - t;
        } else {
          let t = Math.min(absOffset - 2, 1); x = 105 + (t * 30); scale = 0.35 - (t * 0.15); opacity = 0.55 - (t * 0.55); blur = 0; zIndex = 3 - t;
        }
      } else {
        if (absOffset <= 1) {
          x = absOffset * 110; scale = 1 - (absOffset * 0.2); opacity = 1 - (absOffset * 0.2); blur = absOffset * 1; zIndex = 5 - absOffset; 
        } else if (absOffset <= 2) {
          let t = absOffset - 1; x = 110 + (t * 90); scale = 0.8 - (t * 0.2); opacity = 0.8 - (t * 0.3); blur = 1 + (t * 2); zIndex = 4 - t; 
        } else {
          let t = Math.min(absOffset - 2, 1); x = 200 + (t * 50); scale = 0.6 - (t * 0.2); opacity = 0.5 - (t * 0.5); blur = 3 + (t * 2); zIndex = 3 - t;
        }
      }

      card.style.transform = `translateX(${sign * x}%) scale(${scale})`;
      card.style.opacity = Math.max(0, opacity);
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = Math.round(zIndex);

      if (absOffset < 0.3 && isCenteredAndHovered && !isGridView) { card.classList.add('active'); } 
      else { card.classList.remove('active'); }
    });

    requestAnimationFrame(renderCarousel);
  }

  requestAnimationFrame(renderCarousel);

  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      hoveredCardIndex = index;
      hoverTimeouts.forEach(clearTimeout);
      hoverTimeouts = [];

      if (isLocked || isGridView) return; 

      let timeout = setTimeout(() => {
        let d = Math.abs(currentPos - index);
        if (d > cards.length / 2) d = cards.length - d;
        
        if (d > 0.1 && !isLocked) {
          isLocked = true;
          let rawDiff = index - currentPos;
          if (rawDiff > cards.length / 2) rawDiff -= cards.length;
          if (rawDiff < -cards.length / 2) rawDiff += cards.length;
          targetPos = currentPos + rawDiff;
        }
      }, 1500);
      hoverTimeouts.push(timeout);
    });

    card.addEventListener('mouseleave', () => {
      hoveredCardIndex = -1; 
      hoverTimeouts.forEach(clearTimeout);
      hoverTimeouts = [];
    });
  });

  function moveNext() { if (!isLocked) targetPos = Math.round(currentPos); targetPos += 1; isLocked = true; }
  function movePrev() { if (!isLocked) targetPos = Math.round(currentPos); targetPos -= 1; isLocked = true; }

  document.querySelector('.next-arrow').addEventListener('click', (e) => { e.stopPropagation(); moveNext(); });
  document.querySelector('.prev-arrow').addEventListener('click', (e) => { e.stopPropagation(); movePrev(); });

  // ==========================================
  // CLICK "CONTACT ME": TRƯỢT & LÓE SÁNG 
  // ==========================================
  const contactMeBtn = document.getElementById('contactMeBtn');
  const socialGroup = document.getElementById('socialGroup');
  const socialIcons = document.querySelectorAll('.social-icon');

  if (contactMeBtn && socialGroup) {
    contactMeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Trượt mượt xuống phần social
      socialGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Chờ trượt xong (khoảng 600ms) rồi kích hoạt hiệu ứng kính sáng lần lượt
      setTimeout(() => {
        socialIcons.forEach((icon, index) => {
          setTimeout(() => {
            // Reset class để có thể lóe sáng nhiều lần khi bấm nhiều lần
            icon.classList.remove('flash'); 
            void icon.offsetWidth; // Trigger reflow
            icon.classList.add('flash');
          }, index * 200); // Mỗi nút lóe cách nhau 0.2s tạo hiệu ứng lướt ngang
        });
      }, 600);
    });
  }

  // ==========================================
  // XỬ LÝ SỰ KIỆN CHO MODAL CV
  // ==========================================
  const openCvModalBtn = document.getElementById('openCvModal');
  const cvModal = document.getElementById('cvModal');
  const closeCvModalBtn = document.getElementById('closeCvModal');

  if (openCvModalBtn && cvModal) { openCvModalBtn.addEventListener('click', (e) => { e.preventDefault(); cvModal.classList.add('show'); }); }
  if (closeCvModalBtn) { closeCvModalBtn.addEventListener('click', () => cvModal.classList.remove('show')); }
  if (cvModal) { cvModal.addEventListener('click', (e) => { if (e.target === cvModal) cvModal.classList.remove('show'); }); }

  // ==========================================
  // XỬ LÝ HIRE ME & VALIDATION FORM
  // ==========================================
  const hireBtns = document.querySelectorAll('.hire-btn');
  const hireModal = document.getElementById('hireModal');
  const closeHireModal = document.getElementById('closeHireModal');
  const hireForm = document.getElementById('hireForm');
  const toastNotification = document.getElementById('toastNotification');

  hireBtns.forEach(btn => { btn.addEventListener('click', (e) => { e.preventDefault(); hireModal.classList.add('show'); }); });
  if (closeHireModal) { closeHireModal.addEventListener('click', () => hireModal.classList.remove('show')); }
  if (hireModal) { hireModal.addEventListener('click', (e) => { if (e.target === hireModal) hireModal.classList.remove('show'); }); }

  if (hireForm) {
    hireForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('hireName');
      const phone = document.getElementById('hirePhone');
      const email = document.getElementById('hireEmail');
      const address = document.getElementById('hireAddress');
      const purpose = document.getElementById('hirePurpose');

      // --- 1. VALIDATION SỐ ĐIỆN THOẠI BẰNG REGEX ---
      // (Đầu số 03, 05, 07, 08, 09 hoặc 84 và tổng là 10-11 số)
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
      if (!phoneRegex.test(phone.value.trim())) {
        phone.setCustomValidity('Số điện thoại không hợp lệ (Ví dụ: 098..., 038...)');
        phone.reportValidity();
        return; 
      } else {
        phone.setCustomValidity(''); 
      }

      // --- 2. VALIDATION EMAIL BẰNG REGEX ---
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) {
        email.setCustomValidity('Vui lòng nhập đúng định dạng Email (Ví dụ: abc@gmail.com)');
        email.reportValidity();
        return;
      } else {
        email.setCustomValidity('');
      }

      // Nếu đi qua hết các bài test, tiến hành gửi Form!
      const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1524383593789526158/I6xplG5Odx3ljG4Dg5ka1eAY9tBmtZV9KfupRSGRMBZg6zAfQh8lP_x34-CnptUgcJr_';

      const payload = {
        content: "🔔 **BẠN CÓ YÊU CẦU THUÊ DỊCH VỤ MỚI!**",
        embeds: [{
          color: 65450,
          fields: [
            { name: "👤 Khách hàng", value: name.value, inline: false },
            { name: "📞 Điện thoại", value: phone.value, inline: false },
            { name: "📧 Email", value: email.value, inline: false },
            { name: "📍 Địa chỉ", value: address.value || "Không có", inline: false },
            { name: "📝 Mục đích/Yêu cầu", value: purpose.value || "Không có", inline: false }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(error => console.error("Lỗi gửi Discord:", error));

      hireModal.classList.remove('show');
      hireForm.reset();
      toastNotification.classList.add('show');
      
      setTimeout(() => {
        toastNotification.classList.remove('show');
      }, 4000);
    });
  }
});