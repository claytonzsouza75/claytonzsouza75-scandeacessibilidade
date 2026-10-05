// Sample HTML scenarios for instant demonstration and comparison

export const SAMPLE_SCENARIOS: Record<string, { title: string; url: string; html: string }> = {
  barreiras: {
    title: 'Portal Exemplo — Com Múltiplas Barreiras de Acessibilidade',
    url: 'https://exemplo-com-barreiras.com.br',
    html: `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <title>Loja Virtual & Portal Exemplo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0">
  <style>
    * { outline: none; }
    .hero-btn { color: #d1d5db; background-color: #f3f4f6; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <a href="/"><img src="/logo.png" alt="logo.png"></a>
    </div>
    <div onclick="abrirMenu()" tabindex="1">Menu de Navegação</div>
    <a onclick="mostrarMais()">Ver mais ofertas</a>
    <div role="button" onclick="salvarFavorito()">Salvar nos Favoritos</div>
    <div tabindex="0">Painel de novidades rápidas</div>
  </div>

  <div class="main-content">
    <h4>Promoção de Primavera</h4>
    <p>Novidades exclusivas na nossa loja.</p>
    <a href="/promocao">Clique aqui</a>
    <a href="/detalhes">Saiba mais</a>

    <div class="products" style="width: 1200px;">
      <div class="card">
        <img src="IMG_9821.jpg" alt="IMG_9821.jpg">
        <a href="/calcado"><img src="thumb.jpg" alt=""></a>
        <div onclick="comprarItem(12)">Comprar agora</div>
      </div>
    </div>

    <!-- Modal inativo com elemento focável oculto (foco fantasma) -->
    <div aria-hidden="true" style="display:none;">
      <button>Confirmar compra em modal inativo</button>
    </div>

    <form action="/newsletter">
      <input type="text" placeholder="Digite seu e-mail para receber descontos">
      <input type="text" placeholder="Seu WhatsApp">
      <button style="color: #94a3b8; background-color: #ffffff;">Enviar</button>
    </form>

    <div class="carousel-container" class="swiper-container">
      <img src="banner1.jpg" alt="foto">
    </div>

    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
  </div>

  <script src="https://cdn.userway.org/widget.js"></script>
</body>
</html>`,
  },
  otimizado: {
    title: 'Portal Modelo — Acessibilidade WCAG 2.1 Nível AA',
    url: 'https://exemplo-acessivel.com.br',
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Portal Inclusivo Modelo — Acessibilidade Digital</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; transition: none !important; }
    }
  </style>
</head>
<body>
  <a href="#conteudo-principal" class="skip-link">Pular para o conteúdo principal</a>

  <header>
    <nav aria-label="Navegação Principal">
      <a href="/" aria-label="Ir para a página inicial da TechInclusiva">
        <img src="/logo.svg" alt="TechInclusiva — Soluções Acessíveis">
      </a>
      <ul>
        <li><a href="/servicos">Nossos Serviços Especializados</a></li>
        <li><a href="/sobre">Conheça Nossa História e Valores</a></li>
        <li><a href="/contato">Fale com um Especialista</a></li>
      </ul>
    </nav>
  </header>

  <main id="conteudo-principal">
    <h1>Transformando a Experiência Digital para Todas as Pessoas</h1>
    <p>Acessibilidade na web não é um recurso extra, é um direito fundamental.</p>
    <a href="/diagnostico">Solicitar diagnóstico de acessibilidade gratuito</a>

    <section aria-labelledby="produtos-destaque">
      <h2 id="produtos-destaque">Soluções em Destaque</h2>
      <article>
        <h3>Auditoria Automatizada e Manual</h3>
        <img src="/auditoria.jpg" alt="Especialista em acessibilidade revisando código com teclado e leitor de tela">
        <p>Avaliamos conformidade com as diretrizes internacionais da WCAG 2.1.</p>
        <button type="button" class="btn-primary" style="color: #ffffff; background-color: #0f172a;">
          Ver detalhes do serviço de auditoria
        </button>
      </article>
    </section>

    <section aria-labelledby="form-newsletter">
      <h2 id="form-newsletter">Receba Nosso Boletim Informativo</h2>
      <form action="/inscrever" method="POST">
        <label for="email-boletim">Seu endereço de e-mail institucional:</label>
        <input type="email" id="email-boletim" name="email" required placeholder="exemplo@empresa.com.br">
        
        <button type="submit" style="color: #ffffff; background-color: #1e293b;">
          Assinar boletim informativo de acessibilidade
        </button>
      </form>
    </section>
  </main>

  <footer>
    <p>© 2026 TechInclusiva. Todos os direitos reservados.</p>
  </footer>
</body>
</html>`,
  },
};
