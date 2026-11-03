/**
 * MARIO CARTER - CarterPCs Face System
 * Loads assets/carter.jpg, performs high-fidelity face extraction,
 * and composites custom Mario Kart character costumes (hats, crowns, horns, mustache)
 * for both 2D UI elements (Character Select, Standings, Minimap, Toasts)
 * and 3D Three.js textures (kart driver head and high-visibility billboards).
 */

(function (window) {
  'use strict';

  const CHARACTERS = {
    mario: {
      id: 'mario',
      name: 'Mario Carter',
      build: 'Balanced 144Hz Build',
      themeColor: '#EF4444',
      accentColor: '#2563EB',
      stats: { speed: 78, accel: 76, handling: 80, drift: 80 },
      quotes: [
        "Did you remember to flip your PSU switch?!",
        "Balanced 144Hz build with zero bottleneck!",
        "It's-a-me, Carter!",
        "No frame drops on my watch!"
      ]
    },
    luigi: {
      id: 'luigi',
      name: 'Luigi Carter',
      build: 'Liquid Cooled Green',
      themeColor: '#10B981',
      accentColor: '#1E3A8A',
      stats: { speed: 72, accel: 85, handling: 90, drift: 78 },
      quotes: [
        "Custom liquid cooling keeps my temps at 52°C!",
        "Never skimp on your radiator clearance!",
        "Quiet fans, loud victories!",
        "Drifting into that green cooling loop!"
      ]
    },
    princess: {
      id: 'princess',
      name: 'Princess Carter',
      build: 'Aesthetic White Build',
      themeColor: '#EC4899',
      accentColor: '#F8FAFC',
      stats: { speed: 70, accel: 92, handling: 86, drift: 92 },
      quotes: [
        "All-white Lian Li aesthetic build perfection!",
        "Clean cable management is not optional!",
        "Peachy smooth 240fps gameplay!",
        "RGB sync in full harmony!"
      ]
    },
    bowser: {
      id: 'bowser',
      name: 'Bowser Carter',
      build: 'RTX 5090 Threadripper',
      themeColor: '#D97706',
      accentColor: '#0F172A',
      stats: { speed: 96, accel: 56, handling: 58, drift: 70 },
      quotes: [
        "1600W PSU required to handle this ramming power!",
        "RTX 5090 Threadripper heavy torque!",
        "Get out of my thermal exhaust zone!",
        "Heavy metal backplate crushing the apex!"
      ]
    },
    toad: {
      id: 'toad',
      name: 'Toad Carter',
      build: 'ITX Mini-PC Rocket',
      themeColor: '#F43F5E',
      accentColor: '#FFFFFF',
      stats: { speed: 66, accel: 98, handling: 92, drift: 88 },
      quotes: [
        "SFF Mini-ITX packed with insane horsepower!",
        "Instant boost off the line, zero input lag!",
        "I fit where full-tower karts fear to tread!",
        "Super compact, ultra fast!"
      ]
    },
    yoshi: {
      id: 'yoshi',
      name: 'Yoshi Carter',
      build: 'Custom Loop Overclocker',
      themeColor: '#22C55E',
      accentColor: '#F97316',
      stats: { speed: 75, accel: 82, handling: 96, drift: 82 },
      quotes: [
        "Max grip! Applying thermal paste mid-drift!",
        "Overclocked to 6.2GHz all-core!",
        "Yoshi Carter eats your frame stutters for breakfast!",
        "Full copper heat pipes on every turn!"
      ]
    },
    wario: {
      id: 'wario',
      name: 'Wario Carter',
      build: '1600W PSU Beast',
      themeColor: '#EAB308',
      accentColor: '#7E22CE',
      stats: { speed: 92, accel: 62, handling: 62, drift: 74 },
      quotes: [
        "Never buy a prebuilt without dual-channel RAM!",
        "You want horsepower? Wario Carter gives you power!",
        "GPU scalpers fear this heavyweight!",
        "Cheating? No, it's called extreme overclocking!"
      ]
    },
    rosalina: {
      id: 'rosalina',
      name: 'Rosalina Carter',
      build: 'Zero-G Glass Case',
      themeColor: '#06B6D4',
      accentColor: '#E2E8F0',
      stats: { speed: 82, accel: 76, handling: 88, drift: 96 },
      quotes: [
        "Setting monitor from 60Hz to 240Hz!",
        "Zero-G panoramic dual-chamber glass chassis!",
        "Gliding through the RGB rainbow overclock!",
        "Cosmic airflow, celestial frame rates!"
      ]
    }
  };

  class CarterFaceSystem {
    constructor() {
      this.loaded = false;
      this.image = new Image();
      this.avatarCache = {};
      this.threeTextures = {};
      this.loadPromise = null;
    }

    init() {
      if (this.loadPromise) return this.loadPromise;

      this.loadPromise = new Promise((resolve, reject) => {
        this.image.onload = () => {
          this.loaded = true;
          this.generateAllAvatars();
          resolve(this);
        };
        this.image.onerror = (e) => {
          console.warn("Could not load assets/carter.jpg directly, falling back...", e);
          // Still generate fallback canvases
          this.loaded = false;
          this.generateAllAvatars();
          resolve(this);
        };
        this.image.src = 'assets/carter.jpg';
      });

      return this.loadPromise;
    }

    // Draws base face cropped from carter.jpg
    drawCarterBaseFace(ctx, cx, cy, radius) {
      if (!this.loaded || !this.image.complete) {
        // High quality fallback avatar if image fails
        ctx.fillStyle = '#FED7AA';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1E293B';
        ctx.font = `bold ${radius * 0.5}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CARTER', cx, cy);
        return;
      }

      ctx.save();
      // Clip circular face
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Carter face crop coordinates in carter.jpg (339x589)
      // Eyes/nose/smile are centered around x=170, y=300
      const sx = 15;
      const sy = 80;
      const sw = 310;
      const sh = 390;

      // Draw slightly enlarged inside circle to frame his smile and hair
      const dw = radius * 2.15;
      const dh = radius * 2.7;
      const dx = cx - dw / 2;
      const dy = cy - dh * 0.42;

      ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.restore();
    }

    // Draw costume hat/crown/accessories on top of Carter's face
    drawCostume(ctx, charId, cx, cy, radius) {
      const c = CHARACTERS[charId] || CHARACTERS.mario;

      ctx.save();

      switch (charId) {
        case 'mario':
        case 'luigi': {
          const isMario = charId === 'mario';
          const capColor = isMario ? '#EF4444' : '#10B981';
          const capDark = isMario ? '#B91C1C' : '#047857';
          const letter = isMario ? 'M' : 'L';

          // Cap visor / bill
          ctx.fillStyle = capDark;
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.52, radius * 0.72, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cap crown (puffy top)
          ctx.fillStyle = capColor;
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.72, radius * 0.78, radius * 0.45, 0, Math.PI, 0);
          ctx.fill();

          // White circle emblem
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy - radius * 0.75, radius * 0.26, 0, Math.PI * 2);
          ctx.fill();

          // Emblem letter
          ctx.fillStyle = capColor;
          ctx.font = `900 ${radius * 0.34}px "Outfit", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(letter, cx, cy - radius * 0.74);
          break;
        }

        case 'princess': {
          // Princess Peach gold royal crown
          const crownY = cy - radius * 0.65;
          ctx.fillStyle = '#F59E0B'; // Gold
          ctx.beginPath();
          ctx.moveTo(cx - radius * 0.6, crownY + radius * 0.1);
          ctx.lineTo(cx - radius * 0.7, crownY - radius * 0.4); // left peak
          ctx.lineTo(cx - radius * 0.35, crownY - radius * 0.15); // dip
          ctx.lineTo(cx, crownY - radius * 0.55); // center peak
          ctx.lineTo(cx + radius * 0.35, crownY - radius * 0.15); // dip
          ctx.lineTo(cx + radius * 0.7, crownY - radius * 0.4); // right peak
          ctx.lineTo(cx + radius * 0.6, crownY + radius * 0.1);
          ctx.closePath();
          ctx.fill();

          // Crown band
          ctx.fillStyle = '#D97706';
          ctx.beginPath();
          ctx.ellipse(cx, crownY + radius * 0.1, radius * 0.6, radius * 0.08, 0, 0, Math.PI * 2);
          ctx.fill();

          // Center jewel (Ruby pink)
          ctx.fillStyle = '#EC4899';
          ctx.beginPath();
          ctx.ellipse(cx, crownY - radius * 0.18, radius * 0.14, radius * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();

          // Side jewels (Sapphire blue)
          ctx.fillStyle = '#06B6D4';
          ctx.beginPath();
          ctx.arc(cx - radius * 0.4, crownY - radius * 0.1, radius * 0.09, 0, Math.PI * 2);
          ctx.arc(cx + radius * 0.4, crownY - radius * 0.1, radius * 0.09, 0, Math.PI * 2);
          ctx.fill();

          // Golden spherical earrings
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(cx - radius * 0.88, cy + radius * 0.15, radius * 0.14, 0, Math.PI * 2);
          ctx.arc(cx + radius * 0.88, cy + radius * 0.15, radius * 0.14, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'bowser': {
          // Curved beast horns on both sides
          const hornColor = '#F59E0B';
          const hornDark = '#B45309';

          // Left Horn
          ctx.fillStyle = hornColor;
          ctx.beginPath();
          ctx.moveTo(cx - radius * 0.55, cy - radius * 0.4);
          ctx.quadraticCurveTo(cx - radius * 1.1, cy - radius * 0.7, cx - radius * 0.85, cy - radius * 1.05);
          ctx.quadraticCurveTo(cx - radius * 0.65, cy - radius * 0.65, cx - radius * 0.35, cy - radius * 0.55);
          ctx.closePath();
          ctx.fill();

          // Right Horn
          ctx.beginPath();
          ctx.moveTo(cx + radius * 0.55, cy - radius * 0.4);
          ctx.quadraticCurveTo(cx + radius * 1.1, cy - radius * 0.7, cx + radius * 0.85, cy - radius * 1.05);
          ctx.quadraticCurveTo(cx + radius * 0.65, cy - radius * 0.65, cx + radius * 0.35, cy - radius * 0.55);
          ctx.closePath();
          ctx.fill();

          // Spiked collar / metal band at chin
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.ellipse(cx, cy + radius * 0.78, radius * 0.65, radius * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();

          // Silver spikes on collar
          ctx.fillStyle = '#E2E8F0';
          for (let i = -2; i <= 2; i++) {
            const sx = cx + (i * radius * 0.22);
            const sy = cy + radius * 0.82;
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
          // Large white mushroom cap with red polka dots
          const mushroomY = cy - radius * 0.6;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(cx, mushroomY, radius * 0.85, radius * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 3;
          ctx.stroke();

          // 3 Red polka dots
          ctx.fillStyle = '#EF4444';
          // Center dot
          ctx.beginPath();
          ctx.ellipse(cx, mushroomY - radius * 0.1, radius * 0.25, radius * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
          // Left dot
          ctx.beginPath();
          ctx.ellipse(cx - radius * 0.52, mushroomY + radius * 0.05, radius * 0.2, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          // Right dot
          ctx.beginPath();
          ctx.ellipse(cx + radius * 0.52, mushroomY + radius * 0.05, radius * 0.2, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'yoshi': {
          // Neon green dinosaur hood
          ctx.fillStyle = '#22C55E';
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.65, radius * 0.82, radius * 0.48, 0, 0, Math.PI * 2);
          ctx.fill();

          // Orange spines on top
          ctx.fillStyle = '#F97316';
          for (let i = -1; i <= 1; i++) {
            const px = cx + i * radius * 0.28;
            const py = cy - radius * 1.05;
            ctx.beginPath();
            ctx.arc(px, py + radius * 0.15, radius * 0.12, 0, Math.PI * 2);
            ctx.fill();
          }

          // Green hood side flaps framing Carter's cheeks
          ctx.fillStyle = '#16A34A';
          ctx.beginPath();
          ctx.ellipse(cx - radius * 0.8, cy - radius * 0.1, radius * 0.18, radius * 0.45, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + radius * 0.8, cy - radius * 0.1, radius * 0.18, radius * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'wario': {
          // Yellow Wario Cap
          ctx.fillStyle = '#CA8A04'; // dark visor
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.52, radius * 0.74, radius * 0.24, 0, 0, Math.PI * 2);
          ctx.fill();

          // Yellow dome
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.ellipse(cx, cy - radius * 0.72, radius * 0.8, radius * 0.46, 0, Math.PI, 0);
          ctx.fill();

          // White circle
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy - radius * 0.75, radius * 0.26, 0, Math.PI * 2);
          ctx.fill();

          // Purple 'W'
          ctx.fillStyle = '#7E22CE';
          ctx.font = `900 ${radius * 0.34}px "Outfit", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('W', cx, cy - radius * 0.74);

          // Iconic Wario jagged zigzag mustache right below Carter's nose!
          const mY = cy + radius * 0.22;
          ctx.fillStyle = '#1E1B4B';
          ctx.beginPath();
          ctx.moveTo(cx, mY);
          // Right zigzag
          ctx.lineTo(cx + radius * 0.2, mY - radius * 0.08);
          ctx.lineTo(cx + radius * 0.35, mY + radius * 0.04);
          ctx.lineTo(cx + radius * 0.6, mY - radius * 0.12);
          ctx.lineTo(cx + radius * 0.75, mY - radius * 0.02);
          ctx.lineTo(cx + radius * 0.65, mY + radius * 0.12);
          ctx.lineTo(cx + radius * 0.35, mY + radius * 0.18);
          ctx.lineTo(cx, mY + radius * 0.08);
          // Left zigzag
          ctx.lineTo(cx - radius * 0.35, mY + radius * 0.18);
          ctx.lineTo(cx - radius * 0.65, mY + radius * 0.12);
          ctx.lineTo(cx - radius * 0.75, mY - radius * 0.02);
          ctx.lineTo(cx - radius * 0.6, mY - radius * 0.12);
          ctx.lineTo(cx - radius * 0.35, mY + radius * 0.04);
          ctx.lineTo(cx - radius * 0.2, mY - radius * 0.08);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'rosalina': {
          // Platinum Silver Star Crown with cyan star jewel
          const crownY = cy - radius * 0.65;
          ctx.fillStyle = '#E2E8F0'; // Platinum silver
          ctx.beginPath();
          ctx.moveTo(cx - radius * 0.6, crownY + radius * 0.05);
          ctx.lineTo(cx - radius * 0.7, crownY - radius * 0.38);
          ctx.lineTo(cx - radius * 0.35, crownY - radius * 0.15);
          ctx.lineTo(cx, crownY - radius * 0.52);
          ctx.lineTo(cx + radius * 0.35, crownY - radius * 0.15);
          ctx.lineTo(cx + radius * 0.7, crownY - radius * 0.38);
          ctx.lineTo(cx + radius * 0.6, crownY + radius * 0.05);
          ctx.closePath();
          ctx.fill();

          // Cyan Star jewel in center
          ctx.fillStyle = '#06B6D4';
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 10;
          this.drawStar(ctx, cx, crownY - radius * 0.22, 5, radius * 0.18, radius * 0.08);
          ctx.shadowBlur = 0;
          break;
        }
      }

      ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
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

    generateAllAvatars() {
      const size = 256;
      Object.keys(CHARACTERS).forEach(charId => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const cx = size / 2;
        const cy = size / 2 + 10;
        const radius = size * 0.38;

        // Frosted card background circle
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
        ctx.fill();

        // Character color ring
        ctx.strokeStyle = CHARACTERS[charId].themeColor;
        ctx.lineWidth = 6;
        ctx.stroke();

        // 1. Draw Carter's actual face
        this.drawCarterBaseFace(ctx, cx, cy, radius);

        // 2. Draw character costume hat / crown / horns / mustache
        this.drawCostume(ctx, charId, cx, cy, radius);

        this.avatarCache[charId] = canvas;
      });
    }

    getAvatarCanvas(charId, size = 128) {
      if (!this.avatarCache[charId]) {
        this.generateAllAvatars();
      }
      const source = this.avatarCache[charId];
      if (!source) return null;

      if (source.width === size && source.height === size) {
        return source;
      }

      const scaled = document.createElement('canvas');
      scaled.width = size;
      scaled.height = size;
      const ctx = scaled.getContext('2d');
      ctx.drawImage(source, 0, 0, size, size);
      return scaled;
    }

    getAvatarDataURL(charId, size = 128) {
      const canvas = this.getAvatarCanvas(charId, size);
      return canvas ? canvas.toDataURL('image/png') : '';
    }

    // Creates a Three.js CanvasTexture for the 3D kart driver head and overhead billboard
    getHeadTexture(charId) {
      if (this.threeTextures[charId]) {
        return this.threeTextures[charId];
      }

      const canvas = this.getAvatarCanvas(charId, 256);
      if (window.THREE && canvas) {
        const texture = new window.THREE.CanvasTexture(canvas);
        texture.minFilter = window.THREE.LinearFilter;
        texture.magFilter = window.THREE.LinearFilter;
        texture.needsUpdate = true;
        this.threeTextures[charId] = texture;
        return texture;
      }
      return null;
    }

    getCharacters() {
      return CHARACTERS;
    }

    getCharacter(charId) {
      return CHARACTERS[charId] || CHARACTERS.mario;
    }
  }

  window.CarterFaceSystem = new CarterFaceSystem();
  window.CARTER_CHARACTERS = CHARACTERS;

})(window);
