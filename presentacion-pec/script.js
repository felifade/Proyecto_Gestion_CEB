let currentSlide = 1;
const totalSlides = 10;

function showSlide(index) {
  if (index < 1 || index > totalSlides) return;
  
  // Desactivar slide actual
  const activeSlide = document.querySelector('.slide.active');
  if (activeSlide) {
    activeSlide.classList.remove('active');
  }

  // Activar nuevo slide
  const targetSlide = document.getElementById(`slide-${index}`);
  if (targetSlide) {
    targetSlide.classList.add('active');
  }

  currentSlide = index;

  // Actualizar indicadores
  document.getElementById('current-slide-num').textContent = currentSlide;
  const progressPercent = (currentSlide / totalSlides) * 100;
  document.getElementById('progress-indicator').style.width = `${progressPercent}%`;

  // Habilitar/Deshabilitar botones
  document.getElementById('prev-btn').disabled = (currentSlide === 1);
  document.getElementById('next-btn').disabled = (currentSlide === totalSlides);
}

function nextSlide() {
  if (currentSlide < totalSlides) showSlide(currentSlide + 1);
}

function prevSlide() {
  if (currentSlide > 1) showSlide(currentSlide - 1);
}

// Navegación por teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  }
});

function revealPostit(element) {
  element.classList.toggle('revealed');
}
