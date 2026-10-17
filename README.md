# Tessumax — Landing Page

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

Landing page institucional, única página e estática, da Tessumax — empresa de tecnologia que entrega sites, sistemas sob medida, aplicativos, vídeos publicitários e marketing digital com processo claro, código próprio e resultado verificável, do brief ao lançamento.

## Problema / Por que existe

Empresas precisam de presença digital, mas frequentemente encontram fornecedores que somem no meio do projeto, entregam templates genéricos, não documentam o que foi feito e ficam com o código preso. O cliente não sabe em que etapa está o projeto, recebe surpresas de prazo e não consegue manter o que foi entregue.

A Tessumax existe para ser um único parceiro do desenho à release: orçamento honesto antes de qualquer linha de código, atualizações regulares durante a construção, código no repositório do cliente com histórico e documentação mínima para que outro desenvolvedor continue sem precisar perguntar.

## O que faz

A página apresenta o trabalho da Tessumax em oito seções:

- Quatro frentes de entrega — Sites, Sistemas, Apps e Vídeo & Marketing — cada uma com seus entregáveis, prazos típicos e stack usada (por exemplo, sites em HTML5, CSS, JavaScript, Tailwind e Vite; sistemas em Java, Spring Boot, Python, PostgreSQL, MySQL e Docker; apps em React Native com Expo e TypeScript).
- Dois produtos publicados e verificáveis — Garimpo (curadoria de 131 ofertas da Shopee, 100% no navegador, sem backend) e KODAROS (plataforma com 8 e-books e funil de diagnóstico) — ambos com link direto para o ar e para o repositório.
- Acervo de 17 modelos de site por nicho — clínica médica, academia, advocacia, moda e-commerce, cursos EAD, imobiliária, estética, SaaS, restaurante, finanças, casamento, odontologia, marketing digital, energia solar, construção civil, viagens e cripto/web3 — cada um aberto no navegador com link direto.
- Stack de tecnologias com filtro por área — frontend, backend, mobile, desktop, dados, infra, vídeo, IA e marketing — com aviso de que a lista varia conforme o projeto.
- Processo em três etapas — Escopo, Construção e Entrega — com o que o cliente recebe em cada uma.
- Formulário de brief sem servidor: validação no navegador, montagem da mensagem e envio pelo WhatsApp ou e-mail; nada sai do navegador até o usuário enviar.

## Stack

Do próprio site:

- HTML5 e CSS3 em arquivo único (assets/css/main.css), com primitivos de layout em camada @layer od-layout.
- JavaScript vanilla sem dependências (assets/js/main.js): tema, pré-carregador, abas, filtros, trilhos, formulário, revelação ao rolar e canvas de partículas no hero.
- Fontes Arquivo e JetBrains Mono auto-hospedadas (woff2, pré-carregadas).
- Dois temas, Tinta (escuro) e Papel (claro), com detecção da preferência do sistema e persistência em localStorage.

Tecnologias listadas na página para entregas de clientes (não é lista fechada; varia conforme o escopo): Python, JavaScript, TypeScript, Java, Rust, React, Node.js, Docker, PostgreSQL, MySQL, Spring Boot, Tailwind CSS, Git, Tauri, Vite, Linux, Expo, Ruby, Next.js, Astro, GSAP, Three.js, p5.js, Lottie, Framer Motion, Remotion, HyperFrames, FFmpeg, Whisper, Gemini, Supabase, Stripe, npm, Playwright, Puppeteer, OpenCV, Tesseract OCR, Cloudflare, Figma, Search Console, Perfil da Empresa, DataForSEO e OpenSEO.

A procedência de fontes, logos, ícones e capturas está documentada em assets/SOURCES.txt.

## Como funciona

1. Abre o index.html no navegador. Não há passo de build, servidor nem dependências de instalação.
2. A navegação usa âncoras de seção (#frentes, #processo, #produtos, #exemplos, #stack, #sobre, #depoimentos, #faq, #contato) e um menu de gaveta em telas pequenas.
3. O JavaScript inicializa módulos isolados: alternância de tema sem flash de tela, pré-carregador vinculado ao carregamento de fontes e documento, revelação de elementos ao rolar, abas acessíveis, filtro da stack, trilhos horizontais arrastáveis, validação do formulário de brief e animações apenas com transform e opacity.
4. O site respeita prefers-reduced-motion: com movimento reduzido, as revelações aparecem imediatamente, o pré-carregador é pulado e as animações são desligadas.
5. O formulário de brief não tem servidor: ao enviar, monta a mensagem com os dados preenchidos e abre a conversa no WhatsApp (ou copia o resumo para a área de transferência).

## Como rodar

Clonar o repositório:

git clone https://github.com/KelvinOliveiraCode/tessumax-landing.git
cd tessumax-landing

Abrir a página:

- duplo-clique em index.html, ou
- sirva a pasta com qualquer servidor estático, por exemplo python -m http.server 8000, e acesse http://localhost:8000.

Não requer Node.js, npm, ferramentas de build nem conta em nuvem. A página está publicada em https://kelvinoliveiracode.github.io/tessumax-landing/.

## Estrutura do projeto

tessumax-landing/
├── index.html                 # página única: HTML, primitivos de layout em CSS embutido e script de tema inline
├── logo-Tessumax.svg          # favicon
├── README.md
└── assets/
    ├── css/main.css           # estilos do produto
    ├── js/main.js             # runtime sem dependências
    ├── fonts/                 # Arquivo e JetBrains Mono (woff2 e fonts.css)
    ├── logos/                 # marcas de tecnologia em SVG
    ├── icons/                 # ícones de redes sociais
    ├── screens/               # 17 capturas de 800x800 px dos modelos por nicho
    ├── logo-tessumax.svg
    ├── banner-tessumax-arte.svg
    ├── apple-touch-icon.png
    ├── og-image.png
    └── SOURCES.txt            # procedência de fontes, logos, ícones e capturas

## Trade-offs e decisões

- Página única estática sem build: deploy imediato em GitHub Pages, carregamento rápido e zero dependências de ferramenta; contra: conteúdo e markup misturados em um único HTML longo.
- CSS dividido em camada @layer od-layout (estrutura: display, flex, grid, ratio, recorte) e CSS do produto fora da camada, que sempre vence: separa preocupações e evita especificidade imprevista.
- Script de tema executado inline antes do primeiro paint: evita flash de tema incorreto ao carregar; custo de estilo crítico no HTML.
- Pré-carregador com duração mínima vinculado ao carregamento de fontes e documento; desativado com prefers-reduced-motion ou em visitas repetidas.
- Canvas de partículas no hero usa apenas transform/opacity, pára quando sai da viewport e com visibilitychange para economizar bateria.
- Sem backend: o brief é montado no cliente e enviado pelo WhatsApp ou e-mail do usuário. Vantagem: zero infraestrutura de servidor e nada sai do navegador sem ação do usuário; contra: não há recebimento automático nem armazenamento de mensagens.
- Fontes auto-hospedadas com preload: controle total e nenhuma request externa de fonte; custo de arquivos binários no repositório.
- Logos de terceiros monomatizados por CSS (.logo-img); marcas pertencem aos respectivos titulares.
- Depoimentos são textos de exemplo fictícios, conforme aviso no próprio HTML, a serem substituídos por falas reais antes de publicar.

## Limitações conhecidas

- Não há scripts de build, testes automatizados nem integração contínua no repositório da landing page.
- O formulário de brief não armazena nem encaminha mensagens automaticamente; depende do WhatsApp ou do e-mail do usuário.
- Depoimentos são exemplos fictícios e precisam ser substituídos por falas reais antes de publicar.
- Sem backend ou CMS: qualquer alteração de conteúdo exige editar os arquivos diretamente.
- Os modelos do acervo são páginas sem identidade visual de cliente, usadas apenas para demonstrar capacidade técnica; não são sites prontos para uso de uma empresa real.
- Com JavaScript desativado, o tema padrão é escuro e as revelações ficam visíveis; o restante da interatividade não funciona.

## Licença

MIT

## Autor

Kelvin Oliveira — github.com/KelvinOliveiraCode
