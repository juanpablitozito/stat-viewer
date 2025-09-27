// Verifica se é um dispositivo móvel
function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

// Ajusta o comportamento do carrossel em dispositivos móveis
if (isMobileDevice()) {
  // Altera o intervalo do carrossel para ser mais rápido em móveis
  clearInterval(carrosselInterval);
  carrosselInterval = setInterval(avancarSlide, 5000);
  
  // Adiciona suporte a swipe para o carrossel
  let touchStartX = 0;
  let touchEndX = 0;
  
  const carrossel = document.querySelector('.carrossel');
  
  carrossel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);
  
  carrossel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
  
  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      avancarSlide();
    }
    if (touchEndX > touchStartX + 50) {
      voltarSlide();
    }
  }
}

// Ajusta a quantidade de rolagem nos filmes para dispositivos móveis
function avancarFilmes(type) {
  const movieRow = document.getElementById(type);
  const scrollAmount = isMobileDevice() ? 200 : 400;
  movieRow.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
}

function voltarFilmes(type) {
  const movieRow = document.getElementById(type);
  const scrollAmount = isMobileDevice() ? 200 : 400;
  movieRow.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  });
}

// Variáveis de controle do carrossel
let indice = 0;  // Índice que vai controlar a posição atual do slide
const slides = document.getElementById("slides");  // Obtém o elemento que contém os slides
const total = slides.children.length;  // Total de slides (filhos do elemento slides)

// Função para atualizar o slide, movendo-o para a posição indicada pelo índice
function atualizarSlide() {
  slides.style.transform = `translateX(-${indice * 100}%)`;  // Muda a posição horizontal do carrossel
}

// Função para avançar o slide, alterando o índice
function avancarSlide() {
  indice = (indice + 1) % total;  // Avança o índice, retornando ao início ao atingir o final
  atualizarSlide();  // Atualiza a posição do slide
}

// Função para voltar o slide, alterando o índice
function voltarSlide() {
  indice = (indice - 1 + total) % total;  // Retrocede o índice, retornando ao final se for negativo
  atualizarSlide();  // Atualiza a posição do slide
}

// Inicia o carrossel, fazendo ele avançar a cada 10 segundos
setInterval(avancarSlide, 10000);

// Definindo a chave da API e o base URL para imagens
const apiKey = '667f29be2c2b3a1826a0467ad42f291b';
const imgBase = 'https://image.tmdb.org/t/p/w500';

// Buscar pela barra de pesquisa

  const searchInput = document.getElementById('query');
  const overlay = document.getElementById('searchResultsOverlay');
  const resultsContainer = document.getElementById('searchResults');

  function showOverlay() {
    overlay.classList.remove('hidden');
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  function searchMovies(query) {
    if (!query.trim()) {
      hideOverlay();
      return;
    }

    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        resultsContainer.innerHTML = '';
        if (data.results.length > 0) {
          data.results.forEach(movie => {
            const poster = movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/150x225?text=Sem+Imagem';

            const card = document.createElement('div');
            card.classList.add('card-movie');
            card.innerHTML = `
              <img src="${poster}" alt="${movie.title}" />
              <p>${movie.title}</p>
            `;
             // Adiciona evento de clique para abrir o modal e fechar o overlay
  card.addEventListener('click', () => {
    hideOverlay(); // Fecha o overlay

    fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=pt-BR`)
      .then(response => response.json())
      .then(details => {
        openModal(details); // Abre o modal com os detalhes do filme
      })
      .catch(error => {
        console.error('Erro ao buscar detalhes do filme da busca:', error);
      });
  });

            resultsContainer.appendChild(card);
          });
          showOverlay();
        } else {
          resultsContainer.innerHTML = '<p style="color: white;">Nenhum resultado encontrado.</p>';
          showOverlay();
        }
      })
      .catch(err => {
        console.error('Erro na busca:', err);
      });
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    searchMovies(query);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchMovies(searchInput.value);
    }
  });

  // Clique fora da área fecha o overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideOverlay();
    }
  });

function fetchMovies(type) {
  const row = document.getElementById(type);  // Container específico de cada tipo
  row.innerHTML = '';  // Limpa antes de carregar

  let url = '';  // URL da API

  // Define a URL conforme o tipo
  if (type === 'launches') {
    url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=pt-BR&page=1`;
  } else if (type === 'topRated') {
    url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=pt-BR&page=1`;
  } else if (type === 'popular') {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
  } else if (type === 'acao') {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=28&page=1`;
  } else if (type === 'comedia') {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=35&page=1`;
  } else if (type === 'terror') {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=27&page=1`;
  } else if (type === 'suspense') {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=53&page=1`;
  } else if (type === 'romance') {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=10749&page=1`;
  } else if (type === 'anime') {
  url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=16&with_original_language=ja&page=1`;
}

  console.log(`Buscando filmes para: ${url}`);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Dados recebidos da API:', data);

      if (data.results && data.results.length > 0) {
        const movies = data.results;

        movies.forEach(filme => {
          const card = document.createElement('div');
          card.classList.add('card-movie');

          const posterUrl = imgBase + filme.poster_path;
          card.innerHTML = `
            <img src="${posterUrl}" alt="${filme.title}">
          `;

          card.addEventListener('click', () => {
            fetch(`https://api.themoviedb.org/3/movie/${filme.id}?api_key=${apiKey}&language=pt-BR`)
              .then(response => response.json())
              .then(details => {
                openModal(details);
              })
              .catch(error => {
                console.error('Erro ao buscar detalhes do filme:', error);
              });
          });

          row.appendChild(card);
        });
      } else {
        console.log('Nenhum filme encontrado para esta categoria.');
      }
    })
    .catch(error => {
      console.error('Erro ao buscar filmes:', error);
    });
}

// Chamada automática das categorias ao carregar a página
window.onload = function() {
  fetchMovies('launches');
  fetchMovies('topRated');
  fetchMovies('popular');
  fetchMovies('acao');
  fetchMovies('comedia');
  fetchMovies('terror');
  fetchMovies('suspense');
  fetchMovies('romance');
  fetchMovies('anime');
};


const modal = document.getElementById('movieModal');
const modalTitle = document.getElementById('modalTitle');
const modalOverview = document.getElementById('modalOverview');
const modalRating = document.getElementById('modalRating');
const modalRelease = document.getElementById('modalRelease');
const closeModalBtn = document.getElementById('closeModal');


async function openModal(details) {
  modalTitle.textContent = details.title;
  modalOverview.textContent = details.overview || 'Sem sinopse disponível.';
  modalRating.innerHTML = `
  <span style="display: inline-flex; align-items: center;">
    <img src="/assets/img/logo_stat.png" style="height: 30px; vertical-align: middle; margin-right: 6px;">
    ${details.vote_average?.toFixed(1) || 'N/A'}/10
  </span>
`;
  modalRelease.textContent = `${details.release_date || 'Desconhecido'}`;
  modal.classList.remove('hidden');


  const modalBgImage = document.getElementById('modalBgImage');
const backdrop = details.backdrop_path || details.poster_path;

if (backdrop) {
  modalBgImage.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${backdrop})`;
} else {
  modalBgImage.style.backgroundImage = 'none';
}

  // Buscar e exibir trailer
  const trailerKey = await buscarTrailer(details.id);
  const modalTrailer = document.getElementById('modalTrailer');
  
  if (trailerKey) {
    modalTrailer.innerHTML = `
       <a href="https://www.youtube.com/embed/${trailerKey}"  
        title="Trailer de ${details.title}"> <button class="btn-trailer"> Assistir trailer </button>
      </a> 
    `;
  } else {
    modalTrailer.innerHTML = `<p style="text-align:center; padding-bottom: 180px">Trailer não disponível.</p>`;
  }
}

async function buscarTrailer(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=pt-BR`;

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    const trailer = dados.results.find(video =>
      video.site === "YouTube" && video.type === "Trailer"
    );

    return trailer ? trailer.key : null;

  } catch (erro) {
    console.error("Erro ao buscar trailer:", erro);
    return null;
  }
}

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});



// Função para rolar os filmes lateralmente (para a direita)
function avancarFilmes(type) {
  const movieRow = document.getElementById(type);  // Obtém a linha de filmes específica para o tipo
  movieRow.scrollBy({
    left: 400,  // Rola 400px para a direita
    behavior: 'smooth'  // Rola suavemente
  });
}

// Função para rolar os filmes lateralmente (para a esquerda)
function voltarFilmes(type) {
  const movieRow = document.getElementById(type);  // Obtém a linha de filmes específica para o tipo
  movieRow.scrollBy({
    left: -400,  // Rola 400px para a esquerda
    behavior: 'smooth'  // Rola suavemente
  });
}

// Função executada assim que a página carrega
window.onload = function() {
  // Chama a função para buscar filmes assim que a página carregar
   // Buscar todos os tipos de filmes
  fetchMovies('launches');
  fetchMovies('topRated');
  fetchMovies('popular');
  fetchMovies('acao');
  fetchMovies('comedia');
  fetchMovies('terror');
  fetchMovies('suspense');
  fetchMovies('romance');
  fetchMovies('anime');
};

// Adiciona os eventos de click para os botões de navegação dos filmes
document.querySelector('.prev-launches').addEventListener('click', () => {
  voltarFilmes('launches');  // Rola os filmes de lançamentos para a esquerda
});

document.querySelector('.next-launches').addEventListener('click', () => {
  avancarFilmes('launches');  // Rola os filmes de lançamentos para a direita
});

document.querySelector('.prev-popular').addEventListener('click', () => {
  voltarFilmes('popular');  // Rola os filmes populares para a esquerda
});

document.querySelector('.next-popular').addEventListener('click', () => {
  avancarFilmes('popular');  // Rola os filmes populares para a direita
});

document.querySelector('.prev-topRated').addEventListener('click', () => {
  voltarFilmes('topRated');  // Rola os filmes mais bem avaliados para a esquerda
});

document.querySelector('.next-topRated').addEventListener('click', () => {
  avancarFilmes('topRated');  // Rola os filmes mais bem avaliados para a direita
});

document.querySelector('.prev-acao').addEventListener('click', () => {
  voltarFilmes('acao');
});
document.querySelector('.next-acao').addEventListener('click', () => {
  avancarFilmes('acao');
});

document.querySelector('.prev-comedia').addEventListener('click', () => {
  voltarFilmes('comedia');
});
document.querySelector('.next-comedia').addEventListener('click', () => {
  avancarFilmes('comedia');
});

document.querySelector('.prev-terror').addEventListener('click', () => {
  voltarFilmes('terror');
});
document.querySelector('.next-terror').addEventListener('click', () => {
  avancarFilmes('terror');
});

document.querySelector('.prev-suspense').addEventListener('click', () => {
  voltarFilmes('suspense');
});
document.querySelector('.next-suspense').addEventListener('click', () => {
  avancarFilmes('suspense');
});

document.querySelector('.prev-romance').addEventListener('click', () => {
  voltarFilmes('romance');
});
document.querySelector('.next-romance').addEventListener('click', () => {
  avancarFilmes('romance');
});

document.querySelector('.prev-anime').addEventListener('click', () => {
  voltarFilmes('anime');
});
document.querySelector('.next-anime').addEventListener('click', () => {
  avancarFilmes('anime');
});

const bemvindo = document.getElementall('bemvindo');