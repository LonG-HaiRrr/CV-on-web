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

  // ==========================================
  // LOGIC XỬ LÝ DROPDOWN & ĐIỀU KHIỂN TỐC ĐỘ 
  // ==========================================
  const servicesToggle = document.getElementById('servicesToggle');
  const megaMenu = document.getElementById('servicesDropdown');
  const closeBtn = document.getElementById('closeMenu');
  const track = document.querySelector('.carousel-track');
  
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

  const cards = document.querySelectorAll('.service-card');
  let activeIndex = 0; 
  let autoRotateInterval;
  let delayTimeout;
  let hoverCardTimeout;

  // Hàm update vị trí thẻ và KÈM THEO truyền biến tốc độ (duration, easing) xuống CSS
  function updateCarousel(duration = '2s', easing = 'linear') {
    if (track) {
      track.style.setProperty('--trans-dur', duration);
      track.style.setProperty('--trans-ease', easing);
    }

    cards.forEach((card, i) => {
      card.classList.remove('active');
      let offset = i - activeIndex;
      if (offset < -5) offset += cards.length;
      if (offset > 4) offset -= cards.length;

      if (offset === 0) {
        card.style.transform = `translateX(0) scale(1)`;
        card.style.opacity = '1';
        card.style.zIndex = '5';
        card.style.filter = 'blur(0px)';
        card.classList.add('active'); 
      } else if (offset === -1) {
        card.style.transform = `translateX(-115%) scale(0.85)`;
        card.style.opacity = '0.8';
        card.style.zIndex = '4';
        card.style.filter = 'blur(1.5px)'; 
      } else if (offset === 1) {
        card.style.transform = `translateX(115%) scale(0.85)`;
        card.style.opacity = '0.8';
        card.style.zIndex = '4';
        card.style.filter = 'blur(1.5px)';
      } else if (offset === -2) {
        card.style.transform = `translateX(-210%) scale(0.7)`;
        card.style.opacity = '0.5';
        card.style.zIndex = '3';
        card.style.filter = 'blur(3px)';
      } else if (offset === 2) {
        card.style.transform = `translateX(210%) scale(0.7)`;
        card.style.opacity = '0.5';
        card.style.zIndex = '3';
        card.style.filter = 'blur(3px)';
      } else {
        card.style.transform = `translateX(${offset > 0 ? 300 : -300}%) scale(0.5)`;
        card.style.opacity = '0';
        card.style.zIndex = '1';
      }
    });
  }

  // Auto xoay cực êm, không bị dừng khựng
  function startAutoRotate() {
    clearInterval(autoRotateInterval);
    updateCarousel('2s', 'linear'); // Setup tốc độ mượt trước khi xoay
    autoRotateInterval = setInterval(() => {
      activeIndex = (activeIndex + 1) % cards.length;
      updateCarousel('2s', 'linear'); // Liên tục xoay đều mỗi 2 giây
    }, 2000);
  }

  function stopAutoRotate() {
    clearInterval(autoRotateInterval);
    clearTimeout(delayTimeout);
  }

  updateCarousel();
  startAutoRotate();

  // Bấm Mũi Tên: Chuyển thẻ "giật cục" (Thời gian 0.4s)
  document.querySelector('.next-arrow').addEventListener('click', (e) => {
    e.stopPropagation(); 
    activeIndex = (activeIndex + 1) % cards.length;
    updateCarousel('0.4s', 'cubic-bezier(0.25, 0.8, 0.25, 1)'); 
  });
  
  document.querySelector('.prev-arrow').addEventListener('click', (e) => {
    e.stopPropagation(); 
    activeIndex = (activeIndex - 1 + cards.length) % cards.length;
    updateCarousel('0.4s', 'cubic-bezier(0.25, 0.8, 0.25, 1)');
  });

  // Sự kiện Hover cho từng THẺ (Chờ 1500ms -> Kéo thẻ ra giữa với 1.5s tốc độ xoay)
  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      hoverCardTimeout = setTimeout(() => {
        if (activeIndex !== index) {
          activeIndex = index;
          updateCarousel('1.5s', 'ease-in-out'); 
        }
      }, 1500); // <-- Delay chính xác 1500ms
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverCardTimeout);
    });
  });

  // Tạm dừng khi đưa chuột vào Menu & Tắt chế độ trôi êm
  if (megaMenu) {
    megaMenu.addEventListener('mouseenter', () => {
      stopAutoRotate();
      // Ngay khi hover vào menu, đưa tốc độ về mặc định 0.4s để các thẻ phanh lại đứng yên
      if(track) {
        track.style.setProperty('--trans-dur', '0.4s');
        track.style.setProperty('--trans-ease', 'ease-out');
      }
    });

    megaMenu.addEventListener('mouseleave', () => {
      delayTimeout = setTimeout(() => {
        startAutoRotate(); // Trở lại quỹ đạo trôi êm 2s
      }, 1000); 
    });
  }
});