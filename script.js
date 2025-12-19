// ---------- Aurora Canvas ----------
const canvas = document.getElementById('aurora');
const ctx = canvas.getContext('2d');
function resize(){canvas.width = innerWidth; canvas.height = innerHeight;}
addEventListener('resize', resize); resize();

let t = 0;
function drawAurora(){
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  // 背景漸層
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#02040b');
  g.addColorStop(1,'#0b1530');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // 三條極光帶
  const bands = [
    {hue:160, amp:0.25, speed:0.0006, y:0.35},
    {hue:200, amp:0.20, speed:0.00045, y:0.55},
    {hue:130, amp:0.18, speed:0.00035, y:0.75},
  ];
  bands.forEach((b,i)=>{
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    const grad=ctx.createLinearGradient(0,b.y*h-120,0,b.y*h+120);
    grad.addColorStop(0,`hsla(${b.hue},80%,70%,0)`);
    grad.addColorStop(0.45,`hsla(${b.hue+20},90%,70%,.35)`);
    grad.addColorStop(1,`hsla(${b.hue+40},100%,75%,0)`);
    ctx.fillStyle=grad;

    ctx.beginPath();
    ctx.moveTo(0, b.y*h + Math.sin(t*b.speed*900)*(b.amp*120));
    for(let x=0;x<=w;x+=8){
      const y = b.y*h + Math.sin(t*b.speed*x + i)*b.amp*140 + Math.sin(t*b.speed*2.5*x)*b.amp*60;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  t += 1;
  requestAnimationFrame(drawAurora);
}
drawAurora();

// ---------- Calculator (AD + component_sum only) ----------
const $ = (q)=>document.querySelector(q);

// nodes
const dateAD=$("#dateAD");
const twinEnable=$("#twinEnable"); const timeWrap=$("#timeWrap"); const birthTime=$("#birthTime");
const btnCalc=$("#btnCalc"); const btnReset=$("#btnReset");
const result=$("#result");

twinEnable.addEventListener('change',()=>{
  timeWrap.classList.toggle('hidden', !twinEnable.checked);
});

function toggleLoading(on){ btnCalc.classList.toggle('loading',on); }

function readDate(){
  const v=dateAD.value; if(!v) return null; const d=new Date(v); if(isNaN(d)) return null;
  return {y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate()};
}

function sumDigits(n){ const s=String(Math.abs(Number(n)||0)); return [...s].reduce((a,c)=>a+(parseInt(c,10)||0),0); }
function digitalRoot(n){ if(n==='—') return null; const v=Number(n); return ((v%10)+10)%10; }
const KEYWORDS={0:"源初",1:"開創",2:"合作",3:"創意",4:"穩定",5:"變動",6:"責任",7:"覺察",8:"權能",9:"完成"};

function getHHMM(){ if(!(twinEnable.checked && birthTime.value)) return 0;
  const [hh,mm]=birthTime.value.split(':').map(Number); return (Number.isFinite(hh)?hh:0)+(Number.isFinite(mm)?0:mm);
}

function computeMaya({y,m,d}){
  const isException=(y>=1910&&y<=1921)||(y>=2010&&y<=2021);
  const A_raw=Math.floor((y%100)/10);
  const B_raw=y%10;
  const C=isException?10:(A_raw+B_raw);

  // component_sum only: N = Y + M + D (+ HH + MM if twin)
  const hhmm = getHHMM();
  const N = y + m + d + hhmm;
  const Sum = sumDigits(N);

  const D=(Sum<22)?Sum:(Sum-22);
  const E=(Sum<22)?Sum:sumDigits(Sum);
  return {A:isException?'—':String(A_raw), B:isException?'—':String(B_raw), C, D, E};
}

function setSub(id,val){
  const el=document.querySelector(id);
  if(val==='—'){ el.textContent='—'; return; }
  const dr=digitalRoot(val); el.textContent=`${dr}｜${KEYWORDS[dr]||''}`;
}

function render(r){
  document.querySelector('#valA').textContent=r.A;
  document.querySelector('#valB').textContent=r.B;
  document.querySelector('#valC').textContent=r.C;
  document.querySelector('#valD').textContent=r.D;
  document.querySelector('#valE').textContent=r.E;
  setSub('#subA',r.A); setSub('#subB',r.B); setSub('#subC',r.C); setSub('#subD',r.D); setSub('#subE',r.E);
  document.querySelector('#doneMsg').textContent='完成計算。';
  result.classList.remove('hidden');
}

btnCalc.addEventListener('click',()=>{
  const date=readDate();
  if(!date){ alert('請選擇西元生日'); return; }
  toggleLoading(true);
  setTimeout(()=>{ try{ const res=computeMaya(date); render(res);} finally{ toggleLoading(false);} }, 240);
});
btnReset.addEventListener('click',()=>{
  dateAD.value=''; result.classList.add('hidden');
  ['A','B','C','D','E'].forEach(k=>{ document.querySelector('#val'+k).textContent='—'; document.querySelector('#sub'+k).textContent='—'; });
});
