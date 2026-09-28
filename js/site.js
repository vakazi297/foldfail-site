(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const colors = ["#ffd60a", "#ff2e63", "#6bf7ff", "#b6ff3b", "#fff8ec", "#a66bff"];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  const deaths = [
    "FOLDED", "TOO MUCH HINGE", "SKILL ISSUE", "WHY", "ABSOLUTE DISASTER",
    "YOU FOLDED TOO HARD", "PANIC FLAP", "HINGE BETRAYED YOU",
    "THAT WAS EMBARRASSING", "TRY FOLDING LESS",
  ];

  // Nav picks up a backing once the hero is behind it.
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll.
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Videos load lazily and only play while they are on screen.
  const videos = document.querySelectorAll("video");
  const playIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        if (v.dataset.src && !v.src) { v.src = v.dataset.src; v.load(); }
        if (!still) v.play().catch(() => {});
      } else {
        v.pause();
      }
    }
  }, { threshold: 0.2, rootMargin: "200px 0px" });
  videos.forEach((v) => {
    if (still) v.removeAttribute("autoplay");
    playIO.observe(v);
  });

  if (still) return;

  // Confetti in the hero.
  const confetti = document.querySelector(".hero .confetti");
  if (confetti) {
    const count = innerWidth < 700 ? 22 : 40;
    for (let i = 0; i < count; i++) {
      const bit = document.createElement("i");
      bit.style.cssText = [
        `left:${rand(0, 100)}%`,
        `--c:${pick(colors)}`,
        `--w:${rand(8, 16).toFixed(0)}px`,
        `--h:${rand(12, 22).toFixed(0)}px`,
        `--t:${rand(7, 14).toFixed(1)}s`,
        `--d:${(-rand(0, 14)).toFixed(1)}s`,
        `--x:${rand(-120, 120).toFixed(0)}px`,
        `--r:${rand(360, 1080).toFixed(0)}deg`,
      ].join(";");
      confetti.appendChild(bit);
    }
  }

  // Crumpled flyers raining behind the final call.
  const rain = document.querySelector(".final .rain");
  if (rain) {
    const dead = ["legalpad", "twofoldbill", "blueprint", "receipt", "pizzaslice", "goldenfold", "yomamacouch", "treasuremap", "loveletter", "graph"];
    const count = innerWidth < 700 ? 7 : 12;
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.src = `flyers/${dead[i % dead.length]}-dead.png`;
      img.alt = "";
      img.loading = "lazy";
      img.style.cssText = [
        `left:${(i / count) * 100 + rand(-4, 4)}%`,
        `--s:${rand(70, 140).toFixed(0)}px`,
        `--t:${rand(6, 11).toFixed(1)}s`,
        `--d:${(-rand(0, 11)).toFixed(1)}s`,
        `--x:${rand(-80, 80).toFixed(0)}px`,
        `--r:${rand(-720, 720).toFixed(0)}deg`,
      ].join(";");
      rain.appendChild(img);
    }
  }

  // Hero flyers drift against the pointer.
  const stage = document.querySelector(".hero-stage");
  if (stage && finePointer) {
    let frame = 0;
    addEventListener("pointermove", (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        stage.style.setProperty("--px", ((e.clientX / innerWidth) - 0.5).toFixed(3));
        stage.style.setProperty("--py", ((e.clientY / innerHeight) - 0.5).toFixed(3));
      });
    }, { passive: true });
  }

  // Roster: hover flaps, a poke kills.
  document.querySelectorAll(".roster button").forEach((btn) => {
    const img = btn.querySelector("img");
    const id = btn.dataset.id;
    let timer = 0;
    const pose = (p) => { img.src = `flyers/${id}-${p}.png`; };
    ["flap", "panic", "dead"].forEach((p) => { const pre = new Image(); pre.src = `flyers/${id}-${p}.png`; });

    btn.addEventListener("pointerenter", () => { if (!btn.classList.contains("dead")) pose("flap"); });
    btn.addEventListener("pointerleave", () => { if (!btn.classList.contains("dead")) pose("idle"); });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearTimeout(timer);
      pose("panic");
      btn.classList.remove("dead");
      void btn.offsetWidth;
      timer = setTimeout(() => {
        pose("dead");
        btn.classList.add("dead");
        const r = btn.getBoundingClientRect();
        crash(r.left + r.width / 2, r.top + r.height * 0.4);
        timer = setTimeout(() => { btn.classList.remove("dead"); pose("idle"); }, 1400);
      }, 220);
    });
  });

  // Clicking empty space is a crash.
  function crash(x, y) {
    const stamp = document.createElement("div");
    stamp.className = "stamp";
    stamp.textContent = pick(deaths);
    stamp.style.cssText = `left:${x}px;top:${y}px;--c:${pick(["#ff2e63", "#ffd60a", "#6bf7ff", "#b6ff3b"])};--r:${rand(-12, 8).toFixed(0)}deg`;
    document.body.appendChild(stamp);
    stamp.addEventListener("animationend", () => stamp.remove());

    for (let i = 0; i < 14; i++) {
      const s = document.createElement("i");
      s.className = "shard";
      const a = rand(0, Math.PI * 2);
      const d = rand(60, 170);
      s.style.cssText = `left:${x}px;top:${y}px;--c:${pick(colors)};--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px;--r:${rand(-540, 540).toFixed(0)}deg`;
      document.body.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    }
    if (navigator.vibrate) navigator.vibrate(18);
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("a, button, video, .phone, .duo, .doc")) return;
    crash(e.clientX, e.clientY);
  });

  // Paper flecks behind the cursor.
  if (finePointer) {
    let last = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const f = document.createElement("i");
      f.className = "fleck";
      f.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${rand(-18, 18).toFixed(0)}px;--r:${rand(-200, 200).toFixed(0)}deg`;
      if (Math.random() < 0.35) f.style.background = "#6bf7ff";
      document.body.appendChild(f);
      f.addEventListener("animationend", () => f.remove());
    }, { passive: true });
  }
})();
