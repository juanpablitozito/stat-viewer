//are do carrossel da tela home
  let indice = 0;
  const slides = document.getElementById("slides");
  const total = slides.children.length;

  function atualizarSlide() {
    slides.style.transform = `translateX(-${indice * 100}%)`;
  }

  function avancarSlide() {
    indice = (indice + 1) % total;
    atualizarSlide();
  }

  function voltarSlide() {
    indice = (indice - 1 + total) % total;
    atualizarSlide();
  }

  setInterval(avancarSlide, 8000);

 