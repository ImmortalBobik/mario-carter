/**
 * MARIO CARTER - Carter Assets System (carter-assets.js)
 * Manages CarterPCs character roster, 3D track spline waypoints, custom items,
 * and high-fidelity 2D/3D photo-composite canvas texture generation using assets/carter.jpg.
 */

(function (window) {
  'use strict';

  // =========================================================================
  // 1. PLAYABLE CARTER CHARACTERS (8 Roster Members)
  // =========================================================================
  const CHARACTERS_DATA = [
    {
      id: 'mario',
      name: 'Mario Carter',
      title: 'Balanced 144Hz Build',
      build: 'Balanced 144Hz Build',
      color: '#EF4444',
      themeColor: '#EF4444',
      accent: '#2563EB',
      accentColor: '#2563EB',
      hatType: 'cap',
      badge: 'M',
      stats: { speed: 82, accel: 85, handling: 84, drift: 85 },
      quote: "Did you check if your monitor is still on 60Hz?!",
      quotes: [
        "Did you check if your monitor is still on 60Hz?!",
        "Balanced 144Hz build with zero bottleneck!",
        "It's-a-me, Carter!",
        "No frame drops on my watch!"
      ]
    },
    {
      id: 'luigi',
      name: 'Luigi Carter',
      title: 'Eco-Mode Liquid Cooled',
      build: 'Eco-Mode Liquid Cooled',
      color: '#10B981',
      themeColor: '#10B981',
      accent: '#1E3A8A',
      accentColor: '#1E3A8A',
      hatType: 'cap',
      badge: 'L',
      stats: { speed: 80, accel: 90, handling: 92, drift: 84 },
      quote: "Never cheap out on the power supply, bro!",
      quotes: [
        "Never cheap out on the power supply, bro!",
        "Custom liquid cooling keeps my temps at 52°C!",
        "Quiet fans, loud victories!",
        "Eco-mode engaged, efficiency maxed!"
      ]
    },
    {
      id: 'peach',
      name: 'Princess Carter',
      title: 'All-White Aesthetic Rig',
      build: 'All-White Aesthetic Rig',
      color: '#EC4899',
      themeColor: '#EC4899',
      accent: '#F59E0B',
      accentColor: '#F59E0B',
      hatType: 'crown',
      badge: 'P',
      stats: { speed: 78, accel: 95, handling: 94, drift: 96 },
      quote: "White cables add at least +15 FPS of pure vibes.",
      quotes: [
        "White cables add at least +15 FPS of pure vibes.",
        "All-white aesthetic rig perfection!",
        "Clean cable management is not optional!",
        "RGB sync in full pastel harmony!"
      ]
    },
    {
      id: 'bowser',
      name: 'Bowser Carter',
      title: 'RTX 5090 Threadripper',
      build: 'RTX 5090 Threadripper',
      color: '#F59E0B',
      themeColor: '#F59E0B',
      accent: '#DC2626',
      accentColor: '#DC2626',
      hatType: 'horns',
      badge: 'B',
      stats: { speed: 98, accel: 68, handling: 65, drift: 75 },
      quote: "This kart pulls 1,600 Watts straight from the wall!",
      quotes: [
        "This kart pulls 1,600 Watts straight from the wall!",
        "RTX 5090 Threadripper heavy torque!",
        "Get out of my thermal exhaust zone!",
        "Tripping circuit breakers on every lap!"
      ]
    },
    {
      id: 'toad',
      name: 'Toad Carter',
      title: 'ITX Mini-PC Pocket Rocket',
      build: 'ITX Mini-PC Pocket Rocket',
      color: '#3B82F6',
      themeColor: '#3B82F6',
      accent: '#EF4444',
      accentColor: '#EF4444',
      hatType: 'mushroom',
      badge: 'T',
      stats: { speed: 74, accel: 99, handling: 98, drift: 92 },
      quote: "Small form factor, zero thermal throttling!",
      quotes: [
        "Small form factor, zero thermal throttling!",
        "Instant boost off the line, zero input lag!",
        "I fit where full-tower karts fear to tread!",
        "Mesh panel airflow delivers the win!"
      ]
    },
    {
      id: 'yoshi',
      name: 'Yoshi Carter',
      title: 'Custom Loop Overclocker',
      build: 'Custom Loop Overclocker',
      color: '#22C55E',
      themeColor: '#22C55E',
      accent: '#F97316',
      accentColor: '#F97316',
      hatType: 'dino',
      badge: 'Y',
      stats: { speed: 84, accel: 92, handling: 95, drift: 90 },
      quote: "Added an extra pea of thermal paste for grip!",
      quotes: [
        "Added an extra pea of thermal paste for grip!",
        "Overclocked to 6.2GHz all-core!",
        "Full copper heat pipes on every turn!",
        "Green coolant flowing through the apex!"
      ]
    },
    {
      id: 'wario',
      name: 'Wario Carter',
      title: 'Dual-GPU Bottleneck King',
      build: 'Dual-GPU Bottleneck King',
      color: '#EAB308',
      themeColor: '#EAB308',
      accent: '#9333EA',
      accentColor: '#9333EA',
      hatType: 'cap',
      badge: 'W',
      stats: { speed: 94, accel: 74, handling: 72, drift: 80 },
      quote: "Who needs cable management when you have raw torque?!",
      quotes: [
        "Who needs cable management when you have raw torque?!",
        "SLI bridge running red hot!",
        "Spaghetti cables generate extra horsepower!",
        "Out of my way, budget builders!"
      ]
    },
    {
      id: 'rosalina',
      name: 'Rosalina Carter',
      title: 'Zero-G Tempered Glass',
      build: 'Zero-G Tempered Glass',
      color: '#06B6D4',
      themeColor: '#06B6D4',
      accent: '#E2E8F0',
      accentColor: '#E2E8F0',
      hatType: 'crown',
      badge: 'R',
      stats: { speed: 88, accel: 86, handling: 88, drift: 95 },
      quote: "Peeling the plastic off the side panel mid-drift!",
      quotes: [
        "Peeling the plastic off the side panel mid-drift!",
        "Tempered glass with anti-reflective coating!",
        "Zero-G drift mechanics engaged!",
        "Starlight RGB halo shining bright!"
      ]
    }
  ];

  // Expose both array and map access on CHARACTERS
  const CHARACTERS = [...CHARACTERS_DATA];
  CHARACTERS_DATA.forEach(c => {
    CHARACTERS[c.id] = c;
  });
  // Backward compatibility alias for peach / princess
  CHARACTERS['princess'] = CHARACTERS.peach;

  // =========================================================================
  // 2. TRACK DEFINITIONS (3 Rich 3D Tracks with Smooth Spline Waypoints)
  // =========================================================================
  const TRACKS_DATA = {
    silicon: {
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
      fogFar: 480,
      // 24 smooth closed-loop 3D waypoints spanning x: -195..215, z: -185..200, y: 0..18
      waypoints: [
        [-60, 0, -170],
        [0, 1, -185],
        [65, 3, -185],
        [125, 6, -165],
        [175, 9, -125],
        [210, 13, -65],
        [215, 16, 5],
        [190, 18, 75],
        [145, 15, 135],
        [85, 10, 180],
        [15, 6, 200],
        [-55, 3, 190],
        [-115, 5, 155],
        [-165, 9, 105],
        [-195, 13, 40],
        [-180, 16, -20],
        [-130, 12, -45],
        [-80, 8, -25],
        [-65, 5, 30],
        [-105, 3, 85],
        [-160, 1, 40],
        [-185, 0, -40],
        [-170, 0, -110],
        [-120, 0, -155]
      ]
    },
    rainbow: {
      id: 'rainbow',
      name: 'RGB Rainbow Overclock',
      subtitle: '240Hz Skyway in the Clouds • 3 Laps',
      difficulty: 'Hard',
      themeColor: '#8B5CF6',
      skyTop: '#EDE9FE',
      skyBottom: '#FDF4FF',
      groundColor: '#F5F3FF',
      roadColor: '#1E293B',
      curbColorA: '#06B6D4',
      curbColorB: '#EC4899',
      fogColor: '#EDE9FE',
      fogNear: 180,
      fogFar: 520,
      // 22 smooth closed-loop waypoints with elevated figure-8 overpass (y: 2..28)
      waypoints: [
        [0, 24, 0],         // Overpass bridge high in the sky!
        [50, 22, -45],
        [95, 18, -90],
        [130, 14, -145],
        [120, 10, -195],
        [65, 6, -215],
        [0, 4, -205],
        [-65, 3, -195],
        [-120, 2, -150],
        [-115, 2, -90],
        [-70, 4, -45],
        [0, 2, 0],          // Underpass crossing below at ground level!
        [70, 7, 45],
        [125, 12, 95],
        [140, 17, 155],
        [95, 22, 205],
        [25, 26, 215],
        [-45, 28, 195],     // High banked apex
        [-110, 26, 150],
        [-135, 22, 95],
        [-100, 24, 45],
        [-50, 25, 15]
      ]
    },
    desert: {
      id: 'desert',
      name: 'Thermal Paste Dunes',
      subtitle: 'Heatsink Canyon & Cooling Fans • 3 Laps',
      difficulty: 'Medium',
      themeColor: '#F59E0B',
      skyTop: '#FEF3C7',
      skyBottom: '#FFFBEB',
      groundColor: '#FEF3C7',
      roadColor: '#475569',
      curbColorA: '#F59E0B',
      curbColorB: '#FFFFFF',
      fogColor: '#FEF3C7',
      fogNear: 150,
      fogFar: 460,
      // 23 smooth closed-loop waypoints with heatsink canyon & dune crests
      waypoints: [
        [-120, 0, -180],
        [-40, 3, -195],
        [40, 7, -190],
        [120, 4, -165],
        [180, 2, -120],
        [195, 6, -50],
        [165, 12, 10],     // Dune crest
        [110, 8, 40],
        [60, 4, 20],       // Hairpin entry
        [45, 2, -40],      // Technical hairpin inside canyon
        [85, 5, -80],
        [140, 9, -50],
        [175, 14, 20],     // High dune crest 2
        [180, 10, 95],
        [145, 6, 160],
        [85, 3, 195],
        [0, 5, 210],
        [-80, 8, 190],
        [-150, 12, 145],   // Canyon wall ascent
        [-190, 8, 80],
        [-200, 4, 0],
        [-175, 2, -75],
        [-155, 0, -135]
      ]
    }
  };

  const TRACKS = [
    TRACKS_DATA.silicon,
    TRACKS_DATA.rainbow,
    TRACKS_DATA.desert
  ];
  Object.assign(TRACKS, TRACKS_DATA);

  // =========================================================================
  // 3. CARTERPCS ITEMS (6 Custom Items)
  // =========================================================================
  const ITEMS_DATA = {
    mushroom: {
      id: 'mushroom',
      name: 'Overclock Boost (x1)',
      description: 'Instant +45% speed burst & cyan flame exhaust',
      type: 'boost',
      duration: 1.8,
      speedMultiplier: 1.45,
      color: '#EF4444'
    },
    triple_mushroom: {
      id: 'triple_mushroom',
      name: 'Triple Overclock (x3)',
      description: '3x turbo boosts',
      type: 'boost',
      uses: 3,
      duration: 1.8,
      speedMultiplier: 1.45,
      color: '#F97316'
    },
    green_shell: {
      id: 'green_shell',
      name: 'Green GPU Shell',
      description: 'Straight projectile that bounces & spins out karts',
      type: 'projectile',
      speed: 70,
      bounces: 4,
      color: '#10B981'
    },
    red_shell: {
      id: 'red_shell',
      name: 'Red Homing Carter Shell',
      description: 'Locks onto the next racer ahead on the spline',
      type: 'homing',
      speed: 65,
      color: '#EF4444'
    },
    banana: {
      id: 'banana',
      name: 'Thermal Paste Blob',
      description: 'Dropped trap that makes karts spin out',
      type: 'trap',
      color: '#94A3B8'
    },
    star: {
      id: 'star',
      name: '240Hz RGB Star Mode',
      description: '7s invincibility, rainbow glow, +35% speed, knocks rivals!',
      type: 'special',
      duration: 7.0,
      speedMultiplier: 1.35,
      color: '#F59E0B'
    }
  };

  const ITEMS = [
    ITEMS_DATA.mushroom,
    ITEMS_DATA.triple_mushroom,
    ITEMS_DATA.green_shell,
    ITEMS_DATA.red_shell,
    ITEMS_DATA.banana,
    ITEMS_DATA.star
  ];
  Object.assign(ITEMS, ITEMS_DATA);

  // =========================================================================
  // 4. CARTER ASSETS MANAGER CLASS
  // =========================================================================
  class CarterAssetsManager {
    constructor() {
      this.CHARACTERS = CHARACTERS;
      this.TRACKS = TRACKS;
      this.ITEMS = ITEMS;

      this.image = null;
      this.isLoaded = false;
      this.loadPromise = null;

      // Texture & Canvas Caches
      this.threeTextures = {};
      this.portraitCache = {};
    }

    // -----------------------------------------------------------------------
    // Image Loader with Fallback Guarantee
    // -----------------------------------------------------------------------
    loadCarterImage() {
      if (this.loadPromise) return this.loadPromise;

      this.loadPromise = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.image = img;
          this.isLoaded = true;
          this.portraitCache = {}; // invalidate cache so high-res photo renders
          resolve(img);
        };
        img.onerror = () => {
          console.warn('[CarterAssets] assets/carter.jpg failed to load, using procedural fallback.');
          this.isLoaded = false;
          resolve(null);
        };
        img.src = 'assets/carter.jpg';
      });

      return this.loadPromise;
    }

    // Backward compatibility helper
    init() {
      return this.loadCarterImage();
    }

    // -----------------------------------------------------------------------
    // High-Craft Stylized Vector Fallback Portrait of Carter
    // -----------------------------------------------------------------------
    drawCarterFallbackFace(ctx, cx, cy, radius) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Warm skin tone
      ctx.fillStyle = '#FED7AA';
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Dark brown hair
      ctx.fillStyle = '#261B14';
      ctx.beginPath();
      ctx.ellipse(cx, cy - radius * 0.45, radius * 0.9, radius * 0.65, 0, Math.PI, 0);
      ctx.fill();

      // Hair strands / tufts
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.8, cy - radius * 0.4);
      ctx.quadraticCurveTo(cx - radius * 0.4, cy - radius * 0.7, cx, cy - radius * 0.45);
      ctx.quadraticCurveTo(cx + radius * 0.4, cy - radius * 0.7, cx + radius * 0.8, cy - radius * 0.4);
      ctx.lineTo(cx + radius * 0.9, cy - radius * 0.2);
      ctx.lineTo(cx - radius * 0.9, cy - radius * 0.2);
      ctx.closePath();
      ctx.fill();

      // Eyes (friendly brown eyes)
      const eyeY = cy - radius * 0.05;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(cx - radius * 0.32, eyeY, radius * 0.16, radius * 0.12, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + radius * 0.32, eyeY, radius * 0.16, radius * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Irises
      ctx.fillStyle = '#3E2723';
      ctx.beginPath();
      ctx.arc(cx - radius * 0.3, eyeY, radius * 0.08, 0, Math.PI * 2);
      ctx.arc(cx + radius * 0.3, eyeY, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#261B14';
      ctx.lineWidth = radius * 0.07;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.48, eyeY - radius * 0.18);
      ctx.quadraticCurveTo(cx - radius * 0.32, eyeY - radius * 0.26, cx - radius * 0.16, eyeY - radius * 0.18);
      ctx.moveTo(cx + radius * 0.16, eyeY - radius * 0.18);
      ctx.quadraticCurveTo(cx + radius * 0.32, eyeY - radius * 0.26, cx + radius * 0.48, eyeY - radius * 0.18);
      ctx.stroke();

      // Nose
      ctx.strokeStyle = '#FDBA74';
      ctx.lineWidth = radius * 0.06;
      ctx.beginPath();
      ctx.moveTo(cx, eyeY + radius * 0.05);
      ctx.lineTo(cx + radius * 0.06, eyeY + radius * 0.22);
      ctx.lineTo(cx - radius * 0.06, eyeY + radius * 0.24);
      ctx.stroke();

      // Big Carter Smile
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = radius * 0.04;
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.35, cy + radius * 0.36);
      ctx.quadraticCurveTo(cx, cy + radius * 0.68, cx + radius * 0.35, cy + radius * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // Base Face Draw (cropped from assets/carter.jpg: 339x589)
    // -----------------------------------------------------------------------
    drawCarterBaseFace(ctx, cx, cy, radius) {
      if (!this.isLoaded || !this.image || !this.image.complete) {
        this.drawCarterFallbackFace(ctx, cx, cy, radius);
        return;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Carter's face crop in assets/carter.jpg (339x589)
      // Centered on his eyes, smile, and facial structure
      const sx = 20;
      const sy = 75;
      const sw = 295;
      const sh = 360;

      const dw = radius * 2.12;
      const dh = radius * 2.58;
      const dx = cx - dw / 2;
      const dy = cy - dh * 0.43;

      ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // Costumes & Hats: Cap, Crown, Horns, Mushroom, Dino Hood, Mustache
    // -----------------------------------------------------------------------
    drawCostume(ctx, charId, cx, cy, radius) {
      ctx.save();

      switch (charId) {
        case 'mario':
        case 'luigi': {
          const isMario = charId === 'mario';
          const capColor = isMario ? '#EF4444' : '#10B981';
          const capDark = isMario ? '#B91C1C' : '#047857';
          const letter = isMario ? 'M' : 'L';

          // Cap bill / visor shadow
          ctx.fillStyle = capDark;
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.52, radius * 0.76, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cap puffy crown
          ctx.fillStyle = capColor;
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.74, radius * 0.82, radius * 0.46, 0, Math.PI, 0);
          ctx.fill();

          // White circular emblem
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy - radius * 0.76, radius * 0.26, 0, Math.PI * 2);
          ctx.fill();

          // Badge letter
          ctx.fillStyle = capColor;
          ctx.font = `900 ${radius * 0.34}px "Outfit", "Plus Jakarta Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(letter, cx, cy - radius * 0.75);
          break;
        }

        case 'peach':
        case 'princess': {
          // Princess Carter Gold Crown
          const crownY = cy - radius * 0.65;
          ctx.fillStyle = '#F59E0B'; // Gold
          ctx.beginPath();
          ctx.moveTo(cx - radius * 0.6, crownY + radius * 0.1);
          ctx.lineTo(cx - radius * 0.72, crownY - radius * 0.42); // left peak
          ctx.lineTo(cx - radius * 0.35, crownY - radius * 0.15); // dip
          ctx.lineTo(cx, crownY - radius * 0.58);                 // center peak
          ctx.lineTo(cx + radius * 0.35, crownY - radius * 0.15); // dip
          ctx.lineTo(cx + radius * 0.72, crownY - radius * 0.42); // right peak
          ctx.lineTo(cx + radius * 0.6, crownY + radius * 0.1);
          ctx.closePath();
          ctx.fill();

          // Crown base band
          ctx.fillStyle = '#D97706';
          ctx.beginPath();
          ctx.ellipse(cx, crownY + radius * 0.1, radius * 0.6, radius * 0.08, 0, 0, Math.PI * 2);
          ctx.fill();

          // Center jewel (Ruby pink)
          ctx.fillStyle = '#EC4899';
          ctx.beginPath();
          ctx.ellipse(cx, crownY - radius * 0.18, radius * 0.14, radius * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();

          // Side jewels (Cyan)
          ctx.fillStyle = '#06B6D4';
          ctx.beginPath();
          ctx.arc(cx - radius * 0.42, crownY - radius * 0.1, radius * 0.09, 0, Math.PI * 2);
          ctx.arc(cx + radius * 0.42, crownY - radius * 0.1, radius * 0.09, 0, Math.PI * 2);
          ctx.fill();

          // Royal gold pearl earrings
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(cx - radius * 0.9, cy + radius * 0.15, radius * 0.15, 0, Math.PI * 2);
          ctx.arc(cx + radius * 0.9, cy + radius * 0.15, radius * 0.15, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'bowser': {
          // Curved beast horns on both sides
          const hornColor = '#F59E0B';
          // Left Horn
          ctx.fillStyle = hornColor;
          ctx.beginPath();
          ctx.moveTo(cx - radius * 0.52, cy - radius * 0.38);
          ctx.quadraticCurveTo(cx - radius * 1.15, cy - radius * 0.7, cx - radius * 0.88, cy - radius * 1.08);
          ctx.quadraticCurveTo(cx - radius * 0.65, cy - radius * 0.65, cx - radius * 0.32, cy - radius * 0.52);
          ctx.closePath();
          ctx.fill();

          // Right Horn
          ctx.beginPath();
          ctx.moveTo(cx + radius * 0.52, cy - radius * 0.38);
          ctx.quadraticCurveTo(cx + radius * 1.15, cy - radius * 0.7, cx + radius * 0.88, cy - radius * 1.08);
          ctx.quadraticCurveTo(cx + radius * 0.65, cy - radius * 0.65, cx + radius * 0.32, cy - radius * 0.52);
          ctx.closePath();
          ctx.fill();

          // Spiked metal choker collar at chin
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.ellipse(cx, cy + radius * 0.8, radius * 0.68, radius * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();

          // Silver spikes
          ctx.fillStyle = '#E2E8F0';
          for (let i = -2; i <= 2; i++) {
            const sx = cx + (i * radius * 0.22);
            const sy = cy + radius * 0.84;
            ctx.beginPath();
            ctx.moveTo(sx - radius * 0.06, sy);
            ctx.lineTo(sx + radius * 0.06, sy);
            ctx.lineTo(sx, sy + radius * 0.18);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }

        case 'toad': {
          // Giant mushroom cap (white with blue/red dots)
          const mushroomY = cy - radius * 0.62;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(cx, mushroomY, radius * 0.88, radius * 0.56, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 3;
          ctx.stroke();

          // 3 Bold Red/Blue Polka Dots
          ctx.fillStyle = '#EF4444';
          // Center dot
          ctx.beginPath();
          ctx.ellipse(cx, mushroomY - radius * 0.1, radius * 0.26, radius * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
          // Left dot
          ctx.beginPath();
          ctx.ellipse(cx - radius * 0.55, mushroomY + radius * 0.05, radius * 0.2, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          // Right dot
          ctx.beginPath();
          ctx.ellipse(cx + radius * 0.55, mushroomY + radius * 0.05, radius * 0.2, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'yoshi': {
          // Vibrant green dinosaur hood
          ctx.fillStyle = '#22C55E';
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.66, radius * 0.85, radius * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Orange spines on top
          ctx.fillStyle = '#F97316';
          for (let i = -1; i <= 1; i++) {
            const px = cx + i * radius * 0.3;
            const py = cy - radius * 1.08;
            ctx.beginPath();
            ctx.arc(px, py + radius * 0.16, radius * 0.13, 0, Math.PI * 2);
            ctx.fill();
          }

          // Green hood side flaps framing Carter's cheeks
          ctx.fillStyle = '#16A34A';
          ctx.beginPath();
          ctx.ellipse(cx - radius * 0.82, cy - radius * 0.1, radius * 0.18, radius * 0.45, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + radius * 0.82, cy - radius * 0.1, radius * 0.18, radius * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'wario': {
          // Yellow Wario Cap
          ctx.fillStyle = '#CA8A04'; // dark visor
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.52, radius * 0.76, radius * 0.24, 0, 0, Math.PI * 2);
          ctx.fill();

          // Yellow dome
          ctx.fillStyle = '#EAB308';
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.74, radius * 0.82, radius * 0.46, 0, Math.PI, 0);
          ctx.fill();

          // White circle
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy - radius * 0.76, radius * 0.26, 0, Math.PI * 2);
          ctx.fill();

          // Purple 'W'
          ctx.fillStyle = '#9333EA';
          ctx.font = `900 ${radius * 0.34}px "Outfit", "Plus Jakarta Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('W', cx, cy - radius * 0.75);

          // Iconic Wario jagged zigzag mustache below Carter's nose!
          const mY = cy + radius * 0.22;
          ctx.fillStyle = '#1E1B4B';
          ctx.beginPath();
          ctx.moveTo(cx, mY);
          // Right zigzag
          ctx.lineTo(cx + radius * 0.2, mY - radius * 0.08);
          ctx.lineTo(cx + radius * 0.35, mY + radius * 0.04);
          ctx.lineTo(cx + radius * 0.6, mY - radius * 0.12);
          ctx.lineTo(cx + radius * 0.76, mY - radius * 0.02);
          ctx.lineTo(cx + radius * 0.66, mY + radius * 0.12);
          ctx.lineTo(cx + radius * 0.35, mY + radius * 0.18);
          ctx.lineTo(cx, mY + radius * 0.08);
          // Left zigzag
          ctx.lineTo(cx - radius * 0.35, mY + radius * 0.18);
          ctx.lineTo(cx - radius * 0.66, mY + radius * 0.12);
          ctx.lineTo(cx - radius * 0.76, mY - radius * 0.02);
          ctx.lineTo(cx - radius * 0.6, mY - radius * 0.12);
          ctx.lineTo(cx - radius * 0.35, mY + radius * 0.04);
          ctx.lineTo(cx - radius * 0.2, mY - radius * 0.08);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'rosalina': {
          // Platinum Silver Star Tiara with cyan star jewel
          const crownY = cy - radius * 0.65;
          ctx.fillStyle = '#E2E8F0'; // Platinum silver
          ctx.beginPath();
          ctx.moveTo(cx - radius * 0.62, crownY + radius * 0.05);
          ctx.lineTo(cx - radius * 0.72, crownY - radius * 0.4);
          ctx.lineTo(cx - radius * 0.35, crownY - radius * 0.15);
          ctx.lineTo(cx, crownY - radius * 0.54);
          ctx.lineTo(cx + radius * 0.35, crownY - radius * 0.15);
          ctx.lineTo(cx + radius * 0.72, crownY - radius * 0.4);
          ctx.lineTo(cx + radius * 0.62, crownY + radius * 0.05);
          ctx.closePath();
          ctx.fill();

          // Glowing Cyan Star jewel in center
          ctx.fillStyle = '#06B6D4';
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 12;
          this.drawStarShape(ctx, cx, crownY - radius * 0.22, 5, radius * 0.19, radius * 0.08);
          ctx.shadowBlur = 0;
          break;
        }
      }

      ctx.restore();
    }

    // Star helper
    drawStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    }

    // -----------------------------------------------------------------------
    // Core Method: renderCharacterPortrait(canvasOrSize, character, options)
    // -----------------------------------------------------------------------
    renderCharacterPortrait(canvasOrSize, character, options = {}) {
      const charObj = typeof character === 'string'
        ? (CHARACTERS[character] || CHARACTERS.mario)
        : (character || CHARACTERS.mario);

      const size = typeof canvasOrSize === 'number'
        ? canvasOrSize
        : (canvasOrSize && canvasOrSize.width ? canvasOrSize.width : 256);

      let canvas = (canvasOrSize && typeof canvasOrSize === 'object' && canvasOrSize.getContext)
        ? canvasOrSize
        : document.createElement('canvas');

      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2 + size * 0.035;
      const radius = size * 0.38;

      // 1. Subtle Color Aura Glow & Ring
      if (options.showAura !== false) {
        ctx.save();
        ctx.shadowColor = charObj.color || charObj.themeColor;
        ctx.shadowBlur = size * 0.08;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, radius + size * 0.045, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // High contrast colored rim ring
        ctx.strokeStyle = charObj.color || charObj.themeColor;
        ctx.lineWidth = Math.max(3, size * 0.03);
        ctx.beginPath();
        ctx.arc(cx, cy, radius + size * 0.035, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Carter's Face (assets/carter.jpg with fallback)
      this.drawCarterBaseFace(ctx, cx, cy, radius);

      // 3. High-Craft Minimalist Costume
      this.drawCostume(ctx, charObj.id, cx, cy, radius);

      // 4. Character Badge Tag (M, L, P, B, T, Y, W, R)
      if (options.showBadge !== false && charObj.badge) {
        const badgeRadius = radius * 0.26;
        const badgeX = cx + radius * 0.65;
        const badgeY = cy + radius * 0.65;

        // Badge shadow & circle
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = charObj.color || charObj.themeColor;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(2, badgeRadius * 0.18);
        ctx.stroke();
        ctx.restore();

        // Badge Letter
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `900 ${badgeRadius * 1.25}px "Outfit", "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(charObj.badge, badgeX, badgeY + 1);
      }

      return canvas;
    }

    // -----------------------------------------------------------------------
    // Core Method: createThreeHeadTexture(character)
    // -----------------------------------------------------------------------
    createThreeHeadTexture(character) {
      const charObj = typeof character === 'string'
        ? (CHARACTERS[character] || CHARACTERS.mario)
        : (character || CHARACTERS.mario);

      const cacheKey = charObj.id;
      if (this.threeTextures[cacheKey]) {
        return this.threeTextures[cacheKey];
      }

      const canvas = this.renderCharacterPortrait(512, charObj, { showAura: true, showBadge: true });

      if (window.THREE) {
        const texture = new window.THREE.CanvasTexture(canvas);
        texture.minFilter = window.THREE.LinearFilter;
        texture.magFilter = window.THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        this.threeTextures[cacheKey] = texture;
        return texture;
      }

      // If THREE is not yet loaded, return a dummy texture object or canvas
      return canvas;
    }

    // -----------------------------------------------------------------------
    // Core Method: drawItemIcon(canvas, itemId)
    // -----------------------------------------------------------------------
    drawItemIcon(canvas, itemId) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.42;

      ctx.save();

      switch (itemId) {
        case 'mushroom': {
          // Overclock Mushroom (Red cap with cyan flame)
          // Cap
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.ellipse(cx, cy - r * 0.15, r * 0.85, r * 0.6, 0, Math.PI, 0);
          ctx.fill();

          // Cap base
          ctx.fillStyle = '#B91C1C';
          ctx.beginPath();
          ctx.ellipse(cx, cy - r * 0.15, r * 0.85, r * 0.18, 0, 0, Math.PI);
          ctx.fill();

          // Stem
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.roundRect(cx - r * 0.4, cy - r * 0.15, r * 0.8, r * 0.8, [0, 0, 16, 16]);
          ctx.fill();

          // 2 cute eyes on stem
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.18, cy + r * 0.2, r * 0.08, r * 0.18, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + r * 0.18, cy + r * 0.2, r * 0.08, r * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();

          // White spots on mushroom cap
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(cx, cy - r * 0.45, r * 0.28, r * 0.2, 0, 0, Math.PI * 2);
          ctx.ellipse(cx - r * 0.52, cy - r * 0.22, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + r * 0.52, cy - r * 0.22, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cyan overclock lightning badge
          ctx.fillStyle = '#06B6D4';
          ctx.beginPath();
          ctx.moveTo(cx + r * 0.05, cy - r * 0.55);
          ctx.lineTo(cx - r * 0.15, cy - r * 0.35);
          ctx.lineTo(cx, cy - r * 0.35);
          ctx.lineTo(cx - r * 0.08, cy - r * 0.15);
          ctx.lineTo(cx + r * 0.15, cy - r * 0.38);
          ctx.lineTo(cx, cy - r * 0.38);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'triple_mushroom': {
          // 3 Mini Overclock Mushrooms
          const drawMiniMushroom = (mx, my, scale) => {
            const mr = r * scale;
            ctx.fillStyle = '#F97316';
            ctx.beginPath();
            ctx.ellipse(mx, my - mr * 0.15, mr * 0.85, mr * 0.6, 0, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(mx - mr * 0.38, my - mr * 0.15, mr * 0.76, mr * 0.7, [0, 0, 10, 10]);
            ctx.fill();
            ctx.fillStyle = '#1E293B';
            ctx.beginPath();
            ctx.arc(mx - mr * 0.15, my + mr * 0.18, mr * 0.08, 0, Math.PI * 2);
            ctx.arc(mx + mr * 0.15, my + mr * 0.18, mr * 0.08, 0, Math.PI * 2);
            ctx.fill();
          };

          drawMiniMushroom(cx - r * 0.42, cy + r * 0.2, 0.55);
          drawMiniMushroom(cx + r * 0.42, cy + r * 0.2, 0.55);
          drawMiniMushroom(cx, cy - r * 0.28, 0.65);

          // x3 badge
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(cx + r * 0.55, cy + r * 0.55, r * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `900 ${r * 0.35}px "Outfit", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('3x', cx + r * 0.55, cy + r * 0.56);
          break;
        }

        case 'green_shell': {
          // Green GPU Shell with heatsink fins
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.ellipse(cx, cy, r * 0.85, r * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();

          // White rim
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = r * 0.14;
          ctx.stroke();

          // Heatsink fins across shell
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = r * 0.06;
          for (let i = -2; i <= 2; i++) {
            const lineX = cx + i * (r * 0.22);
            ctx.beginPath();
            ctx.moveTo(lineX, cy - r * 0.55);
            ctx.lineTo(lineX, cy + r * 0.55);
            ctx.stroke();
          }

          // Gold PCIe pins badge in center
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.roundRect(cx - r * 0.3, cy - r * 0.18, r * 0.6, r * 0.36, 6);
          ctx.fill();
          ctx.fillStyle = '#1E293B';
          ctx.font = `900 ${r * 0.22}px "Outfit", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('RTX', cx, cy);
          break;
        }

        case 'red_shell': {
          // Red Homing Shell with laser reticle
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.ellipse(cx, cy, r * 0.85, r * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = r * 0.14;
          ctx.stroke();

          // Targeting crosshairs
          ctx.strokeStyle = '#FEE2E2';
          ctx.lineWidth = r * 0.06;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
          ctx.moveTo(cx - r * 0.65, cy);
          ctx.lineTo(cx + r * 0.65, cy);
          ctx.moveTo(cx, cy - r * 0.65);
          ctx.lineTo(cx, cy + r * 0.65);
          ctx.stroke();

          // Center target pip
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'banana': {
          // Thermal Paste Blob / Tube
          // Paste dollop on bottom
          ctx.fillStyle = '#94A3B8';
          ctx.beginPath();
          ctx.ellipse(cx, cy + r * 0.35, r * 0.7, r * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();

          // Paste swirl peak
          ctx.beginPath();
          ctx.moveTo(cx - r * 0.4, cy + r * 0.3);
          ctx.quadraticCurveTo(cx, cy - r * 0.3, cx + r * 0.15, cy - r * 0.25);
          ctx.quadraticCurveTo(cx + r * 0.4, cy + r * 0.1, cx + r * 0.4, cy + r * 0.35);
          ctx.closePath();
          ctx.fill();

          // Thermal Paste Tube Syringe
          ctx.save();
          ctx.translate(cx, cy - r * 0.1);
          ctx.rotate(-Math.PI / 4);

          // Syringe body
          ctx.fillStyle = '#E2E8F0';
          ctx.beginPath();
          ctx.roundRect(-r * 0.18, -r * 0.6, r * 0.36, r * 0.9, 4);
          ctx.fill();
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Blue Carter label
          ctx.fillStyle = '#2563EB';
          ctx.fillRect(-r * 0.16, -r * 0.35, r * 0.32, r * 0.4);

          ctx.restore();
          break;
        }

        case 'star': {
          // 240Hz RGB Rainbow Star
          const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
          grad.addColorStop(0, '#EF4444');
          grad.addColorStop(0.2, '#F59E0B');
          grad.addColorStop(0.4, '#10B981');
          grad.addColorStop(0.6, '#06B6D4');
          grad.addColorStop(0.8, '#3B82F6');
          grad.addColorStop(1, '#8B5CF6');

          ctx.fillStyle = grad;
          this.drawStarShape(ctx, cx, cy, 5, r * 0.9, r * 0.42);

          // 2 big cute kart eyes
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.16, cy - r * 0.05, r * 0.07, r * 0.18, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + r * 0.16, cy - r * 0.05, r * 0.07, r * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();

          // 240Hz badge
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `900 ${r * 0.22}px "Outfit", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('240Hz', cx, cy + r * 0.3);
          break;
        }
      }

      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // Backward-Compatibility Helpers (for existing UI / game scripts)
    // -----------------------------------------------------------------------
    getAvatarCanvas(charId, size = 128) {
      return this.renderCharacterPortrait(size, charId);
    }

    getAvatarDataURL(charId, size = 128) {
      const canvas = this.renderCharacterPortrait(size, charId);
      return canvas ? canvas.toDataURL('image/png') : '';
    }

    getHeadTexture(charId) {
      return this.createThreeHeadTexture(charId);
    }

    getCharacters() {
      return this.CHARACTERS;
    }

    getCharacter(charId) {
      return this.CHARACTERS[charId] || this.CHARACTERS.mario;
    }
  }

  // Create singleton instance
  const instance = new CarterAssetsManager();

  // Expose on window
  window.CarterAssets = instance;
  window.CarterFaceSystem = instance; // Backwards compatibility
  window.CARTER_CHARACTERS = CHARACTERS;
  window.CARTER_TRACKS = TRACKS;
  window.CARTER_ITEMS = ITEMS;

  // Auto-init load on script load
  if (typeof document !== 'undefined') {
    instance.loadCarterImage();
  }

})(window);
