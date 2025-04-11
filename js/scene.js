// Configuração do visualizador 3D para o modelo do Bragfy
document.addEventListener("DOMContentLoaded", () => {
  const modelContainer = document.getElementById("model-container");
  if (!modelContainer) return;

  // Mostrar indicador de carregamento
  const loadingIndicator = document.getElementById("loading-indicator");

  // Função para mostrar imagem de fallback em caso de erro
  const showFallbackImage = (message = "Erro ao carregar o modelo 3D") => {
    if (loadingIndicator) {
      loadingIndicator.textContent = message;

      // Criar imagem de fallback após tentar carregar o modelo e falhar
      setTimeout(() => {
        const fallbackDiv = document.createElement("div");
        fallbackDiv.className = "fallback-image";

        const fallbackImg = document.createElement("img");
        fallbackImg.src = "img/bragfy-hero.svg";
        fallbackImg.alt = "Ilustração do Bragfy em ação no Telegram";
        fallbackImg.width = 600;
        fallbackImg.height = 400;

        fallbackDiv.appendChild(fallbackImg);

        // Substituir o contêiner do modelo com a imagem fallback
        modelContainer.innerHTML = "";
        modelContainer.appendChild(fallbackDiv);
      }, 3000);
    }
  };

  // Verificar suporte para WebGL
  if (!THREE.WEBGL.isWebGLAvailable()) {
    const warning = THREE.WEBGL.getWebGLErrorMessage();
    modelContainer.appendChild(warning);
    showFallbackImage(
      "Seu navegador não suporta WebGL necessário para o visualizador 3D."
    );
    return;
  }

  // Configurações do modelo
  const modelPath = "./paper.glb";

  // Configuração da cena Three.js
  const scene = new THREE.Scene();
  scene.background = null; // Torna o fundo transparente para integrar com a página

  // Configuração da câmera com zoom aumentado
  const camera = new THREE.PerspectiveCamera(
    25, // Campo de visão reduzido para maior zoom
    modelContainer.clientWidth / modelContainer.clientHeight,
    0.1,
    1000
  );
  // Posicionar a câmera para melhor visualização com maior zoom
  camera.position.set(0, 1.5, 9);

  // Configuração do renderizador
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true, // Importante para fundo transparente
    powerPreference: "high-performance"
  });
  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar para melhor performance

  // Deixar fundo transparente
  renderer.setClearColor(0x000000, 0);

  // Compatibilidade com diferentes versões do Three.js
  if (renderer.outputEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  } else if (renderer.outputColorSpace !== undefined) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  modelContainer.appendChild(renderer.domElement);

  // Acessibilidade - Adicionar role e descrição ARIA
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute(
    "aria-label",
    "Modelo 3D interativo do Bragfy"
  );
  renderer.domElement.setAttribute("tabindex", "0");

  // Iluminação da cena - Melhorada para fundo transparente/escuro
  // Luz ambiente mais forte
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  // Luz direcional principal
  const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
  mainLight.position.set(5, 5, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  scene.add(mainLight);

  // Luz de preenchimento do lado oposto
  const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
  fillLight.position.set(-5, 0, -5);
  scene.add(fillLight);

  // Luz de realce para dar dimensão
  const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.7);
  rimLight.position.set(0, 10, -10);
  scene.add(rimLight);

  // Variáveis para controlar a rotação do modelo baseada no mouse
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;

  // Função para lidar com movimento do mouse
  const onMouseMove = (event) => {
    // Calcular posição relativa do mouse no container (normalizado de -1 a 1)
    const rect = modelContainer.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Definir rotação alvo suave baseada na posição do mouse
    targetRotationX = mouseY * 0.3; // Limitar o ângulo de rotação
    targetRotationY = mouseX * 0.5;
  };

  // Adicionar event listener para movimento do mouse
  document.addEventListener("mousemove", onMouseMove);

  // Definir timeout para carregamento do modelo
  const modelLoadTimeout = setTimeout(() => {
    showFallbackImage("Tempo de carregamento excedido. Verifique sua conexão.");
  }, 10000); // 10 segundos para timeout

  // Carregar o modelo 3D
  const loadingManager = new THREE.LoadingManager();
  const loader = new THREE.GLTFLoader(loadingManager);

  loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progressPercent = Math.floor((itemsLoaded / itemsTotal) * 100);
    if (loadingIndicator) {
      loadingIndicator.textContent = `Carregando modelo 3D... ${progressPercent}%`;
    }
  };

  loadingManager.onError = (url) => {
    console.error("Erro ao carregar:", url);
    showFallbackImage();
    clearTimeout(modelLoadTimeout);
  };

  // Variável para armazenar o modelo
  let model;

  loader.load(
    modelPath,
    (gltf) => {
      // Limpar timeout quando o modelo carrega com sucesso
      clearTimeout(modelLoadTimeout);

      model = gltf.scene;

      // Ajustar escala global do modelo para melhor visualização
      model.scale.set(2.5, 2.5, 2.5);

      // Centralizar e dimensionar o modelo
      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;

          // Otimizar geometrias para melhor desempenho
          if (node.geometry) {
            node.geometry.computeVertexNormals();
          }

          // Otimizar materiais e ajustar para fundo escuro
          if (node.material) {
            // Aumentar emissão para melhor visibilidade
            if (!node.material.emissive) {
              node.material.emissive = new THREE.Color(0x333333);
            } else {
              node.material.emissive.set(0x333333);
            }

            // Aumentar intensidade especular
            if (node.material.specular) {
              node.material.specular.set(0xffffff);
              node.material.shininess = 50;
            }

            // Garantir materiais PBR corretamente configurados
            if (node.material.map) node.material.map.anisotropy = 16;
          }
        }
      });

      // Adicionar o modelo à cena
      scene.add(model);

      // Calcular o tamanho do modelo e centralizar
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Ajustar posição vertical para melhor visualização
      model.position.x = -center.x;
      model.position.y = -center.y + 0.7; // Elevar mais
      model.position.z = -center.z;

      // Ajustar a posição da câmera com base no tamanho do modelo
      const maxDim = Math.max(size.x, size.y, size.z);
      camera.position.z = maxDim * 2.0; // Aproximar a câmera para aumentar o zoom

      // Inclinar câmera ligeiramente para baixo
      camera.position.y = maxDim * 0.7;
      camera.lookAt(0, 0, 0);

      // Esconder indicador de carregamento
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }
    },
    (xhr) => {
      // Progresso de carregamento tratado pelo loadingManager
    },
    (error) => {
      console.error("Erro ao carregar o modelo:", error);
      showFallbackImage();
      clearTimeout(modelLoadTimeout);
    }
  );

  // Função para redimensionar o canvas quando a janela é redimensionada
  const onWindowResize = () => {
    camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  };

  window.addEventListener("resize", onWindowResize);

  // Função de animação que aplica a rotação suave
  let frameId;
  const animate = () => {
    frameId = requestAnimationFrame(animate);

    // Aplicar transição suave à rotação baseada na posição do mouse
    if (model) {
      // Calcular a rotação atual com interpolação para efeito suave
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      // Rotação autônoma suave adicional
      const time = Date.now() * 0.0005;
      const autoRotationY = Math.sin(time) * 0.1;

      // Aplicar rotação combinada (mouse + animação autônoma)
      model.rotation.x = currentRotationX;
      model.rotation.y = currentRotationY + autoRotationY;
    }

    renderer.render(scene, camera);
  };

  animate();

  // Função para otimizar desempenho pausando renderização quando não visível
  const handleVisibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else {
      animate();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Limpeza ao desmontar
  return () => {
    window.removeEventListener("resize", onWindowResize);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("mousemove", onMouseMove);
    cancelAnimationFrame(frameId);
    renderer.dispose();
  };
});
