// A looping crash, drawn in the game's palette. Decorative: the page copy stands without it.
(function () {
  const canvas = document.getElementById("stage");
  const stamp = document.getElementById("stamp");
  const frame = canvas && canvas.closest(".stage-wrap");
  if (!canvas || !stamp || !frame) return;

  const ctx = canvas.getContext("2d");
  const LW = 390;
  const LH = 640;
  const CYCLE = 8.2;
  const IMPACT = 5.35;
  const FLYER_X = 128;
  const SPEED = 148;
  const STAMPS = [
    "FOLDED",
    "TOO MUCH HINGE",
    "SKILL ISSUE",
    "WHY",
    "PANIC FLAP",
    "HINGE BETRAYED YOU"
  ];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let shownStamp = "";

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const scale = Math.min(canvas.width / LW, canvas.height / LH);
    ctx.setTransform(scale, 0, 0, scale, (canvas.width - LW * scale) / 2, (canvas.height - LH * scale) / 2);
  }

  function flapLift(t) {
    const flaps = [
      { t: 0.85, lift: 70, decay: 2.6 },
      { t: 2.15, lift: 78, decay: 2.6 },
      { t: 3.45, lift: 74, decay: 2.6 },
      { t: 4.72, lift: 210, decay: 1.05 }
    ];
    let lift = 0;
    let wing = 0.15;
    for (const flap of flaps) {
      const age = t - flap.t;
      if (age < 0) continue;
      lift += flap.lift * Math.exp(-age * flap.decay);
      if (age < 0.18) wing = -1.15;
    }
    return { lift, wing };
  }

  function flyerY(t) {
    if (t < IMPACT) {
      const glide = flapLift(t);
      return 300 + Math.sin(t * 2.3) * 14 - glide.lift;
    }
    const age = t - IMPACT;
    const start = 300 + Math.sin(IMPACT * 2.3) * 14 - flapLift(IMPACT).lift;
    const fall = start + age * 520 + age * age * 280;
    const ground = 512;
    if (fall < ground) return fall;
    const bounced = Math.abs(Math.sin(age * 9)) * Math.max(0, 36 - age * 28);
    return ground - bounced;
  }

  function gateX(index, t) {
    const spacing = 310;
    const crashStart = FLYER_X - 6 + SPEED * IMPACT;
    return crashStart + (index - 1) * spacing - SPEED * t;
  }

  function roundPanel(x, y, w, h) {
    if (h < 8) return;
    const r = 10;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawGate(x, openingTop, openingBottom) {
    ctx.save();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#0A0812";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#EDEFF5";
    const topH = openingTop;
    const botY = openingBottom;
    const botH = 548 - botY;
    roundPanel(x, -20, 78, topH + 20);
    roundPanel(x, botY, 78, botH);
    ctx.fillStyle = "#98A4C6";
    ctx.fillRect(x, -20, 16, topH + 20);
    ctx.fillRect(x, botY, 16, botH);
    ctx.strokeStyle = "#0A0812";
    ctx.lineWidth = 4;
    const knuckles = (y0, y1) => {
      for (let y = y0; y < y1; y += 16) {
        ctx.beginPath();
        ctx.arc(x + 78, y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = "#C5CCE0";
        ctx.fill();
        ctx.stroke();
      }
    };
    knuckles(Math.max(18, openingTop - 70), openingTop - 6);
    knuckles(openingBottom + 10, Math.min(530, openingBottom + 74));
    ctx.restore();
  }

  function eye(x, y, panic) {
    const r = 8.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#0A0812";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 2.2, y + 0.4, panic ? 2.1 : 3.6, 0, Math.PI * 2);
    ctx.fillStyle = "#0A0812";
    ctx.fill();
  }

  function drawFlyer(x, y, t) {
    const crashing = t >= IMPACT;
    const glide = flapLift(Math.min(t, IMPACT));
    const panic = t > IMPACT - 0.7 && t < IMPACT + 0.15;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.65, 1.65);
    if (crashing) ctx.rotate(Math.min(t - IMPACT, 0.8) * 7);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0A0812";
    ctx.lineWidth = 4;

    if (crashing) {
      ctx.fillStyle = "#FFD84D";
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#F0A32B";
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.quadraticCurveTo(0, 4, 14, 10);
      ctx.stroke();
      ctx.strokeStyle = "#0A0812";
      eye(-7, -4, true);
      eye(8, -2, true);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(-4, 4);
    ctx.rotate(glide.wing);
    ctx.fillStyle = "#F0A32B";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(42, -14);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#FFD84D";
    ctx.beginPath();
    ctx.moveTo(46, 2);
    ctx.lineTo(-16, -18);
    ctx.lineTo(-30, -2);
    ctx.lineTo(-16, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#F0A32B";
    ctx.beginPath();
    ctx.moveTo(46, 2);
    ctx.lineTo(-16, 18);
    ctx.lineTo(-6, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFD84D";
    ctx.beginPath();
    ctx.moveTo(-16, -18);
    ctx.lineTo(-34, -34);
    ctx.lineTo(-22, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    eye(-2, -6, panic);
    eye(14, -2, panic);
    ctx.restore();
  }

  function drawFlecks(t) {
    if (t >= IMPACT) return;
    const y = flyerY(t);
    ctx.save();
    for (let i = 1; i <= 7; i++) {
      const back = i * 16;
      ctx.save();
      ctx.translate(FLYER_X - 36 - back, y + Math.sin(t * 6 + i) * 6);
      ctx.rotate(-0.4 + i * 0.15);
      ctx.fillStyle = i % 2 ? "#FFD84D" : "#F0A32B";
      ctx.fillRect(-5, -3, 10, 6);
      ctx.strokeStyle = "#0A0812";
      ctx.lineWidth = 2;
      ctx.strokeRect(-5, -3, 10, 6);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawConfetti(t) {
    if (t < IMPACT) return;
    const age = t - IMPACT;
    const originY = flyerY(IMPACT);
    for (let i = 0; i < 16; i++) {
      const ang = i * 0.9 + 0.2;
      const speed = 90 + (i % 5) * 28;
      const x = FLYER_X + Math.cos(ang) * speed * age;
      const y = originY + Math.sin(ang) * speed * age + 260 * age * age;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(age * 4 + i);
      ctx.fillStyle = ["#FFD84D", "#FF2E63", "#6BF7FF", "#FFD60A"][i % 4];
      ctx.fillRect(-6, -4, 12, 8);
      ctx.restore();
    }
  }

  function drawScore(t) {
    const score = Math.max(0, Math.floor(Math.min(t, IMPACT) * 17));
    ctx.save();
    ctx.font = "42px 'Lilita One', sans-serif";
    ctx.textAlign = "right";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#0A0812";
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeText(String(score), 358, 64);
    ctx.fillText(String(score), 358, 64);
    ctx.restore();
  }

  function render(t, cycle) {
    ctx.clearRect(-20, -20, LW + 40, LH + 40);
    const sky = ctx.createLinearGradient(0, 0, 0, 548);
    sky.addColorStop(0, "#4A1FB8");
    sky.addColorStop(1, "#C41E9B");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, LW, LH);

    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    const shift = (t * 50) % 48;
    for (let x = -LH; x < LW + LH; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x + shift, 0);
      ctx.lineTo(x - 220 + shift, 548);
      ctx.stroke();
    }
    ctx.restore();

    const shake = t >= IMPACT && t < IMPACT + 0.28
      ? Math.sin((t - IMPACT) * 90) * (1 - (t - IMPACT) / 0.28) * 7
      : 0;
    ctx.save();
    ctx.translate(shake, -shake * 0.4);

    for (let i = -1; i < 4; i++) {
      const x = gateX(i, t);
      if (x < -120 || x > LW + 40) continue;
      const crash = i === 1;
      const top = crash ? 250 : 188;
      const bottom = crash ? 430 : 392;
      drawGate(x, top, bottom);
    }

    drawFlecks(t);
    drawFlyer(FLYER_X, flyerY(t), t);
    drawConfetti(t);
    ctx.restore();

    ctx.fillStyle = "#FF2E63";
    ctx.fillRect(0, 548, LW, LH - 548);
    ctx.fillStyle = "#0A0812";
    for (let x = -20; x < LW; x += 28) {
      ctx.fillRect(x + (t * 80) % 28, 562, 14, 8);
    }

    drawScore(t);

    const phrase = STAMPS[cycle % STAMPS.length];
    const show = t >= IMPACT + 0.08;
    if (show && shownStamp !== phrase + cycle) {
      shownStamp = phrase + cycle;
      stamp.textContent = phrase;
      stamp.classList.remove("show");
      void stamp.offsetWidth;
      stamp.classList.add("show");
      frame.classList.remove("shake");
      void frame.offsetWidth;
      frame.classList.add("shake");
    } else if (!show && stamp.classList.contains("show")) {
      stamp.classList.remove("show");
      shownStamp = "";
    }
  }

  fit();
  window.addEventListener("resize", fit);

  if (reduced) {
    render(2.1, 0);
    return;
  }

  const start = performance.now();
  function tick(now) {
    const elapsed = (now - start) / 1000 + 1.35;
    render(elapsed % CYCLE, Math.floor(elapsed / CYCLE));
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
