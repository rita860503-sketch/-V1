// 工具
const $ = (sel) => document.querySelector(sel);
const KEYWORDS = {0:"源初",1:"開創",2:"合作",3:"創意",4:"穩定",5:"變動",6:"責任",7:"覺察",8:"權能",9:"完成"};

function sumDigits(n){
  return String(Math.abs(n)).split("").reduce((a,c)=>a + (parseInt(c,10)||0), 0);
}
function digitalRoot(n){
  if(n==="—") return null;
  let v = Math.abs(parseInt(n,10));
  return v % 10;
}
function isExceptionYear(y){
  return (y>=1910 && y<=1921) || (y>=2010 && y<=2021);
}
function parseDateValue(inputEl){
  const v = inputEl.value;
  if(!v) return null;
  const d = new Date(v);
  if(isNaN(d.getTime())) return null;
  return {y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate()};
}
function hhmmToOffset(timeEl){
  const tv = timeEl?.value || "";
  if(!tv) return 0;
  const [hh,mm] = tv.split(":").map(x=>parseInt(x,10));
  const h = Number.isFinite(hh) ? hh : 0;
  const m = Number.isFinite(mm) ? mm : 0;
  return h + m;
}

// 規則：加總法 (年+月+日 [+ 時 + 分]), Sum取位數和 -> D/E
function computeMaya(y,m,d, offsetHM = 0){
  const tens = Math.floor((y%100)/10);
  const ones = y%10;

  let A="—",B="—",C=10;
  if(!isExceptionYear(y)){
    A = String(tens);
    B = String(ones);
    C = tens + ones;
  }

  let total = y + m + d + offsetHM;
  const Sum = sumDigits(total);

  let D, E;
  if(Sum < 22){
    D = Sum;
    E = Sum;
  }else{
    D = Sum - 22;
    E = sumDigits(Sum);
  }
  return {A,B,C,D,E};
}

// 渲染
function fillSet(prefix, r){
  const keys = ["A","B","C","D","E"];
  keys.forEach(k=>{
    const val = r[k];
    $(`#${prefix}${k}`).textContent = val;
    const subEl = $(`#${prefix}${k}s`);
    if(subEl){
      if(val==="—"){
        subEl.textContent = "—";
      }else{
        const dr = digitalRoot(val);
        subEl.textContent = `${dr}｜${KEYWORDS[dr]}`;
      }
    }
  });
}

// 互動控制
const modeSel = $("#mode");
const singleInputs = $("#singleInputs");
const matchInputs = $("#matchInputs");
const resultSingle = $("#resultSingle");
const resultMatch = $("#resultMatch");

modeSel.addEventListener("change", () => {
  const m = modeSel.value;
  singleInputs.classList.toggle("hidden", m!=="single");
  matchInputs.classList.toggle("hidden", m!=="match");

  resultSingle.classList.add("hidden");
  resultMatch.classList.add("hidden");
});

// Twin toggles
function attachTwinToggle(checkEl, wrapEl){
  checkEl.addEventListener("change", ()=>{
    wrapEl.hidden = !checkEl.checked;
  });
}
attachTwinToggle($("#twinA"), $("#timeWrapA"));
attachTwinToggle($("#twinA2"), $("#timeWrapA2"));
attachTwinToggle($("#twinB"), $("#timeWrapB"));

// 清空
$("#btnReset").addEventListener("click", ()=>{
  ["dateA","dateA2","dateB","timeA","timeA2","timeB"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  ["twinA","twinA2","twinB"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.checked = false;
  });
  $("#timeWrapA").hidden = true;
  $("#timeWrapA2").hidden = true;
  $("#timeWrapB").hidden = true;
  resultSingle.classList.add("hidden");
  resultMatch.classList.add("hidden");
});

// 計算
$("#btnCalc").addEventListener("click", ()=>{
  if(modeSel.value === "single"){
    const dA = parseDateValue($("#dateA"));
    if(!dA){ alert("請輸入西元生日（本人）"); return; }
    const offA = $("#twinA").checked ? hhmmToOffset($("#timeA")) : 0;
    const rA = computeMaya(dA.y, dA.m, dA.d, offA);
    fillSet("", {A:rA.A,B:rA.B,C:rA.C,D:rA.D,E:rA.E}); // unused
    // 單人區塊的 id 接尾碼 1
    fillSet("", {}); // no-op
    $("#A1").textContent = rA.A;
    $("#B1").textContent = rA.B;
    $("#C1").textContent = rA.C;
    $("#D1").textContent = rA.D;
    $("#E1").textContent = rA.E;
    const map = {A:"A1s",B:"B1s",C:"C1s",D:"D1s",E:"E1s"};
    Object.entries({A:rA.A,B:rA.B,C:rA.C,D:rA.D,E:rA.E}).forEach(([k,v]) => {
      const el = document.getElementById(map[k]);
      if(v==="—"){ el.textContent = "—"; }
      else { const dr = digitalRoot(v); el.textContent = `${dr}｜${KEYWORDS[dr]}`; }
    });
    resultSingle.classList.remove("hidden");
    resultMatch.classList.add("hidden");
  }else{
    const dA = parseDateValue($("#dateA2"));
    const dB = parseDateValue($("#dateB"));
    if(!dA || !dB){ alert("請輸入西元生日（本人與對方）"); return; }
    const offA = $("#twinA2").checked ? hhmmToOffset($("#timeA2")) : 0;
    const offB = $("#twinB").checked ? hhmmToOffset($("#timeB")) : 0;
    const rA = computeMaya(dA.y, dA.m, dA.d, offA);
    const rB = computeMaya(dB.y, dB.m, dB.d, offB);

    // 本人結果
    $("#A2r").textContent = rA.A; $("#B2r").textContent = rA.B; $("#C2r").textContent = rA.C; $("#D2r").textContent = rA.D; $("#E2r").textContent = rA.E;
    [["A2rs",rA.A],["B2rs",rA.B],["C2rs",rA.C],["D2rs",rA.D],["E2rs",rA.E]].forEach(([id,v])=>{
      const el = document.getElementById(id);
      if(v==="—") el.textContent="—"; else { const dr = digitalRoot(v); el.textContent = `${dr}｜${KEYWORDS[dr]}`; }
    });
    // 對方結果
    $("#A3r").textContent = rB.A; $("#B3r").textContent = rB.B; $("#C3r").textContent = rB.C; $("#D3r").textContent = rB.D; $("#E3r").textContent = rB.E;
    [["A3rs",rB.A],["B3rs",rB.B],["C3rs",rB.C],["D3rs",rB.D],["E3rs",rB.E]].forEach(([id,v])=>{
      const el = document.getElementById(id);
      if(v==="—") el.textContent="—"; else { const dr = digitalRoot(v); el.textContent = `${dr}｜${KEYWORDS[dr]}`; }
    });

    resultSingle.classList.add("hidden");
    resultMatch.classList.remove("hidden");
  }
});
