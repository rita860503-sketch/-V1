// --- Aurora background (static gradient) ---
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
resize();

// --- Core logic ---
const KEYWORDS = {0:"源初",1:"開創",2:"合作",3:"創意",4:"穩定",5:"變動",6:"責任",7:"覺察",8:"權能",9:"完成"};
const $ = q => document.querySelector(q);
let currentMode = 'single'; // 'single' | 'match'

function readDate(sel){
  const v = $(sel).value;
  if(!v) return null;
  const d = new Date(v);
  if(isNaN(d)) return null;
  return { y: d.getFullYear(), m: d.getMonth()+1, d: d.getDate() };
}
function sumDigits(n){ return String(Math.abs(Number(n)||0)).split('').reduce((a,c)=>a+(parseInt(c,10)||0),0); }
function digitalRoot(n){ if(n==='—') return null; const v = Number(n); return ((v%10)+10)%10; }

function computeMaya({y,m,d}, timeVal=null){
  const isException = (y>=1910 && y<=1921) || (y>=2010 && y<=2021);
  const A_raw = Math.floor((y%100)/10);
  const B_raw = y % 10;
  const C = isException ? 10 : (A_raw + B_raw);

  let N = y + m + d;
  if(timeVal){
    const [hh, mm] = timeVal.split(':').map(Number);
    N += (Number.isFinite(hh)?hh:0) + (Number.isFinite(mm)?mm:0); // twin fix
  }
  const Sum = sumDigits(N);
  const D = (Sum < 22) ? Sum : (Sum - 22);
  const E = (Sum < 22) ? Sum : sumDigits(Sum);

  return {
    A: isException ? '—' : String(A_raw),
    B: isException ? '—' : String(B_raw),
    C, D, E
  };
}

// --- Single render ---
function renderSingle(r){
  const setV = (id, val) => {
    const el = $(id), sub = $(id.replace('val','sub'));
    if(val==='—'){ el.textContent='—'; sub.textContent='—'; return; }
    const dr = digitalRoot(val);
    el.textContent = val;
    sub.textContent = `${dr}｜${KEYWORDS[dr]}`;
  };
  setV('#valA', r.A);
  setV('#valB', r.B);
  setV('#valC', r.C);
  setV('#valD', r.D);
  setV('#valE', r.E);

  $('#result').classList.remove('hidden');
  $('#matchResult').classList.add('hidden');
}

// --- Match render ---
function renderMatch(r1, r2){
  $('#result').classList.add('hidden');
  $('#matchResult').classList.remove('hidden');

  const mini = r => {
    const fmt = (k, v) => `${k}: ${v}${v!=='—' ? ' ('+KEYWORDS[digitalRoot(v)]+')' : ''}`;
    return `${fmt('A', r.A)}\n${fmt('B', r.B)}\n${fmt('C', r.C)}\n${fmt('D', r.D)}\n${fmt('E', r.E)}`;
  };
  $('#mRes1').textContent = mini(r1);
  $('#mRes2').textContent = mini(r2);

  // qualitative notes
  let notes = [];

  if(r1.A===r2.A && r1.B===r2.B){
    notes.push('★ 深層共鳴：雙方前世與今生頻率一致，價值觀底層極為契合。');
  } else if (digitalRoot(r1.C) === digitalRoot(r2.C)){
    notes.push('★ 潛意識默契：對事物的直覺反應與內在需求高度相似。');
  }

  const d1 = digitalRoot(r1.D), d2 = digitalRoot(r2.D);
  const isDyn = n => [1,3,5].includes(n);
  const isStb = n => [4,6,8].includes(n);

  if( (isDyn(d1) && isStb(d2)) || (isStb(d1) && isDyn(d2)) ){
    notes.push('★ 動靜互補：一方偏開創變動，另一方偏穩定結構，是良好合作組合。');
  } else if (d1===d2){
    notes.push('★ 同頻共振：表象模式相同，溝通零時差，但需注意盲點一致。');
  }

  if( ((d1===7||d1===9) && d2===5) || ((d2===7||d2===9) && d1===5) ){
    notes.push('⚠️ 節奏磨合：一方重深思與完美(7/9)，一方追求速度與自由(5)，需互相包容。');
  }

  if(notes.length===0) notes.push('雙方能量平穩，可解鎖進階指數查看更深層互動。');

  $('#matchDesc').innerHTML = notes.join('<br><br>');

  // reset lock UI
  $('#lockedArea').classList.remove('hidden');
  $('#unlockedArea').classList.add('hidden');
  $('#passError').classList.add('hidden');
  $('#passInput').value = '';
}

// score calc
function calculateScore(r1, r2){
  let score = 60;
  const root = v => v==='—' ? -1 : digitalRoot(v);
  ['A','B','C','D','E'].forEach(k => {
    if(r1[k]!=='—' && r1[k] == r2[k]) score += 6;
    else if(root(r1[k]) === root(r2[k])) score += 3;
  });
  const d1 = root(r1.D), d2 = root(r2.D);
  if((d1%2)!==(d2%2)) score += 5;
  return Math.min(100, score);
}

function drawCharts(){
  const container = $('#chartBars');
  container.innerHTML = '';
  const metrics = [
    {label: '溝通', v: 70 + Math.random()*25},
    {label: '價值', v: 65 + Math.random()*30},
    {label: '熱情', v: 60 + Math.random()*35},
  ];
  metrics.forEach(m => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = '<div class="bar-label">'+m.label+'</div><div class="bar-track"><div class="bar-fill" style="width:0%"></div></div>';
    container.appendChild(row);
    setTimeout(() => { row.querySelector('.bar-fill').style.width = m.v + '%'; }, 120);
  });
}

// tabs
function setMode(m){
  currentMode = m;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  (m==='single' ? $('#tabSingle') : $('#tabMatch')).classList.add('active');
  if(m==='single'){
    $('#fieldDate2').classList.add('hidden');
    $('#labelDate1').textContent = '西元生日 (A)';
    $('#matchResult').classList.add('hidden');
    if($('#valA').textContent !== '—') $('#result').classList.remove('hidden');
  }else{
    $('#fieldDate2').classList.remove('hidden');
    $('#labelDate1').textContent = '己方生日 (A)';
    $('#result').classList.add('hidden');
    if($('#mRes1').textContent) $('#matchResult').classList.remove('hidden');
  }
}
$('#tabSingle').addEventListener('click', () => setMode('single'));
$('#tabMatch').addEventListener('click', () => setMode('match'));

// twin toggle
$('#twinEnable').addEventListener('change', () => {
  $('#timeWrap').classList.toggle('hidden', !$('#twinEnable').checked);
});

// button actions
const btnCalc = $('#btnCalc');
function toggleLoading(is){
  const t=$('.btn-text'), l=$('.loader');
  if(is){ btnCalc.classList.add('loading'); l.classList.remove('hidden'); }
  else { btnCalc.classList.remove('loading'); l.classList.add('hidden'); }
}

btnCalc.addEventListener('click', () => {
  const d1 = readDate('#dateAD');
  if(!d1){ alert('請輸入日期'); return; }
  toggleLoading(true);
  setTimeout(() => {
    try{
      const tV = $('#twinEnable').checked ? $('#birthTime').value : null;
      const r1 = computeMaya(d1, tV);
      if(currentMode==='single'){
        renderSingle(r1);
      }else{
        const d2 = readDate('#dateAD2');
        if(!d2){ alert('請輸入對方日期'); return; }
        const r2 = computeMaya(d2, null);
        renderMatch(r1, r2);
      }
    } finally{
      toggleLoading(false);
    }
  }, 300);
});

$('#btnReset').addEventListener('click', () => {
  ['#dateAD','#dateAD2','#birthTime','#passInput'].forEach(s => { const el=$(s); if(el) el.value=''; });
  ['A','B','C','D','E'].forEach(k=>{$('#val'+k).textContent='—';$('#sub'+k).textContent='—'});
  $('#result').classList.add('hidden');
  $('#matchResult').classList.add('hidden');
  $('#twinEnable').checked = false; $('#timeWrap').classList.add('hidden');
});

// unlock
$('#btnUnlock').addEventListener('click', () => {
  const pass = $('#passInput').value;
  if(pass === '123456'){
    $('#lockedArea').classList.add('hidden');
    $('#unlockedArea').classList.remove('hidden');
    const d1 = readDate('#dateAD');
    const d2 = readDate('#dateAD2');
    const tV = $('#twinEnable').checked ? $('#birthTime').value : null;
    const r1 = computeMaya(d1, tV);
    const r2 = computeMaya(d2, null);
    const score = calculateScore(r1, r2);

    const circle = $('#scorePath'); const text = $('#scoreText');
    circle.style.strokeDasharray = score + ', 100';
    let s=0; const it = setInterval(()=>{ s++; text.textContent=s+'%'; if(s>=score) clearInterval(it); }, 10);

    drawCharts();
    $('#passError').classList.add('hidden');
  }else{
    $('#passError').classList.remove('hidden');
  }
});