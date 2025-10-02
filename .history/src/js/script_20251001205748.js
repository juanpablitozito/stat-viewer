// === VARIÁVEIS GLOBAIS ===
const baseUrl = "https://api.themoviedb.org/3";
const apiKey = "667f29be2c2b3a1826a0467ad42f291b"; // SUBSTITUA PELA SUA CHAVE REAL
const imgBase = "https://image.tmdb.org/t/p/w500";

// Variáveis de controle do carrossel
let indice = 0;
let total = 0;
let carrosselInterval;

// === FUNÇÃO DE DETECÇÃO MOBILE ===
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || 
           (navigator.userAgent.indexOf('IEMobile') !== -1) ||
           (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// === CONFIGURAÇÃO SWIPE PARA MOBILE ===
function configurarSwipe() {
    const carrossel = document.querySelector('.carrossel');
    
    if (!carrossel || !isMobileDevice()) return;

    let touchStartX = 0;
    let touchEndX = 0;

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

// === CARROSSEL PRINCIPAL ===
async function carregarCarrossel() {
    try {
        const resposta = await fetch(`${baseUrl}/movie/now_playing?api_key=${apiKey}&language=pt-BR&page=1`);
        const dados = await resposta.json();
        const filmes = dados.results.slice(0, 5);

        const slidesContainer = document.getElementById('slides');
        
        if (!slidesContainer) {
            console.error("Elemento 'slides' não encontrado");
            return;
        }

        slidesContainer.innerHTML = filmes.map(filme => {
            const backdropUrl = filme.backdrop_path 
                ? `https://image.tmdb.org/t/p/w1280${filme.backdrop_path}`
                : 'https://via.placeholder.com/1280x500/333/666?text=Imagem+Indisponível';
            
            return `
            <div class="slide" style="min-width:100%; height: 500px; 
                 background-image: url('${backdropUrl}');
                 background-size: cover; background-position: center;">
            
                <h2>${filme.title}</h2>
                <p>${filme.overview ? filme.overview.substring(0, 150) + "..." : "Sem descrição disponível."}</p>
              </div>
          
            `;
        }).join('');
        overlay.style.display = 'none';
        total = filmes.length;
        indice = 0;
        atualizarSlide();

        // Configurar intervalo com suporte mobile
        configurarIntervaloMobile();

    } catch (error) {
        console.error("Erro ao carregar carrossel principal:", error);
    }
}

function configurarIntervaloMobile() {
    if (carrosselInterval) clearInterval(carrosselInterval);
    
    const intervalo = isMobileDevice() ? 5000 : 8000;
    carrosselInterval = setInterval(avancarSlide, intervalo);
}

function atualizarSlide() {
    const slides = document.getElementById("slides");
    if (slides) {
        slides.style.transform = `translateX(-${indice * 100}%)`;
        slides.style.transition = "transform 0.8s ease-in-out";
    }
}

function avancarSlide() {
    if (total === 0) return;
    indice = (indice + 1) % total;
    atualizarSlide();
}

function voltarSlide() {
    if (total === 0) return;
    indice = (indice - 1 + total) % total;
    atualizarSlide();
}

// === CONTROLE DE FILMES ===
function avancarFilmes(type) {
    const movieRow = document.getElementById(type);
    if (!movieRow) {
        console.warn(`Elemento com ID '${type}' não encontrado`);
        return;
    }
    
    const scrollAmount = isMobileDevice() ? 200 : 400;
    movieRow.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

function voltarFilmes(type) {
    const movieRow = document.getElementById(type);
    if (!movieRow) {
        console.warn(`Elemento com ID '${type}' não encontrado`);
        return;
    }
    
    const scrollAmount = isMobileDevice() ? 200 : 400;
    movieRow.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
    });
}

// === BUSCA DE FILMES ===
function configurarBusca() {
    const searchInput = document.getElementById('query');
    const overlay = document.getElementById('searchResultsOverlay');
    const resultsContainer = document.getElementById('searchResults');

    if (!searchInput || !overlay || !resultsContainer) {
        console.warn("Elementos de busca não encontrados");
        return;
    }

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
                if (data.results && data.results.length > 0) {
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
                        
                        card.addEventListener('click', () => {
                            hideOverlay();
                            fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=pt-BR`)
                                .then(response => response.json())
                                .then(details => {
                                    openModal(details);
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

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hideOverlay();
        }
    });
}

// === CARREGAR FILMES POR CATEGORIA ===
function fetchMovies(type) {
    const row = document.getElementById(type);
    if (!row) {
        console.warn(`Container com ID '${type}' não encontrado`);
        return;
    }

    row.innerHTML = '<div class="loading">Carregando...</div>';

    let url = '';

    // Define a URL conforme o tipo
    switch(type) {
        case 'launches':
            url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=pt-BR&page=1`;
            break;
        case 'topRated':
            url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=pt-BR&page=1`;
            break;
        case 'popular':
            url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
            break;
        case 'acao':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=28&page=1`;
            break;
        case 'comedia':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=35&page=1`;
            break;
        case 'terror':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=27&page=1`;
            break;
        case 'suspense':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=53&page=1`;
            break;
        case 'romance':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=10749&page=1`;
            break;
        case 'anime':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=16&with_original_language=ja&page=1`;
            break;
        default:
            console.error('Tipo de filme não reconhecido:', type);
            return;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            row.innerHTML = '';

            if (data.results && data.results.length > 0) {
                data.results.forEach(filme => {
                    const card = document.createElement('div');
                    card.classList.add('card-movie');

                    const posterUrl = filme.poster_path 
                        ? imgBase + filme.poster_path 
                        : 'https://via.placeholder.com/150x225?text=Sem+Imagem';
                    
                    card.innerHTML = `
                        <img src="${posterUrl}" alt="${filme.title}" loading="lazy"/>
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
                row.innerHTML = '<p class="no-movies">Nenhum filme encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar filmes:', error);
            row.innerHTML = '<p class="error-message">Erro ao carregar filmes.</p>';
        });
}

// === MODAL ===
const modal = document.getElementById('movieModal');
const modalTitle = document.getElementById('modalTitle');
const modalOverview = document.getElementById('modalOverview');
const modalRating = document.getElementById('modalRating');
const modalRelease = document.getElementById('modalRelease');
const closeModalBtn = document.getElementById('closeModal');

async function openModal(details) {
    if (!modal || !modalTitle || !modalOverview || !modalRating || !modalRelease) {
        console.error("Elementos do modal não encontrados");
        return;
    }

    modalTitle.textContent = details.title;
    modalOverview.textContent = details.overview || 'Sem sinopse disponível.';
    modalRating.innerHTML = `
        <span style="display: inline-flex; align-items: center;">
            <img src="/assets/img/logo_stat.ico" style="height: 30px; vertical-align: middle; margin-right: 6px;">
            ${details.vote_average?.toFixed(1) || 'N/A'}/10
        </span>
    `;
    modalRelease.textContent = `${details.release_date || 'Desconhecido'}`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

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

    if (modalTrailer) {
        if (trailerKey) {
            modalTrailer.innerHTML = `
                <a href="https://www.youtube.com/embed/${trailerKey}"  
                 title="Trailer de ${details.title}"> 
                 <button class="btn-trailer"> Assistir trailer </button>
                </a> 
            `;
        } else {
            modalTrailer.innerHTML = `<p style="text-align:center; padding-bottom: 180px">Trailer não disponível.</p>`;
        }
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

// Fechar modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
}

// === CARREGAR TODOS OS FILMES ===
function carregarTodosOsFilmes() {
    const categorias = [
        'launches', 'topRated', 'popular', 'acao', 
        'comedia', 'terror', 'suspense', 'romance', 'anime'
    ];
    
    categorias.forEach(categoria => {
        fetchMovies(categoria);
    });
}

// === CONFIGURAR EVENTOS DOS BOTÕES ===
function configurarEventosBotoes() {
    document.addEventListener('click', function(e) {
        const classList = e.target.classList;
        
        if (classList.contains('prev-launches') || e.target.closest('.prev-launches')) {
            voltarFilmes('launches');
        }
        if (classList.contains('next-launches') || e.target.closest('.next-launches')) {
            avancarFilmes('launches');
        }
        
        if (classList.contains('prev-popular') || e.target.closest('.prev-popular')) {
            voltarFilmes('popular');
        }
        if (classList.contains('next-popular') || e.target.closest('.next-popular')) {
            avancarFilmes('popular');
        }
        
        if (classList.contains('prev-topRated') || e.target.closest('.prev-topRated')) {
            voltarFilmes('topRated');
        }
        if (classList.contains('next-topRated') || e.target.closest('.next-topRated')) {
            avancarFilmes('topRated');
        }
        
        // Adicione outros botões conforme necessário
    });
}

// === ALERTA DE BOAS-VINDAS ===
function mostrarAlerta() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Bem-vindo!',
            icon: 'success',
            customClass: {
                popup: 'meu-popup',
                title: 'meu-titulo',
                confirmButton: 'meu-botao'
            }
        });
    }
}

// === INICIALIZAÇÃO PRINCIPAL ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicação...');
    
    // Carregar carrossel e filmes
    carregarCarrossel();
    carregarTodosOsFilmes();
    
    // Configurar eventos
    configurarSwipe();
    configurarEventosBotoes();
    configurarBusca();
    
    // Mostrar alerta após um delay
    setTimeout(mostrarAlerta, 1000);
});

// Event listeners para os botões de navegação do carrossel (se existirem)
document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (prevBtn) prevBtn.addEventListener('click', voltarSlide);
    if (nextBtn) nextBtn.addEventListener('click', avancarSlide);
});