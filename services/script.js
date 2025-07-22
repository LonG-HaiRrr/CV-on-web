// Slider Logic By Ujjwal
const sliderItems = document.querySelectorAll('.slider__item');
const dots = document.querySelectorAll('.dot');
const leftThumb = document.getElementById('leftThumb');
const rightThumb = document.getElementById('rightThumb');
const indexShow = document.getElementById('sliderIndex');
const countShow = document.getElementById('sliderCount');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let current = 0;
const total = sliderItems.length;

function updateSlider(idx) {
  sliderItems.forEach((item, i) => {
    item.classList.toggle('active', i === idx);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
  indexShow.innerText = String(idx + 1).padStart(2, "0");
  countShow.innerText = String(total).padStart(2, "0");
  leftThumb.src = sliderItems[(idx - 1 + total) % total].querySelector('img').src;
  rightThumb.src = sliderItems[(idx + 1) % total].querySelector('img').src;
}

prevBtn.addEventListener('click', () => {
  current = (current - 1 + total) % total;
  updateSlider(current);
});
nextBtn.addEventListener('click', () => {
  current = (current + 1) % total;
  updateSlider(current);
});
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    current = i;
    updateSlider(current);
  });
});
updateSlider(current);
