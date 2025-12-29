const $ = (q)=>document.querySelector(q);

const KEYWORDS = {0:"源初",1:"開創",2:"合作",3:"創意",4:"穩定",5:"變動",6:"責任",7:"覺察",8:"權能",9:"完成"};

function sumDigits(n){
  return String(Math.abs(n)).split("").reduce((a,c)=>a+(parseInt(c,10)||0),0);
}
function digitalRoot(n){
  if(n==="—") return null;
  const v = Math.abs(parseInt(n,10));
  return v%10;
}
function parseDateInput(el){
  const v = el.value;
  if(!v) return null;
  const d = new Date(v);
  if(isNaN(d.getTime())) return null;
  return {y:d.getFullYear(), m:(d.getMonth()+1), d:d.getDate()};
}
function parseHHMM(el){
  const v = el.value;
  if(!v) return {hh:0, mm:0};
  const [hh, mm] = v.split(":").map(Number);
  return {
    hh: Number.isFinite(hh)?hh:0,
    mm: Number.isFinite(mm)?mm:0
  };
}
function compute({y,m,d}, useTwin, hh, mm){
  // A/B
  const A_raw = Math.floor((y%100)/10);
  const B_raw = y%10;
  const exception = (y>=1910 && y<=1921) || (y>=2010 && y<=2021);
  const A = exception ? "—" : String(A_raw);
  const B = exception ? "—" : String(B_raw);
  const C = exception ? 10 : (A_raw + B_raw);

  // Sum
  let N = y + m + d;
  if(useTwin){
    N += (hh + mm); // 雙胞胎分流：時+分
  }
  const Sum = sumDigits(N);
  let D, E;
  if(Sum < 22){ D=Sum; E=Sum; } else { D=Sum-22; E=sumDigits(Sum); }
  return {A,B,C,D,E};
}
function applyToBox(prefix, r){
  ["A","B","C","D","E"].forEach(k=>{
    const val = r[k];
    $("#"+prefix+"_"+k).textContent = val;
    if(val === "—"){ $("#"+prefix+"_"+k+"_kw").textContent = "—"; }
    else{
      const dr = digitalRoot(val);
      $("#"+prefix+"_"+k+"_kw").textContent = `${dr}｜${KEYWORDS[dr]}`;
    }
  });
}

// UI
const twinA = $("#twinA"), twinB = $("#twinB");
const timeA = $("#timeA"), timeB = $("#timeB");
twinA.addEventListener("change", ()=>{ timeA.disabled = !twinA.checked; });
twinB.addEventListener("change", ()=>{ timeB.disabled = !twinB.checked; });

const btn = $("#btnCalc");
function setLoading(x){
  const t = btn.querySelector('.btn-text');
  const l = btn.querySelector('.loader');
  if(x){ btn.classList.add('loading'); t.classList.add('hidden'); l.classList.remove('hidden'); }
  else { btn.classList.remove('loading'); t.classList.remove('hidden'); l.classList.add('hidden'); }
}

$("#btnReset").addEventListener("click", ()=>{
  $("#dateA").value = "";
  $("#dateB").value = "";
  twinA.checked = false; twinB.checked=false;
  timeA.value = ""; timeB.value = "";
  timeA.disabled = true; timeB.disabled = true;
  $("#result").classList.add("hidden");
});

btn.addEventListener("click", ()=>{
  const dA = parseDateInput($("#dateA"));
  const dB = parseDateInput($("#dateB"));
  if(!dA || !dB){ alert("請輸入雙方的西元生日。"); return; }

  setLoading(true);
  setTimeout(()=>{
    const tA = parseHHMM(timeA);
    const tB = parseHHMM(timeB);
    const rA = compute(dA, twinA.checked, tA.hh, tA.mm);
    const rB = compute(dB, twinB.checked, tB.hh, tB.mm);
    applyToBox("A", rA);
    applyToBox("B", rB);
    $("#result").classList.remove("hidden");
    setLoading(false);
  }, 400);
});
