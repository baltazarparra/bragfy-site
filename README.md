# Bragfy

Landing page estática para o Bragfy — um agente inteligente que ajuda profissionais a documentarem atividades no trabalho, diretamente via Telegram.

## Objetivo

Construir uma página institucional ultra performática e bem posicionada em SEO, sem dependências externas como frameworks ou bibliotecas CSS. A página é 100% estática e hospedável via Vercel, Netlify ou qualquer outro serviço de hospedagem estática.

## Stack Técnica

- HTML5 semântico
- CSS puro (modularizado em arquivos separados)
- Zero dependências externas
- Sem frameworks ou bibliotecas (sem Tailwind, sem React, sem jQuery)
- SEO otimizado: Schema.org (JSON-LD), Open Graph, Twitter Cards
- Favicons para múltiplos dispositivos
- Mobile-first e responsivo

## Estrutura de Diretórios

```
bragfy-site/
├── css/
│   └── style.css           # Estilos da aplicação
├── favicon/
│   ├── favicon.ico         # Favicon tradicional
│   ├── favicon.svg         # Favicon vetorial
│   └── site.webmanifest    # Manifesto para PWA
├── img/
│   ├── bragfy-hero.svg     # Ilustração principal
│   ├── bragfy-logo.svg     # Logo principal
│   ├── bragfy-logo-footer.svg # Logo do rodapé
│   ├── icon-connect.svg    # Ícone de conexão
│   ├── icon-chat.svg       # Ícone de chat
│   ├── icon-document.svg   # Ícone de documento
│   └── og-image.svg        # Imagem para Open Graph
├── index.html              # Página principal
├── PLAN.md                 # Planejamento técnico
├── README.md               # Este arquivo
└── LICENSE                 # Licença do projeto
```

## Características Principais

- **Performance Otimizada:**

  - HTML e CSS minimalistas e eficientes
  - Carregamento de fontes otimizado com preload
  - Imagens SVG leves e responsivas
  - Lazy loading para imagens secundárias

- **SEO Técnico:**

  - Meta tags completas (description, keywords, robots)
  - Dados estruturados com JSON-LD
  - Open Graph para compartilhamento em redes sociais
  - Twitter Cards para exibição adequada no Twitter
  - Canonical link

- **Acessibilidade:**
  - HTML semântico com landmarks
  - Cores com contraste adequado
  - Navegação por teclado funcional
  - Atributos ARIA quando necessário

## Como Usar

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/bragfy-site.git
   cd bragfy-site
   ```

2. Abra o arquivo `index.html` em seu navegador para visualização local.

3. Para implantar, faça upload dos arquivos para qualquer servidor web ou plataforma de hospedagem estática como Vercel, Netlify, GitHub Pages, etc.

## Modificações Necessárias Antes da Produção

- Substituir imagens SVG por versões finalizadas
- Gerar versões reais dos favicons a partir do SVG base
- Atualizar as URLs no HTML e nos metadados para o domínio final

## Licença

Este projeto está licenciado sob os termos da Licença MIT - veja o arquivo LICENSE para mais detalhes.
