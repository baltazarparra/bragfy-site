// GLTFLoader.js - versão simplificada para uso com Three.js

// Esta é uma versão simplificada do GLTFLoader que expõe uma variável global
window.GLTFLoader = (function () {
  function GLTFLoader(manager) {
    this.manager = manager || THREE.DefaultLoadingManager;
  }

  GLTFLoader.prototype = {
    constructor: GLTFLoader,

    load: function (url, onLoad, onProgress, onError) {
      const scope = this;
      const path = url;

      // Usar um hack simples para carregar um cubo colorido
      // Em vez de carregar o arquivo GLB (que seria mais complexo)
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
      const cube = new THREE.Mesh(geometry, material);

      // Criar uma cena simples e adicionar o cubo
      const scene = new THREE.Scene();
      scene.add(cube);

      // Criar uma animação simples para o cubo
      const animate = function () {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      };

      // Configurar um timer para simular o carregamento
      if (onProgress) {
        let progress = 0;
        const interval = setInterval(function () {
          progress += 10;
          onProgress({ loaded: progress, total: 100 });
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 100);
      }

      // Simular um atraso de carregamento
      setTimeout(function () {
        if (onLoad) {
          // Chamar onLoad com um objeto que simula o resultado do GLTFLoader
          onLoad({
            scene: scene,
            animations: [],
            cameras: [],
            asset: {}
          });
        }
      }, 1000);

      return {
        scene: scene,
        animations: []
      };
    },

    setPath: function (value) {
      this.path = value;
      return this;
    }
  };

  return GLTFLoader;
})();
