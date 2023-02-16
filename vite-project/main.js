import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import  {FBXLoader} from "three/examples/jsm/loaders/FBXloader.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
let camera, scene, renderer, controls;


const objects = [];
 
let raycaster;                     //This class is designed to assist with raycasting. Raycasting is used for mouse picking (working out what objects in the 3d space the mouse is over) amongst other things.

let moveForward = false;           //movement variables
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;               //movement variables

let prevTime = performance.now(); //time.now
const velocity = new THREE.Vector3();  // velocity is a phenomenon with 2 properties magnitude and direction
const direction = new THREE.Vector3();

init();      
animate();




function init() {


//camera and position
  camera = new THREE.PerspectiveCamera(     
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;
//background and fog
  scene = new THREE.Scene();                         
  scene.background = new THREE.Color(0xffffff);
  const skyLoader = new THREE.CubeTextureLoader();
  //sky texture-clouds
const skytexture = skyLoader.load([
    './resources/yellowcloud_ft.jpg',
    './resources/yellowcloud_bk.jpg',
    './resources/yellowcloud_up.jpg',
    './resources/yellowcloud_dn.jpg',
    './resources/yellowcloud_rt.jpg',
    './resources/yellowcloud_lf.jpg',
]);
scene.background = skytexture;
  scene.fog = new THREE.Fog(0x8A5000, 0, 750);

//lighting
  const ambientLight =new THREE.AmbientLight(0xeeeeff, 0x777788, 0.75)
  ambientLight.intensity =0.5;
  scene.add(ambientLight)

  const light = new THREE.DirectionalLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(130, 100, 100);
  light.intensity=1;
  //shadows
  light.castShadow = true; 
  light.shadow.mapSize.width = 2000;
  light.shadow.mapSize.height = 2000;
  light.shadow.camera.near = 2;
  light.shadow.camera.far = 1500;
  light.shadow.camera.near = 2;
  light.shadow.camera.far = 1500;
  light.shadow.camera.left = 1500;
  light.shadow.camera.right = -1500;
  light.shadow.camera.top = 1000;
  light.shadow.camera.bottom = -1000;
  

  scene.add(light);
//defining pointerlock
  controls = new PointerLockControls(camera, document.body);

//html controls info
  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

//pointerlock system
  //lock
  instructions.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });
  //unlock
  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });
//movement controls

  scene.add(controls.getObject());
//keydown
  const onKeyDown = function (event) {           
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 150;
        canJump = false;
        break;
    }
  };
//keyup
  const onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };
//event listeners
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  raycaster = new THREE.Raycaster(   
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10 
  );
// floor/plane
  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);
//floor material
  const floorMaterial = new THREE.MeshStandardMaterial({
  color:0x674F2D,
  });

  const floor = new THREE.Mesh(floorGeometry,floorMaterial);
  floor.receiveShadow = true; //shadows
  floor.castShadow = false;
  scene.add(floor);


  //GLTF house

  const loader = new GLTFLoader();

  loader.load( 'resources/house exportglb.glb', function ( glb ) {
    const model = glb.scene;
    scene.add(model);
    model.position.set(0,11,-50);
    
    model.scale.set(15,15,15);
    model.rotateY(-0.9);
    model.traverse(function(node) {
      if(node.isMesh)
      node.castShadow = true;
      node.receiveShadow=true;
    });

  }, undefined, function ( error ) {
    console.error( error );
  } );

  // renderer size pixel ratio.. 

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; //shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  document.body.appendChild(renderer.domElement);
;

  //resizing listener

  window.addEventListener("resize", onWindowResize);

  //end of init function
}


// function that does the resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}


//animation and movement diplayed
function animate() {

  requestAnimationFrame(animate);


//time variable so animation is updated on time not device perfomance
  const time = performance.now();


//the mouse movement once clicked and pointerlock is enabled
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 7 * 100.0 * delta; // 100.0 = mass

//adding movement to the event listeners mentioned in the init function
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
    
//allows movement sideways front and back
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
//jump
    controls.getObject().position.y += velocity.y * delta; // new behavior
    
//stops you from falling through the floor
    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }
//previous time from start of function
  prevTime = time;

  renderer.render(scene, camera);
}
