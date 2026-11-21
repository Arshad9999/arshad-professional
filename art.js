// A half-turn across one revolution joins the two sides of the strip.
function drawRibbon(context, progress) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const spin = -.4 + progress * 1.22;
  const tilt = .93 - .18 * progress;
  const cs = Math.cos(spin), ss = Math.sin(spin);
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const columns = 128, rows = 18;
  const surface = [];
  for (let i = 0; i <= columns; i++) {
    const angle = 2 * Math.PI * i / columns;
    const ring = [];
    for (let j = 0; j <= rows; j++) {
      const v = (j / rows - .5) * .99;
      const radius = 1 + v * Math.cos(angle / 2);
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = v * Math.sin(angle / 2);
      const rx = cs * x - ss * y, ry = ss * x + cs * y;
      ring.push([rx, ct * ry - st * z, st * ry + ct * z]);
    }
    surface.push(ring);
  }

  const faces = [];
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const vertices = [surface[i][j], surface[i + 1][j], surface[i + 1][j + 1], surface[i][j + 1]];
      const [a,b,,d] = vertices;
      const u = b.map((n,k) => n - a[k]), v = d.map((n,k) => n - a[k]);
      let nx = u[1]*v[2] - u[2]*v[1];
      let ny = u[2]*v[0] - u[0]*v[2];
      let nz = u[0]*v[1] - u[1]*v[0];
      const length = Math.hypot(nx,ny,nz) * (nz < 0 ? -1 : 1);
      nx /= length; ny /= length; nz /= length;
      const reflection = 2 * nz * (.28 * nx - .83 * ny + .49 * nz) - .49;
      const band = Math.exp(-Math.pow((reflection - .33) / .19, 2));
      const soft = Math.exp(-Math.pow((reflection + .48) / .37, 2));
      const edge = j === 0 || j === rows - 1 ? .10 : 0;
      const light = Math.min(1, .10 + .84 * band + .52 * soft + .13 * (1 - nz) + edge);
      const rgb = [24 + light * (211 - 32*progress), 26 + light * (197 + 28*progress), 45 + light * 205];
      faces.push({vertices, depth: vertices.reduce((sum,p) => sum + p[2],0), color: 'rgb(' + rgb.map(Math.round).join(',') + ')'});
    }
  }
  context.clearRect(0,0,width,height);
  const scale = Math.min(width * .32, height * .47);
  for (const face of faces.sort((a,b) => a.depth - b.depth)) {
    context.beginPath();
    face.vertices.forEach(([x,y],i) => {
      const px = width * .49 + scale * (.94 * x + .34 * y);
      const py = height * .55 + scale * (.94 * y - .34 * x);
      if (i === 0) context.moveTo(px,py);
      else context.lineTo(px,py);
    });
    context.closePath();
    context.fillStyle = context.strokeStyle = face.color;
    context.lineWidth = .68;
    context.fill();
    context.stroke();
  }
}

function setupArtwork() {
  const hero = document.querySelector('.hero');
  const artwork = hero.querySelector('.hero-art');
  const monogram = artwork.querySelector('img');
  const mesh = artwork.querySelector('canvas');
  const meshContext = mesh.getContext('2d');
  const region = document.querySelector('.work-research');
  const pin = region.querySelector('.ribbon-pin');
  const ribbon = pin.querySelector('canvas');
  const ribbonContext = ribbon.getContext('2d');
  if (!meshContext || !ribbonContext || !('IntersectionObserver' in window)) return;

  const still = matchMedia('(prefers-reduced-motion: reduce), (max-width: 820px)');
  const targets = [[225,198],[197,167],[213,152],[178,204],[239,154],[265,195],[166,159],[201,151],[209,113],[292,262],[194,184],[203,216],[220,99],[227,151],[191,201],[296,239],[248,197],[183,167],[233,197],[172,146],[218,215],[197,122],[154,243],[129,273],[264,179],[142,247],[173,187],[233,214],[242,139],[148,188],[147,236],[152,167],[167,227],[184,145],[227,137],[285,281],[260,266],[151,220],[240,239],[157,146],[193,239],[209,139],[253,159],[284,247],[151,263],[156,200],[143,210],[174,170],[274,199],[184,102],[234,250],[198,253],[367,231],[369,240],[434,247],[377,209],[440,109],[401,80],[443,212],[330,215],[406,91],[358,248],[329,144],[448,233],[389,272],[378,82],[476,247],[419,191],[432,85],[346,213],[455,99],[335,229],[429,263],[394,156],[479,182],[334,115],[424,274],[485,191],[374,268],[363,93],[389,228],[337,173],[445,177],[370,136],[332,168],[440,206],[417,169],[396,111],[492,214],[359,140],[329,110],[468,207],[480,251],[362,211],[405,274],[345,102],[323,131],[366,110],[462,232],[444,224],[383,114],[425,161],[399,194],[453,194]];
  const nodes = targets.map(([x,y],i) => ({
    x, y, startX: 310 + 270 * Math.sin(i * 1.87), startY: 210 + 159 * Math.cos(i * 2.37)
  }));
  const edges = [];
  nodes.forEach((p,i) => {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.hypot(p.x - nodes[j].x, p.y - nodes[j].y) < 40) edges.push([i,j]);
    }
  });
  const clamp = n => Math.max(0,Math.min(1,n));
  function paintMesh(t) {
    const eased = 1 - (1 - t) ** 3;
    const placed = nodes.map(p => [p.startX + (p.x - p.startX) * eased, p.startY + (p.y - p.startY) * eased]);
    meshContext.clearRect(0,0,620,420);
    meshContext.lineWidth = .8;
    meshContext.strokeStyle = 'rgba(176,170,222,.50)';
    meshContext.beginPath();
    for (const [i,j] of edges) {
      if (Math.hypot(placed[i][0]-placed[j][0],placed[i][1]-placed[j][1]) > 80) continue;
      meshContext.moveTo(...placed[i]); meshContext.lineTo(...placed[j]);
    }
    meshContext.stroke();
    meshContext.fillStyle = '#dbdcfc';
    for (const [x,y] of placed) {
      meshContext.beginPath(); meshContext.arc(x,y,1.25,0,2*Math.PI); meshContext.fill();
    }
    const reveal = clamp((t - .30) / .70);
    monogram.style.opacity = String(reveal);
    mesh.style.opacity = String(1 - reveal);
  }
  let elapsed = 0, lastTime = 0, frame = 0, lastPose = -1;
  let heroVisible = false, ribbonVisible = false, settled = still.matches;
  const duration = 1650;
  function update(now) {
    frame = 0;
    if (document.hidden || still.matches) return;
    if (heroVisible && !settled) {
      if (lastTime) elapsed += Math.min(now-lastTime,64);
      lastTime = now;
      paintMesh(clamp(elapsed / duration));
      settled = elapsed >= duration;
    }
    const heroBox = hero.getBoundingClientRect();
    const exit = clamp(-heroBox.top / heroBox.height);
    artwork.style.opacity = String(1 - clamp((exit - .18) / .36));
    if (ribbonVisible) {
      const section = region.getBoundingClientRect();
      const pose = clamp((innerHeight * .42 - section.top) / section.height);
      pin.style.opacity = String(clamp((exit - .54) / .27));
      if (exit > .54 && Math.abs(pose - lastPose) > .001) {
        drawRibbon(ribbonContext,pose);
        pin.querySelector('img').hidden = true;
        lastPose = pose;
      }
    }
    if (heroVisible && !settled) queueFrame();
  }
  function queueFrame() {
    if (!frame && !document.hidden && !still.matches && (heroVisible || ribbonVisible)) frame = requestAnimationFrame(update);
  }
  function resetTiming() {
    cancelAnimationFrame(frame);
    lastTime = frame = 0;
    if (still.matches) {
      settled = true;
      artwork.style.opacity = monogram.style.opacity = pin.style.opacity = '1';
      mesh.style.opacity = '0';
      ribbonContext.clearRect(0,0,ribbon.width,ribbon.height);
      pin.querySelector('img').hidden = false;
      lastPose = -1;
    }
    queueFrame();
  }
  const visible = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === artwork) heroVisible = entry.isIntersecting;
      else ribbonVisible = entry.isIntersecting;
    }
    if (!heroVisible) lastTime = 0;
    queueFrame();
  });
  visible.observe(artwork);
  visible.observe(pin);
  window.addEventListener('scroll',queueFrame,{passive:true});
  window.addEventListener('resize',queueFrame);
  document.addEventListener('visibilitychange',resetTiming);
  still.addEventListener('change',resetTiming);
  if (!settled) paintMesh(0);
  resetTiming();
}
setupArtwork();
