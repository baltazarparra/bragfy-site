const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;

// Mapeamento de extensões de arquivo para content-types
const CONTENT_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".glb": "model/gltf-binary",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".webmanifest": "application/manifest+json"
};

// Tipos de arquivos que deveriam ter charset UTF-8
const TEXT_TYPES = [
  ".html",
  ".css",
  ".js",
  ".json",
  ".svg",
  ".txt",
  ".webmanifest"
];

// Função para servir a página 404
function serve404(res) {
  const notFoundPath = path.join(process.cwd(), "404.html");

  // Verifica se existe uma página 404 personalizada
  fs.access(notFoundPath, fs.constants.F_OK, (err) => {
    if (err) {
      // Usa uma página 404 padrão
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h1>404 Não Encontrado</h1><p>O arquivo solicitado não foi encontrado no servidor.</p>",
        "utf-8"
      );
    } else {
      // Usa a página 404 personalizada
      fs.readFile(notFoundPath, (readErr, content) => {
        if (readErr) {
          // Caso haja erro na leitura, usa a página padrão
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(
            "<h1>404 Não Encontrado</h1><p>O arquivo solicitado não foi encontrado no servidor.</p>",
            "utf-8"
          );
        } else {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(content);
          console.log("Servindo página 404 personalizada");
        }
      });
    }
  });
}

// Função para servir arquivos estáticos
function serveStaticFile(req, res) {
  // Parse da URL para lidar com parâmetros de consulta
  const parsedUrl = url.parse(req.url);
  // Decodifica a URL para tratar caracteres especiais
  const sanitizedPath = decodeURIComponent(parsedUrl.pathname);

  // Normaliza e resolve o caminho do arquivo
  let filePath = path.join(process.cwd(), sanitizedPath);

  // Se o caminho termina com /, serve o index.html
  if (filePath.endsWith("/") || filePath === process.cwd()) {
    filePath = path.join(filePath, "index.html");
  }

  // Obtém a extensão do arquivo solicitado
  const requestedExtname = path.extname(filePath).toLowerCase();

  // Verifica se existe um arquivo com a mesma base de nome mas extensão .svg
  // Isso é para lidar com placeholders SVG para arquivos .png, .ico, etc.
  const svgFallbackPath = path.format({
    dir: path.dirname(filePath),
    name: path.basename(filePath, requestedExtname),
    ext: requestedExtname === ".svg" ? requestedExtname : ".svg"
  });

  // Primeiro verifica se o arquivo original existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Arquivo não encontrado, verifica se existe uma versão SVG
      fs.access(svgFallbackPath, fs.constants.F_OK, (svgErr) => {
        if (svgErr) {
          // Nem o arquivo original nem a versão SVG existem
          console.log(`Arquivo não encontrado: ${filePath}`);
          serve404(res);
        } else {
          // Usa o arquivo SVG como fallback, mas mantém o content-type original
          serveFile(
            svgFallbackPath,
            requestedExtname !== ".svg"
              ? CONTENT_TYPES[requestedExtname]
              : null,
            res
          );
        }
      });
    } else {
      // Arquivo original encontrado, serve normalmente
      serveFile(filePath, null, res);
    }
  });
}

// Função auxiliar para servir o arquivo
function serveFile(filePath, overrideContentType, res) {
  // Obtém a extensão do arquivo a ser servido
  const extname = path.extname(filePath).toLowerCase();

  // Obtém o content-type apropriado
  let contentType =
    overrideContentType || CONTENT_TYPES[extname] || "text/plain";

  // Verifica se deve adicionar charset=utf-8
  const headers = {
    "Content-Type": contentType,
    // Adiciona cabeçalhos CORS para permitir carregamento de recursos
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cross-Origin-Resource-Policy": "cross-origin"
  };

  if (TEXT_TYPES.includes(extname) && !overrideContentType) {
    headers["Content-Type"] += "; charset=utf-8";
  }

  // Caso seja um arquivo GLB, adiciona cabeçalhos específicos para modelos 3D
  if (extname === ".glb") {
    headers["Content-Disposition"] = "inline";
  }

  // Lê o arquivo de forma assíncrona
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // Erro de servidor - 500
      console.error(`Erro ao ler o arquivo: ${err}`);
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h1>500 Erro Interno</h1><p>Ocorreu um erro ao processar sua solicitação.</p>",
        "utf-8"
      );
    } else {
      // Arquivo encontrado, envia a resposta com o content-type adequado
      res.writeHead(200, headers);
      res.end(content);
      console.log(`Servindo: ${filePath} (${contentType})`);
    }
  });
}

// Cria o servidor HTTP
const server = http.createServer((req, res) => {
  // Log da requisição
  console.log(`${req.method} ${req.url}`);

  // Serve o arquivo estático
  serveStaticFile(req, res);
});

// Inicia o servidor na porta definida
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Servindo arquivos do diretório: ${process.cwd()}`);
  console.log("Para acessar o site, abra o navegador em http://localhost:3000");
  console.log("Pressione Ctrl+C para encerrar o servidor");
});
