# LP Plasticauto

Landing page e catálogo técnico-comercial da Plasticauto, preparado para publicação no GitHub Pages.

## Recursos implementados

- página inicial responsiva;
- catálogo com 53 produtos;
- busca por nome, código, marca, modelo e descrição;
- filtros por marca, modelo, ano e categoria;
- páginas individuais por produto via `produto.html?id=...`;
- mensagens de WhatsApp preenchidas automaticamente;
- formulário comercial para revendedores;
- SEO básico, dados estruturados e sitemap;
- workflow de deploy no GitHub Pages.

## Pontos a confirmar antes do lançamento definitivo

1. **WhatsApp:** o número `14 99756-4659` foi encontrado em diretório público de Tupã, mas deve ser confirmado pela Plasticauto. A configuração fica em `assets/js/app.js`.
2. **Fotos:** o MVP usa ilustrações gráficas. Substituir por fotografias oficiais, preferencialmente em WebP.
3. **Aplicações:** revisar anos e versões, especialmente o item `AB-FRONTIER-001`, cuja descrição no site anterior estava inconsistente.
4. **Anos recentes:** confirmar aplicações 2025/2026 para produtos cadastrados até 2024.
5. **Materiais e instalação:** complementar as páginas com material, conteúdo do kit, garantia, EAN e instruções.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica o conteúdo após alterações na branch `main`. Caso seja a primeira publicação, abra **Settings → Pages** e selecione **GitHub Actions** como fonte.
