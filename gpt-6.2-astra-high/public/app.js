const scene = document.querySelector('#scene');
const overlay = document.querySelector('#bursts');
const display = scene.getContext('2d');
const fx = overlay.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const button = document.querySelector('#fire');
const count = document.querySelector('#count');
const statusLine = document.querySelector('#status');
const meter = document.querySelector('#meter');
const tau = Math.PI * 2;
let presses = 0;
let particles = [];
let rings = [];
let frame = 0;
let last = 0;
let w, h;
function fit(canvas, context) {
  const ratio = Math.min(devicePixelRatio, 2);
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function resize() {
  fit(scene, display);
  fit(overlay, fx);
  w = scene.clientWidth;
  h = scene.clientHeight;
  landscape(performance.now());
}
new ResizeObserver(resize).observe(scene);
window.addEventListener('resize', resize);

// Sample a flower-shaped torus and paint its wire cells from back to front.
function sculpture(time, hue) {
  const cells = [];
  const radius = Math.min(w * .25, h * .33);
  const rows = 64, bands = 16;
  const mesh = [];
  for (let i = 0; i < rows; i++) {
    const a = tau * i / rows;
    const ridge = Math.cos(3 * a + time * .25);
    const ring = [];
    for (let j = 0; j < bands; j++) {
      const b = tau * j / bands;
      const r = .8 + .19 * ridge + .32 * Math.cos(b);
      const x = r * Math.cos(a), y = r * Math.sin(a);
      const z = .42 * Math.sin(3 * a + time * .25) + .34 * Math.sin(b);
      const tilt = .88 + .08 * Math.sin(time);
      const py = y * Math.cos(tilt) - z * Math.sin(tilt);
      const depth = y * Math.sin(tilt) + z * Math.cos(tilt);
      ring.push([w * .5 + radius * (x * .95 + py * .31), h * .46 + radius * (py * .95 - x * .31), depth]);
    }
    mesh.push(ring);
  }
  for (let i = 0; i < rows; i++) {
    const next = mesh[(i+1)%rows];
    for (let j = 0; j < bands; j++) {
      const k = (j+1)%bands;
      const points = [mesh[i][j], next[j], next[k], mesh[i][k]];
      cells.push({points, depth: points.reduce((s,p)=>s+p[2],0)/4});
    }
  }
  cells.sort((a,b)=>a.depth-b.depth);
  display.lineWidth = .85;
  for (const {points, depth} of cells) {
    display.fillStyle = 'hsl('+hue+' 44% '+(7+(depth+1)*5)+'%)';
    display.strokeStyle = 'hsl('+hue+' 85% '+(35+(depth+1)*16)+'%)';
    display.beginPath();
    points.forEach(([x,y],i)=>i ? display.lineTo(x,y) : display.moveTo(x,y));
    display.closePath(); display.fill(); display.stroke();
  }
}
function landscape(now) {
  const time = reduced.matches ? 0 : now * .0003;
  const hue = presses ? (84 + presses * 21)%360 : 94;
  display.clearRect(0,0,w,h);
  const glow = display.createRadialGradient(w*.5,h*.47,5,w*.5,h*.5,w*.56);
  glow.addColorStop(0,'hsl('+hue+' 43% 14%)');
  glow.addColorStop(1,'#09130d');
  display.fillStyle = glow; display.fillRect(0,0,w,h);
  for (let i=1;i<94;i++) {
    const x = ((i*137.57)%99)/99*w, y = ((i*i*3.43)%83)/99*h;
    display.fillStyle = i%8 ? '#88b98a80' : '#c6e9b4';
    display.fillRect(x,y,i%8 ? 1 : 4,1);
    if (!(i%8)) display.fillRect(x+1.5,y-1.5,1,4);
  }
  function floorPoint(col,row) {
    const dist = 1/(1+row*.3);
    const x = col * dist * w * .09;
    const wave = .38 + .24*Math.sin(col*.4 + row*.35 + time) + .16*Math.cos(col*.48-row*.19);
    return [w*.5+x,h*(.69+dist*.5)-Math.min(1,Math.abs(x)/w*2.8)**1.8*h*wave];
  }
  display.lineWidth=.8;
  for (let row=22;row>=0;row--) {
    display.strokeStyle='hsla('+hue+' 75% 57% / '+(.21+.32/(1+row*.1))+')';
    display.beginPath();
    for(let col=-40;col<=40;col++) {
      const [x,y] = floorPoint(col,row);
      if(x < -w*.15 || x>w*1.15) continue;
      display.moveTo(x,y);display.lineTo(...floorPoint(col+1,row));
      display.moveTo(x,y);display.lineTo(...floorPoint(col,row+1));
    }
    display.stroke();
  }
  sculpture(time,hue);
}
const stages = ['ИМПУЛЬС','РАЗГОН','ПЕРЕГРУЗКА','ПОЛНЫЙ ХАОС','КОСМИЧЕСКИЙ ТРЫНДЕЦ'];
function fire() {
  presses++;
  count.textContent = String(presses).padStart(3,'0');
  const stage = Math.min(4, Math.floor(Math.sqrt(presses-1)/1.4));
  statusLine.textContent = '● '+stages[stage];
  meter.style.setProperty('--level',Math.min(100,6+presses*5)+'%');
  const rect = button.getBoundingClientRect();
  const x = rect.left+rect.width/2, y=rect.top+rect.height/2;
  const hue = presses*39;
  const origins = [[x,y]];
  for(let i=0;i<stage;i++) origins.push([Math.random()*innerWidth,Math.random()*innerHeight*.8]);
  for(const [cx,cy] of origins) {
    rings.push({x:cx,y:cy,hue,born:performance.now(),size:100+stage*70});
    for(let i=0;i<(reduced.matches?8:36+stage*7);i++) {
      const a=Math.random()*tau, speed=90+Math.random()*(270+stage*100);
      particles.push({x:cx,y:cy,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-120,
        hue:hue+Math.random()*110,life:1+Math.random()*1.8,size:3+Math.random()*(6+stage*2),
        spin:Math.random()*6,kind:Math.floor(Math.random()*(stage+2))});
    }
  }
  particles=particles.slice(-1800);rings=rings.slice(-45);
  if(reduced.matches) landscape(performance.now());
}
button.addEventListener('click',fire);
window.addEventListener('keydown',e=>{
  if(e.code==='Space' && !e.altKey && !e.ctrlKey && !e.metaKey){e.preventDefault();if(!e.repeat)fire();}
});
function animate(now) {
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(!reduced.matches && now-frame>50){landscape(now);frame=now;}
  fx.clearRect(0,0,innerWidth,innerHeight);
  rings=rings.filter(r=>now-r.born<1150);
  for(const r of rings) {
    const age=(now-r.born)/1150;
    fx.strokeStyle='hsla('+r.hue+' 100% 68% / '+(1-age)+')';
    fx.lineWidth=3*(1-age)+.3;
    fx.beginPath();fx.arc(r.x,r.y,8+(reduced.matches?20:r.size)*age,0,tau);fx.stroke();
  }
  particles=particles.filter(p=>p.life>0);
  for(const p of particles) {
    const step = reduced.matches ? dt*.12 : dt;
    p.life-=dt;p.x+=p.vx*step;p.y+=p.vy*step;p.vy+=180*step;
    fx.save();fx.translate(p.x,p.y);fx.rotate(p.spin+p.life);fx.globalAlpha=Math.min(1,p.life*2);
    fx.fillStyle='hsl('+p.hue+' 100% 65%)';
    if(p.kind>1){fx.font='bold '+(p.size*2.6)+'px monospace';fx.fillText(['✦','ϟ','★','✹'][p.kind%4],0,0);}
    else fx.fillRect(0,0,p.size,p.size*(p.kind?2.5:1));
    fx.restore();
  }
  requestAnimationFrame(animate);
}
resize();requestAnimationFrame(animate);
