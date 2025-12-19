// 動態極光背景：Canvas + requestAnimationFrame
const canvas = document.getElementById('aurora');
const ctx = canvas.getContext('2d', { alpha: true }); // 透明背景，避免被覆蓋
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
addEventListener('resize',resize,{passive:true});resize();
let t=0;
function drawAurora(){
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  // 深藍色底（淡到透明，保留星空）
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'rgba(2,4,11,0.9)');
  g.addColorStop(1,'rgba(11,21,48,0.6)');
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

  const bands=[
    {hue:160,amp:.28,speed:.0007,y:.35,width:140},
    {hue:200,amp:.22,speed:.0005,y:.55,width:160},
    {hue:130,amp:.2 ,speed:.0004,y:.75,width:180},
  ];

  bands.forEach((b,i)=>{
    ctx.save(); ctx.globalCompositeOperation='lighter';
    const grad=ctx.createLinearGradient(0,b.y*h-b.width,0,b.y*h+b.width);
    grad.addColorStop(0,`hsla(${b.hue},90%,70%,0)`);
    grad.addColorStop(.45,`hsla(${b.hue+20},95%,70%,.35)`);
    grad.addColorStop(1,`hsla(${b.hue+40},100%,75%,0)`);
    ctx.fillStyle=grad;
    ctx.beginPath();
    ctx.moveTo(0,b.y*h);
    for(let x=0;x<=w;x+=6){
      const y=b.y*h
        + Math.sin((t*b.speed*900)+x*0.01+i)*b.amp*140
        + Math.sin((t*b.speed*2.5)+x*0.03)*b.amp*60;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
    ctx.fill(); ctx.restore();
  });

  t+=1; requestAnimationFrame(drawAurora);
}
drawAurora();

// 計算器（西元 + 加總法 + 例外 + 雙胞胎時間加總）
const $=q=>document.querySelector(q);
const dateAD=$("#dateAD");
const twinEnable=$("#twinEnable"), timeWrap=$("#timeWrap"), birthTime=$("#birthTime");
const btnCalc=$("#btnCalc"), btnReset=$("#btnReset"), result=$("#result");

twinEnable.addEventListener('change',()=>{timeWrap.classList.toggle('hidden',!twinEnable.checked)});
function toggleLoading(on){btnCalc.classList.toggle('loading',on)}
function readDate(){const v=dateAD.value;if(!v)return null;const d=new Date(v);if(isNaN(d))return null;return{y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate()}}
function sumDigits(n){return String(Math.abs(Number(n)||0)).split('').reduce((a,c)=>a+(parseInt(c,10)||0),0)}
function digitalRoot(n){if(n==='—')return null;const v=Number(n);return((v%10)+10)%10}
const KEYWORDS={0:"源初",1:"開創",2:"合作",3:"創意",4:"穩定",5:"變動",6:"責任",7:"覺察",8:"權能",9:"完成"};
function getHHMM(){if(!(twinEnable.checked&&birthTime.value))return 0;const [hh,mm]=birthTime.value.split(':').map(Number);return (Number.isFinite(hh)?hh:0)+(Number.isFinite(mm)?0:mm)}
function computeMaya({y,m,d}){
  const isException=(y>=1910&&y<=1921)||(y>=2010&&y<=2021);
  const A_raw=Math.floor((y%100)/10), B_raw=y%10;
  const C=isException?10:(A_raw+B_raw);
  const N=y+m+d+getHHMM(); const Sum=sumDigits(N);
  const D=(Sum<22)?Sum:(Sum-22); const E=(Sum<22)?Sum:sumDigits(Sum);
  return {A:isException?'—':String(A_raw),B:isException?'—':String(B_raw),C,D,E};
}
function setSub(id,val){const el=$(id);if(val==='—'){el.textContent='—';return;}const dr=digitalRoot(val);el.textContent=`${dr}｜${KEYWORDS[dr]||''}`}
function render(r){$('#valA').textContent=r.A;$('#valB').textContent=r.B;$('#valC').textContent=r.C;$('#valD').textContent=r.D;$('#valE').textContent=r.E;
  setSub('#subA',r.A);setSub('#subB',r.B);setSub('#subC',r.C);setSub('#subD',r.D);setSub('#subE',r.E);$('#doneMsg').textContent='完成計算。';result.classList.remove('hidden')}

btnCalc.addEventListener('click',()=>{const date=readDate();if(!date){alert('請輸入您的出生年月日');return}toggleLoading(true);
  setTimeout(()=>{try{const res=computeMaya(date);render(res)}finally{toggleLoading(false)}},240)});
btnReset.addEventListener('click',()=>{dateAD.value='';result.classList.add('hidden');['A','B','C','D','E'].forEach(k=>{$('#val'+k).textContent='—';$('#sub'+k).textContent='—'})});


// v4 scroll fix: force enable scroll on iOS/Android
document.addEventListener('DOMContentLoaded', () => {
  const elHtml = document.documentElement;
  const elBody = document.body;
  elHtml.style.overflowY = 'auto';
  elBody.style.overflowY = 'auto';
  elBody.style.height = 'auto';
});
