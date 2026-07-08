window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.fade-in, .fade-in-right').forEach(el => {
    el.style.animationPlayState = 'running';
  });

  const bgImages = ['img_body/1.jpg', 'img_body/1.png'];
  const bgSlider = document.querySelector('.bg-slider');
  let currentBgIndex = 0;
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
  // THUẬT TOÁN 60FPS - KHÔNG BAO GIỜ KHỰNG & CÓ GRID VIEW
  // ==========================================
  const cards = document.querySelectorAll('.service-card');
  let currentPos = 0;        
  let targetPos = 0;         
  let isLocked = false;      
  let hoveredCardIndex = -1; // Lưu vị trí thẻ đang được trỏ chuột
  let hoverTimeouts = [];

  const autoSpinSpeed = 0.0012; // Tốc độ trôi tự do
  const maxSpinSpeed = 0.04;    // Giới hạn vận tốc: Chống xoay giật cục
  const lerpFactor = 0.03;      // Gia tốc bám đích

  const viewToggle = document.getElementById('viewToggle');
  const track = document.querySelector('.carousel-track');
  const arrows = document.querySelectorAll('.slider-arrow');
  let isGridView = false;

  // Lắng nghe sự kiện chuyển đổi Grid View
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

  function renderCarousel() {
    // Nếu bật Grid View, vô hiệu hóa toàn bộ CSS nội tuyến 3D
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

    if (!isLocked && !isCenteredAndHovered) {
      currentPos += autoSpinSpeed;
      targetPos = currentPos;
    } 
    else if (isLocked) {
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
        // --- CÔNG THỨC THU GỌN VÀ HIỂN THỊ ĐỦ 5 THẺ (MOBILE) ---
        if (absOffset <= 1) {
          x = absOffset * 65; 
          scale = 0.95 - (absOffset * 0.45); 
          opacity = 1 - (absOffset * 0.15); 
          blur = 0; // Xóa mờ
          zIndex = 5 - absOffset;
        } else if (absOffset <= 2) {
          let t = absOffset - 1;
          x = 65 + (t * 40); 
          scale = 0.5 - (t * 0.15); 
          opacity = 0.85 - (t * 0.3);
          blur = 0; // Xóa mờ
          zIndex = 4 - t;
        } else {
          let t = Math.min(absOffset - 2, 1);
          x = 105 + (t * 30);
          scale = 0.35 - (t * 0.15);
          opacity = 0.55 - (t * 0.55);
          blur = 0;
          zIndex = 3 - t;
        }
      } else {
        // --- CÔNG THỨC CHUẨN (LAPTOP) ---
        if (absOffset <= 1) {
          x = absOffset * 110; 
          scale = 1 - (absOffset * 0.2); 
          opacity = 1 - (absOffset * 0.2); 
          blur = absOffset * 1; 
          zIndex = 5 - absOffset; 
        } else if (absOffset <= 2) {
          let t = absOffset - 1; 
          x = 110 + (t * 90); 
          scale = 0.8 - (t * 0.2); 
          opacity = 0.8 - (t * 0.3); 
          blur = 1 + (t * 2); 
          zIndex = 4 - t; 
        } else {
          let t = Math.min(absOffset - 2, 1);
          x = 200 + (t * 50); 
          scale = 0.6 - (t * 0.2); 
          opacity = 0.5 - (t * 0.5); 
          blur = 3 + (t * 2);
          zIndex = 3 - t;
        }
      }

      card.style.transform = `translateX(${sign * x}%) scale(${scale})`;
      card.style.opacity = Math.max(0, opacity);
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = Math.round(zIndex);

      if (absOffset < 0.3 && isCenteredAndHovered && !isGridView) {
         card.classList.add('active');
      } else {
         card.classList.remove('active');
      }
    });

    requestAnimationFrame(renderCarousel);
  }

  requestAnimationFrame(renderCarousel);

  // ==========================================
  // XỬ LÝ HOVER 1.5s THÔNG MINH
  // ==========================================
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

  // ==========================================
  // XỬ LÝ MŨI TÊN
  // ==========================================
  function moveNext() {
    if (!isLocked) targetPos = Math.round(currentPos);
    targetPos += 1;
    isLocked = true;
  }
  function movePrev() {
    if (!isLocked) targetPos = Math.round(currentPos);
    targetPos -= 1;
    isLocked = true;
  }

  document.querySelector('.next-arrow').addEventListener('click', (e) => {
    e.stopPropagation(); moveNext();
  });
  document.querySelector('.prev-arrow').addEventListener('click', (e) => {
    e.stopPropagation(); movePrev();
  });
});