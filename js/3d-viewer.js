// Arquivo 3d-viewer.js - Versão com Three.js carregado externamente

// Função para inicializar a cena Three.js
function initThreeJS() {
  console.log("Iniciando Three.js e carregamento do modelo...");

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
    200, // Campo de visão reduzido para zoom out mais amplo
    container.clientWidth / container.clientHeight,
    1,
    0
  );
  camera.position.set(0, 0, 0); // Aumentado Z para afastar mais o modelo

  // Configuração do renderizador com fundo transparente
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true // Habilitar transparência
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Limitar pixel ratio para melhor performance
  renderer.setClearColor(0x000000, 0); // Fundo totalmente transparente

  // Configuração para sombras
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Adicionar o canvas ao container
  container.appendChild(renderer.domElement);

  // Adicionar luzes
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  // Luz de preenchimento
  const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
  fillLight.position.set(-5, 0, -5);
  scene.add(fillLight);

  // Luz de realce
  const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.5);
  rimLight.position.set(0, 10, -10);
  scene.add(rimLight);

  // Verificar se o GLTFLoader está disponível
  if (typeof GLTFLoader === "undefined") {
    console.error(
      "GLTFLoader não está disponível. Criando cubo como fallback."
    );

    // Criar um cubo como fallback
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    // Configurar animação simples
    function animateCube() {
      requestAnimationFrame(animateCube);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animateCube();
    return;
  }

  // Criar o carregador de modelos GLTF
  console.log("Criando GLTFLoader...");
  let loader;
  try {
    loader = new GLTFLoader();
    console.log("GLTFLoader criado com sucesso!");
  } catch (e) {
    console.error("Erro ao criar GLTFLoader:", e);
    return;
  }

  // Variáveis para controlar a rotação do modelo
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;
  let model = null;

  // Configuração de interação
  function setupInteraction() {
    // Mouse move
    document.addEventListener("mousemove", (event) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mouseX = x;
      mouseY = y;
      targetRotationX = Math.max(Math.min(mouseY * 0.3, 0.4), -0.4);
      targetRotationY = Math.max(Math.min(mouseX * 0.5, 0.6), -0.6);
    });

    // Touch move
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

    // Aplicar rotação baseada no mouse se o modelo estiver carregado
    if (model) {
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      // Rotação autônoma suave adicional
      const time = Date.now() * 0.0003;
      const autoRotationY = Math.sin(time) * 0.07;

      model.rotation.x = currentRotationX;
      model.rotation.y = currentRotationY + autoRotationY;
    }

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
      camera.fov = 25; // FOV ligeiramente maior para mobiles
      camera.position.z = 11; // Mais afastado para ver o modelo completo
    } else {
      camera.fov = 10; // FOV menor para desktop
      camera.position.z = 50; // Distância padrão
    }

    camera.updateProjectionMatrix();
  }

  // Carregar o modelo
  console.log("Iniciando carregamento do modelo paper.glb...");
  try {
    loader.load(
      "/models/paper.glb", // Caminho para o modelo na pasta models
      (gltf) => {
        console.log("Callback de sucesso do carregador chamado!");
        model = gltf.scene;
        console.log("Modelo carregado com sucesso!", gltf);

        // Ajustar escala do modelo com base no tamanho da tela
        const isMobile = window.innerWidth < 768;
        const scale = isMobile ? 3.5 : 4.0;
        model.scale.set(scale, scale, scale);
        console.log("Escala do modelo ajustada");

        // Processar materiais e meshes
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            if (node.geometry) {
              node.geometry.computeVertexNormals();
              node.geometry.computeBoundingBox();
            }

            if (node.material) {
              if (!node.material.emissive) {
                node.material.emissive = new THREE.Color(0x444444);
              } else {
                node.material.emissive.set(0x444444);
              }

              // Ajustar propriedades do material para melhor visibilidade
              node.material.roughness = 0.7;
              node.material.metalness = 0.3;

              if (node.material.map) {
                node.material.map.anisotropy = 16;
              }
            }
          }
        });

        // Adicionar modelo à cena
        scene.add(model);
        console.log("Modelo adicionado à cena");

        // Centralizar o modelo usando bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Adicionar margem ao redor do modelo
        const margin = 0.1; // 10% de margem
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scaleFactor = 1 / (1 + margin);

        // Ajustar posição para centralizar
        model.position.x = -center.x;
        model.position.y = -center.y + size.y * 0.45; // Ajustado para ficar mais centrado
        model.position.z = -center.z;

        console.log("Modelo posicionado e centralizado:", {
          tamanho: size,
          centro: center,
          posição: model.position
        });

        // Ajustar câmera após carregar o modelo
        adjustCameraForScreenSize();
      },
      // Callback de progresso
      (xhr) => {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        console.log(`${percentComplete.toFixed(2)}% carregado`);
      },
      // Callback de erro
      (error) => {
        console.error("Erro ao carregar o modelo:", error);
        console.error("Detalhes adicionais:", {
          url: "/models/paper.glb",
          errorName: error.name,
          errorMessage: error.message
        });
      }
    );
  } catch (e) {
    console.error("Exceção ao tentar carregar o modelo:", e);
  }

  // Função para redimensionar o canvas conforme o tamanho do container
  function onWindowResize() {
    // Atualizar dimensões da câmera
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    // Atualizar tamanho do renderizador
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Ajustar câmera com base no novo tamanho da tela
    adjustCameraForScreenSize();

    // Se o modelo estiver carregado, ajustar a escala conforme necessário
    if (model) {
      const isMobile = window.innerWidth < 768;
      const scale = isMobile ? 3.5 : 4.0;
      model.scale.set(scale, scale, scale);
    }
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
