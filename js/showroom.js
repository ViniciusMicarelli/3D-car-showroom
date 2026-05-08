import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CARS, PAINTS, ENVIRONMENTS } from './data.js';

const { gsap, ScrollTrigger, Observer, MotionPathPlugin } = window;
gsap.registerPlugin(ScrollTrigger, Observer, MotionPathPlugin);




function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  const chars = [];
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'sc';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}
function splitWords(el) {
  const text = el.textContent.trim();
  el.textContent = '';
  const words = [];
  text.split(/\s+/).forEach((w, i, arr) => {
    const wrap = document.createElement('span');
    wrap.className = 'sw';
    wrap.textContent = w;
    el.appendChild(wrap);
    words.push(wrap);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return words;
}




class Showroom {
  constructor() {
    this.canvas = document.getElementById('stage');
    this.bg = document.getElementById('bg-gradient');
    this.loaderEl = document.getElementById('loader');

    this.cars = [];         
    this.bodyMaterials = [];
    this.currentIndex = 0;
    this.currentEnv = 0;
    this.currentPaint = 0;
    this.transitioning = false;
    this.autorotate = true;
    this.exploreMode = false; 

    this.initScene();
    this.initLights();
    this.initGround();
    this.initIntroLogo();
    this.initLoader();
    this.loadAllModels().then(() => this.boot());
    window.addEventListener('resize', () => this.onResize());
  }

  initScene() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070708, 0.018);

    const isMobile = window.innerWidth <= 768;
    this.camera = new THREE.PerspectiveCamera(
      isMobile ? 52 : 38,
      window.innerWidth / window.innerHeight, 0.1, 200
    );
    this.camera.position.set(8, 3, 12);
    this.camera.lookAt(0, 0.6, 0);


    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;


    this.stand = new THREE.Group();
    this.scene.add(this.stand);


    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 14;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minPolarAngle = 0.15;
    this.controls.target.set(0, 0.55, 0);
    this.controls.enabled = false;
  }

  initLights() {
    this.ambient = new THREE.HemisphereLight(0xffffff, 0x222233, 0.4);
    this.scene.add(this.ambient);

    this.key = new THREE.DirectionalLight(0xffffff, 4.0);
    this.key.position.set(6, 8, 4);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    this.key.shadow.camera.near = 0.5;
    this.key.shadow.camera.far = 30;
    this.key.shadow.camera.left = -8;
    this.key.shadow.camera.right = 8;
    this.key.shadow.camera.top = 8;
    this.key.shadow.camera.bottom = -8;
    this.key.shadow.bias = -0.0005;
    this.scene.add(this.key);

    this.fill = new THREE.DirectionalLight(0xe0eaff, 1.2);
    this.fill.position.set(-7, 5, -3);
    this.scene.add(this.fill);

    this.rim = new THREE.DirectionalLight(0xff8855, 1.6);
    this.rim.position.set(-2, 4, -8);
    this.scene.add(this.rim);

    this.spot = new THREE.SpotLight(0xffffff, 50, 30, Math.PI / 7, 0.4, 1.5);
    this.spot.position.set(0, 12, 0);
    this.spot.target.position.set(0, 0, 0);
    this.scene.add(this.spot);
    this.scene.add(this.spot.target);
  }

  initGround() {
    const geo = new THREE.CircleGeometry(40, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x101012, roughness: 0.35, metalness: 0.7
    });
    this.ground = new THREE.Mesh(geo, mat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  initIntroLogo() {
    const intro = document.getElementById('intro');
    const introLines = intro.querySelectorAll('.intro-line');
    this.allIntroChars = [];
    introLines.forEach((line) => this.allIntroChars.push(...splitChars(line)));
    
    gsap.set(this.allIntroChars, { yPercent: 110, opacity: 0, rotate: 6 });
    gsap.set('#intro .intro-eyebrow', { autoAlpha: 0, y: -12 });
    gsap.set('#intro .intro-meta', { autoAlpha: 0, y: 8 });
  }




  async loadAllModels() {
    const loader = new GLTFLoader();
    const promises = CARS.map((car, i) => new Promise((resolve) => {
      loader.load(
        car.file,
        (gltf) => {
          const root = gltf.scene;
          this.fitToFrame(root, car);
          root.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
              if (o.material) o.material.envMapIntensity = 1.1;
            }
          });
          this.cars[i] = root;
          this.bodyMaterials[i] = this.detectBodyMaterials(root);
          this.updateLoader(i + 1, CARS.length, car.model);
          resolve({ ok: true });
        },
        undefined,
        (err) => {
          console.warn('Failed to load', car.file, err);
          this.cars[i] = this.buildPlaceholderCar(car);
          this.bodyMaterials[i] = this.detectBodyMaterials(this.cars[i]);
          this.cars[i].userData.placeholder = true;
          this.updateLoader(i + 1, CARS.length, car.model + ' (failed)');
          resolve({ ok: false });
        }
      );
    }));
    await Promise.all(promises);
  }

  buildPlaceholderCar(car) {
    const g = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: car.accent, metalness: 0.85, roughness: 0.3, name: 'BODY_PLACEHOLDER'
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.9, 1.9), bodyMat);
    body.position.y = 0.7;
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.7, 1.7),
      new THREE.MeshStandardMaterial({ color: 0x101010, metalness: 0.4, roughness: 0.1 })
    );
    cabin.position.set(0.1, 1.4, 0); cabin.castShadow = true; g.add(cabin);

    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.32, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7, metalness: 0.5 });
    [[-1.5, 0.45, 0.95], [1.5, 0.45, 0.95], [-1.5, 0.45, -0.95], [1.5, 0.45, -0.95]].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(...p); w.castShadow = true; g.add(w);
    });
    return g;
  }

  fitToFrame(obj, car) {
    const targetSize = 3.6;
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3();
    let meshCount = 0;
    
    obj.traverse((child) => {
      if (child.isMesh) {
        const name = (child.name || '').toLowerCase();

        if (name.includes('plane') || name.includes('ground') || name.includes('floor') || name.includes('environment')) return;
        
        child.geometry.computeBoundingBox();
        if (child.geometry.boundingBox) {
          const childBox = child.geometry.boundingBox.clone();
          childBox.applyMatrix4(child.matrixWorld);
          box.union(childBox);
          meshCount++;
        }
      }
    });
    
    if (meshCount === 0 || box.isEmpty()) {
      box.setFromObject(obj);
    }

    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    let maxAxis = Math.max(size.x, size.y, size.z);
    if (maxAxis === 0) maxAxis = 1;
    
    let scale = targetSize / maxAxis;
    if (car.framing.scaleMultiplier) scale *= car.framing.scaleMultiplier;
    
    obj.scale.setScalar(scale);
    

    obj.position.x = -center.x * scale + (car.framing.offsetX || 0);
    obj.position.z = -center.z * scale + (car.framing.offsetZ || 0);
    obj.position.y = -box.min.y * scale + (car.framing.offsetY || 0);
    
    obj.userData.baseScale = scale;
  }

  detectBodyMaterials(root) {



    const found = new Set();
    const named = new Set();

    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        const name = (m.name || '').toLowerCase();
        const meshName = (o.name || '').toLowerCase();
        const looksBody = /body|paint|carrosserie|carosseria|kuzov|exterior|exteri|lacquer/.test(name + ' ' + meshName);
        const looksGlass = /glass|window|fenster|stick|stiklo|lentes/.test(name + ' ' + meshName);
        const looksWheel = /wheel|tire|tyre|rim|brake|caliper|disc|rotor/.test(name + ' ' + meshName);
        const looksLight = /light|lamp|head|tail|signal|indicator|reflector|emiss/.test(name + ' ' + meshName);
        const looksInterior = /interior|seat|dash|steer|carpet|leather/.test(name + ' ' + meshName);
        if (looksGlass || looksWheel || looksLight || looksInterior) return;
        if (looksBody) {
          named.add(m);
        } else if (m.isMeshStandardMaterial && m.metalness > 0.5 && m.roughness < 0.6) {
          found.add(m);
        }
      });
    });
    if (named.size) return [...named];
    if (found.size) return [...found];

    const all = new Set();
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => { if (m.isMeshStandardMaterial) all.add(m); });
    });
    return [...all];
  }




  initLoader() {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%&';
    this._scrambleIntervals = {};

    gsap.to('.ld-corner', { opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out' });
    gsap.to('.ld-telem-row', { opacity: 1, duration: 0.4, stagger: 0.12, ease: 'power2.out', delay: 0.2 });

    gsap.fromTo('.ld-scan',
      { top: '-2px' },
      { top: '100%', duration: 1.8, ease: 'none', repeat: -1, onRepeat: () => gsap.set('.ld-scan', { top: '-2px' }) }
    );

    gsap.fromTo('.ld-wordmark', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });

    this._scrambleField('lt-gpu', 'WebGL 2.0 · HARDWARE');
    this._scrambleField('lt-shader', 'PBR · PCFSOFT · ACESFilmic');
    this._scrambleField('lt-env', 'STUDIO · 5600K · HDRI');
  }

  _scrambleField(id, finalText, delay = 0) {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@·';
    const el = document.getElementById(id);
    if (!el) return;
    let frame = 0;
    const totalFrames = 18;
    setTimeout(() => {
      const iv = setInterval(() => {
        if (frame >= totalFrames) {
          el.textContent = finalText;
          clearInterval(iv);
          return;
        }
        const progress = frame / totalFrames;
        const revealCount = Math.floor(progress * finalText.length);
        el.textContent =
          finalText.slice(0, revealCount) +
          Array.from({ length: finalText.length - revealCount }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
        frame++;
      }, 40);
    }, delay);
  }

  updateLoader(done, total, label) {
    const pct = done / total;
    

    const targetMPH = Math.round(pct * 217);
    const speedEl = document.getElementById('ld-speed-val');
    if (speedEl) {
      const obj = { v: parseInt(speedEl.textContent) || 0 };
      gsap.to(obj, {
        v: targetMPH,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => { speedEl.textContent = Math.round(obj.v); }
      });
    }


    const rpmFill = document.querySelector('.ld-rpm-fill');
    if (rpmFill) rpmFill.style.width = `${pct * 100}%`;


    const vbar = document.querySelector('.ld-vbar-fill');
    if (vbar) vbar.style.height = `${pct * 100}%`;


    this._scrambleField('lt-asset', label.toUpperCase(), 0);


    const sys = document.getElementById('lt-sys');
    if (sys) sys.textContent = pct < 1 ? 'LOADING ASSETS' : 'COMPILING';

    const status = document.getElementById('lt-status');
    if (status) {
      status.textContent = pct < 0.4 ? 'IGNITION' : pct < 0.8 ? 'ACCELERATING' : 'V-MAX';
    }
  }




  boot() {

    this.cars.forEach((c, i) => {
      this.stand.add(c);
      c.visible = (i === 0);
    });

    this.applyEnvironment(0, true);
    this.applyPaint(0, 0, true);
    this.populateIntroStats();
    this.populateUI();
    this.startRender();


    this.updateLoader(1, 1, 'COMPLETE');
    const status = document.getElementById('lt-status');
    if (status) status.textContent = 'ONLINE';
    const sys = document.getElementById('lt-sys');
    if (sys) sys.textContent = 'READY';


    gsap.timeline()
      .to('.ld-rpm-fill', { width: '100%', duration: 0.3, ease: 'power3.out' })
      .to('.ld-vbar-fill', { height: '100%', duration: 0.3, ease: 'power3.out' }, '<')
      .to('.ld-telem-row', { opacity: 0, x: -12, duration: 0.25, stagger: 0.04, ease: 'power2.in' }, '+=0.15')
      .to('.ld-corner', { opacity: 0, duration: 0.2, stagger: 0.04 }, '<')
      .to('.ld-wordmark', { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in' }, '<+=0.1')
      .to('.ld-speedo,.ld-rpm', { opacity: 0, duration: 0.2 }, '<')
      .to('#loader', {
        autoAlpha: 0, duration: 0.5, ease: 'power2.inOut',
        onComplete: () => {
          this.loaderEl.style.display = 'none';
          this.runIntro();
          this.setupObservers();
        }
      });
  }

  startRender() {
    const clock = new THREE.Clock();
    const tick = () => {
      const dt = clock.getDelta();
      if (this.autorotate && !this.transitioning && !this.exploreMode) {
        this.stand.rotation.y += dt * 0.18;
      }
      if (this.controls.enabled) this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };
    tick();
  }




  runIntro() {
    const intro = document.getElementById('intro');

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(intro, { autoAlpha: 0, duration: 0.9, ease: 'power2.out',
          onComplete: () => intro.style.display = 'none' });
        this.revealHud();
        this.flyToCar(0, true);
      }
    });

    tl.to(this.allIntroChars, {
      yPercent: 0, opacity: 1, rotate: 0,
      duration: 0.9, ease: 'power3.out',
      stagger: { each: 0.018, from: 'start' }
    });
    tl.to('#intro .intro-eyebrow', 
      { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power2.out' },
      '-=0.6'
    );
    tl.to('#intro .intro-rule', {
      width: '100%', duration: 1.2, ease: 'expo.inOut'
    }, '-=0.4');
    tl.to('#intro .intro-meta', {
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out'
    }, '-=0.6');
    tl.to({}, { duration: 1.4 });
    tl.to(this.allIntroChars, {
      yPercent: -110, opacity: 0,
      duration: 0.6, ease: 'power3.in',
      stagger: { each: 0.008 }
    });
    tl.to('#intro .intro-rule', { width: 0, duration: 0.5, ease: 'expo.inOut' }, '<');
  }

  revealHud() {
    gsap.to('.hud', { autoAlpha: 1, duration: 0.8, ease: 'power2.out' });
    gsap.fromTo('.hud-corner', { y: 14, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08
    });
  }





  flyToCar(index, isFirst = false) {
    const car = CARS[index];
    const [cx, cy, cz] = car.framing.camera;
    const [tx, ty, tz] = car.framing.target;

    if (isFirst) {

      const path = [
        { x: 14, y: 6, z: 18 },
        { x: 9,  y: 4, z: 12 },
        { x: cx + 1.2, y: cy + 0.6, z: cz + 0.8 },
        { x: cx, y: cy, z: cz }
      ];
      gsap.to(this.camera.position, {
        duration: 3.2, ease: 'power3.inOut',
        motionPath: { path, type: 'cubic', curviness: 1.5 },
        onUpdate: () => this.camera.lookAt(tx, ty, tz)
      });

      gsap.fromTo(this.camera, { fov: 22 }, {
        fov: 38, duration: 3.2, ease: 'power3.inOut',
        onUpdate: () => this.camera.updateProjectionMatrix()
      });
    } else {
      gsap.to(this.camera.position, {
        x: cx, y: cy, z: cz, duration: 1.4, ease: 'power3.inOut',
        onUpdate: () => this.camera.lookAt(tx, ty, tz)
      });
    }
  }




  switchTo(index, dir = 1) {
    if (this.transitioning) return;

    index = ((index % CARS.length) + CARS.length) % CARS.length;
    if (index === this.currentIndex) return;
    this.transitioning = true;

    const fromCar = this.cars[this.currentIndex];
    const toCar = this.cars[index];
    const car = CARS[index];
    const toBase = toCar.userData.baseScale || 1;
    const [cx, cy, cz] = car.framing.camera;
    const [tx, ty, tz] = car.framing.target;

    const tl = gsap.timeline({
      onComplete: () => {
        this.currentIndex = index;
        this.transitioning = false;
        this.updateActiveDots();
      }
    });


    tl.to(this.rim.color, {
      r: new THREE.Color(car.accent).r,
      g: new THREE.Color(car.accent).g,
      b: new THREE.Color(car.accent).b,
      duration: 0.5
    }, 0);


    const spinTo = this.stand.rotation.y + Math.PI * dir;
    tl.to(this.stand.rotation, { y: spinTo, duration: 0.8, ease: 'power3.inOut' }, 0);


    tl.add(() => {
      fromCar.visible = false;
      toCar.visible = true;
      toCar.scale.setScalar(toBase);
      this.applyPaint(index, this.currentPaint, true);
    }, 0.35);


    tl.to(this.camera.position, {
      x: cx, y: cy, z: cz, duration: 1.0, ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.lookAt(tx, ty, tz);
        this.controls.target.set(tx, ty, tz);
      }
    }, 0.1);


    tl.add(() => this.updateHudFor(car, index), 0.35);
    tl.to('.hud-text-in', { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.04 }, 0.5);


    tl.add(() => this.animateSpecNumbers(car), 0.5);
  }




  applyPaint(carIndex, paintIndex, instant = false) {
    const paint = PAINTS[paintIndex];
    const mats = this.bodyMaterials[carIndex] || [];
    const target = new THREE.Color(paint.hex);
    this.currentPaint = paintIndex;

    if (instant) {
      mats.forEach((m) => {
        m.color.copy(target);
        if (m.isMeshStandardMaterial) {
          m.metalness = paint.metal;
          m.roughness = paint.rough;
          m.needsUpdate = true;
        }
      });
      return;
    }
    mats.forEach((m, i) => {
      gsap.to(m.color, {
        r: target.r, g: target.g, b: target.b,
        duration: 0.9, ease: 'power2.out', delay: i * 0.005
      });
      if (m.isMeshStandardMaterial) {
        gsap.to(m, {
          metalness: paint.metal, roughness: paint.rough,
          duration: 0.9, ease: 'power2.out',
          onUpdate: () => m.needsUpdate = true
        });
      }
    });




    gsap.fromTo(this.renderer, { toneMappingExposure: 1.4 }, {
      toneMappingExposure: 1.05, duration: 0.9, ease: 'power2.out'
    });
  }



  applyEnvironment(envIndex, instant = false) {
    const env = ENVIRONMENTS[envIndex];
    this.currentEnv = envIndex;


    this.bg.style.background = `linear-gradient(180deg, ${env.bgTop} 0%, ${env.bgBottom} 100%)`;
    if (this.bg) this.bg.style.opacity = '1';
    if (this.ground) this.ground.visible = true;


    const tweenColor = (target, hex, dur) => {
      const c = new THREE.Color(hex);
      if (instant) { target.copy(c); return; }
      gsap.to(target, { r: c.r, g: c.g, b: c.b, duration: dur, ease: 'power2.inOut' });
    };
    tweenColor(this.ground.material.color, env.floor, 1.2);
    tweenColor(this.key.color, env.keyColor, 1.2);
    tweenColor(this.fill.color, env.fillColor, 1.2);
    tweenColor(this.rim.color, env.rimColor, 1.2);
    tweenColor(this.scene.fog.color, env.fog, 1.2);

    if (instant) {
      this.key.intensity = env.keyIntensity;
      this.fill.intensity = env.fillIntensity;
      this.rim.intensity = env.rimIntensity;
      this.scene.fog.density = env.fogDensity;
    } else {
      gsap.to(this.key,  { intensity: env.keyIntensity,  duration: 1.2, ease: 'power2.inOut' });
      gsap.to(this.fill, { intensity: env.fillIntensity, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(this.rim,  { intensity: env.rimIntensity,  duration: 1.2, ease: 'power2.inOut' });
      gsap.to(this.scene.fog, { density: env.fogDensity, duration: 1.2, ease: 'power2.inOut' });
    }


    const nameEl = document.querySelector('.env-name');
    const subEl  = document.querySelector('.env-sub');
    if (nameEl && subEl) {
      nameEl.textContent = env.name; subEl.textContent = env.sub;
      const chars = splitChars(nameEl);
      gsap.fromTo(chars, { y: 12, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.02
      });
      gsap.fromTo(subEl, { opacity: 0 }, { opacity: 0.6, duration: 0.6, delay: 0.3 });
    }


    document.querySelectorAll('.env-dot').forEach((d, i) => {
      d.classList.toggle('active', i === envIndex);
    });
  }




  populateIntroStats() {
    const COUNT_WORDS = [
      '', 'One', 'Two', 'Three', 'Four', 'Five',
      'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve'
    ];
    const n = CARS.length;
    const word = COUNT_WORDS[n] || String(n);


    const countEl = document.querySelector('.js-car-count');
    if (countEl) countEl.textContent = word;


    const years = CARS.map(c => parseInt(c.year, 10)).filter(Boolean);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearEl = document.querySelector('.js-year-range');
    if (yearEl) {
      yearEl.textContent = minYear === maxYear
        ? String(minYear)
        : `${minYear} – ${maxYear}`;
    }


    const chassisEl = document.querySelector('.js-chassis-count');
    if (chassisEl) chassisEl.textContent = String(n);


    const totalHp = CARS.reduce((sum, c) => {
      const powerSpec = c.specs.find(s => s.label.toLowerCase().includes('power'));
      return sum + (powerSpec ? parseInt(powerSpec.value, 10) : 0);
    }, 0);
    const hpEl = document.querySelector('.js-hp-total');
    if (hpEl) hpEl.textContent = totalHp.toLocaleString();
  }




  populateUI() {

    const paintRow = document.querySelector('.paints');
    PAINTS.forEach((p, i) => {
      const el = document.createElement('button');
      el.className = 'paint';
      el.style.background = p.hex;
      el.title = p.name;
      el.dataset.index = i;
      if (i === 0) el.classList.add('active');
      el.addEventListener('click', () => {
        document.querySelectorAll('.paint').forEach((x) => x.classList.remove('active'));
        el.classList.add('active');
        this.applyPaint(this.currentIndex, i);
        document.querySelector('.paint-label').textContent = p.name;
      });
      paintRow.appendChild(el);
    });
    document.querySelector('.paint-label').textContent = PAINTS[0].name;


    const envRow = document.querySelector('.envs');
    ENVIRONMENTS.forEach((e, i) => {
      const el = document.createElement('button');
      el.className = 'env-dot' + (i === 0 ? ' active' : '');
      el.dataset.index = i;
      el.style.setProperty('--c', e.bgTop);
      el.innerHTML = `<span class="env-dot-label">${e.name}</span>`;
      el.addEventListener('click', () => this.applyEnvironment(i));
      envRow.appendChild(el);
    });


    const idxRow = document.querySelector('.car-dots');
    CARS.forEach((c, i) => {
      const el = document.createElement('button');
      el.className = 'car-dot' + (i === 0 ? ' active' : '');
      el.innerHTML = `<span class="num">${String(i + 1).padStart(2, '0')}</span><span class="lbl">${c.marque} ${c.model}</span>`;
      el.addEventListener('click', () => this.switchTo(i, i > this.currentIndex ? 1 : -1));
      idxRow.appendChild(el);
    });


    document.querySelector('.car-index-tot').textContent =
      `/ ${String(CARS.length).padStart(2, '0')}`;


    this.updateHudFor(CARS[0]);
    this.animateSpecNumbers(CARS[0]);


    document.querySelector('.nav-prev').addEventListener('click', () => {
      const next = (this.currentIndex - 1 + CARS.length) % CARS.length;
      this.switchTo(next, -1);
    });
    document.querySelector('.nav-next').addEventListener('click', () => {
      const next = (this.currentIndex + 1) % CARS.length;
      this.switchTo(next, 1);
    });


    const rotEl = document.querySelector('.btn-rotate');
    rotEl.addEventListener('click', () => {
      this.autorotate = !this.autorotate;
      rotEl.classList.toggle('off', !this.autorotate);
      rotEl.querySelector('.label').textContent = this.autorotate ? 'Rotating' : 'Static';
    });


    const exploreBtn = document.querySelector('.btn-explore');
    exploreBtn.addEventListener('click', () => {
      this.exploreMode = !this.exploreMode;
      this.controls.enabled = this.exploreMode;
      exploreBtn.classList.toggle('active', this.exploreMode);
      exploreBtn.querySelector('.label').textContent = this.exploreMode ? 'Exploring' : 'Explore';

      if (this.exploreMode) {

        const car = CARS[this.currentIndex];
        this.controls.target.set(...car.framing.target);
        this.controls.update();
      } else {

        this.resetCameraToFraming();
      }
    });
  }

  resetCameraToFraming() {
    const car = CARS[this.currentIndex];
    const [cx, cy, cz] = car.framing.camera;
    const [tx, ty, tz] = car.framing.target;
    gsap.to(this.camera.position, {
      x: cx, y: cy, z: cz, duration: 1.0, ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.lookAt(tx, ty, tz);
        this.controls.target.set(tx, ty, tz);
      }
    });
  }

  updateHudFor(car, index) {
    const idx = (index !== undefined) ? index : this.currentIndex;
    document.querySelector('.car-marque').textContent = car.marque.toUpperCase();
    document.querySelector('.car-model').textContent = car.model;
    document.querySelector('.car-line').textContent = `${car.line} · ${car.year}`;
    document.querySelector('.car-tagline').textContent = car.tagline;
    document.querySelector('.car-origin').textContent = car.origin;
    document.querySelector('.car-layout').textContent = car.layout;
    document.querySelector('.car-index-num').textContent = String(idx + 1).padStart(2, '0');


    const m = document.querySelector('.car-model');
    splitChars(m);
  }

  animateSpecNumbers(car) {
    const grid = document.querySelector('.specs');
    grid.innerHTML = '';
    car.specs.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'spec hud-text-in';
      el.innerHTML = `
        <div class="spec-label">${s.label}</div>
        <div class="spec-value">
          <span class="num" data-target="${s.value}">0</span>
          <span class="unit">${s.unit}</span>
        </div>`;
      grid.appendChild(el);

      const numEl = el.querySelector('.num');
      const target = parseFloat(s.value);
      const isFloat = String(s.value).includes('.');
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power3.out', delay: 0.1 + i * 0.08,
        onUpdate: () => {
          numEl.textContent = isFloat ? obj.v.toFixed(1) : Math.round(obj.v).toLocaleString();
        }
      });
    });


    const modelEl = document.querySelector('.car-model');
    const chars = modelEl.querySelectorAll('.sc');
    gsap.fromTo(chars, { yPercent: 120, opacity: 0, rotate: 8 },
      { yPercent: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'power3.out', stagger: 0.03 });
  }

  updateActiveDots() {
    document.querySelectorAll('.car-dot').forEach((d, i) =>
      d.classList.toggle('active', i === this.currentIndex));
  }




  setupObservers() {
    Observer.create({
      target: window,
      type: 'wheel,touch',
      wheelSpeed: -1,
      tolerance: 80,
      preventDefault: false,
      onUp: () => { if (!this.exploreMode) this.switchTo(this.currentIndex + 1, 1); },
      onDown: () => { if (!this.exploreMode) this.switchTo(this.currentIndex - 1, -1); },
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.switchTo(this.currentIndex + 1, 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this.switchTo(this.currentIndex - 1, -1);
      if (e.key === ' ') { this.autorotate = !this.autorotate; }
      if (e.key === 'Escape' && this.exploreMode) {

        this.exploreMode = false;
        this.controls.enabled = false;
        const exploreBtn = document.querySelector('.btn-explore');
        if (exploreBtn) {
          exploreBtn.classList.remove('active');
          exploreBtn.querySelector('.label').textContent = 'Explore';
        }
        this.resetCameraToFraming();
      }
    });


    this.canvas.addEventListener('dblclick', () => {
      this.resetCameraToFraming();
    });


    let targetTilt = { x: 0, y: 0 };
    window.addEventListener('pointermove', (e) => {
      if (this.exploreMode) return;
      targetTilt.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetTilt.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
    });
    gsap.ticker.add(() => {
      if (this.transitioning || this.exploreMode) return;
      const car = CARS[this.currentIndex];
      const [cx, cy, cz] = car.framing.camera;
      this.camera.position.x += (cx + targetTilt.x - this.camera.position.x) * 0.04;
      this.camera.position.y += (cy + targetTilt.y - this.camera.position.y) * 0.04;
      this.camera.lookAt(...car.framing.target);
    });


    ScrollTrigger.create({
      trigger: document.body,
      start: 0, end: '+=2000',
      scrub: true,
      onUpdate: (self) => {
        document.querySelector('.scroll-fill').style.transform =
          `scaleX(${self.progress})`;
      }
    });
  }

  onResize() {
    const isMobile = window.innerWidth <= 768;
    this.camera.fov = isMobile ? 52 : 38;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Showroom();
});
