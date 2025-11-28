// 工具
const $ = (q) => document.querySelector(q);

// 基本節點
const calendarMode = $("#calendarMode");
const adInputs = $("#adInputs");
const rocInputs = $("#rocInputs");
const btnCalc = $("#btnCalc");
const btnText = btnCalc.querySelector(".btn-text");
const btnLoader = btnCalc.querySelector(".loader");

// AD
const dateAD = $("#dateAD");

// ROC：年輸入 + 月日選擇
const rocYearInput = $("#rocYear");
const rocMDDisplay = $("#rocMDDisplay");
const dateROCValue = $("#dateROCValue"); // AD ISO yyyy-mm-dd

// Picker（年固定）
const rocPicker = $("#rocPicker");
const rocTitle = $("#rocTitle");
const rocPrev = $("#rocPrev");
const rocNext = $("#rocNext");
const rocToday = $("#rocToday");
const rocClose = $("#rocClose");
const rocDays = $("#rocDays");

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth() + 1;

// 模式切換
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

// 點擊月日輸入 → 開 Picker（固定年）
rocMDDisplay.addEventListener("click", () => {
  const ry = parseInt(rocYearInput.value, 10);
  if (isNaN(ry) || ry <= 0) { alert("請先輸入民國年份（例如：86）。"); return; }
  viewYear = 1911 + ry; // 轉 AD 年
  const base = dateROCValue.value ? new Date(dateROCValue.value) : new Date(viewYear, new Date().getMonth(), 1);
  viewMonth = base.getMonth() + 1;
  openPicker();
});

function openPicker(){
  rocPicker.classList.remove("hidden");
  renderMonth();
}
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

// 上/下一月（限制在該年）
rocPrev.addEventListener("click", () => {
  if (viewMonth === 1) return; // 不跨年
  viewMonth--; renderMonth();
});
rocNext.addEventListener("click", () => {
  if (viewMonth === 12) return; // 不跨年
  viewMonth++; renderMonth();
});
rocToday.addEventListener("click", () => {
  const t = new Date();
  if (t.getFullYear() !== viewYear) return; // 今天不在此年則忽略
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
  $("#valA").textContent = "—";
  $("#valB").textContent = "—";
  $("#valC").textContent = "—";
  $("#valD").textContent = "—";
  $("#valE").textContent = "—";
  $("#result").classList.add("hidden");
}

// Loading
function toggleLoading(isLoading){
  if (isLoading){ btnCalc.classList.add("loading"); btnText.classList.add("hidden"); btnLoader.classList.remove("hidden"); }
  else { btnCalc.classList.remove("loading"); btnText.classList.remove("hidden"); btnLoader.classList.add("hidden"); }
}

// 計算
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
    // 強制把年替換為（1911 + 民國年），避免跨年殘值
    const adY = 1911 + ry;
    const m = d.getMonth() + 1, day = d.getDate();
    return { y: adY, m, d: day, roc: ry };
  }
}

function sumDigits(n){ return String(Math.trunc(Number(n))).split("").reduce((a,c)=>a+(isNaN(+c)?0:+c),0); }
function computeMaya({ y, m, d }){
  const A_raw = Math.floor((y % 100) / 10);
  const B_raw = y % 10;
  const isException = (y >= 1910 && y <= 1921) || (y >= 2010 && y <= 2021);
  const C = isException ? 10 : (A_raw + B_raw);
  const Sum = sumDigits(y + m + d);
  const Dv = (Sum < 22) ? Sum : (Sum - 22);
  const Ev = (Sum < 22) ? Sum : sumDigits(Sum);
  return { y,m,d, A: isException ? "—" : String(A_raw), B: isException ? "—" : String(B_raw), C, D:Dv, E:Ev };
}
function render(r){
  $("#valA").textContent = r.A;
  $("#valB").textContent = r.B;
  $("#valC").textContent = r.C;
  $("#valD").textContent = r.D;
  $("#valE").textContent = r.E;
  $("#result").classList.remove("hidden");
}
