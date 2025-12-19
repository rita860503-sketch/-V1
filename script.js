// 靜態極光底（移除動態波浪，降低 GPU/CPU）
const canvas = document.getElementById('aurora');
const ctx = canvas.getContext('2d', { alpha: true });
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; paintAurora(); }
addEventListener('resize', resize, { passive:true });
function paintAurora(){
  const w = canvas.width, h = canvas.height;
  const g = ctx.createRadialGradient(w*0.7, h*0.2, 50, w*0.5, h*0.7, Math.max(w,h));
  g.addColorStop(0,  'rgba(20, 40, 90, 0.55)');
  g.addColorStop(0.4,'rgba(12, 28, 64, 0.45)');
  g.addColorStop(1,  'rgba(4, 10, 22, 0.85)');
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);
}
resize(); // initial paint

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
function getHHMM(){if(!(twinEnable.checked&&birthTime.value))return 0;const [hh,mm]=birthTime.value.split(':').map(Number);return (Number.isFinite(hh)?hh:0) + (Number.isFinite(mm)?mm:0)}
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
