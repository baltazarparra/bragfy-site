# Bragfy Landing Page — Technical Plan

## Visão geral

Criar uma landing page institucional para o Bragfy, explicando a proposta do agente, com foco em conversão de novos usuários via SEO e performance web.

## Objetivos principais

1. **Performance alta (nota verde no Lighthouse)**
2. **SEO técnico e semântico impecável**
3. **Sem frameworks, 100% HTML/CSS puro**
4. **UX simples, rápida e acessível**
5. **Design limpo, moderno e mobile-first**

## Requisitos funcionais

- Estrutura básica:

  - Seção de apresentação do agente
  - Como funciona o Bragfy
  - Benefícios para o usuário
  - Chamada para ação (ex: “Comece agora no Telegram”)
  - Footer com informações institucionais e redes sociais

- Arquivos:
  - `index.html`
  - `style.css` separado (sem frameworks)
  - Imagens WebP otimizadas
  - Favicon com múltiplas versões

## Requisitos técnicos

- HTML semântico (`<main>`, `<section>`, `<header>`, `<footer>`, etc.)
- CSS sem preprocessadores
- Fontes carregadas via `preload`
- Imagens em WebP ou AVIF
- SEO:
  - Tags Open Graph
  - Twitter Cards
  - Meta description + keywords
  - JSON-LD com dados estruturados (`Organization`, `WebSite`, `Product`)
- Acessibilidade com landmarks e contrastes adequados
- Responsivo mobile-first
- Lighthouse 100 em todos os pilares

## Prompt base inicial para o Cursor

```plaintext
Crie um projeto HTML com os seguintes arquivos:
- `index.html`: estrutura básica da landing page do Bragfy, com HTML5 semântico, tags meta para SEO, links para CSS e favicon. Deve conter seção principal com headline, subtítulo, botão CTA e uma imagem ilustrativa. Use fontes do Google Fonts com preload.
- `css/style.css`: comece com estilos base para reset, tipografia, layout responsivo e grid simples.
- `img/`: crie imagem placeholder otimizada (use `.webp`).

Não utilize frameworks nem bibliotecas externas. O foco é performance máxima e SEO. Prepare a base para ser facilmente editada via vibe coding com Claude 3.7 no Cursor.
```
