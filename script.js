// Khi load trang, thêm class để kick các hiệu ứng animate từng dòng
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.fade-in, .fade-in-right').forEach(el => {
    el.style.animationPlayState = 'running';
  });
});
