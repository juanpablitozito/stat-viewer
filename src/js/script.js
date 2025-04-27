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

// Função para buscar filmes de cada categoria (Lançamentos, Populares, Melhores Avaliados)
function fetchMovies(type) {
  const row = document.getElementById(type);  // Obtém o container específico para cada tipo de filme
  row.innerHTML = '';  // Limpa a área de filmes antes de adicionar novos filmes
  
  let url = '';  // URL da API
  
  // Define a URL da API dependendo do tipo de filmes
  if (type === 'launches') {
    url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=pt-BR&page=1`;
  } else if (type === 'topRated') {
    url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=pt-BR&page=1`;
  } else if (type === 'popular') {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
  }
  
  console.log(`Buscando filmes para: ${url}`);  // Exibe a URL que será chamada para depuração
  
  // Realiza a requisição para a API
  fetch(url)
    .then(response => response.json())  // Converte a resposta para JSON
    .then(data => {
      console.log('Dados recebidos da API:', data);  // Exibe os dados recebidos da API
      
      // Se a resposta contiver resultados de filmes
      if (data.results && data.results.length > 0) {
        const movies = data.results;  // Acessa os resultados dos filmes
        
        // Para cada filme, cria um card e o adiciona à página
        movies.forEach(filme => {
          const card = document.createElement('div');
          card.classList.add('card-movie');  // Adiciona uma classe de estilo ao card
  
          const posterUrl = imgBase + filme.poster_path;  // Monta a URL da imagem do cartaz do filme
          card.innerHTML = `  <!-- Exibe o poster e título do filme -->
            <img src="${posterUrl}" alt="${filme.title}">
            <h3>${filme.title}</h3>
          `;
  
          row.appendChild(card);  // Adiciona o card de filme à área de filmes
        });
      } else {
        console.log('Nenhum filme encontrado para esta categoria.');  // Caso não haja filmes
      }
    })
    .catch(error => {
      console.error('Erro ao buscar filmes:', error);  // Captura qualquer erro da requisição
    });
}

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
  fetchMovies('launches');   // Busca filmes de Lançamentos
  fetchMovies('topRated');   // Busca filmes Melhores Avaliados
  fetchMovies('popular');    // Busca filmes Populares
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