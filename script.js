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
  // THUẬT TOÁN 60FPS - KHÔNG BAO GIỜ KHỰNG
  // ==========================================
  const cards = document.querySelectorAll('.service-card');
  let currentPos = 0;        
  let targetPos = 0;         
  let isLocked = false;      
  let hoveredCardIndex = -1; // Lưu vị trí thẻ đang được trỏ chuột
  let hoverTimeouts = [];

  const autoSpinSpeed = 0.0012; // Tốc độ trôi tự do (Cực kỳ chậm và mượt)
  const maxSpinSpeed = 0.04;    // Giới hạn vận tốc: Chống xoay giật cục
  const lerpFactor = 0.03;      // Gia tốc bám đích

  function renderCarousel() {
    let isCenteredAndHovered = false;

    // KHI THẺ VÀO GIỮA & CÒN BỊ HOVER -> Mới đứng yên cho khách đọc
    if (hoveredCardIndex !== -1) {
      let d = Math.abs(currentPos - hoveredCardIndex);
      if (d > cards.length / 2) d = cards.length - d;
      if (d < 0.05) isCenteredAndHovered = true; 
    }

    // NẾU KHÔNG BỊ KHÓA & KHÔNG PHẢI ĐANG ĐỌC THẺ GIỮA -> Cứ trôi liên tiếp
    if (!isLocked && !isCenteredAndHovered) {
      currentPos += autoSpinSpeed;
      targetPos = currentPos;
    } 
    // NẾU BỊ KHÓA -> Xoay thẻ mục tiêu vào giữa
    else if (isLocked) {
      let diff = targetPos - currentPos;
      
      // Chọn đường ngắn nhất
      if (diff > cards.length / 2) diff -= cards.length;
      if (diff < -cards.length / 2) diff += cards.length;

      let step = diff * lerpFactor;
      
      // ĐẶT MỨC BÃO HÒA: Ép tốc độ không được vượt quá maxSpinSpeed
      if (step > maxSpinSpeed) step = maxSpinSpeed;
      if (step < -maxSpinSpeed) step = -maxSpinSpeed;

      currentPos += step;

      // Khi thẻ đã vào chính giữa tâm
      if (Math.abs(diff) < 0.005) {
        currentPos = targetPos; 
        isLocked = false; // Mở khóa ngay để sẵn sàng nhận lệnh mới
      }
    }

    // Vòng lặp vô tận (nối circle)
    if (currentPos >= cards.length) { currentPos -= cards.length; targetPos -= cards.length; }
    if (currentPos < 0) { currentPos += cards.length; targetPos += cards.length; }

    // Tính toán CSS
    cards.forEach((card, i) => {
      let offset = i - currentPos;
      if (offset > cards.length / 2) offset -= cards.length;
      if (offset < -cards.length / 2) offset += cards.length;
      
      let absOffset = Math.abs(offset);
      let sign = Math.sign(offset);
      let x = 0, scale = 1, opacity = 1, blur = 0, zIndex = 5;

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

      card.style.transform = `translateX(${sign * x}%) scale(${scale})`;
      card.style.opacity = Math.max(0, opacity);
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = Math.round(zIndex);

      // Thêm hiệu ứng phát sáng cho thẻ đang ở tâm
      if (absOffset < 0.3 && isCenteredAndHovered) {
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

      if (isLocked) return; // Nếu hệ thống đang bận xoay thẻ khác, bỏ qua

      let timeout = setTimeout(() => {
        let d = Math.abs(currentPos - index);
        if (d > cards.length / 2) d = cards.length - d;
        
        // Sau 1.5s, nếu thẻ chưa ở tâm thì ra lệnh xoay
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
      hoveredCardIndex = -1; // Hủy trạng thái đọc thẻ
      hoverTimeouts.forEach(clearTimeout);
      hoverTimeouts = [];
    });
  });

  // ==========================================
  // XỬ LÝ MŨI TÊN (Cộng dồn mượt mà)
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