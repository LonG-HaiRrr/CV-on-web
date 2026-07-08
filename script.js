window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.fade-in, .fade-in-right').forEach(el => {
    el.style.animationPlayState = 'running';
  });

  const bgImages = [
    'img_body/1.jpg',
    'img_body/1.png'
  ];

  const bgSlider = document.querySelector('.bg-slider');
  let currentBgIndex = 0;

  if (bgSlider && bgImages.length > 0) {
    bgSlider.style.backgroundImage = `url('${bgImages[currentBgIndex]}')`;
    setInterval(() => {
      currentBgIndex = (currentBgIndex + 1) % bgImages.length;
      bgSlider.style.backgroundImage = `url('${bgImages[currentBgIndex]}')`;
    }, 3000);
  }
});