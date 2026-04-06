/* ═══════════════════════════════════════════════════════
   script.js — Sahara Sheikholeslami Research Portfolio
   Optimized interactive version
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const safe = fn => { try { const r = fn(); if (r && r.catch) r.catch(e => console.warn(fn.name, e)); } catch(e) { console.warn(fn.name, e); } };
  safe(initCustomCursor);
  safe(initScrollProgress);
  safe(initHero3D);
  safe(initHeroParallax);
  safe(initTextScramble);
  safe(initTypewriter);
  safe(initScrollReveal);
  safe(initTiltCards);
  safe(initMagnetic);
  safe(loadPublications);
  safe(buildConstellationSVG);
  safe(initNavigation);
  safe(initVizCards);
  safe(initVizFilters);
  safe(initBurger);
  safe(initCounters);
  safe(initScrollHint);
});

/* ── Shared mouse position (one listener for everything) ── */
let gMouseX = 0, gMouseY = 0;
document.addEventListener('mousemove', e => { gMouseX = e.clientX; gMouseY = e.clientY; }, { passive: true });

/* ──────────────────────────────────────────────────
   CUSTOM CURSOR (CSS-driven, no RAF)
   ────────────────────────────────────────────────── */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring || matchMedia('(pointer:coarse)').matches) {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    return;
  }
  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
  }, { passive: true });

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .tilt-card, .magnetic')) {
      ring.classList.add('cursor-hover'); dot.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .tilt-card, .magnetic')) {
      ring.classList.remove('cursor-hover'); dot.classList.remove('cursor-hover');
    }
  });
}

/* ──────────────────────────────────────────────────
   SCROLL PROGRESS BAR
   ────────────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
  }, { passive: true });
}

/* ──────────────────────────────────────────────────
   HERO PARALLAX (CSS transform on scroll, no RAF)
   ────────────────────────────────────────────────── */
function initHeroParallax() {
  const layers = document.querySelectorAll('.hero-parallax-layer');
  if (!layers.length || matchMedia('(pointer:coarse)').matches) return;
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    layers.forEach(layer => {
      const d = parseFloat(layer.dataset.depth) || 0.05;
      layer.style.transform = `translate(${mx * d * 80}px, ${my * d * 80}px)`;
    });
  }, { passive: true });
}

/* ──────────────────────────────────────────────────
   TEXT SCRAMBLE (hero name — runs once then stops)
   ────────────────────────────────────────────────── */
function initTextScramble() {
  const el = document.getElementById('hero-name-scramble');
  if (!el) return;
  const chars = '!<>-_\\/[]{}=+*^?#________';
  const finalHTML = el.innerHTML;
  const finalText = el.textContent;
  let frame = 0;
  const total = 30;

  function scramble() {
    const progress = frame / total;
    let out = '';
    for (let i = 0; i < finalText.length; i++) {
      if (finalText[i] === '\n' || finalText[i] === ' ') { out += finalText[i]; continue; }
      out += (i / finalText.length < progress) ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = out;
    frame++;
    if (frame <= total) requestAnimationFrame(scramble);
    else el.innerHTML = finalHTML;
  }
  setTimeout(scramble, 400);
}

/* ──────────────────────────────────────────────────
   TYPEWRITER (hero tagline)
   ────────────────────────────────────────────────── */
function initTypewriter() {
  const el = document.getElementById('hero-typewriter');
  if (!el) return;
  const phrases = ['Computer Vision · Robotics · LLMs', 'Visual Proprioception · Sim-to-Real', 'Deep Learning · Generative AI', '5,376+ Models · 3 Robot Platforms'];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; setTimeout(type, 2200); return; }
      setTimeout(type, 55 + Math.random() * 40);
    } else {
      el.textContent = phrase.slice(0, ci);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; }
      setTimeout(type, 30);
    }
  }
  setTimeout(type, 1200);
}

/* ──────────────────────────────────────────────────
   SCROLL REVEAL
   ────────────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = getComputedStyle(entry.target).getPropertyValue('--delay') || '0s';
        entry.target.style.transitionDelay = delay;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────
   3D TILT CARDS (lightweight)
   ────────────────────────────────────────────────── */
function initTiltCards() {
  if (matchMedia('(pointer:coarse)').matches) return;
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.tilt-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
    card.style.setProperty('--shine-x', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--shine-y', `${(y + 0.5) * 100}%`);
  }, { passive: true });
  document.addEventListener('mouseout', e => {
    const card = e.target.closest('.tilt-card');
    if (card) card.style.transform = '';
  }, { passive: true });
}

/* ──────────────────────────────────────────────────
   MAGNETIC ELEMENTS (lightweight)
   ────────────────────────────────────────────────── */
function initMagnetic() {
  if (matchMedia('(pointer:coarse)').matches) return;
  document.addEventListener('mousemove', e => {
    const el = e.target.closest('.magnetic');
    if (!el) return;
    const strength = parseFloat(el.dataset.strength) || 10;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / r.width * strength;
    const dy = (e.clientY - r.top - r.height / 2) / r.height * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }, { passive: true });
  document.addEventListener('mouseout', e => {
    const el = e.target.closest('.magnetic');
    if (el) el.style.transform = '';
  }, { passive: true });
}

/* ──────────────────────────────────────────────────
   SCROLL HINT
   ────────────────────────────────────────────────── */
function initScrollHint() {
  const hint = document.getElementById('scroll-hint');
  if (!hint) return;
  window.addEventListener('scroll', () => {
    hint.style.opacity = Math.max(0, 1 - window.scrollY / 300);
  }, { passive: true });
}


/* ──────────────────────────────────────────────────
   THREE.JS HERO (reduced particles for performance)
   ────────────────────────────────────────────────── */
function initHero3D() {
  const container = document.getElementById('hero-3d');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x020810, 1);
  container.appendChild(renderer.domElement);

  const palette = [0xF72585, 0x4CC9F0, 0x06D6A0, 0xFFB703, 0x8338EC];
  const N = 300; // reduced from 600
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const velocities = [];

  for (let i = 0; i < N; i++) {
    positions[i*3] = (Math.random()-.5)*60;
    positions[i*3+1] = (Math.random()-.5)*40;
    positions[i*3+2] = (Math.random()-.5)*30;
    const col = new THREE.Color(palette[Math.floor(Math.random()*palette.length)]);
    colors[i*3]=col.r; colors[i*3+1]=col.g; colors[i*3+2]=col.b;
    velocities.push({x:(Math.random()-.5)*.01,y:(Math.random()-.5)*.01,z:(Math.random()-.5)*.005});
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.Points(geom, new THREE.PointsMaterial({
    size:.18, vertexColors:true, transparent:true, opacity:.7,
    sizeAttenuation:true, blending:THREE.AdditiveBlending, depthWrite:false
  })));

  const lineGeo = new THREE.BufferGeometry();
  const maxLines = 200;
  const lp = new Float32Array(maxLines*6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  lineGeo.setDrawRange(0,0);
  scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color:0x1a3a5c, transparent:true, opacity:.15, blending:THREE.AdditiveBlending, depthWrite:false
  })));

  [0xF72585,0x4CC9F0,0x06D6A0].forEach((col,i)=>{
    const r = new THREE.Mesh(
      new THREE.RingGeometry(12+i*3,12.05+i*3,64),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.06,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})
    );
    r.rotation.x=Math.PI*.3+i*.4; r.rotation.y=i*.5;
    r.userData={speed:.001+i*.0005,axis:i%2===0?'x':'y'};
    scene.add(r);
  });

  window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight)});

  // Only animate when hero is visible
  let heroVisible = true;
  const heroObs = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
  }, { threshold: 0 });
  heroObs.observe(container);

  (function animate(){
    requestAnimationFrame(animate);
    if (!heroVisible) return; // skip when scrolled past

    const pos=geom.attributes.position.array;
    for(let i=0;i<N;i++){
      pos[i*3]+=velocities[i].x;pos[i*3+1]+=velocities[i].y;pos[i*3+2]+=velocities[i].z;
      if(pos[i*3]>30)pos[i*3]=-30;if(pos[i*3]<-30)pos[i*3]=30;
      if(pos[i*3+1]>20)pos[i*3+1]=-20;if(pos[i*3+1]<-20)pos[i*3+1]=20;
    }
    geom.attributes.position.needsUpdate=true;

    // Sparse line check — only check a subset each frame
    let li=0;const la=lineGeo.attributes.position.array;
    for(let i=0;i<N&&li<maxLines;i+=2)for(let j=i+1;j<N&&li<maxLines;j+=2){
      const dx=pos[i*3]-pos[j*3],dy=pos[i*3+1]-pos[j*3+1],dz=pos[i*3+2]-pos[j*3+2];
      if(dx*dx+dy*dy+dz*dz<36){la[li*6]=pos[i*3];la[li*6+1]=pos[i*3+1];la[li*6+2]=pos[i*3+2];la[li*6+3]=pos[j*3];la[li*6+4]=pos[j*3+1];la[li*6+5]=pos[j*3+2];li++;}
    }
    lineGeo.setDrawRange(0,li*2);lineGeo.attributes.position.needsUpdate=true;

    scene.children.forEach(c=>{if(c.userData&&c.userData.speed){if(c.userData.axis==='x')c.rotation.x+=c.userData.speed;else c.rotation.y+=c.userData.speed;}});
    const mx=(gMouseX/window.innerWidth-.5)*2, my=(gMouseY/window.innerHeight-.5)*2;
    camera.position.x+=(mx*3-camera.position.x)*.02;camera.position.y+=(-my*2-camera.position.y)*.02;camera.lookAt(scene.position);
    renderer.render(scene,camera);
  })();
}


/* ──────────────────────────────────────────────────
   PUBLICATIONS (embedded data, no fetch needed)
   ────────────────────────────────────────────────── */
async function loadPublications() {
  const list = document.getElementById('pub-list');
  if (!list) return;

  const embeddedPubs = [
    {"title":"Latent Representations for Visual Proprioception in Inexpensive Robots","authors":["Sahara Sheikholeslami","Ladislau B\u00f6l\u00f6ni"],"venue":"ICRA 2026","venueFull":"IEEE Int. Conf. on Robotics and Automation","year":2026,"status":"Accepted","type":"conference","abstract":"Exploring CNNs, VAEs, ViTs, and bags of uncalibrated fiducial markers for fast, single-pass visual proprioception from a single external camera on an inexpensive 6-DoF robot.","tags":["Latent Representations","Robotics","Visual Proprioception"]},
    {"title":"Multi-view Robot Proprioception with Asymmetric Camera Positions","authors":["Sahara Sheikholeslami","Ladislau B\u00f6l\u00f6ni"],"venue":"IROS 2026","venueFull":"IEEE/RSJ Int. Conf. on Intelligent Robots and Systems","year":2026,"status":"Under Review","type":"conference","abstract":"We propose multi-view visual proprioception from two asymmetrically mounted, uncalibrated RGB cameras. We evaluate 50 implementation variants across ViT-, CNN-, and VAE-based encoders and five distinct view fusion frameworks, finding up to 36.6% improvement over single-view methods.","tags":["Multi-View Fusion","Visual Proprioception","Asymmetric Cameras"]},
    {"title":"Domain Randomization for Learning Visual Proprioception for Robot Manipulators","authors":["Sahara Sheikholeslami","Robert-Anton Konievic","Ladislau B\u00f6l\u00f6ni","Levente Tamas"],"equalContribution":["Sahara Sheikholeslami","Robert-Anton Konievic"],"venue":"ECCV 2026","venueFull":"European Conference on Computer Vision","year":2026,"status":"Under Review","type":"conference","abstract":"We study how different domain randomization techniques affect the accuracy of various visual proprioception models across 5,376 distinct models in a sim-to-real setting, evaluating multiple encoder architectures, camera positions, and randomization techniques.","tags":["Domain Randomization","Sim-to-Real","Visual Proprioception"]},
    {"title":"Optimal Camera Positions for Visual Robot Proprioception","authors":["Robert-Anton Konievic","Sahara Sheikholeslami","Levente Tamas","Ladislau B\u00f6l\u00f6ni"],"equalContribution":["Sahara Sheikholeslami","Robert-Anton Konievic"],"venue":"IROS 2026","venueFull":"IEEE/RSJ Int. Conf. on Intelligent Robots and Systems","year":2026,"status":"Under Review","type":"conference","abstract":"A framework for quantifying visual proprioception accuracy as a function of camera placement. Eight encoder configurations trained across 112 simulated and 20 real-world camera positions yield over 1,000 distinct models.","tags":["Camera Optimization","Visual Proprioception","Sim-to-Real"]},
    {"title":"Generalizing Visual Proprioception for Multiple Robot Configurations","authors":["Robert-Anton Konievic","Sahara Sheikholeslami","Ladislau B\u00f6l\u00f6ni","Levente Tamas"],"equalContribution":["Sahara Sheikholeslami","Robert-Anton Konievic"],"venue":"ICRA 2026 Workshop","venueFull":"IEEE Int. Conf. on Robotics and Automation \u2014 MM-Spatial AI Workshop","year":2026,"status":"Under Review","type":"workshop","abstract":"We investigate the generalization of visual proprioception across three very different robot configurations: a low-cost 6DOF AL5D arm, a high-precision 7DOF Franka arm, and a humanoid G1 arm with 7DOF.","tags":["Cross-Robot Transfer","Visual Proprioception","Encoder Generalization","Sim-to-Real"]}
  ];

  let pubs;
  try {
    const r = await fetch('publications.json');
    if (!r.ok) throw new Error(r.status);
    pubs = await r.json();
  } catch (e) {
    pubs = embeddedPubs;
  }
  list.innerHTML = '';
  pubs.forEach((p, i) => {
    const card = makePubCard(p);
    card.style.animationDelay = (i * 0.08) + 's';
    list.appendChild(card);
  });
}

function makePubCard(p) {
  const el = document.createElement('div');
  el.className = 'pub-card tilt-card';
  const badge = p.status === 'Accepted' ? 'accepted' : 'review';
  const equalSet = new Set(p.equalContribution || []);
  const authors = p.authors
    .map(a => {
      let html = a.includes('Sahara') ? `<span class="me">${a}</span>` : a;
      if (equalSet.has(a)) html += '<sup class="equal-mark">*</sup>';
      return html;
    }).join(', ');
  const equalNote = equalSet.size > 0 ? '<p class="equal-note"><sup>*</sup> Equal contribution as first author</p>' : '';
  const tags = p.tags.map(t => `<span class="pub-tag">${t}</span>`).join('');
  el.innerHTML = `
    <div class="pub-top"><span class="pub-venue">${p.venue}</span><span class="pub-year">${p.year}</span><span class="pub-badge ${badge}">${p.status}</span></div>
    <h3>${p.title}</h3>
    <p class="pub-authors">${authors}</p>${equalNote}
    <p class="pub-abstract">${p.abstract}</p>
    <div class="pub-tags">${tags}</div>`;
  return el;
}


/* ──────────────────────────────────────────────────
   SVG CONSTELLATION
   ────────────────────────────────────────────────── */
function buildConstellationSVG() {
  const svg = document.getElementById('research-svg');
  if (!svg) return;
  const topics = [
    {id:'vp',label:'Visual\nProprioception',x:410,y:110,r:52,color:'#F72585'},
    {id:'s2r',label:'Sim-to-Real',x:180,y:170,r:38,color:'#4CC9F0'},
    {id:'enc',label:'Latent\nEncoders',x:620,y:180,r:40,color:'#06D6A0'},
    {id:'cam',label:'Camera\nOptimization',x:260,y:320,r:36,color:'#FFB703'},
    {id:'dr',label:'Domain\nRandomization',x:140,y:50,r:32,color:'#8338EC'},
    {id:'rob',label:'Robotics',x:540,y:340,r:34,color:'#FF6B6B'},
    {id:'viz',label:'Research\nVisualization',x:730,y:310,r:30,color:'#4ECDC4'},
    {id:'dl',label:'Deep\nLearning',x:700,y:60,r:34,color:'#E9C46A'},
  ];
  const edges=[['vp','s2r'],['vp','enc'],['vp','cam'],['vp','rob'],['vp','dr'],['vp','dl'],['s2r','dr'],['s2r','cam'],['enc','dl'],['enc','viz'],['cam','rob'],['cam','viz'],['rob','enc'],['dr','dl']];
  const tm=Object.fromEntries(topics.map(t=>[t.id,t]));
  const defs=svgEl(svg,'defs',{});
  topics.forEach(t=>{const f=svgEl(defs,'filter',{id:`glow-${t.id}`,x:'-50%',y:'-50%',width:'200%',height:'200%'});svgEl(f,'feGaussianBlur',{stdDeviation:'6',result:'blur'});const m=svgEl(f,'feMerge',{});svgEl(m,'feMergeNode',{in:'blur'});svgEl(m,'feMergeNode',{in:'SourceGraphic'});});
  edges.forEach(([a,b])=>{svgEl(svg,'line',{x1:tm[a].x,y1:tm[a].y,x2:tm[b].x,y2:tm[b].y,stroke:'#0d1a2e','stroke-width':1,opacity:.6,class:`edge edge-${a} edge-${b}`});});
  topics.forEach(t=>{
    const g=svgEl(svg,'g',{class:'node',style:'cursor:pointer'});
    svgEl(g,'circle',{cx:t.x,cy:t.y,r:t.r+8,fill:'none',stroke:t.color,'stroke-width':.5,opacity:0,class:'ring'});
    svgEl(g,'circle',{cx:t.x,cy:t.y,r:t.r,fill:t.color,opacity:.08,stroke:t.color,'stroke-width':1.2});
    svgEl(g,'circle',{cx:t.x,cy:t.y,r:3,fill:t.color,opacity:.9,filter:`url(#glow-${t.id})`});
    t.label.split('\n').forEach((line,i)=>{svgEl(g,'text',{x:t.x,y:t.y+t.r+16+i*15,'text-anchor':'middle','font-family':"'Outfit',sans-serif",'font-size':12,'font-weight':500,fill:'#5a7090','letter-spacing':1}).textContent=line;});
    g.addEventListener('mouseenter',()=>{g.querySelector('.ring').setAttribute('opacity',.4);svg.querySelectorAll(`.edge-${t.id}`).forEach(e=>{e.setAttribute('stroke',t.color);e.setAttribute('opacity',.5);e.setAttribute('stroke-width',1.5);});});
    g.addEventListener('mouseleave',()=>{g.querySelector('.ring').setAttribute('opacity',0);svg.querySelectorAll('.edge').forEach(e=>{e.setAttribute('stroke','#0d1a2e');e.setAttribute('opacity',.6);e.setAttribute('stroke-width',1);});});
  });
  // Use CSS animation instead of RAF for particles
  for(let i=0;i<15;i++){
    const c=svgEl(svg,'circle',{cx:Math.random()*820,cy:Math.random()*420,r:Math.random()*1.5+.3,fill:['#F72585','#4CC9F0','#06D6A0','#FFB703'][Math.floor(Math.random()*4)],opacity:Math.random()*.15+.05});
    c.innerHTML = `<animate attributeName="cx" values="${Math.random()*820};${Math.random()*820};${Math.random()*820}" dur="${15+Math.random()*10}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${Math.random()*420};${Math.random()*420};${Math.random()*420}" dur="${18+Math.random()*10}s" repeatCount="indefinite"/>`;
  }
}


/* ──────────────────────────────────────────────────
   VIZ CARDS & FILTERS
   ────────────────────────────────────────────────── */
function initVizCards() {
  const modal=document.getElementById('viz-modal'),mf=document.getElementById('viz-modal-frame'),mt=document.getElementById('viz-modal-title'),mc=document.getElementById('viz-modal-close');
  const lb=document.getElementById('viz-lightbox'),lf=document.getElementById('viz-lightbox-frame'),lt=document.getElementById('viz-lightbox-title'),lc=document.getElementById('viz-lightbox-close'),lbd=document.getElementById('viz-lightbox-backdrop');
  document.querySelectorAll('.viz-card').forEach(card=>{
    const src=card.dataset.viz,name=card.dataset.title||'';
    const btn=card.querySelector('.viz-interact-btn');
    if(btn)btn.addEventListener('click',e=>{e.stopPropagation();lf.src=src;lt.textContent=name;lb.classList.add('open');document.body.style.overflow='hidden';});
    const h3=card.querySelector('.viz-info h3');
    if(h3)h3.addEventListener('click',e=>{e.stopPropagation();mf.src=src;mt.textContent=name;modal.classList.add('open');document.body.style.overflow='hidden';});
  });
  function closeLB(){lb.classList.remove('open');lf.src='';document.body.style.overflow='';}
  function closeM(){modal.classList.remove('open');mf.src='';document.body.style.overflow='';}
  lc.addEventListener('click',closeLB);lbd.addEventListener('click',closeLB);mc.addEventListener('click',closeM);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLB();closeM();}});
}

function initVizFilters() {
  const btns=document.querySelectorAll('.viz-filter'),cards=document.querySelectorAll('.viz-card');
  btns.forEach(btn=>{btn.addEventListener('click',()=>{
    btns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const f=btn.dataset.filter;
    cards.forEach(card=>{
      const cat=card.dataset.cat||'';
      card.style.display=(f==='all'||cat.includes(f))?'':'none';
    });
  });});
}


/* ──────────────────────────────────────────────────
   NAVIGATION & BURGER
   ────────────────────────────────────────────────── */
function initNavigation() {
  const nav=document.getElementById('navbar'),links=document.querySelectorAll('.nav-links a');
  const ids=Array.from(links).map(a=>a.dataset.section).filter(Boolean);
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled',window.scrollY>60);
    let cur='';ids.forEach(id=>{const s=document.getElementById(id);if(s&&window.scrollY>=s.offsetTop-200)cur=id;});
    links.forEach(a=>a.classList.toggle('active',a.dataset.section===cur));
  },{passive:true});
}
function initBurger(){const b=document.getElementById('burger'),l=document.getElementById('nav-links');b.addEventListener('click',()=>l.classList.toggle('open'));l.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>l.classList.remove('open')));}


/* ──────────────────────────────────────────────────
   ANIMATED COUNTERS
   ────────────────────────────────────────────────── */
function initCounters() {
  const counters=document.querySelectorAll('.stat-num[data-count]');
  if(!counters.length)return;
  const obs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){
    const el=entry.target,target=+el.dataset.count,dur=1800,start=performance.now();
    function tick(now){const t=Math.min((now-start)/dur,1);el.textContent=Math.round((1-Math.pow(1-t,3))*target).toLocaleString();if(t<1)requestAnimationFrame(tick);}
    requestAnimationFrame(tick);obs.unobserve(el);
  }});},{threshold:.5});
  counters.forEach(c=>obs.observe(c));
}


/* ── SVG Helper ── */
function svgEl(parent,tag,attrs){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);parent.appendChild(el);return el;}
