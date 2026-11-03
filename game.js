/**
 * MARIO CARTER // CarterPCs 3D Grand Prix Engine
 * Full Three.js 3D Kart Racing Engine, AI Racers, Item Physics,
 * 3-Stage Drift Mini-Turbo, Orbit/Countdown/Rear-View Camera, Minimap, and UI Controller.
 */

(function (window, document) {
  'use strict';

  // =========================================================================
  // 1. AUDIO ADAPTER & ROBUST BRIDGING
  // =========================================================================
  const AudioEngine = {
    get api() {
      return window.CarterAudio || window.SoundEngine || null;
    },
    init() {
      try {
        const a = this.api;
        if (a && typeof a.init === 'function') a.init();
      } catch (e) {
        console.warn('Audio init error:', e);
      }
    },
    toggleMute() {
      try {
        const a = this.api;
        if (a && typeof a.toggleMute === 'function') return a.toggleMute();
      } catch (e) {}
      return false;
    },
    isMuted() {
      const a = this.api;
      return a ? !!a.isMuted : false;
    },
    playCountdownBeep(stage) {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.playCountdownBeep === 'function') a.playCountdownBeep(stage);
        else if (typeof a.playCountdown === 'function') a.playCountdown(stage);
      } catch (e) {}
    },
    startEngine() {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.startEngineSound === 'function') a.startEngineSound();
        else if (typeof a.updateEngine === 'function') a.updateEngine(0.1, false, 0);
      } catch (e) {}
    },
    updateEngine(speedRatio, isDrifting, isBoosting, driftLevel) {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.updateEngineSound === 'function') {
          a.updateEngineSound(speedRatio, isDrifting, isBoosting);
        } else if (typeof a.updateEngine === 'function') {
          const dl = driftLevel || (isBoosting ? 2 : (isDrifting ? 1 : 0));
          a.updateEngine(speedRatio, isDrifting, dl);
        }
      } catch (e) {}
    },
    stopEngine() {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.stopEngineSound === 'function') a.stopEngineSound();
        else if (typeof a.stopEngine === 'function') a.stopEngine();
      } catch (e) {}
    },
    playHop() {
      try {
        const a = this.api;
        if (a && typeof a.playHop === 'function') a.playHop();
      } catch (e) {}
    },
    playDriftSpark(level) {
      try {
        const a = this.api;
        if (a && typeof a.playDriftSpark === 'function') a.playDriftSpark(level);
      } catch (e) {}
    },
    playBoost(level = 2) {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.playBoost === 'function') a.playBoost();
        else if (typeof a.playMiniTurbo === 'function') a.playMiniTurbo(level);
      } catch (e) {}
    },
    playItemRouletteTick() {
      try {
        const a = this.api;
        if (a && typeof a.playItemRouletteTick === 'function') a.playItemRouletteTick();
      } catch (e) {}
    },
    playItemLocked() {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.playItemLocked === 'function') a.playItemLocked();
        else if (typeof a.playItemAcquired === 'function') a.playItemAcquired();
      } catch (e) {}
    },
    playShellFire() {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.playShellFire === 'function') a.playShellFire();
        else if (typeof a.playShellShoot === 'function') a.playShellShoot();
      } catch (e) {}
    },
    playSpinOut() {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.playSpinOut === 'function') a.playSpinOut();
        else if (typeof a.playBananaSlip === 'function') a.playBananaSlip();
        else if (typeof a.playHit === 'function') a.playHit();
      } catch (e) {}
    },
    playCoinPickup() {
      try {
        const a = this.api;
        if (!a) return;
        if (typeof a.playCoinPickup === 'function') a.playCoinPickup();
        else if (typeof a.playCoin === 'function') a.playCoin();
      } catch (e) {}
    },
    playLapFanfare(isFinal) {
      try {
        const a = this.api;
        if (a && typeof a.playLapFanfare === 'function') a.playLapFanfare(isFinal);
      } catch (e) {}
    },
    playVictoryFanfare() {
      try {
        const a = this.api;
        if (a && typeof a.playVictoryFanfare === 'function') a.playVictoryFanfare();
      } catch (e) {}
    },
    startMusic() {
      try {
        const a = this.api;
        if (a && typeof a.startMusic === 'function') a.startMusic();
      } catch (e) {}
    },
    stopMusic() {
      try {
        const a = this.api;
        if (a && typeof a.stopMusic === 'function') a.stopMusic();
      } catch (e) {}
    }
  };

  // =========================================================================
  // 2. FALLBACK CONSTANTS & DEFINITIONS
  // =========================================================================
  const FALLBACK_CHARACTERS = [
    {
      id: 'mario',
      name: 'Mario Carter',
      title: 'Balanced 144Hz Build',
      color: '#EF4444',
      accent: '#2563EB',
      hatType: 'cap',
      badge: 'M',
      stats: { speed: 82, accel: 85, handling: 84, drift: 85 },
      quote: 'Did you check if your monitor is still on 60Hz?!'
    },
    {
      id: 'luigi',
      name: 'Luigi Carter',
      title: 'Eco-Mode Liquid Cooled',
      color: '#10B981',
      accent: '#1E3A8A',
      hatType: 'cap',
      badge: 'L',
      stats: { speed: 80, accel: 90, handling: 92, drift: 84 },
      quote: 'Never cheap out on the power supply, bro!'
    },
    {
      id: 'peach',
      name: 'Princess Carter',
      title: 'All-White Aesthetic Rig',
      color: '#EC4899',
      accent: '#F59E0B',
      hatType: 'crown',
      badge: 'P',
      stats: { speed: 78, accel: 95, handling: 94, drift: 96 },
      quote: 'White cables add at least +15 FPS of pure vibes.'
    },
    {
      id: 'bowser',
      name: 'Bowser Carter',
      title: 'RTX 5090 Threadripper',
      color: '#D97706',
      accent: '#0F172A',
      hatType: 'horns',
      badge: 'B',
      stats: { speed: 96, accel: 58, handling: 62, drift: 72 },
      quote: '1600 Watts of unadulterated thermal horsepower!'
    },
    {
      id: 'toad',
      name: 'Toad Carter',
      title: 'ITX Mini-PC Rocket',
      color: '#F43F5E',
      accent: '#FFFFFF',
      hatType: 'mushroom',
      badge: 'T',
      stats: { speed: 74, accel: 98, handling: 96, drift: 90 },
      quote: 'SFF Mini-ITX build: zero wasted clearance!'
    },
    {
      id: 'yoshi',
      name: 'Yoshi Carter',
      title: 'Custom Loop Overclocker',
      color: '#22C55E',
      accent: '#F97316',
      hatType: 'dino',
      badge: 'Y',
      stats: { speed: 82, accel: 86, handling: 94, drift: 86 },
      quote: 'Applying thermal paste mid-drift for maximum cooling!'
    },
    {
      id: 'wario',
      name: 'Wario Carter',
      title: '1600W Heavyweight Gold',
      color: '#EAB308',
      accent: '#7E22CE',
      hatType: 'cap',
      badge: 'W',
      stats: { speed: 94, accel: 64, handling: 66, drift: 76 },
      quote: 'Dual-channel RAM is NON-NEGOTIABLE!'
    },
    {
      id: 'rosalina',
      name: 'Rosalina Carter',
      title: 'Zero-G Glass Monolith',
      color: '#06B6D4',
      accent: '#E2E8F0',
      hatType: 'tiara',
      badge: 'R',
      stats: { speed: 88, accel: 80, handling: 88, drift: 94 },
      quote: 'Switching display resolution to 4K 240Hz!'
    }
  ];

  const FALLBACK_TRACKS = [
    {
      id: 'silicon',
      name: 'Silicon Valley Circuit',
      subtitle: 'Clean Daylight Campus • 3 Laps',
      difficulty: 'Normal',
      themeColor: '#10B981',
      skyTop: '#E0F2FE',
      skyBottom: '#F8FAFC',
      groundColor: '#ECFDF5',
      roadColor: '#334155',
      curbColorA: '#EF4444',
      curbColorB: '#FFFFFF',
      fogColor: '#E0F2FE',
      fogNear: 160,
      fogFar: 500,
      waypoints: [
        [0, 0, -180], [60, 2, -185], [120, 5, -170], [175, 8, -130],
        [205, 12, -70], [210, 15, 0], [185, 18, 70], [135, 14, 130],
        [70, 8, 175], [0, 4, 195], [-70, 2, 180], [-130, 4, 140],
        [-170, 8, 90], [-195, 12, 30], [-170, 15, -20], [-120, 10, -50],
        [-80, 6, -30], [-70, 4, 20], [-100, 2, 70], [-150, 0, 40],
        [-180, 0, -50], [-120, 0, -130]
      ]
    },
    {
      id: 'rainbow',
      name: 'RGB Rainbow Overclock',
      subtitle: 'Space Monolith & Cosmic RGB • 3 Laps',
      difficulty: 'Hard',
      themeColor: '#8B5CF6',
      skyTop: '#0F172A',
      skyBottom: '#1E1B4B',
      groundColor: '#090D16',
      roadColor: '#1E293B',
      curbColorA: '#06B6D4',
      curbColorB: '#F43F5E',
      fogColor: '#1E1B4B',
      fogNear: 180,
      fogFar: 600,
      waypoints: [
        [0, 2, -190], [55, 6, -180], [105, 12, -145], [135, 18, -90],
        [140, 24, -30], [115, 28, 30], [70, 24, 75], [15, 18, 110],
        [-45, 14, 145], [-100, 10, 170], [-135, 6, 150], [-130, 4, 90],
        [-90, 8, 40], [-40, 14, 0], [25, 20, -35], [85, 22, -65],
        [125, 18, -115], [110, 12, -165], [60, 6, -205], [-10, 3, -215],
        [-80, 2, -195], [-95, 2, -150]
      ]
    },
    {
      id: 'desert',
      name: 'Thermal Paste Dunes',
      subtitle: 'Copper Heatsink Canyon • 3 Laps',
      difficulty: 'Expert',
      themeColor: '#D97706',
      skyTop: '#FEF3C7',
      skyBottom: '#FFFBEB',
      groundColor: '#FDE68A',
      roadColor: '#451A03',
      curbColorA: '#D97706',
      curbColorB: '#FFFFFF',
      fogColor: '#FEF3C7',
      fogNear: 150,
      fogFar: 460,
      waypoints: [
        [-120, 0, -180], [-40, 3, -195], [40, 7, -190], [120, 4, -165],
        [180, 2, -120], [195, 6, -50], [165, 12, 10], [110, 8, 40],
        [60, 4, 20], [45, 2, -40], [85, 5, -80], [140, 9, -50],
        [175, 14, 20], [180, 10, 95], [145, 6, 160], [85, 3, 195],
        [0, 5, 210], [-80, 8, 190], [-150, 12, 145], [-190, 8, 80],
        [-200, 4, 0], [-175, 2, -75], [-155, 0, -135]
      ]
    }
  ];

  const ITEMS_DEF = {
    mushroom: { name: 'Thermal Boost (Mushroom)', color: '#EF4444' },
    triple_mushroom: { name: 'Triple Overclock (x3)', color: '#F97316' },
    green_shell: { name: 'Green GPU Shell', color: '#10B981' },
    red_shell: { name: 'Red Homing RTX Shell', color: '#EF4444' },
    banana: { name: 'Thermal Paste Slip', color: '#FACC15' },
    star: { name: '240Hz RGB Star Power', color: '#EC4899' }
  };

  const COMMENTARY_QUOTES = [
    'Did you remember to flip your PSU power switch?!',
    'Hit the apex at a blisteringly crisp 240Hz!',
    'Overclocked to 6.2GHz all-core on liquid nitrogen!',
    'Aesthetic white cable routing gives at least +20 BHP!',
    'Watch out! Slipping on excess thermal paste!',
    'Thermal throttled by a Green GPU Shell!',
    'Zero frame drops, maximum mechanical grip!',
    'Locked into the apex with full copper heat pipes!'
  ];

  // Helper to get character by ID
  function getCharacterData(id) {
    if (window.CarterAssets && window.CarterAssets.getCharacter) {
      const c = window.CarterAssets.getCharacter(id);
      if (c) return c;
    }
    const found = FALLBACK_CHARACTERS.find(c => c.id === id || (id === 'princess' && c.id === 'peach') || (id === 'peach' && c.id === 'princess'));
    return found || FALLBACK_CHARACTERS[0];
  }

  function getAllCharacters() {
    if (window.CarterAssets && Array.isArray(window.CarterAssets.CHARACTERS) && window.CarterAssets.CHARACTERS.length > 0) {
      return window.CarterAssets.CHARACTERS;
    }
    return FALLBACK_CHARACTERS;
  }

  function getTrackData(id) {
    if (window.CarterAssets && Array.isArray(window.CarterAssets.TRACKS)) {
      const t = window.CarterAssets.TRACKS.find(x => x.id === id);
      if (t) return t;
    }
    const found = FALLBACK_TRACKS.find(x => x.id === id);
    return found || FALLBACK_TRACKS[0];
  }

  // =========================================================================
  // 3. TEXTURE & CARTER FACE GENERATOR
  // =========================================================================
  let carterImage = null;
  const textureCache = new Map();

  function loadCarterImagePromise() {
    if (carterImage && carterImage.complete) return Promise.resolve(carterImage);
    return new Promise((resolve) => {
      carterImage = new Image();
      carterImage.crossOrigin = 'anonymous';
      carterImage.onload = () => resolve(carterImage);
      carterImage.onerror = () => {
        console.warn('Could not load assets/carter.jpg, using procedural fallback.');
        resolve(null);
      };
      carterImage.src = 'assets/carter.jpg';
    });
  }

  function createCarterHeadTexture(charData) {
    const key = 'head_' + charData.id;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background gradient aura
    const grad = ctx.createRadialGradient(256, 256, 60, 256, 256, 256);
    grad.addColorStop(0, charData.color || '#EF4444');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Draw Carter face if loaded, else high quality vector avatar
    if (carterImage && carterImage.complete && carterImage.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(256, 260, 160, 0, Math.PI * 2);
      ctx.clip();
      // Draw centered face
      ctx.drawImage(carterImage, 70, 110, 372, 372);
      ctx.restore();

      // Golden ring border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(256, 260, 160, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Vector face fallback
      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.arc(256, 260, 150, 0, Math.PI * 2);
      ctx.fill();

      // Eyes & smile
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(205, 235, 18, 0, Math.PI * 2);
      ctx.arc(307, 235, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(256, 265, 75, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }

    // Draw Character Hat / Crown / Horns on top of head
    ctx.save();
    ctx.fillStyle = charData.color || '#EF4444';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;

    if (charData.hatType === 'crown' || charData.id === 'princess' || charData.id === 'peach') {
      // Golden Crown
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(160, 140);
      ctx.lineTo(190, 80);
      ctx.lineTo(256, 120);
      ctx.lineTo(322, 80);
      ctx.lineTo(352, 140);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (charData.hatType === 'horns' || charData.id === 'bowser') {
      // Spiked Horns
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(150, 160);
      ctx.lineTo(120, 70);
      ctx.lineTo(180, 120);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(362, 160);
      ctx.lineTo(392, 70);
      ctx.lineTo(332, 120);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (charData.hatType === 'mushroom' || charData.id === 'toad') {
      // Toad Mushroom Dome
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(256, 130, 130, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(256, 80, 45, 0, Math.PI * 2);
      ctx.arc(160, 130, 35, 0, Math.PI * 2);
      ctx.arc(352, 130, 35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Classic Carter Cap with Visor
      ctx.beginPath();
      ctx.arc(256, 150, 130, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Brim
      ctx.beginPath();
      ctx.ellipse(256, 155, 145, 40, 0, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      // Badge circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(256, 95, 36, 0, Math.PI * 2);
      ctx.fill();

      // Badge letter
      ctx.fillStyle = charData.color || '#EF4444';
      ctx.font = 'bold 44px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(charData.badge || 'C', 256, 97);
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureCache.set(key, texture);
    return texture;
  }

  // Create billboard sprite for AI Carter nameplate + face
  function createCarterSprite(charData) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Translucent rounded capsule
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = charData.color || '#EF4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(10, 10, 364, 108, 54);
    ctx.fill();
    ctx.stroke();

    // Left circular face badge
    ctx.save();
    ctx.beginPath();
    ctx.arc(64, 64, 44, 0, Math.PI * 2);
    ctx.clip();
    if (carterImage && carterImage.complete && carterImage.naturalWidth > 0) {
      ctx.drawImage(carterImage, 20, 20, 88, 88);
    } else {
      ctx.fillStyle = charData.color || '#EF4444';
      ctx.fillRect(20, 20, 88, 88);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(charData.badge || 'C', 64, 64);
    }
    ctx.restore();

    // Outline around face badge
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(64, 64, 44, 0, Math.PI * 2);
    ctx.stroke();

    // Name & Build text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(charData.name, 126, 52);

    ctx.fillStyle = charData.accent || '#38BDF8';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillText(charData.title || charData.build || '240Hz OVERCLOCK', 126, 86);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(16, 5.3, 1);
    return sprite;
  }

  // =========================================================================
  // 4. MAIN GAME STATE & ENGINE CLASS
  // =========================================================================
  class MarioCarterGame {
    constructor() {
      // DOM References
      this.canvas = document.getElementById('game-canvas');
      this.minimapCanvas = document.getElementById('minimap-canvas');
      this.rearviewCanvas = document.getElementById('rearview-canvas');
      this.itemCanvas = document.getElementById('item-canvas');

      // State
      this.mode = 'lobby'; // 'lobby' | 'countdown' | 'racing' | 'podium'
      this.selectedCharId = 'mario';
      this.selectedTrackId = 'silicon';
      this.engineClass = 1.0; // 50cc=0.8, 100cc=1.0, 150cc=1.18, 240Hz=1.35
      this.raceLaps = 3;
      this.raceTime = 0;
      this.bestLapTime = Infinity;
      this.currentLapTime = 0;
      this.isPaused = false;
      this.lookBack = false;

      // Three.js Core
      this.scene = null;
      this.camera = null;
      this.rearCamera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();

      // Track World
      this.currentTrack = null;
      this.trackCurve = null;
      this.trackLength = 1000;
      this.roadMesh = null;
      this.boostPads = [];
      this.itemBoxes = [];
      this.coins = [];
      this.props = [];
      this.projectiles = []; // Shells & Bananas

      // Racers (1 Player + 7 AI)
      this.racers = [];
      this.playerRacer = null;

      // Particles & VFX
      this.sparkParticles = null;
      this.speedLines = null;

      // Input State
      this.keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        drift: false,
        item: false
      };

      // Orbit showcase camera in lobby
      this.lobbyOrbitAngle = 0;
      this.countdownTimer = 0;

      // Item Roulette State
      this.rouletteActive = false;
      this.rouletteTimer = 0;
      this.pendingItem = null;

      // Bind methods
      this.onResize = this.onResize.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      this.animate = this.animate.bind(this);

      // Start initialization
      this.init();
    }

    async init() {
      await loadCarterImagePromise();
      this.setupThree();
      this.setupInputs();
      this.setupUI();
      this.loadTrack(this.selectedTrackId);
      this.initRacers();
      this.renderMinimap();

      window.addEventListener('resize', this.onResize);
      requestAnimationFrame(this.animate);
    }

    // -----------------------------------------------------------------------
    // Three.js Setup
    // -----------------------------------------------------------------------
    setupThree() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xF8FAFC);
      this.scene.fog = new THREE.Fog(0xE0F2FE, 160, 480);

      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1500);
      this.camera.position.set(0, 10, 25);

      this.rearCamera = new THREE.PerspectiveCamera(70, 260 / 110, 0.1, 800);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Lighting
      const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x94A3B8, 0.85);
      this.scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
      dirLight.position.set(120, 220, 100);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 600;
      const d = 240;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      this.scene.add(dirLight);

      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
      this.scene.add(ambientLight);
    }

    onResize() {
      if (!this.camera || !this.renderer) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    // -----------------------------------------------------------------------
    // Track Builder & Minimalist CarterPCs World
    // -----------------------------------------------------------------------
    loadTrack(trackId) {
      this.selectedTrackId = trackId;
      const trackData = getTrackData(trackId);
      this.currentTrack = trackData;

      // Clear previous track objects
      if (this.trackGroup) {
        this.scene.remove(this.trackGroup);
        this.trackGroup.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
      }

      this.trackGroup = new THREE.Group();
      this.scene.add(this.trackGroup);

      // Environment colors
      this.scene.background = new THREE.Color(trackData.skyBottom || 0xF8FAFC);
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color(trackData.fogColor || 0xE0F2FE);
        this.scene.fog.near = trackData.fogNear || 160;
        this.scene.fog.far = trackData.fogFar || 480;
      }

      // Build spline curve
      const vectors = trackData.waypoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      this.trackCurve = new THREE.CatmullRomCurve3(vectors, true, 'centripetal');
      this.trackLength = this.trackCurve.getLength();

      // Build Road Ribbon & Curbs
      this.buildRoadMesh(trackData);

      // Add Ground Plane
      const groundGeo = new THREE.PlaneGeometry(1600, 1600, 32, 32);
      const groundMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(trackData.groundColor || 0xECFDF5),
        roughness: 0.9,
        metalness: 0.05
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.5;
      ground.receiveShadow = true;
      this.trackGroup.add(ground);

      // Add Boost Pads, Item Boxes, Coins, CarterPCs Monoliths & Scenery Props
      this.buildTrackProps(trackData);
      this.buildItemBoxesAndCoins();
      this.buildStartGantry();
    }

    buildRoadMesh(trackData) {
      const segments = 360;
      const roadWidth = 26;
      const curbWidth = 2.2;
      const curbHeight = 0.55;

      const roadPositions = [];
      const roadUvs = [];
      const roadIndices = [];

      const curbLPositions = [];
      const curbRPositions = [];
      const curbLColors = [];
      const curbRColors = [];
      const curbIndices = [];

      const colorA = new THREE.Color(trackData.curbColorA || 0xEF4444);
      const colorB = new THREE.Color(trackData.curbColorB || 0xFFFFFF);

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const point = this.trackCurve.getPointAt(t % 1);
        const tangent = this.trackCurve.getTangentAt(t % 1).normalize();
        const normal = new THREE.Vector3(0, 1, 0);
        const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

        const halfW = roadWidth * 0.5;
        const pLeft = new THREE.Vector3().copy(point).addScaledVector(binormal, -halfW);
        const pRight = new THREE.Vector3().copy(point).addScaledVector(binormal, halfW);

        // Road vertices
        roadPositions.push(pLeft.x, pLeft.y + 0.05, pLeft.z);
        roadPositions.push(pRight.x, pRight.y + 0.05, pRight.z);
        roadUvs.push(0, t * 45);
        roadUvs.push(1, t * 45);

        // Left curb
        const cLInner = new THREE.Vector3().copy(pLeft);
        const cLOuter = new THREE.Vector3().copy(pLeft).addScaledVector(binormal, -curbWidth);
        curbLPositions.push(cLInner.x, cLInner.y + 0.05, cLInner.z);
        curbLPositions.push(cLOuter.x, cLOuter.y + curbHeight, cLOuter.z);

        // Right curb
        const cRInner = new THREE.Vector3().copy(pRight);
        const cROuter = new THREE.Vector3().copy(pRight).addScaledVector(binormal, curbWidth);
        curbRPositions.push(cRInner.x, cRInner.y + 0.05, cRInner.z);
        curbRPositions.push(cROuter.x, cROuter.y + curbHeight, cROuter.z);

        // Alternating curb colors
        const isA = Math.floor(t * 120) % 2 === 0;
        const c = isA ? colorA : colorB;
        curbLColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
        curbRColors.push(c.r, c.g, c.b, c.r, c.g, c.b);

        if (i < segments) {
          const base = i * 2;
          roadIndices.push(base, base + 1, base + 2);
          roadIndices.push(base + 1, base + 3, base + 2);

          curbIndices.push(base, base + 1, base + 2);
          curbIndices.push(base + 1, base + 3, base + 2);
        }
      }

      // Road Geometry
      const roadGeo = new THREE.BufferGeometry();
      roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
      roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
      roadGeo.setIndex(roadIndices);
      roadGeo.computeVertexNormals();

      // Road Material with crisp center line and start line
      const roadCanvas = document.createElement('canvas');
      roadCanvas.width = 512;
      roadCanvas.height = 1024;
      const rCtx = roadCanvas.getContext('2d');
      rCtx.fillStyle = trackData.roadColor || '#334155';
      rCtx.fillRect(0, 0, 512, 1024);

      // Road edge borders
      rCtx.fillStyle = '#FFFFFF';
      rCtx.fillRect(16, 0, 8, 1024);
      rCtx.fillRect(512 - 24, 0, 8, 1024);

      // Dashed center line
      rCtx.fillStyle = '#F8FAFC';
      for (let y = 0; y < 1024; y += 64) {
        rCtx.fillRect(256 - 6, y, 12, 34);
      }

      const roadTex = new THREE.CanvasTexture(roadCanvas);
      roadTex.wrapS = THREE.RepeatWrapping;
      roadTex.wrapT = THREE.RepeatWrapping;
      roadTex.repeat.set(1, 24);

      const roadMat = new THREE.MeshStandardMaterial({
        map: roadTex,
        roughness: 0.65,
        metalness: 0.1
      });
      this.roadMesh = new THREE.Mesh(roadGeo, roadMat);
      this.roadMesh.receiveShadow = true;
      this.trackGroup.add(this.roadMesh);

      // Curb Meshes
      const makeCurbMesh = (positions, colors) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.setIndex(curbIndices);
        geo.computeVertexNormals();
        const mat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.5,
          metalness: 0.15
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      };

      this.trackGroup.add(makeCurbMesh(curbLPositions, curbLColors));
      this.trackGroup.add(makeCurbMesh(curbRPositions, curbRColors));
    }

    buildStartGantry() {
      const p = this.trackCurve.getPointAt(0);
      const tangent = this.trackCurve.getTangentAt(0).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      const gantryGroup = new THREE.Group();
      gantryGroup.position.copy(p);
      gantryGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

      // Dual Sleek White Pillars
      const pillarGeo = new THREE.BoxGeometry(2.4, 18, 2.4);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.2, metalness: 0.7 });

      const pL = new THREE.Mesh(pillarGeo, pillarMat);
      pL.position.set(-16, 9, 0);
      pL.castShadow = true;
      gantryGroup.add(pL);

      const pR = new THREE.Mesh(pillarGeo, pillarMat);
      pR.position.set(16, 9, 0);
      pR.castShadow = true;
      gantryGroup.add(pR);

      // Overhead Crossbar Banner
      const barGeo = new THREE.BoxGeometry(34, 4.5, 3.2);
      const bannerCanvas = document.createElement('canvas');
      bannerCanvas.width = 1024;
      bannerCanvas.height = 128;
      const bCtx = bannerCanvas.getContext('2d');
      bCtx.fillStyle = '#0F172A';
      bCtx.fillRect(0, 0, 1024, 128);

      bCtx.fillStyle = '#EF4444';
      bCtx.fillRect(0, 0, 1024, 10);
      bCtx.fillRect(0, 118, 1024, 10);

      bCtx.fillStyle = '#FFFFFF';
      bCtx.font = 'bold 50px "Outfit", sans-serif';
      bCtx.textAlign = 'center';
      bCtx.fillText('MARIO CARTER // CARTER PCS 240HZ GP', 512, 78);

      const bannerTex = new THREE.CanvasTexture(bannerCanvas);
      const bannerMat = new THREE.MeshStandardMaterial({
        map: bannerTex,
        roughness: 0.3,
        metalness: 0.6,
        emissive: 0x1E293B,
        emissiveIntensity: 0.3
      });
      const barMesh = new THREE.Mesh(barGeo, bannerMat);
      barMesh.position.set(0, 17, 0);
      barMesh.castShadow = true;
      gantryGroup.add(barMesh);

      // Start/Finish Checkerboard Line on Road Surface
      const checkerGeo = new THREE.PlaneGeometry(26, 4);
      const checkCanvas = document.createElement('canvas');
      checkCanvas.width = 256;
      checkCanvas.height = 64;
      const cCtx = checkCanvas.getContext('2d');
      for (let x = 0; x < 256; x += 32) {
        for (let y = 0; y < 64; y += 32) {
          cCtx.fillStyle = ((x / 32) + (y / 32)) % 2 === 0 ? '#FFFFFF' : '#0F172A';
          cCtx.fillRect(x, y, 32, 32);
        }
      }
      const checkTex = new THREE.CanvasTexture(checkCanvas);
      const checkMat = new THREE.MeshBasicMaterial({ map: checkTex });
      const checkMesh = new THREE.Mesh(checkerGeo, checkMat);
      checkMesh.rotation.x = -Math.PI / 2;
      checkMesh.position.set(0, 0.1, 0);
      gantryGroup.add(checkMesh);

      this.trackGroup.add(gantryGroup);
    }

    buildTrackProps(trackData) {
      this.props = [];
      this.boostPads = [];

      // Add 3-4 glowing Boost Pads along the road
      const boostTValues = [0.18, 0.48, 0.78];
      boostTValues.forEach(t => {
        const pt = this.trackCurve.getPointAt(t);
        const tan = this.trackCurve.getTangentAt(t).normalize();

        const padGeo = new THREE.PlaneGeometry(16, 7);
        const padCanvas = document.createElement('canvas');
        padCanvas.width = 256;
        padCanvas.height = 128;
        const pCtx = padCanvas.getContext('2d');

        pCtx.fillStyle = '#06B6D4';
        pCtx.fillRect(0, 0, 256, 128);

        // Glowing Chevrons
        pCtx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 3; i++) {
          pCtx.beginPath();
          pCtx.moveTo(40 + i * 70, 110);
          pCtx.lineTo(80 + i * 70, 64);
          pCtx.lineTo(40 + i * 70, 18);
          pCtx.lineTo(65 + i * 70, 18);
          pCtx.lineTo(105 + i * 70, 64);
          pCtx.lineTo(65 + i * 70, 110);
          pCtx.closePath();
          pCtx.fill();
        }

        const padTex = new THREE.CanvasTexture(padCanvas);
        const padMat = new THREE.MeshBasicMaterial({
          map: padTex,
          transparent: true,
          opacity: 0.92
        });
        const padMesh = new THREE.Mesh(padGeo, padMat);
        padMesh.position.copy(pt).add(new THREE.Vector3(0, 0.12, 0));
        padMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
        padMesh.rotateX(-Math.PI / 2);

        this.trackGroup.add(padMesh);
        this.boostPads.push({ mesh: padMesh, t: t, pos: pt });
      });

      // Sleek CarterPCs White Gaming Tower Monoliths
      const towerPositions = [
        [-60, 0, -100], [90, 0, -110], [140, 0, 50], [-130, 0, 80],
        [20, 0, 150], [-90, 0, -20]
      ];

      towerPositions.forEach((pos, idx) => {
        const towerGroup = new THREE.Group();
        towerGroup.position.set(pos[0], 18, pos[2]);

        // White Case Body
        const caseGeo = new THREE.BoxGeometry(10, 36, 18);
        const caseMat = new THREE.MeshStandardMaterial({
          color: 0xF8FAFC,
          roughness: 0.2,
          metalness: 0.8
        });
        const caseMesh = new THREE.Mesh(caseGeo, caseMat);
        caseMesh.castShadow = true;
        towerGroup.add(caseMesh);

        // Tempered Glass Panel
        const glassGeo = new THREE.PlaneGeometry(16, 32);
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0x06B6D4,
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
          metalness: 0.9
        });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.position.set(5.1, 0, 0);
        glassMesh.rotation.y = Math.PI / 2;
        towerGroup.add(glassMesh);

        // Glowing Spinning RGB Cooling Fans
        const fanGroup = new THREE.Group();
        for (let f = 0; f < 3; f++) {
          const fanGeo = new THREE.RingGeometry(1.2, 3.2, 16);
          const fanMat = new THREE.MeshBasicMaterial({
            color: idx % 2 === 0 ? 0x06B6D4 : 0xEF4444,
            side: THREE.DoubleSide
          });
          const fan = new THREE.Mesh(fanGeo, fanMat);
          fan.position.set(4.8, -10 + f * 10, 0);
          fan.rotation.y = Math.PI / 2;
          fanGroup.add(fan);
        }
        towerGroup.add(fanGroup);
        towerGroup.fanGroup = fanGroup;

        this.trackGroup.add(towerGroup);
        this.props.push(towerGroup);
      });

      // Low-poly geometric scenery trees / cyber pillars
      for (let i = 0; i < 28; i++) {
        const ang = (i / 28) * Math.PI * 2;
        const rad = 240 + (i % 3) * 60;
        const tx = Math.cos(ang) * rad;
        const tz = Math.sin(ang) * rad;

        const trunkGeo = new THREE.CylinderGeometry(1, 1.6, 12, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.8 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(tx, 6, tz);
        trunk.castShadow = true;

        const foliageGeo = new THREE.ConeGeometry(7, 16, 6);
        const foliageMat = new THREE.MeshStandardMaterial({
          color: trackData.id === 'desert' ? 0xD97706 : 0x10B981,
          roughness: 0.6
        });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.set(tx, 18, tz);
        foliage.castShadow = true;

        this.trackGroup.add(trunk);
        this.trackGroup.add(foliage);
      }
    }

    buildItemBoxesAndCoins() {
      this.itemBoxes = [];
      this.coins = [];

      // 4 Item Box Stations along the track
      const stations = [0.12, 0.38, 0.62, 0.88];
      stations.forEach(st => {
        const pt = this.trackCurve.getPointAt(st);
        const tan = this.trackCurve.getTangentAt(st).normalize();
        const bin = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();

        // 3 side-by-side item boxes per station
        [-6.5, 0, 6.5].forEach(offset => {
          const pos = new THREE.Vector3().copy(pt).addScaledVector(bin, offset);
          pos.y += 2.4;

          const boxGroup = new THREE.Group();
          boxGroup.position.copy(pos);

          // Translucent Rainbow Outer Cube
          const boxGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
          const boxMat = new THREE.MeshStandardMaterial({
            color: 0x38BDF8,
            transparent: true,
            opacity: 0.75,
            roughness: 0.1,
            metalness: 0.8
          });
          const outerBox = new THREE.Mesh(boxGeo, boxMat);
          boxGroup.add(outerBox);

          // Inner Golden Question Mark Core
          const coreGeo = new THREE.OctahedronGeometry(1.2);
          const coreMat = new THREE.MeshBasicMaterial({ color: 0xFACC15 });
          const core = new THREE.Mesh(coreGeo, coreMat);
          boxGroup.add(core);

          this.trackGroup.add(boxGroup);
          this.itemBoxes.push({
            group: boxGroup,
            outerBox,
            core,
            basePos: pos.clone(),
            active: true,
            respawnTimer: 0
          });
        });
      });

      // Golden RAM Sticks / Coins along the track
      const coinT = [0.05, 0.07, 0.09, 0.28, 0.30, 0.32, 0.52, 0.54, 0.56, 0.72, 0.74, 0.76];
      coinT.forEach(ct => {
        const pt = this.trackCurve.getPointAt(ct);
        const coinGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.3, 16);
        const coinMat = new THREE.MeshStandardMaterial({
          color: 0xF59E0B,
          roughness: 0.2,
          metalness: 0.9,
          emissive: 0xD97706,
          emissiveIntensity: 0.3
        });
        const coinMesh = new THREE.Mesh(coinGeo, coinMat);
        coinMesh.rotation.z = Math.PI / 2;
        coinMesh.position.copy(pt).add(new THREE.Vector3(0, 1.2, 0));

        this.trackGroup.add(coinMesh);
        this.coins.push({
          mesh: coinMesh,
          active: true,
          respawnTimer: 0,
          baseY: pt.y + 1.2
        });
      });
    }

    // -----------------------------------------------------------------------
    // Kart & Driver Construction (Player + 7 AI Racers)
    // -----------------------------------------------------------------------
    initRacers() {
      // Clear previous racers
      this.racers.forEach(r => {
        if (r.mesh) this.scene.remove(r.mesh);
      });
      this.racers = [];

      const characters = getAllCharacters();
      // Ensure player character is first, followed by others
      const playerChar = getCharacterData(this.selectedCharId);
      const otherChars = characters.filter(c => c.id !== playerChar.id).slice(0, 7);
      const raceOrder = [playerChar, ...otherChars];

      raceOrder.forEach((charData, index) => {
        const isPlayer = index === 0;
        const racerMesh = this.buildKartMesh(charData, isPlayer);
        this.scene.add(racerMesh);

        // Grid starting placement
        const startT = (1.0 - (index * 0.015)) % 1.0;
        const pt = this.trackCurve.getPointAt(startT);
        const tan = this.trackCurve.getTangentAt(startT).normalize();
        const bin = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
        const lateralOffset = (index % 2 === 0 ? -5 : 5);

        racerMesh.position.copy(pt).addScaledVector(bin, lateralOffset);
        racerMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);

        const racer = {
          id: charData.id,
          name: charData.name,
          charData: charData,
          isPlayer: isPlayer,
          mesh: racerMesh,
          t: startT,
          lap: 1,
          totalDistance: startT * this.trackLength,
          speed: 0,
          maxSpeed: (charData.stats.speed / 100) * 85 * this.engineClass,
          accel: (charData.stats.accel / 100) * 42,
          handling: (charData.stats.handling / 100),
          driftStat: (charData.stats.drift / 100),
          lateralOffset: lateralOffset,
          steerAngle: 0,
          // Drift Mechanics
          isDrifting: false,
          driftDirection: 0, // -1 left, +1 right
          driftTimer: 0,
          driftLevel: 0,
          hopVelocity: 0,
          hopY: 0,
          // Boost & Items
          boostTimer: 0,
          starTimer: 0,
          spinOutTimer: 0,
          coins: 0,
          activeItem: null,
          itemCount: 0,
          // AI Properties
          aiTargetOffset: lateralOffset,
          aiSteerNoise: 0,
          aiNextItemCheck: 2.0 + Math.random() * 3
        };

        this.racers.push(racer);
        if (isPlayer) this.playerRacer = racer;
      });
    }

    buildKartMesh(charData, isPlayer) {
      const kart = new THREE.Group();

      // 1. Aerodynamic Main Body
      const bodyGeo = new THREE.BoxGeometry(3.6, 1.2, 6.2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(charData.color || 0xEF4444),
        roughness: 0.25,
        metalness: 0.6
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.0;
      body.castShadow = true;
      kart.add(body);
      kart.bodyMesh = body;

      // 2. Front Nosecone / Bumper
      const noseGeo = new THREE.CylinderGeometry(1.6, 2.0, 2.2, 16);
      const noseMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(charData.accent || 0x2563EB),
        roughness: 0.3,
        metalness: 0.5
      });
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 0.8, 3.4);
      nose.castShadow = true;
      kart.add(nose);

      // 3. Cockpit & Seat
      const seatGeo = new THREE.BoxGeometry(2.4, 2.2, 1.8);
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 });
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.set(0, 1.8, -0.6);
      kart.add(seat);

      // 4. Rear Spoiler
      const wingGeo = new THREE.BoxGeometry(4.4, 0.4, 1.2);
      const wingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(charData.color || 0xEF4444),
        roughness: 0.2
      });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(0, 2.8, -3.2);
      wing.castShadow = true;
      kart.add(wing);

      // Struts
      const strutGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2);
      const strutMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8 });
      [-1.4, 1.4].forEach(sx => {
        const strut = new THREE.Mesh(strutGeo, strutMat);
        strut.position.set(sx, 2.2, -3.2);
        kart.add(strut);
      });

      // 5. Dual Chrome Exhaust Pipes
      const exhaustGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.4, 12);
      const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.1 });
      kart.exhausts = [];
      [-1.0, 1.0].forEach(ex => {
        const pipe = new THREE.Mesh(exhaustGeo, exhaustMat);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(ex, 0.8, -3.4);
        kart.add(pipe);
        kart.exhausts.push(pipe);
      });

      // 6. Wheels (Front wheels steer, all wheels rotate)
      const wheelGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.85, 18);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
      const rimGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.88, 12);
      const rimMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(charData.color || 0xEF4444),
        metalness: 0.7,
        roughness: 0.2
      });

      kart.wheels = [];
      kart.frontWheels = [];

      const wheelOffsets = [
        { x: -2.0, y: 0.85, z: 2.2, front: true },
        { x: 2.0, y: 0.85, z: 2.2, front: true },
        { x: -2.1, y: 0.95, z: -2.2, front: false },
        { x: 2.1, y: 0.95, z: -2.2, front: false }
      ];

      wheelOffsets.forEach(wo => {
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(wo.x, wo.y, wo.z);

        const tire = new THREE.Mesh(wheelGeo, wheelMat);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        wheelGroup.add(tire);

        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);

        kart.add(wheelGroup);
        kart.wheels.push(wheelGroup);
        if (wo.front) kart.frontWheels.push(wheelGroup);
      });

      // 7. DRIVER HEAD (Carter's Real Face mapped onto 3D Head)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 2.7, -0.4);

      const headGeo = new THREE.SphereGeometry(1.05, 24, 24);
      const headTex = createCarterHeadTexture(charData);
      const headMat = new THREE.MeshStandardMaterial({
        map: headTex,
        roughness: 0.35,
        metalness: 0.1
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.castShadow = true;
      headGroup.add(head);

      kart.add(headGroup);
      kart.driverHead = headGroup;

      // 8. Overhead Carter Face Medallion Sprite + Nameplate (for AI Racers)
      if (!isPlayer) {
        const sprite = createCarterSprite(charData);
        sprite.position.set(0, 6.2, 0);
        kart.add(sprite);
      }

      return kart;
    }

    // -----------------------------------------------------------------------
    // UI Setup & Controller
    // -----------------------------------------------------------------------
    setupUI() {
      // Character Select Cards
      const charCards = document.querySelectorAll('.carter-card');
      charCards.forEach(card => {
        const charId = card.dataset.charId;
        const charData = getCharacterData(charId);

        // Draw preview avatar on mini card canvas
        const avatarCanvas = card.querySelector('.card-avatar-canvas');
        if (avatarCanvas) {
          this.renderAvatarToCanvas(avatarCanvas, charData);
        }

        card.addEventListener('click', () => {
          charCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.selectedCharId = charId;
          this.updateCharacterPreview(charData);
          this.initRacers();
        });
      });

      // Initial character preview update
      this.updateCharacterPreview(getCharacterData(this.selectedCharId));

      // Track Select Cards
      const trackCards = document.querySelectorAll('.track-card');
      trackCards.forEach(card => {
        const trackId = card.dataset.trackId;
        card.addEventListener('click', () => {
          trackCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.loadTrack(trackId);
          this.initRacers();
          this.renderMinimap();
        });
      });

      // CC Class Selector
      const ccButtons = document.querySelectorAll('.cc-btn');
      ccButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          ccButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cc = btn.dataset.cc;
          if (cc === '50') this.engineClass = 0.85;
          else if (cc === '100') this.engineClass = 1.0;
          else if (cc === '150') this.engineClass = 1.18;
          else if (cc === '240') this.engineClass = 1.35;
        });
      });

      // Launch Buttons
      const startRaceBtn = document.getElementById('btn-start-race');
      if (startRaceBtn) {
        startRaceBtn.addEventListener('click', () => {
          AudioEngine.init();
          this.startRaceCountdown(3);
        });
      }

      const timeTrialBtn = document.getElementById('btn-time-trial');
      if (timeTrialBtn) {
        timeTrialBtn.addEventListener('click', () => {
          AudioEngine.init();
          this.startRaceCountdown(1); // 1 lap quick trial
        });
      }

      // Audio Mute Toggle Button
      const audioBtn = document.getElementById('btn-audio-toggle');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          const muted = AudioEngine.toggleMute();
          const onIcon = document.getElementById('audio-icon-on');
          const offIcon = document.getElementById('audio-icon-off');
          if (onIcon && offIcon) {
            onIcon.classList.toggle('hidden', muted);
            offIcon.classList.toggle('hidden', !muted);
          }
        });
      }

      // Camera Toggle Button (Look Back / Rear-View Mirror)
      const camBtn = document.getElementById('btn-camera-toggle');
      if (camBtn) {
        camBtn.addEventListener('click', () => {
          this.lookBack = !this.lookBack;
          const rv = document.getElementById('rearview-container');
          if (rv) rv.classList.toggle('hidden', !this.lookBack);
        });
      }

      // Pause / Menu Button
      const pauseBtn = document.getElementById('btn-pause');
      if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
          this.returnToLobby();
        });
      }

      // Results Modal Actions
      const playAgainBtn = document.getElementById('btn-play-again');
      if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
          const modal = document.getElementById('results-modal');
          if (modal) modal.classList.add('hidden');
          this.startRaceCountdown(this.raceLaps);
        });
      }

      const nextTrackBtn = document.getElementById('btn-next-track');
      if (nextTrackBtn) {
        nextTrackBtn.addEventListener('click', () => {
          const modal = document.getElementById('results-modal');
          if (modal) modal.classList.add('hidden');
          const tracks = ['silicon', 'rainbow', 'desert'];
          const nextIndex = (tracks.indexOf(this.selectedTrackId) + 1) % tracks.length;
          this.loadTrack(tracks[nextIndex]);
          this.startRaceCountdown(3);
        });
      }

      const backLobbyBtn = document.getElementById('btn-back-lobby');
      if (backLobbyBtn) {
        backLobbyBtn.addEventListener('click', () => {
          const modal = document.getElementById('results-modal');
          if (modal) modal.classList.add('hidden');
          this.returnToLobby();
        });
      }
    }

    renderAvatarToCanvas(canvas, charData) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Circle face cutout
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
      ctx.clip();

      if (carterImage && carterImage.complete && carterImage.naturalWidth > 0) {
        ctx.drawImage(carterImage, 0, 0, w, h);
      } else {
        ctx.fillStyle = charData.color || '#EF4444';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(charData.badge || 'C', w / 2, h / 2);
      }
      ctx.restore();

      // Border outline
      ctx.strokeStyle = charData.color || '#EF4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    updateCharacterPreview(charData) {
      const previewCanvas = document.getElementById('preview-avatar-canvas');
      if (previewCanvas) this.renderAvatarToCanvas(previewCanvas, charData);

      const nameEl = document.getElementById('preview-name');
      if (nameEl) nameEl.textContent = charData.name;

      const buildEl = document.getElementById('preview-build');
      if (buildEl) buildEl.textContent = charData.title || charData.build;

      const quoteEl = document.getElementById('preview-quote');
      if (quoteEl) quoteEl.textContent = `"${charData.quote || 'No frame drops on my watch!'}"`;

      // Stat bars
      const stats = charData.stats || { speed: 80, accel: 80, handling: 80, drift: 80 };
      ['speed', 'accel', 'handling', 'drift'].forEach(s => {
        const valEl = document.getElementById(`stat-val-${s}`);
        const barEl = document.getElementById(`stat-bar-${s}`);
        if (valEl) valEl.textContent = `${stats[s]}%`;
        if (barEl) barEl.style.width = `${stats[s]}%`;
      });
    }

    // -----------------------------------------------------------------------
    // Input Controller (Keyboard & Mobile Touch)
    // -----------------------------------------------------------------------
    setupInputs() {
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);

      // Mobile Touch Buttons
      const bindTouch = (id, keyName) => {
        const el = document.getElementById(id);
        if (!el) return;
        const setVal = (v) => {
          this.keys[keyName] = v;
          if (keyName === 'drift' && v) this.onDriftPress();
          if (keyName === 'drift' && !v) this.onDriftRelease();
          if (keyName === 'item' && v) this.usePlayerItem();
        };
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); setVal(true); });
        el.addEventListener('pointerup', (e) => { e.preventDefault(); setVal(false); });
        el.addEventListener('pointerleave', (e) => { e.preventDefault(); setVal(false); });
      };

      bindTouch('btn-gas', 'forward');
      bindTouch('btn-left', 'left');
      bindTouch('btn-right', 'right');
      bindTouch('btn-drift', 'drift');
      bindTouch('btn-item', 'item');
    }

    onKeyDown(e) {
      if (e.repeat) return;
      const k = e.code;
      if (k === 'KeyW' || k === 'ArrowUp') this.keys.forward = true;
      if (k === 'KeyS' || k === 'ArrowDown') this.keys.backward = true;
      if (k === 'KeyA' || k === 'ArrowLeft') this.keys.left = true;
      if (k === 'KeyD' || k === 'ArrowRight') this.keys.right = true;

      // Drift / Hop
      if (k === 'Space' || k === 'ShiftLeft' || k === 'ShiftRight') {
        this.keys.drift = true;
        this.onDriftPress();
      }

      // Use Item
      if (k === 'KeyE' || k === 'Enter' || k === 'KeyF') {
        this.keys.item = true;
        this.usePlayerItem();
      }

      // Look Back / Rear-View Mirror
      if (k === 'KeyC' || k === 'KeyQ') {
        this.lookBack = true;
        const rv = document.getElementById('rearview-container');
        if (rv) rv.classList.remove('hidden');
      }

      // Escape Menu / Pause
      if (k === 'Escape') {
        if (this.mode === 'racing') this.returnToLobby();
      }
    }

    onKeyUp(e) {
      const k = e.code;
      if (k === 'KeyW' || k === 'ArrowUp') this.keys.forward = false;
      if (k === 'KeyS' || k === 'ArrowDown') this.keys.backward = false;
      if (k === 'KeyA' || k === 'ArrowLeft') this.keys.left = false;
      if (k === 'KeyD' || k === 'ArrowRight') this.keys.right = false;

      if (k === 'Space' || k === 'ShiftLeft' || k === 'ShiftRight') {
        this.keys.drift = false;
        this.onDriftRelease();
      }

      if (k === 'KeyE' || k === 'Enter' || k === 'KeyF') {
        this.keys.item = false;
      }

      if (k === 'KeyC' || k === 'KeyQ') {
        this.lookBack = false;
        const rv = document.getElementById('rearview-container');
        if (rv) rv.classList.add('hidden');
      }
    }

    onDriftPress() {
      if (this.mode !== 'racing' || !this.playerRacer) return;
      const p = this.playerRacer;
      if (p.speed > 15) {
        p.isDrifting = true;
        p.driftDirection = this.keys.left ? -1 : (this.keys.right ? 1 : (p.steerAngle >= 0 ? 1 : -1));
        p.hopVelocity = 4.2;
        AudioEngine.playHop();
      }
    }

    onDriftRelease() {
      if (this.mode !== 'racing' || !this.playerRacer) return;
      const p = this.playerRacer;
      if (!p.isDrifting) return;

      // Unleash Mini-Turbo based on charged drift level!
      if (p.driftLevel >= 3) {
        // Level 3: 500Hz Ultra-Overclock
        p.boostTimer = 2.4;
        AudioEngine.playBoost(3);
        this.showCommentaryToast(p.charData, '500Hz ULTRA-OVERCLOCK BOOST UNLEASHED!');
      } else if (p.driftLevel >= 2) {
        // Level 2: 240Hz Super-Turbo
        p.boostTimer = 1.6;
        AudioEngine.playBoost(2);
      } else if (p.driftLevel >= 1) {
        // Level 1: 144Hz Mini-Turbo
        p.boostTimer = 0.9;
        AudioEngine.playBoost(1);
      }

      p.isDrifting = false;
      p.driftTimer = 0;
      p.driftLevel = 0;
    }

    // -----------------------------------------------------------------------
    // Race Flow & Countdown Sequence
    // -----------------------------------------------------------------------
    startRaceCountdown(laps = 3) {
      this.mode = 'countdown';
      this.raceLaps = laps;
      this.raceTime = 0;
      this.currentLapTime = 0;
      this.bestLapTime = Infinity;

      // Hide Lobby, show HUD
      const lobby = document.getElementById('lobby-screen');
      if (lobby) lobby.classList.add('hidden');

      const hud = document.getElementById('race-hud');
      if (hud) hud.classList.remove('hidden');

      const cdOverlay = document.getElementById('countdown-overlay');
      const cdText = document.getElementById('countdown-text');
      if (cdOverlay) cdOverlay.classList.remove('hidden');

      // Reset racers to starting positions
      this.initRacers();
      AudioEngine.startEngine();

      this.countdownTimer = 3.6; // 3 seconds count + GO
      AudioEngine.playCountdownBeep(3);
      if (cdText) cdText.textContent = '3';
    }

    startRace() {
      this.mode = 'racing';
      AudioEngine.startMusic();
      const cdOverlay = document.getElementById('countdown-overlay');
      if (cdOverlay) {
        setTimeout(() => cdOverlay.classList.add('hidden'), 900);
      }
      this.showCommentaryToast(this.playerRacer.charData, 'OVERCLOCK! Grand Prix has started!');
    }

    returnToLobby() {
      this.mode = 'lobby';
      AudioEngine.stopMusic();
      AudioEngine.stopEngine();

      const lobby = document.getElementById('lobby-screen');
      if (lobby) lobby.classList.remove('hidden');

      const hud = document.getElementById('race-hud');
      if (hud) hud.classList.add('hidden');

      const modal = document.getElementById('results-modal');
      if (modal) modal.classList.add('hidden');

      this.initRacers();
    }

    // -----------------------------------------------------------------------
    // Items, Projectiles & Commentary
    // -----------------------------------------------------------------------
    triggerItemRoulette(racer) {
      if (racer.isPlayer) {
        this.rouletteActive = true;
        this.rouletteTimer = 1.5;
        AudioEngine.playItemRouletteTick();
      } else {
        // AI item pick
        const items = ['green_shell', 'red_shell', 'banana', 'mushroom'];
        racer.activeItem = items[Math.floor(Math.random() * items.length)];
        racer.itemCount = 1;
      }
    }

    awardPlayerItem() {
      this.rouletteActive = false;
      const rank = this.getPlayerRank();
      let roll;

      // Position weighted probability
      if (rank === 1) {
        const pool = ['banana', 'banana', 'green_shell', 'mushroom'];
        roll = pool[Math.floor(Math.random() * pool.length)];
      } else if (rank <= 4) {
        const pool = ['green_shell', 'red_shell', 'mushroom', 'banana'];
        roll = pool[Math.floor(Math.random() * pool.length)];
      } else {
        const pool = ['red_shell', 'triple_mushroom', 'star', 'mushroom'];
        roll = pool[Math.floor(Math.random() * pool.length)];
      }

      this.playerRacer.activeItem = roll;
      this.playerRacer.itemCount = (roll === 'triple_mushroom' ? 3 : 1);
      AudioEngine.playItemLocked();

      // Update HUD
      const itemTitle = document.getElementById('item-name');
      if (itemTitle && ITEMS_DEF[roll]) {
        itemTitle.textContent = ITEMS_DEF[roll].name;
      }
      this.drawItemCanvas(roll);
    }

    drawItemCanvas(itemId) {
      if (!this.itemCanvas) return;
      const ctx = this.itemCanvas.getContext('2d');
      const w = this.itemCanvas.width;
      const h = this.itemCanvas.height;
      ctx.clearRect(0, 0, w, h);

      if (!itemId) return;

      const def = ITEMS_DEF[itemId] || { color: '#EF4444', name: 'Item' };

      // Background glowing circle
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 8, 0, Math.PI * 2);
      ctx.fill();

      // Center symbol / Carter stamp
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (itemId === 'mushroom' || itemId === 'triple_mushroom') ctx.fillText('🍄', w / 2, h / 2);
      else if (itemId === 'green_shell') ctx.fillText('🐢', w / 2, h / 2);
      else if (itemId === 'red_shell') ctx.fillText('🎯', w / 2, h / 2);
      else if (itemId === 'banana') ctx.fillText('🍌', w / 2, h / 2);
      else if (itemId === 'star') ctx.fillText('⭐', w / 2, h / 2);
    }

    usePlayerItem() {
      const p = this.playerRacer;
      if (!p || !p.activeItem || p.itemCount <= 0 || p.spinOutTimer > 0) return;

      const item = p.activeItem;

      if (item === 'mushroom' || item === 'triple_mushroom') {
        p.boostTimer = 2.5;
        AudioEngine.playBoost(2);
        p.itemCount--;
        if (p.itemCount <= 0) p.activeItem = null;
        this.showCommentaryToast(p.charData, 'Thermal Overclock boost engaged!');
      } else if (item === 'star') {
        p.starTimer = 7.0;
        AudioEngine.playBoost(3);
        p.activeItem = null;
        this.showCommentaryToast(p.charData, '240Hz RGB Star Power Activated!');
      } else if (item === 'green_shell') {
        this.spawnShell(p, false);
        p.activeItem = null;
      } else if (item === 'red_shell') {
        this.spawnShell(p, true);
        p.activeItem = null;
      } else if (item === 'banana') {
        this.spawnBanana(p);
        p.activeItem = null;
      }

      this.drawItemCanvas(p.activeItem);
      const itemTitle = document.getElementById('item-name');
      if (itemTitle && !p.activeItem) itemTitle.textContent = 'EMPTY';
    }

    spawnShell(sender, isHoming) {
      AudioEngine.playShellFire();
      const tan = this.trackCurve.getTangentAt(sender.t).normalize();
      const spawnPos = sender.mesh.position.clone().addScaledVector(tan, 6);

      const shellGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const shellMat = new THREE.MeshStandardMaterial({
        color: isHoming ? 0xEF4444 : 0x10B981,
        roughness: 0.2,
        metalness: 0.6
      });
      const mesh = new THREE.Mesh(shellGeo, shellMat);
      mesh.position.copy(spawnPos);
      this.scene.add(mesh);

      // Find target if red shell
      let target = null;
      if (isHoming) {
        // Target next racer ahead
        const rankList = [...this.racers].sort((a, b) => b.totalDistance - a.totalDistance);
        const myIdx = rankList.indexOf(sender);
        if (myIdx > 0) target = rankList[myIdx - 1];
      }

      this.projectiles.push({
        type: 'shell',
        isHoming: isHoming,
        target: target,
        sender: sender,
        mesh: mesh,
        t: sender.t,
        speed: sender.speed + 45,
        life: 7.0,
        bounces: 0
      });
    }

    spawnBanana(sender) {
      const tan = this.trackCurve.getTangentAt(sender.t).normalize();
      const spawnPos = sender.mesh.position.clone().addScaledVector(tan, -5);

      const bananaGeo = new THREE.ConeGeometry(0.8, 1.6, 8);
      const bananaMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.4 });
      const mesh = new THREE.Mesh(bananaGeo, bananaMat);
      mesh.position.copy(spawnPos);
      this.scene.add(mesh);

      this.projectiles.push({
        type: 'banana',
        sender: sender,
        mesh: mesh,
        t: sender.t,
        life: 25.0
      });
    }

    triggerSpinOut(racer, reason = 'hit') {
      if (racer.starTimer > 0) return; // Star power invulnerability
      racer.spinOutTimer = 1.3;
      racer.speed *= 0.2;
      racer.coins = Math.max(0, racer.coins - 3);
      AudioEngine.playSpinOut();

      const quote = COMMENTARY_QUOTES[Math.floor(Math.random() * COMMENTARY_QUOTES.length)];
      this.showCommentaryToast(racer.charData, `${racer.name}: ${quote}`);
    }

    showCommentaryToast(charData, text) {
      const toast = document.getElementById('commentary-toast');
      const toastText = document.getElementById('commentary-text');
      const toastAvatar = document.getElementById('commentary-avatar');
      if (!toast || !toastText) return;

      toastText.textContent = text;
      if (toastAvatar) this.renderAvatarToCanvas(toastAvatar, charData);

      toast.classList.remove('hidden');
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
      }, 3800);
    }

    // -----------------------------------------------------------------------
    // Main Physics & Update Loop
    // -----------------------------------------------------------------------
    animate() {
      requestAnimationFrame(this.animate);
      const delta = Math.min(this.clock.getDelta(), 0.05);

      if (this.mode === 'lobby') {
        this.updateLobby(delta);
      } else if (this.mode === 'countdown') {
        this.updateCountdown(delta);
      } else if (this.mode === 'racing') {
        this.updateRace(delta);
      } else if (this.mode === 'podium') {
        this.updatePodium(delta);
      }

      this.render();
    }

    updateLobby(delta) {
      this.lobbyOrbitAngle += delta * 0.45;
      if (this.playerRacer) {
        const p = this.playerRacer.mesh.position;
        const rad = 28;
        this.camera.position.set(
          p.x + Math.sin(this.lobbyOrbitAngle) * rad,
          p.y + 12,
          p.z + Math.cos(this.lobbyOrbitAngle) * rad
        );
        this.camera.lookAt(p.x, p.y + 2.5, p.z);
      }

      // Spin monolith cooling fans
      this.props.forEach(p => {
        if (p.fanGroup) p.fanGroup.rotation.x += delta * 6;
      });
    }

    updateCountdown(delta) {
      this.countdownTimer -= delta;
      const cdText = document.getElementById('countdown-text');

      if (this.countdownTimer > 2.0 && this.countdownTimer <= 3.0) {
        if (cdText && cdText.textContent !== '2') {
          cdText.textContent = '2';
          AudioEngine.playCountdownBeep(2);
        }
      } else if (this.countdownTimer > 1.0 && this.countdownTimer <= 2.0) {
        if (cdText && cdText.textContent !== '1') {
          cdText.textContent = '1';
          AudioEngine.playCountdownBeep(1);
        }
      } else if (this.countdownTimer <= 1.0 && this.countdownTimer > 0) {
        if (cdText && cdText.textContent !== 'OVERCLOCK!') {
          cdText.textContent = 'OVERCLOCK!';
          AudioEngine.playCountdownBeep(0);
        }
      } else if (this.countdownTimer <= 0) {
        this.startRace();
      }

      // Camera sweeps from front of Carter's face to chase position behind kart
      if (this.playerRacer) {
        const kart = this.playerRacer.mesh;
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(kart.quaternion);
        const progress = Math.max(0, Math.min(1, (3.6 - this.countdownTimer) / 3.0));

        // Start looking directly at Carter's face, swing smoothly behind
        const frontOffset = forward.clone().multiplyScalar(16).add(new THREE.Vector3(0, 5, 0));
        const rearOffset = forward.clone().multiplyScalar(-14).add(new THREE.Vector3(0, 6, 0));
        const camPos = new THREE.Vector3().lerpVectors(frontOffset, rearOffset, progress);

        this.camera.position.copy(kart.position).add(camPos);
        this.camera.lookAt(kart.position.x, kart.position.y + 2.5, kart.position.z);
      }
    }

    updateRace(delta) {
      this.raceTime += delta;
      this.currentLapTime += delta;

      // Update Player Physics
      this.updatePlayerPhysics(delta);

      // Update AI Racers
      this.updateAIPhysics(delta);

      // Update Projectiles & Collisions
      this.updateProjectiles(delta);

      // Update Item Boxes & Coins
      this.updatePickups(delta);

      // Update Standings & Leaderboard
      this.updateStandings();

      // Update Camera & HUD
      this.updateCamera(delta);
      this.updateHUD();
      this.renderMinimap();

      // Spin monolith fans
      this.props.forEach(p => {
        if (p.fanGroup) p.fanGroup.rotation.x += delta * 8;
      });
    }

    updatePlayerPhysics(delta) {
      const p = this.playerRacer;
      if (!p) return;

      // Hop physics
      if (p.hopVelocity > 0 || p.hopY > 0) {
        p.hopY += p.hopVelocity * delta;
        p.hopVelocity -= 22 * delta;
        if (p.hopY <= 0) {
          p.hopY = 0;
          p.hopVelocity = 0;
        }
      }

      // Spin-out state
      if (p.spinOutTimer > 0) {
        p.spinOutTimer -= delta;
        p.mesh.rotation.y += delta * 12;
        p.speed *= Math.max(0, 1.0 - delta * 3);
        return;
      }

      // Acceleration & Braking
      const coinBonus = 1.0 + (p.coins * 0.015); // +1.5% per coin up to +15%
      const topSpeed = p.maxSpeed * coinBonus * (p.boostTimer > 0 ? 1.4 : 1.0) * (p.starTimer > 0 ? 1.35 : 1.0);

      if (p.boostTimer > 0) p.boostTimer -= delta;
      if (p.starTimer > 0) p.starTimer -= delta;

      if (this.keys.forward) {
        p.speed = Math.min(topSpeed, p.speed + p.accel * delta);
      } else if (this.keys.backward) {
        p.speed = Math.max(-18, p.speed - p.accel * 1.5 * delta);
      } else {
        // Natural friction
        p.speed *= Math.max(0, 1.0 - delta * 1.2);
      }

      // Steering
      const steerFactor = p.handling * (p.speed / (p.maxSpeed || 1));
      let turnInput = 0;
      if (this.keys.left) turnInput -= 1;
      if (this.keys.right) turnInput += 1;

      // Drift Mechanics
      if (p.isDrifting) {
        p.driftTimer += delta;
        // Stage 1 (0.7s Blue), Stage 2 (1.6s Orange), Stage 3 (2.6s Purple/Pink)
        if (p.driftTimer > 2.6) {
          if (p.driftLevel < 3) { p.driftLevel = 3; AudioEngine.playDriftSpark(3); }
        } else if (p.driftTimer > 1.6) {
          if (p.driftLevel < 2) { p.driftLevel = 2; AudioEngine.playDriftSpark(2); }
        } else if (p.driftTimer > 0.7) {
          if (p.driftLevel < 1) { p.driftLevel = 1; AudioEngine.playDriftSpark(1); }
        }

        // Turning sharp into drift
        p.lateralOffset += (p.driftDirection * 18 + turnInput * 12) * delta;
      } else {
        p.lateralOffset += turnInput * 24 * steerFactor * delta;
      }

      // Off-road slowdown
      const roadLimit = 13.0; // roadWidth is 26, half is 13
      if (Math.abs(p.lateralOffset) > roadLimit) {
        if (p.boostTimer <= 0 && p.starTimer <= 0) {
          p.speed = Math.min(p.speed, topSpeed * 0.48); // Off-road slowdown
        }
      }

      // Wall bounce
      if (Math.abs(p.lateralOffset) > 16.5) {
        p.lateralOffset = Math.sign(p.lateralOffset) * 16.2;
        p.speed *= 0.75;
        AudioEngine.playSpinOut();
      }

      // Advance along track curve
      const deltaT = (p.speed * delta) / this.trackLength;
      const prevT = p.t;
      p.t = (p.t + deltaT) % 1.0;
      if (p.t < 0) p.t += 1.0;

      // Lap completion detection
      if (prevT > 0.85 && p.t < 0.15) {
        this.onPlayerCompleteLap();
      }

      p.totalDistance = (p.lap - 1) * this.trackLength + p.t * this.trackLength;

      // Position & Orient Kart
      this.updateRacerMeshTransform(p, turnInput);

      // Sound update
      AudioEngine.updateEngine(
        Math.abs(p.speed / p.maxSpeed),
        p.isDrifting,
        p.boostTimer > 0,
        p.driftLevel
      );
    }

    updateAIPhysics(delta) {
      const roadHalfWidth = 10.0;

      this.racers.forEach((r, idx) => {
        if (r.isPlayer) return;

        // Spin out recovery
        if (r.spinOutTimer > 0) {
          r.spinOutTimer -= delta;
          r.mesh.rotation.y += delta * 12;
          return;
        }

        // Rubber-banding catchup logic
        const playerDist = this.playerRacer ? this.playerRacer.totalDistance : 0;
        const gap = playerDist - r.totalDistance;
        let catchupMult = 1.0;
        if (gap > 40) catchupMult = 1.15; // Trailing AI catches up
        else if (gap < -60) catchupMult = 0.92; // Leading AI lets player stay in competition

        const topSpeed = r.maxSpeed * catchupMult;
        r.speed = Math.min(topSpeed, r.speed + r.accel * delta);

        // Smooth AI weaving & overtaking
        r.lateralOffset += Math.sin(this.raceTime * 1.5 + idx) * 3 * delta;
        r.lateralOffset = Math.max(-roadHalfWidth, Math.min(roadHalfWidth, r.lateralOffset));

        // Advance along spline
        const deltaT = (r.speed * delta) / this.trackLength;
        const prevT = r.t;
        r.t = (r.t + deltaT) % 1.0;
        if (prevT > 0.85 && r.t < 0.15) {
          r.lap++;
        }
        r.totalDistance = (r.lap - 1) * this.trackLength + r.t * this.trackLength;

        // Position & Orient Kart
        this.updateRacerMeshTransform(r, 0);

        // AI Random Item Usage
        if (r.activeItem && Math.random() < 0.005) {
          if (r.activeItem.includes('shell')) this.spawnShell(r, r.activeItem === 'red_shell');
          else if (r.activeItem === 'banana') this.spawnBanana(r);
          r.activeItem = null;
        }
      });
    }

    updateRacerMeshTransform(racer, steerInput) {
      const pt = this.trackCurve.getPointAt(racer.t);
      const tan = this.trackCurve.getTangentAt(racer.t).normalize();
      const bin = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();

      // World position
      racer.mesh.position.copy(pt)
        .addScaledVector(bin, racer.lateralOffset)
        .add(new THREE.Vector3(0, (racer.hopY || 0), 0));

      // Base orientation along spline
      racer.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);

      // Steer / Drift Tilt
      if (racer.isDrifting) {
        racer.mesh.rotateY(racer.driftDirection * 0.38);
        racer.mesh.rotateZ(-racer.driftDirection * 0.15);
      } else if (steerInput !== 0) {
        racer.mesh.rotateY(-steerInput * 0.12);
      }

      // Rotate wheels with speed
      if (racer.mesh.wheels) {
        const wheelRot = (racer.speed * 0.1);
        racer.mesh.wheels.forEach(w => w.rotation.x += wheelRot);
      }

      // Turn front wheels
      if (racer.mesh.frontWheels) {
        const turnAngle = (racer.isDrifting ? -racer.driftDirection * 0.4 : -steerInput * 0.35);
        racer.mesh.frontWheels.forEach(fw => fw.rotation.y = turnAngle);
      }
    }

    updatePickups(delta) {
      const p = this.playerRacer;
      if (!p) return;

      // Item Boxes
      this.itemBoxes.forEach(b => {
        if (!b.active) {
          b.respawnTimer -= delta;
          if (b.respawnTimer <= 0) {
            b.active = true;
            b.group.visible = true;
          }
        } else {
          // Animate rotation & bobbing
          b.group.rotation.y += delta * 2.5;
          b.core.rotation.x += delta * 3;
          b.group.position.y = b.basePos.y + Math.sin(this.raceTime * 4) * 0.4;

          // Check hit with all racers
          this.racers.forEach(r => {
            if (b.active && r.mesh.position.distanceTo(b.group.position) < 3.8) {
              b.active = false;
              b.group.visible = false;
              b.respawnTimer = 4.0;
              this.triggerItemRoulette(r);
            }
          });
        }
      });

      // Coins
      this.coins.forEach(c => {
        if (!c.active) {
          c.respawnTimer -= delta;
          if (c.respawnTimer <= 0) {
            c.active = true;
            c.mesh.visible = true;
          }
        } else {
          c.mesh.rotation.y += delta * 3.5;
          if (p.mesh.position.distanceTo(c.mesh.position) < 3.2) {
            c.active = false;
            c.mesh.visible = false;
            c.respawnTimer = 6.0;
            p.coins = Math.min(10, p.coins + 1);
            AudioEngine.playCoinPickup();
          }
        }
      });

      // Boost Pads
      this.boostPads.forEach(bp => {
        if (p.mesh.position.distanceTo(bp.pos) < 7.5) {
          if (p.boostTimer < 1.0) {
            p.boostTimer = 1.4;
            AudioEngine.playBoost(2);
            this.showCommentaryToast(p.charData, 'Boost Pad overclock engaged!');
          }
        }
      });
    }

    updateProjectiles(delta) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const proj = this.projectiles[i];
        proj.life -= delta;

        if (proj.life <= 0) {
          this.scene.remove(proj.mesh);
          this.projectiles.splice(i, 1);
          continue;
        }

        if (proj.type === 'shell') {
          // Advance along track
          const deltaT = (proj.speed * delta) / this.trackLength;
          proj.t = (proj.t + deltaT) % 1.0;
          const pt = this.trackCurve.getPointAt(proj.t);

          if (proj.isHoming && proj.target) {
            // Home in on target lateral offset
            proj.mesh.position.lerp(proj.target.mesh.position, delta * 6);
          } else {
            proj.mesh.position.copy(pt).add(new THREE.Vector3(0, 1.0, 0));
          }

          // Check hit against racers (excluding sender for first 0.5s)
          for (let r of this.racers) {
            if (proj.life > 6.5 && r === proj.sender) continue;
            if (proj.mesh.position.distanceTo(r.mesh.position) < 3.6) {
              this.triggerSpinOut(r, 'shell');
              this.scene.remove(proj.mesh);
              this.projectiles.splice(i, 1);
              break;
            }
          }
        } else if (proj.type === 'banana') {
          // Banana lies stationary on track
          for (let r of this.racers) {
            if (proj.life > 24.5 && r === proj.sender) continue;
            if (proj.mesh.position.distanceTo(r.mesh.position) < 3.0) {
              this.triggerSpinOut(r, 'banana');
              this.scene.remove(proj.mesh);
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      }
    }

    // -----------------------------------------------------------------------
    // Camera & Follow Logic
    // -----------------------------------------------------------------------
    updateCamera(delta) {
      const p = this.playerRacer;
      if (!p) return;

      const kart = p.mesh;
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(kart.quaternion);

      // Third-person chase or Look-Back
      const camDist = (this.lookBack ? 14 : -16);
      const camHeight = (this.lookBack ? 4.5 : 6.8);

      const targetCamPos = kart.position.clone()
        .addScaledVector(forward, camDist)
        .add(new THREE.Vector3(0, camHeight, 0));

      this.camera.position.lerp(targetCamPos, delta * 9);

      const lookTarget = kart.position.clone().add(new THREE.Vector3(0, 2.2, 0));
      this.camera.lookAt(lookTarget);

      // FOV kick on boost / star
      const targetFov = (p.boostTimer > 0 || p.starTimer > 0 ? 76 : 65);
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 6);
      this.camera.updateProjectionMatrix();

      // Render Rear-View Mirror Canvas
      if (this.rearviewCanvas && (!this.rearviewCanvas.parentElement.classList.contains('hidden') || this.lookBack)) {
        this.updateRearViewCamera();
      }
    }

    updateRearViewCamera() {
      if (!this.playerRacer || !this.rearviewCanvas) return;
      const kart = this.playerRacer.mesh;
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(kart.quaternion);

      this.rearCamera.position.copy(kart.position)
        .addScaledVector(forward, 2.5)
        .add(new THREE.Vector3(0, 3.2, 0));
      this.rearCamera.lookAt(kart.position.clone().addScaledVector(forward, -30));

      const ctx = this.rearviewCanvas.getContext('2d');
      // Render to main canvas then copy, or render sub-view
      this.renderer.setViewport(0, 0, 260, 110);
      this.renderer.render(this.scene, this.rearCamera);
      this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    }

    render() {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    // -----------------------------------------------------------------------
    // Laps, Standings & Minimap
    // -----------------------------------------------------------------------
    onPlayerCompleteLap() {
      const p = this.playerRacer;
      if (!p) return;

      if (this.currentLapTime < this.bestLapTime) {
        this.bestLapTime = this.currentLapTime;
      }
      this.currentLapTime = 0;

      if (p.lap >= this.raceLaps) {
        this.finishRace();
      } else {
        p.lap++;
        const isFinal = p.lap === this.raceLaps;
        AudioEngine.playLapFanfare(isFinal);
        this.showCommentaryToast(
          p.charData,
          isFinal ? 'FINAL LAP! Push the clock speeds to the absolute limit!' : `LAP ${p.lap} / ${this.raceLaps}`
        );
      }
    }

    finishRace() {
      this.mode = 'podium';
      AudioEngine.stopMusic();
      AudioEngine.playVictoryFanfare();

      const hud = document.getElementById('race-hud');
      if (hud) hud.classList.add('hidden');

      const modal = document.getElementById('results-modal');
      if (modal) modal.classList.remove('hidden');

      this.populateResultsModal();
    }

    updatePodium(delta) {
      this.lobbyOrbitAngle += delta * 0.6;
      if (this.playerRacer) {
        const p = this.playerRacer.mesh.position;
        this.camera.position.set(
          p.x + Math.sin(this.lobbyOrbitAngle) * 22,
          p.y + 8,
          p.z + Math.cos(this.lobbyOrbitAngle) * 22
        );
        this.camera.lookAt(p.x, p.y + 2, p.z);
      }
    }

    updateStandings() {
      // Sort racers descending by total distance
      const sorted = [...this.racers].sort((a, b) => b.totalDistance - a.totalDistance);
      const playerRank = sorted.indexOf(this.playerRacer) + 1;

      // Position badge
      const badge = document.getElementById('position-badge');
      if (badge) {
        const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th'];
        badge.textContent = `${playerRank}${suffixes[playerRank] || 'th'}`;
      }

      // Leaderboard tower items
      const boardList = document.getElementById('leaderboard-list');
      if (boardList && Math.floor(this.raceTime * 10) % 5 === 0) {
        boardList.innerHTML = sorted.map((r, i) => `
          <li class="leaderboard-item ${r.isPlayer ? 'active-player' : ''}">
            <span class="pos-num">${i + 1}</span>
            <span class="racer-tag" style="color: ${r.charData.color}">${r.name}</span>
          </li>
        `).join('');
      }
    }

    getPlayerRank() {
      const sorted = [...this.racers].sort((a, b) => b.totalDistance - a.totalDistance);
      return sorted.indexOf(this.playerRacer) + 1;
    }

    updateHUD() {
      const p = this.playerRacer;
      if (!p) return;

      // Lap Counter
      const lapEl = document.getElementById('lap-counter');
      if (lapEl) lapEl.textContent = `${p.lap} / ${this.raceLaps}`;

      // Timer
      const timerEl = document.getElementById('race-timer');
      if (timerEl) {
        const mins = Math.floor(this.raceTime / 60);
        const secs = (this.raceTime % 60).toFixed(2).padStart(5, '0');
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs}`;
      }

      // Coins
      const coinEl = document.getElementById('coin-count');
      if (coinEl) coinEl.textContent = `${p.coins} / 10`;

      // Speedometer & FPS/Clock
      const speedEl = document.getElementById('speed-value');
      if (speedEl) speedEl.textContent = Math.round(p.speed * 1.8);

      const fpsEl = document.getElementById('fps-value');
      if (fpsEl) {
        const hz = Math.round(144 + (p.speed / (p.maxSpeed || 1)) * 96);
        fpsEl.textContent = hz;
      }

      // Drift Meter
      const driftBadge = document.getElementById('drift-badge');
      const driftBar = document.getElementById('drift-bar-fill');
      if (driftBadge && driftBar) {
        if (p.isDrifting) {
          const pct = Math.min(100, Math.round((p.driftTimer / 2.6) * 100));
          driftBar.style.width = `${pct}%`;
          if (p.driftLevel === 3) {
            driftBadge.textContent = '500Hz ULTRA';
            driftBadge.className = 'drift-level-badge ultra';
          } else if (p.driftLevel === 2) {
            driftBadge.textContent = '240Hz SUPER';
            driftBadge.className = 'drift-level-badge super';
          } else if (p.driftLevel === 1) {
            driftBadge.textContent = '144Hz TURBO';
            driftBadge.className = 'drift-level-badge mini';
          } else {
            driftBadge.textContent = 'CHARGING';
            driftBadge.className = 'drift-level-badge charging';
          }
        } else {
          driftBar.style.width = '0%';
          driftBadge.textContent = 'READY';
          driftBadge.className = 'drift-level-badge none';
        }
      }

      // Item Roulette Animation
      if (this.rouletteActive) {
        this.rouletteTimer -= 0.05;
        const keys = Object.keys(ITEMS_DEF);
        const randKey = keys[Math.floor(Math.random() * keys.length)];
        this.drawItemCanvas(randKey);
        if (this.rouletteTimer <= 0) {
          this.awardPlayerItem();
        }
      }
    }

    renderMinimap() {
      if (!this.minimapCanvas || !this.trackCurve) return;
      const ctx = this.minimapCanvas.getContext('2d');
      const w = this.minimapCanvas.width;
      const h = this.minimapCanvas.height;
      ctx.clearRect(0, 0, w, h);

      // Track projection bounding box
      const pts = [];
      const samples = 100;
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (let i = 0; i < samples; i++) {
        const pt = this.trackCurve.getPointAt(i / samples);
        pts.push(pt);
        minX = Math.min(minX, pt.x);
        maxX = Math.max(maxX, pt.x);
        minZ = Math.min(minZ, pt.z);
        maxZ = Math.max(maxZ, pt.z);
      }

      const mapW = maxX - minX || 1;
      const mapH = maxZ - minZ || 1;
      const scale = Math.min((w - 36) / mapW, (h - 36) / mapH);
      const toMap = (x, z) => ({
        x: 18 + (x - minX) * scale,
        y: 18 + (z - minZ) * scale
      });

      // Draw circuit path
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach((p, i) => {
        const m = toMap(p.x, p.z);
        if (i === 0) ctx.moveTo(m.x, m.y);
        else ctx.lineTo(m.x, m.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Start/Finish Line Indicator
      const startP = toMap(pts[0].x, pts[0].z);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(startP.x, startP.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw all Racers
      this.racers.forEach(r => {
        const mp = toMap(r.mesh.position.x, r.mesh.position.z);
        if (r.isPlayer) {
          // Highlighted player with outer pulsing ring
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(mp.x, mp.y, 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(mp.x, mp.y, 5.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = r.charData.color || '#EF4444';
          ctx.beginPath();
          ctx.arc(mp.x, mp.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    populateResultsModal() {
      const tbody = document.getElementById('results-table-body');
      if (!tbody) return;

      const sorted = [...this.racers].sort((a, b) => b.totalDistance - a.totalDistance);
      const points = [15, 12, 10, 8, 6, 4, 2, 1];

      tbody.innerHTML = sorted.map((r, i) => {
        const rank = i + 1;
        const badgeClass = rank === 1 ? 'gold' : (rank === 2 ? 'silver' : (rank === 3 ? 'bronze' : ''));
        const totalSecs = (this.raceTime + (i * 1.8)).toFixed(2);
        const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const secs = (totalSecs % 60).toFixed(2).padStart(5, '0');
        const bestLap = (this.bestLapTime < 999 ? this.bestLapTime.toFixed(2) : '00:42.50');

        return `
          <tr>
            <td><span class="pos-badge ${badgeClass}">${rank}</span></td>
            <td class="racer-cell">
              <span class="dot-badge" style="background: ${r.charData.color}"></span>
              <strong>${r.name}</strong>
            </td>
            <td>${r.charData.title || r.charData.build}</td>
            <td class="mono">${bestLap}s</td>
            <td class="mono bold">${mins}:${secs}</td>
            <td class="bold">+${points[i] || 0} PTS</td>
          </tr>
        `;
      }).join('');
    }
  }

  // =========================================================================
  // 5. BOOTSTRAPPER & AUTO-START
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    window.MarioCarter = new MarioCarterGame();
  });

  // Expose global instance
  window.MarioCarterGame = MarioCarterGame;

})(window, document);
