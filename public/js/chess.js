let chess;
let zoom = false;
const sizes = {
  'width': window.innerWidth,
  'height': window.innerHeight
};
let activeBtn = null;
let buttonsMapping = {
  'btn-rotate': {
    'name': 'rotate',
    'id': 'btn-rotate',
    'x': null,
    'y': null
  },
  'btn-zoom': {
    'name': 'zoom',
    'id': 'btn-zoom',
    'x': null,
    'y': null
  }
};

function btnToggle(event) {
  const elementID = event.target.parentElement.id;
  if (activeBtn) {
    let oldElement = document.getElementById(activeBtn['id']);
    oldElement.classList.remove('btn-secondary');
    oldElement.classList.add('btn-outline-secondary');
    if (activeBtn['id'] !== elementID) {
      let newElement = document.getElementById(elementID);
      newElement.classList.remove('btn-outline-secondary');
      newElement.classList.add('btn-secondary');
      activeBtn = buttonsMapping[elementID];
    } else {
      activeBtn = null;
    }
  } else {
    let element = document.getElementById(elementID);
    element.classList.remove('btn-outline-secondary');
    element.classList.add('btn-secondary');
    activeBtn = buttonsMapping[elementID]
  }
}

function mousemove(event) {
  let clientX;
  let clientY;
  if (event.type.includes('touch')) {
    clientX = event.targetTouches[0].clientX;
    clientY = event.targetTouches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }
  if (activeBtn['name'] === 'zoom') {
    camera.position.z += (clientY - activeBtn['y']) / 100;
    activeBtn['y'] = clientY;
  } else if (activeBtn['name'] === 'rotate') {
    chess.rotation.x += (clientY - activeBtn['y']) / 1000;
    chess.rotation.y += (clientX - activeBtn['x']) / 1000;
    bg.rotation.y += (clientX - activeBtn['x']) / 1000;
    activeBtn['x'] = event.clientX;
    activeBtn['y'] = clientY;
  }
}

window.addEventListener('mousedown', (event) => {
  if (activeBtn) {
    activeBtn['x'] = event.clientX;
    activeBtn['y'] = event.clientY;
    window.addEventListener('mousemove', mousemove);
  }
  window.addEventListener('mouseup', () => {
    window.removeEventListener('mousemove', mousemove);
  });
});
window.addEventListener('touchstart', (event) => {
  console.info(event);
  if (activeBtn) {
    if (event.type.includes('touch')) {
      activeBtn['x'] = event.targetTouches[0].clientX;
      activeBtn['y'] = event.targetTouches[0].clientY;
    } else {
      activeBtn['x'] = event.clientX;
      activeBtn['y'] = event.clientY;
    }
    ;
    window.addEventListener('touchmove', mousemove);

    window.addEventListener('touchend', () => {
      window.removeEventListener('touchmove', mousemove);
    });
  }
});

window.addEventListener('resize', () => {
  // Save sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
})

// Scene
const scene = new THREE.Scene();


// probe
lightProbe = new THREE.LightProbe();
scene.add(lightProbe);

// light
directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// light
directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(-10, 10, 10);
scene.add(directionalLight);

let bg = new THREE.Mesh(
  new THREE.SphereGeometry(100, 20, 20),
  new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('images/nature.jpeg'),
    side: THREE.BackSide
  })
);
scene.add(bg);

//Camera
const camera = new THREE.PerspectiveCamera(
  100, sizes.width / sizes.height, 0.1, 1000
);
camera.position.z = 3

//Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor('#3a3c3c');
document.body.appendChild(renderer.domElement);

// Loaders
const objLoader = new THREE.OBJLoader();
objLoader.setPath('/blender-files/');
const mtlLoader = new THREE.MTLLoader();
mtlLoader.setPath('/blender-files/');

function rotate() {
  chess.rotation.y += -(1 / 10000000);
  rotate();
}

new Promise((resolve) => {
  mtlLoader.load('BirthdayCake.mtl', (materials) => {
    resolve(materials);
  });
}).then((materials) => {
  materials.preload();
  objLoader.setMaterials(materials);
  objLoader.load('BirthdayCake.obj', (object) => {
    chess = object;
    let loader = document.getElementById('loading');
    loader.remove();
    scene.add(object);
    chess.rotation.x = 0.3;
    chess.position.y = -1.1;
  });
});

function play() {
  let audio = document.getElementById("audio");
  let element = document.getElementById('btn-audio');
  if (!audio.paused) {
    audio.pause();
    element.classList.remove('btn-secondary');
    element.classList.add('btn-outline-secondary');
  } else {
    audio.play();
    element.classList.remove('btn-outline-secondary');
    element.classList.add('btn-secondary');
  }
}

//Render Loop
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  rotate();
}

render();
