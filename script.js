const $ = (q) => document.querySelector(q);

// ----- Nodes -----
const calendarMode = $("#calendarMode");
const adInputs = $("#adInputs");
const rocInputs = $("#rocInputs");
const btnCalc = $("#btnCalc");
const btnText = btnCalc.querySelector(".btn-text");
const btnLoader = btnCalc.querySelector(".loader");
const calcAlgo = $("#calcAlgo");

// AD
const dateAD = $("#dateAD");

// ROC inputs
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

// ---- Mode switch ----
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

// ---- ROC picker open with smart start month ----
rocMDDisplay.addEventListener("click", () => {
  const ry = parseInt(rocYearInput.value, 10);
  if (!Number.isFinite(ry) || ry < 1 || ry > 200) {
    alert("請先輸入正確的民國年份（1–200，例如：86）");
    rocYearInput.focus();
    return;
  }
  const adYear = 1911 + ry;
  viewYear = adYear;

  let startMonth = 1;
  const chosen = dateROCValue?.value;
  if (chosen) {
    const d = new Date(chosen);
    if (!isNaN(d.getTime()) && d.getFullYear() === adYear) {
      startMonth = d.getMonth() + 1;
    }
  } else {
    const today = new Date();
    if (today.getFullYear() === adYear) {
      startMonth = today.getMonth() + 1;
    }
  }
  viewMonth = Math.min(12, Math.max(1, startMonth));
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

// ---- Reset ----
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

// ---- Loading ----
function toggleLoading(isLoading){
  if (isLoading){ btnCalc.classList.add("loading"); btnText.classList.add("hidden"); btnLoader.classList.remove("hidden"); }
  else { btnCalc.classList.remove("loading"); btnText.classList.remove("hidden"); btnLoader.classList.add("hidden"); }
}

// ---- Math helpers ----
function sumDigits(n) {
  const s = String(Math.abs(Number(n) || 0));
  return [...s].reduce((a, c) => a + (parseInt(c, 10) || 0), 0);
}

// %10 digital root mapping for keywords
function digitalRoot(n) {
  if (n === "—") return null;
  const val = Number(n);
  if (!Number.isFinite(val)) return null;
  return ((val % 10) + 10) % 10;
}

const KEYWORDS = {
  0:"源初", 1:"開創", 2:"合作", 3:"創意", 4:"穩定",
  5:"變動", 6:"責任", 7:"覺察", 8:"權能", 9:"完成"
};

// ---- Compute ----
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
  }, 220);
});

function readDate(){
  if (calendarMode.value === "ad"){
    const v = dateAD.value; if(!v) return null;
    const d = new Date(v); if(isNaN(d.getTime())) return null;
    return { y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate() };
  } else {
    const ry = parseInt(rocYearInput.value, 10);
    if (!Number.isFinite(ry) || ry < 1) return null;
    const v = dateROCValue.value; if(!v) return null;
    const d = new Date(v); if(isNaN(d.getTime())) return null;
    const adY = 1911 + ry;
    return { y: adY, m: d.getMonth()+1, d: d.getDate(), roc: ry };
  }
}

function getBirthTimeHHMM(){
  if (!(twinEnable && twinEnable.checked && birthTime && birthTime.value)) return 0;
  const [hh, mm] = birthTime.value.split(":").map(Number);
  return (Number.isFinite(hh) ? hh : 0) + (Number.isFinite(mm) ? mm : 0);
}

function computeMaya({ y, m, d }){
  // Exception years
  const isException = (y >= 1910 && y <= 1921) || (y >= 2010 && y <= 2021);
  const A_raw = Math.floor((y % 100) / 10);
  const B_raw = y % 10;
  const C = isException ? 10 : (A_raw + B_raw);

  // D/E algorithm
  const algo = (calcAlgo && calcAlgo.value) || "component_sum";
  const hhmm = getBirthTimeHHMM();

  let Sum;
  if (algo === "component_sum") {
    // N = 年 + 月 + 日 + (HH + MM)
    const N = y + m + d + hhmm;
    Sum = sumDigits(N);
  } else if (algo === "concat_8") {
    // 八位串接：YYYYMMDD 再 + (HH+MM)，最後做位數和
    const eight = Number(String(y) + String(m).padStart(2, "0") + String(d).padStart(2, "0")) + hhmm;
    Sum = sumDigits(eight);
  } else {
    // fallback
    const N = y + m + d + hhmm;
    Sum = sumDigits(N);
  }

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
  // main numbers
  $("#valA").textContent = r.A;
  $("#valB").textContent = r.B;
  $("#valC").textContent = r.C;
  $("#valD").textContent = r.D;
  $("#valE").textContent = r.E;

  // sub lines
  const setSub = (id, v) => {
    const el = document.querySelector(id);
    if (v === "—"){ el.textContent = "—"; return; }
    const dr = digitalRoot(v);
    el.textContent = (dr === null) ? "—" : `${dr} | ${KEYWORDS[dr] ?? ""}`;
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
