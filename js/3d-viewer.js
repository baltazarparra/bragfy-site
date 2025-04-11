// Arquivo 3d-viewer.js - Versão com Three.js carregado externamente e planeta procedural monocromático

// Função para inicializar a cena Three.js
function initThreeJS() {
  console.log(
    "Iniciando Three.js e geração do planeta procedural monocromático..."
  );

  // Verificar se o Three.js foi carregado
  if (typeof THREE === "undefined") {
    console.error(
      "THREE não está disponível. Verifique se o script foi carregado corretamente."
    );
    return;
  }

  // Seleção do container para o visualizador 3D
  const container = document.getElementById("viewer");
  if (!container) {
    console.error("Container #viewer não encontrado");
    return;
  }
  console.log(
    "Container #viewer encontrado, dimensões:",
    container.clientWidth,
    "x",
    container.clientHeight
  );

  // Criação da cena
  const scene = new THREE.Scene();
  console.log("Cena Three.js criada");

  // Configuração da câmera
  const camera = new THREE.PerspectiveCamera(
    65, // Campo de visão adequado para o planeta
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  // Configuração do renderizador com fundo transparente
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true // Habilitar transparência
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar pixel ratio para melhor performance
  renderer.setClearColor(0x000000, 0); // Fundo totalmente transparente

  // Configuração para sombras de alta qualidade
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Adicionar o canvas ao container
  container.appendChild(renderer.domElement);

  // Configuração refinada de iluminação para destacar textura monocromática
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Luz direcional principal com sombras de alta qualidade
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(3, 5, 3);
  directionalLight.castShadow = true;

  // Configuração avançada das sombras
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 30;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;

  // Ajuste fino para evitar artefatos nas sombras
  directionalLight.shadow.bias = -0.0005;
  directionalLight.shadow.normalBias = 0.02;
  scene.add(directionalLight);

  // Luz de preenchimento suave para áreas de sombra
  const fillLight = new THREE.DirectionalLight(0xe0e0e0, 0.5);
  fillLight.position.set(-5, -3, -5);
  scene.add(fillLight);

  // Luz de realce para dar profundidade e definição às bordas
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
  rimLight.position.set(0, 10, -10);
  scene.add(rimLight);

  // Gerar normal map procedural para detalhes de superfície refinados
  function generateNormalMap(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Preencher com cinza neutro (normal padrão)
    ctx.fillStyle = "rgb(128, 128, 255)";
    ctx.fillRect(0, 0, width, height);

    // Função para ruído melhorado (aproximação de Perlin)
    function improvedNoise(x, y, z) {
      // Usar combinações de funções trigonométricas com frequências diferentes
      // para aproximar comportamento de ruído de Perlin sem biblioteca externa
      const noiseX =
        Math.sin(x * 1.5) *
        Math.cos(y * 2.3 + z * 1.7) *
        Math.sin(z * 3.1 + x * 0.3);
      const noiseY =
        Math.cos(x * 2.1 + z * 0.9) *
        Math.sin(y * 3.3) *
        Math.cos(z * 0.7 + y * 2.9);
      const noiseZ =
        Math.sin(x * 0.8 + y * 1.5) *
        Math.cos(y * 0.5 + z * 1.9) *
        Math.sin(z * 2.5 + x * 1.3);

      return (noiseX + noiseY + noiseZ) / 3.0;
    }

    // Gerar valores para normal map
    const data = ctx.createImageData(width, height);
    const pixels = data.data;

    // Frequências para diferentes camadas de detalhes
    const frequencies = [
      { scale: 2.0, weight: 0.5 }, // Grandes formações
      { scale: 10.0, weight: 0.3 }, // Detalhes médios
      { scale: 20.0, weight: 0.15 }, // Detalhes pequenos
      { scale: 40.0, weight: 0.05 } // Micro-detalhes
    ];

    // Processamento de cada pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Coordenadas normalizadas e esféricas
        const u = x / width;
        const v = y / height;

        // Converter de coordenadas UV para coordenadas esféricas
        const phi = u * Math.PI * 2;
        const theta = v * Math.PI;

        // Converter para coordenadas cartesianas (esfera de raio 1)
        const px = Math.sin(theta) * Math.cos(phi);
        const py = Math.cos(theta);
        const pz = Math.sin(theta) * Math.sin(phi);

        // Acumular ruído de diferentes frequências
        let normalX = 0;
        let normalY = 0;
        let normalZ = 0;

        // Misturar múltiplas camadas de ruído (técnica de FBM - Fractional Brownian Motion)
        for (const freq of frequencies) {
          const nx = improvedNoise(
            px * freq.scale,
            py * freq.scale,
            pz * freq.scale
          );
          const ny = improvedNoise(
            px * freq.scale + 123.4,
            py * freq.scale + 567.8,
            pz * freq.scale + 901.2
          );
          const nz = improvedNoise(
            px * freq.scale + 234.5,
            py * freq.scale + 789.0,
            pz * freq.scale + 345.6
          );

          normalX += nx * freq.weight;
          normalY += ny * freq.weight;
          normalZ += nz * freq.weight;
        }

        // Normalizar o vetor (importante para normal maps)
        const length = Math.sqrt(
          normalX * normalX + normalY * normalY + normalZ * normalZ
        );
        if (length > 0) {
          normalX /= length;
          normalY /= length;
          normalZ /= length;
        }

        // Converter o vetor normal para formato RGB
        // Normal map usa formato: R = x/direita, G = y/cima, B = z/frente
        // Mapear de [-1,1] para [0,255]
        const r = Math.floor((normalX + 1) * 0.5 * 255);
        const g = Math.floor((normalY + 1) * 0.5 * 255);
        const b = Math.floor((normalZ + 1) * 0.5 * 255);

        // Definir o pixel no ImageData
        const i = (y * width + x) * 4;
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = 255; // Alpha (opaco)
      }
    }

    // Aplicar os pixels ao canvas
    ctx.putImageData(data, 0, 0);

    // Suavizar um pouco o normal map
    ctx.filter = "blur(1px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";

    return new THREE.CanvasTexture(canvas);
  }

  // Gerar textura de rugosidade procedural (roughness map)
  function generateRoughnessMap(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Preencher com rugosidade base média
    ctx.fillStyle = "rgb(150, 150, 150)";
    ctx.fillRect(0, 0, width, height);

    // Função de ruído simples
    function simpleNoise(x, y, seed) {
      return (
        ((Math.sin(x * seed) + Math.cos(y * (seed * 0.7))) * 0.5 + 0.5) *
        ((Math.cos((x + y) * seed * 0.5) + Math.sin(x * y * seed * 0.1)) * 0.5 +
          0.5)
      );
    }

    // Criar padrões de rugosidade variável
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const nx = x / width;
        const ny = y / height;

        // Várias camadas de ruído para textura interessante
        const noise1 = simpleNoise(nx * 7, ny * 7, 3.7);
        const noise2 = simpleNoise(nx * 21, ny * 21, 5.3);
        const noise3 = simpleNoise(nx * 39, ny * 39, 9.1);

        // Combinar camadas
        let noiseValue = noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1;

        // Mapear para valores de rugosidade (130-190)
        // Valores mais altos = mais rugoso
        const roughness = Math.floor(130 + noiseValue * 60);

        ctx.fillStyle = `rgb(${roughness}, ${roughness}, ${roughness})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Adicionar alguns "crateras" ou áreas de rugosidade variável
    ctx.globalCompositeOperation = "overlay";
    for (let i = 0; i < 30; i++) {
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      const radius = 10 + Math.random() * 50;

      // Determinar se esta área será mais ou menos rugosa
      const isSmoother = Math.random() > 0.5;
      const color = isSmoother
        ? "rgba(100, 100, 100, 0.6)"
        : "rgba(200, 200, 200, 0.6)";

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(150, 150, 150, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    return new THREE.CanvasTexture(canvas);
  }

  // Criar esfera do planeta
  const planetRadius = 4;
  const planetGeometry = new THREE.SphereGeometry(planetRadius, 128, 128);

  // Gerar normal map e roughness map
  const normalMap = generateNormalMap(1024, 512);
  const roughnessMap = generateRoughnessMap(1024, 512);

  // Criar material monocromático refinado para o planeta
  const planetMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, // Cinza muito escuro
    normalMap: normalMap,
    normalScale: new THREE.Vector2(1.0, 1.0),
    roughnessMap: roughnessMap,
    roughness: 0.65,
    metalness: 0.1,
    flatShading: false
  });

  // Criar mesh do planeta
  const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  planetMesh.castShadow = true;
  planetMesh.receiveShadow = true;
  planetMesh.rotation.y = Math.PI; // Rotação inicial
  scene.add(planetMesh);

  // Criar atmosfera etérea (shader customizado)
  const atmosphereGeometry = new THREE.SphereGeometry(
    planetRadius * 1.05,
    64,
    64
  );

  // Shaders para a atmosfera sutil
  const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const atmosphereFragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 5.0);
      gl_FragColor = vec4(0.9, 0.9, 0.95, 0.5) * intensity;
    }
  `;

  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  });

  const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphereMesh);

  // Agrupar planeta e atmosfera
  const planetGroup = new THREE.Group();
  scene.remove(planetMesh);
  scene.remove(atmosphereMesh);

  planetGroup.add(planetMesh);
  planetGroup.add(atmosphereMesh);
  scene.add(planetGroup);

  // Variáveis para controlar a rotação do modelo
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;

  // Configuração de interação
  function setupInteraction() {
    // Mouse move em toda a janela
    window.addEventListener("mousemove", (event) => {
      // Coordenadas normalizadas relativas à janela inteira
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      mouseX = x;
      mouseY = y;

      // Ajustar fatores para movimento mais sutil em toda a tela
      targetRotationX = Math.max(Math.min(mouseY * 0.15, 0.25), -0.25);
      targetRotationY = Math.max(Math.min(mouseX * 0.25, 0.35), -0.35);
    });

    // Touch move (mantido no container para interação móvel mais precisa)
    container.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length > 0) {
          const touch = event.touches[0];
          const rect = container.getBoundingClientRect();
          const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

          mouseX = x;
          mouseY = y;
          targetRotationX = Math.max(Math.min(mouseY * 0.3, 0.4), -0.4);
          targetRotationY = Math.max(Math.min(mouseX * 0.5, 0.6), -0.6);

          // Prevenir scroll na página durante interação com o modelo
          event.preventDefault();
        }
      },
      { passive: false }
    );
  }

  // Configurar interação
  setupInteraction();

  // Loop de animação
  function animate() {
    requestAnimationFrame(animate);

    // Aplicar rotação baseada no mouse
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;

    // Rotação autônoma suave adicional
    const time = Date.now() * 0.0002;
    const autoRotationY = Math.sin(time) * 0.03;

    // Aplicar rotação ao grupo do planeta
    planetGroup.rotation.x = currentRotationX;
    planetGroup.rotation.y = currentRotationY + autoRotationY;

    // Rotação própria do planeta (em seu eixo)
    planetMesh.rotation.y += 0.001;

    // Animar sutilmente a atmosfera
    const pulseScale = 1 + Math.sin(Date.now() * 0.0008) * 0.002;
    atmosphereMesh.scale.set(pulseScale, pulseScale, pulseScale);

    // Renderizar a cena
    renderer.render(scene, camera);
  }

  // Iniciar animação
  animate();

  // Ajustar câmera com base no tamanho da tela
  function adjustCameraForScreenSize() {
    // Ajusta FOV e posição com base no tamanho da tela
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      camera.fov = 75; // FOV para mobiles
      camera.position.z = 10; // Mais afastado para ver o planeta completo
    } else {
      camera.fov = 60; // FOV para desktop
      camera.position.z = 10; // Distância padrão
    }

    camera.updateProjectionMatrix();
  }

  // Ajustar câmera inicial
  adjustCameraForScreenSize();

  // Função para redimensionar o canvas conforme o tamanho do container
  function onWindowResize() {
    // Atualizar dimensões da câmera
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    // Atualizar tamanho do renderizador
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Ajustar câmera com base no novo tamanho da tela
    adjustCameraForScreenSize();
  }

  // Adicionar listener para redimensionamento da janela
  window.addEventListener("resize", onWindowResize);
}

// Inicializar a cena quando o DOM estiver carregado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initThreeJS);
} else {
  initThreeJS();
}
