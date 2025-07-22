

const selector = document.getElementById('fontSelector');
const svgText = document.querySelector('.title svg text');
selector.addEventListener('change', () => {
  svgText.setAttribute('font-family', selector.value);
});
