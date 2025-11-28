const $ = (q) => document.querySelector(q);

// ----- UI nodes -----
const calendarMode = $("#calendarMode");
const adInputs = $("#adInputs");
const rocInputs = $("#rocInputs");
const btnCalc = $("#btnCalc");
const btnText = btnCalc.querySelector(".btn-text");
const btnLoader = btnCalc.querySelector(".loader");

// AD input
const dateAD = $("#dateAD");

// ROC input: year + month/day picker
const rocYearInput = $("#rocYear");
const rocMDDisplay = $("#rocMDDisplay");
const dateROCValue = $("#dateROCValue");

// Twins
const twinEnable = $("#twinEnable");
const timeWrap = $("#timeWrap");
const birthTime = $("#birthTime");
twinEnable.addEventListener("change", () => {
  timeWrap.classList.toggle("hidden", !twinEnable.checked);
});

// Picker modal
const rocPicker = $("#rocPicker");
const rocTitle = $("#rocTitle");
const rocPrev = $("#rocPrev");
const rocNext = $("#rocNext");
const rocToday = $("#rocToday");
const rocClose = $("#rocClose");
const rocDays = $("#rocDays");

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth() + 1;

// Mode switch
calendarMode.addEventListener("change", () => {
  if (calendarMode.value === "ad") {
    rocInputs.classList.add("hidden");
    adInputs.classList.remove("hidden");
    clearROC();
  } else {
    adInputs.classList.add("hidden");
    rocInputs.classList.remove("hidden");
    dateAD.value = "";
  }
});

function clearROC(){
  rocYearInput.value = "";
  rocMDDisplay.value = "";
  dateROCValue.value = "";
}

// Click ROC MD input to open picker
rocMDDisplay.addEventListener("click", () => {
  const ry = parseInt(rocYearInput.value, 10);
  if (isNaN(ry) || ry <= 0) { alert("請先輸入民國年份（例如：86）。"); return; }
  viewYear = 1911 + ry;
  const base = dateROCValue.value ? new Date(dateROCValue.value) : new Date(viewYear, new Date().getMonth(), 1);
  viewMonth = base.getMonth() + 1;
  openPicker();
});

function openPicker(){ rocPicker.classList.remove("hidden"); renderMonth(); }
function closePicker(){ rocPicker.classList.add("hidden"); }

function renderMonth(){
  const rocY = viewYear - 1911;
  rocTitle.textContent = `民國 ${rocY} 年 ${String(viewMonth).padStart(2,"0")} 月`;
  const first = new Date(viewYear, viewMonth - 1, 1);
  const startW = first.getDay();
  const daysInM = new Date(viewYear, viewMonth, 0).getDate();
  const prevDays = new Date(viewYear, viewMonth - 1, 0).getDate();
  rocDays.innerHTML = "";
  const cells = 42;
  for (let i=0;i<cells;i++){
    const btn = document.createElement("button");
    let dayNum;
    if (i < startW){
      dayNum = prevDays - (startW - 1 - i);
      btn.classList.add("muted");
      const d = new Date(viewYear, viewMonth - 2, dayNum);
      btn.textContent = dayNum;
      btn.addEventListener("click", () => selectMD(d));
    } else if (i < startW + daysInM){
      dayNum = i - startW + 1;
      const d = new Date(viewYear, viewMonth - 1, dayNum);
      btn.textContent = dayNum;
      const today = new Date();
      if (d.toDateString() === today.toDateString()) btn.classList.add("today");
      btn.addEventListener("click", () => selectMD(d));
    } else {
      dayNum = i - (startW + daysInM) + 1;
      btn.classList.add("muted");
      const d = new Date(viewYear, viewMonth, dayNum);
      btn.textContent = dayNum;
      btn.addEventListener("click", () => selectMD(d));
    }
    rocDays.appendChild(btn);
  }
}

function selectMD(d){
  const rocY = viewYear - 1911;
  rocMDDisplay.value = `民國 ${rocY}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
  dateROCValue.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  closePicker();
}

// Prev/Next (stay in year)
rocPrev.addEventListener("click", () => { if (viewMonth === 1) return; viewMonth--; renderMonth(); });
rocNext.addEventListener("click", () => { if (viewMonth === 12) return; viewMonth++; renderMonth(); });
rocToday.addEventListener("click", () => {
  const t = new Date();
  if (t.getFullYear() !== viewYear) return;
  viewMonth = t.getMonth() + 1;
  renderMonth();
});
rocClose.addEventListener("click", closePicker);

// Reset
$("#btnReset").addEventListener("click", () => {
  dateAD.value = "";
  clearROC();
  hideResult();
});

function hideResult(){
  ["A","B","C","D","E"].forEach(k=>{
    document.querySelector("#val"+k).textContent = "—";
    document.querySelector("#sub"+k).textContent = "—";
  });
  $("#doneMsg").textContent = "";
  $("#result").classList.add("hidden");
}

// Loading
function toggleLoading(isLoading){
  if (isLoading){ btnCalc.classList.add("loading"); btnText.classList.add("hidden"); btnLoader.classList.remove("hidden"); }
  else { btnCalc.classList.remove("loading"); btnText.classList.remove("hidden"); btnLoader.classList.add("hidden"); }
}

// Digit sum & digital root
function sumDigits(n){
  return String(Math.trunc(Number(n))).split("").reduce((a,c)=>a+(isNaN(+c)?0:+c),0);
}
function digitalRoot(n){
  n = Math.abs(parseInt(n,10)||0);
  while(n>=10){ n = String(n).split("").reduce((a,c)=>a+(+c||0),0); }
  return n;
}

// Keywords 0-9
const KEYWORDS = {
  0:"源初",1:"創始",2:"連結",3:"溝通",4:"結構",5:"變動",6:"責任",7:"覺察",8:"力量",9:"完成"
};

// Compute
btnCalc.addEventListener("click", () => {
  if (btnCalc.classList.contains("loading")) return;
  const date = readDate();
  if (!date) { alert("請輸入完整生日（西元或民國年 + 月/日）。"); return; }
  toggleLoading(true);
  setTimeout(() => {
    try{
      const res = computeMaya(date);
      render(res);
    } finally {
      toggleLoading(false);
    }
  }, 250);
});

function readDate(){
  if (calendarMode.value === "ad"){
    const v = dateAD.value; if(!v) return null;
    const d = new Date(v); if(isNaN(d.getTime())) return null;
    return { y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate() };
  } else {
    const ry = parseInt(rocYearInput.value, 10);
    if (isNaN(ry) || ry <= 0) return null;
    const v = dateROCValue.value; if(!v) return null;
    const d = new Date(v); if(isNaN(d.getTime())) return null;
    const adY = 1911 + ry;
    return { y: adY, m: d.getMonth()+1, d: d.getDate(), roc: ry };
  }
}

function computeMaya({ y, m, d }){
  // Exceptions
  const isException = (y >= 1910 && y <= 1921) || (y >= 2010 && y <= 2021);
  const A_raw = Math.floor((y % 100) / 10);
  const B_raw = y % 10;
  const C = isException ? 10 : (A_raw + B_raw);

  // Twins HH+MM
  let hhmm = 0;
  if (twinEnable && twinEnable.checked && birthTime && birthTime.value){
    const [hh, mm] = birthTime.value.split(":").map(v=>parseInt(v,10));
    if (!isNaN(hh)) hhmm += hh;
    if (!isNaN(mm)) hhmm += mm;
  }

  // N = Y+M+D+(HH+MM); Sum = digit sum of N
  const N = y + m + d + hhmm;
  const Sum = sumDigits(N);
  const D = (Sum < 22) ? Sum : (Sum - 22);
  const E = (Sum < 22) ? Sum : sumDigits(Sum);

  return {
    y,m,d,
    A: isException ? "—" : String(A_raw),
    B: isException ? "—" : String(B_raw),
    C, D, E
  };
}

function render(r){
  // Main numbers
  $("#valA").textContent = r.A;
  $("#valB").textContent = r.B;
  $("#valC").textContent = r.C;
  $("#valD").textContent = r.D;
  $("#valE").textContent = r.E;

  // Sub lines
  const setSub = (id, v) => {
    const el = document.querySelector(id);
    if (v === "—"){ el.textContent = "—"; return; }
    const dr = digitalRoot(v);
    const word = KEYWORDS[dr] ?? "";
    el.textContent = `${dr} | ${word}`;
  };
  setSub("#subA", r.A);
  setSub("#subB", r.B);
  setSub("#subC", r.C);
  setSub("#subD", r.D);
  setSub("#subE", r.E);

  // Done
  $("#doneMsg").textContent = "完成計算。";
  $("#result").classList.remove("hidden");
}
