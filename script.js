// 工具
const $ = (q)=>document.querySelector(q);
const KEYWORDS = {0:"源初",1:"開創",2:"合作",3:"創意",4:"穩定",5:"變動",6:"責任",7:"覺察",8:"權能",9:"完成"};

function sumDigits(n){
  return String(Math.abs(n)).split('').reduce((a,c)=>a+(parseInt(c,10)||0),0);
}
function digitalRoot(n){
  if(n==="—") return null;
  const v = Math.abs(parseInt(n,10));
  return v%10;
}
function getHHMM(timeStr){
  if(!timeStr) return 0;
  const [hhStr, mmStr] = timeStr.split(':');
  const hh = parseInt(hhStr,10);
  const mm = parseInt(mmStr,10);
  // 修正：mm 寫反的問題
  return (Number.isFinite(hh)?hh:0) + (Number.isFinite(mm)?mm:0);
}
function computeOne({y,m,d}, hhmm=0){
  const isException = (y>=1910 && y<=1921) || (y>=2010 && y<=2021);
  const A = isException ? "—" : String(Math.floor((y%100)/10));
  const B = isException ? "—" : String(y%10);
  const C = isException ? 10 : (Math.floor((y%100)/10) + (y%10));

  const N = y + m + d + (hhmm||0);
  const S = sumDigits(N);
  let D,E;
  if(S<22){ D=S; E=S; } else { D=S-22; E=sumDigits(S); }
  return {A,B,C,D,E};
}
function parseDateInput(inputEl){
  const v = inputEl.value;
  if(!v) return null;
  const d = new Date(v);
  if(isNaN(d.getTime())) return null;
  return {y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate()};
}
function renderSet(prefix, r){
  const map = {A:'A',B:'B',C:'C',D:'D',E:'E'};
  for(const k in map){
    const id = `${prefix}${map[k]}`;
    const id2 = `${prefix}${map[k]}2`;
    document.getElementById(id).textContent = r[k];
    if(r[k]==="—"){
      document.getElementById(id2).textContent = "—";
    }else{
      const dr = digitalRoot(r[k]);
      document.getElementById(id2).textContent = `${dr}｜${KEYWORDS[dr]}`;
    }
  }
}

// Tabs
const tabSingle = $("#tabSingle");
const tabMatch  = $("#tabMatch");
const panelSingle = $("#panelSingle");
const panelMatch  = $("#panelMatch");

tabSingle.addEventListener("click", ()=>{
  tabSingle.classList.add("active");
  tabMatch.classList.remove("active");
  panelSingle.classList.remove("hidden");
  panelMatch.classList.add("hidden");
});
tabMatch.addEventListener("click", ()=>{
  tabMatch.classList.add("active");
  tabSingle.classList.remove("active");
  panelMatch.classList.remove("hidden");
  panelSingle.classList.add("hidden");
});

// 單人：雙胞欄位啟用控制
const sTwin = $("#sTwin");
const sTime = $("#sTime");
if(sTwin){
  sTwin.addEventListener("change", ()=>{
    sTime.disabled = !sTwin.checked;
    if(!sTwin.checked) sTime.value = "";
  });
}

// 合盤：雙胞欄位啟用控制（A/B 各自）
const twinA = $("#twinA"), birthTimeA = $("#birthTimeA");
const twinB = $("#twinB"), birthTimeB = $("#birthTimeB");
if(twinA){
  twinA.addEventListener("change", ()=>{
    birthTimeA.disabled = !twinA.checked;
    if(!twinA.checked) birthTimeA.value = "";
  });
}
if(twinB){
  twinB.addEventListener("change", ()=>{
    birthTimeB.disabled = !twinB.checked;
    if(!twinB.checked) birthTimeB.value = "";
  });
}

// 單人計算
$("#btnCalcSingle").addEventListener("click", ()=>{
  const dt = parseDateInput($("#sDate"));
  if(!dt){ alert("請先選擇西元生日"); return; }
  const hhmm = sTwin.checked ? getHHMM(sTime.value) : 0;
  const r = computeOne(dt, hhmm);
  renderSet("s", r);
  $("#resultSingle").classList.remove("hidden");
});
$("#btnResetSingle").addEventListener("click", ()=>{
  $("#sDate").value = ""; sTwin.checked = false; sTime.value=""; sTime.disabled=true;
  $("#resultSingle").classList.add("hidden");
});

// 合盤計算
$("#btnCalcMatch").addEventListener("click", ()=>{
  const aDt = parseDateInput($("#aDate"));
  const bDt = parseDateInput($("#bDate"));
  if(!aDt || !bDt){ alert("請先輸入 A 與 B 的西元生日"); return; }

  const hhmmA = twinA.checked ? getHHMM(birthTimeA.value) : 0;
  const hhmmB = twinB.checked ? getHHMM(birthTimeB.value) : 0;

  const aRes = computeOne(aDt, hhmmA);
  const bRes = computeOne(bDt, hhmmB);

  renderSet("a", aRes);
  renderSet("b", bRes);
  $("#resultMatch").classList.remove("hidden");
});
$("#btnResetMatch").addEventListener("click", ()=>{
  $("#aDate").value=""; $("#bDate").value="";
  twinA.checked=false; birthTimeA.value=""; birthTimeA.disabled=true;
  twinB.checked=false; birthTimeB.value=""; birthTimeB.disabled=true;
  $("#resultMatch").classList.add("hidden");
});
