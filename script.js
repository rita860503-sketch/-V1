// 工具
const $ = (q) => document.querySelector(q);

// 基本節點
const calendarMode = $("#calendarMode");
const adInputs = $("#adInputs");
const rocInputs = $("#rocInputs");
const btnCalc = $("#btnCalc");
const btnText = btnCalc.querySelector(".btn-text");
const btnLoader = btnCalc.querySelector(".loader");

// AD inputs
const dateAD = $("#dateAD");

// ROC inputs & picker
const dateROCDisplay = $("#dateROCDisplay"); // 顯示：民國 yy/mm/dd
const dateROCValue = $("#dateROCValue");     // 實值：AD yyyy-mm-dd
const rocPicker = $("#rocPicker");
const rocTitle = $("#rocTitle");
const rocPrev = $("#rocPrev");
const rocNext = $("#rocNext");
const rocToday = $("#rocToday");
const rocYearSel = $("#rocYearSel");
const rocMonthSel = $("#rocMonthSel");
const rocClose = $("#rocClose");
const rocDays = $("#rocDays");
const panelYear = $("#panelYear");
const panelMonth = $("#panelMonth");

// 狀態
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth() + 1;

// 切換模式
calendarMode.addEventListener("change", () => {
  if (calendarMode.value === "ad") {
    rocInputs.classList.add("hidden");
    adInputs.classList.remove("hidden");
    dateROCDisplay.value = "";
    dateROCValue.value = "";
  } else {
    adInputs.classList.add("hidden");
    rocInputs.classList.remove("hidden");
    dateAD.value = "";
  }
});

// 開啟 ROC Picker
dateROCDisplay.addEventListener("click", () => openRocPicker());
$("#rocClose").addEventListener("click", () => closeRocPicker());

function openRocPicker() {
  const base = dateROCValue.value ? new Date(dateROCValue.value) : new Date();
  viewYear = base.getFullYear();
  viewMonth = base.getMonth() + 1;
  panelYear.classList.add("hidden");
  panelMonth.classList.add("hidden");
  rocPicker.classList.remove("hidden");
  renderRocCalendar();
}
function closeRocPicker(){ rocPicker.classList.add("hidden"); }

function renderRocCalendar() {
  const rocYear = viewYear - 1911;
  rocTitle.textContent = `民國 ${rocYear} 年 ${String(viewMonth).padStart(2,"0")} 月`;

  const firstDay = new Date(viewYear, viewMonth - 1, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

  rocDays.innerHTML = "";
  const cells = 42;
  for (let i = 0; i < cells; i++) {
    const cell = document.createElement("button");
    let dayNum;
    if (i < startWeekday) {
      dayNum = prevMonthDays - (startWeekday - 1 - i);
      cell.classList.add("muted");
      const d = new Date(viewYear, viewMonth - 2, dayNum);
      cell.textContent = dayNum;
      cell.addEventListener("click", () => selectDate(d));
    } else if (i < startWeekday + daysInMonth) {
      dayNum = i - startWeekday + 1;
      const d = new Date(viewYear, viewMonth - 1, dayNum);
      cell.textContent = dayNum;
      const today = new Date();
      if (d.toDateString() == today.toDateString()) cell.classList.add("today");
      cell.addEventListener("click", () => selectDate(d));
    } else {
      dayNum = i - (startWeekday + daysInMonth) + 1;
      cell.classList.add("muted");
      const d = new Date(viewYear, viewMonth, dayNum);
      cell.textContent = dayNum;
      cell.addEventListener("click", () => selectDate(d));
    }
    rocDays.appendChild(cell);
  }
}

function selectDate(d){
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  const rocY = y - 1911;
  dateROCDisplay.value = `民國 ${rocY}/${String(m).padStart(2,"0")}/${String(day).padStart(2,"0")}`;
  dateROCValue.value = `${y}-${String(m).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  closeRocPicker();
}

$("#rocPrev").addEventListener("click", () => { if(viewMonth===1){viewMonth=12;viewYear--;} else viewMonth--; renderRocCalendar(); });
$("#rocNext").addEventListener("click", () => { if(viewMonth===12){viewMonth=1;viewYear++;} else viewMonth++; renderRocCalendar(); });
$("#rocToday").addEventListener("click", () => {
  const t = new Date(); viewYear = t.getFullYear(); viewMonth = t.getMonth()+1; renderRocCalendar();
});
$("#rocYearSel").addEventListener("click", () => { panelMonth.classList.add("hidden"); renderYearPanel(); });
$("#rocMonthSel").addEventListener("click", () => { panelYear.classList.add("hidden"); renderMonthPanel(); });

function renderYearPanel(){
  panelYear.innerHTML = "";
  const start = viewYear - 8;
  for (let y = start; y < start + 20; y++){
    const btn = document.createElement("button");
    btn.textContent = `民國 ${y - 1911}`;
    btn.addEventListener("click", () => { viewYear = y; panelYear.classList.add("hidden"); renderRocCalendar(); });
    panelYear.appendChild(btn);
  }
  panelYear.classList.remove("hidden");
}
function renderMonthPanel(){
  panelMonth.innerHTML = "";
  for (let m = 1; m <= 12; m++){
    const btn = document.createElement("button");
    btn.textContent = `${m} 月`;
    btn.addEventListener("click", () => { viewMonth = m; panelMonth.classList.add("hidden"); renderRocCalendar(); });
    panelMonth.appendChild(btn);
  }
  panelMonth.classList.remove("hidden");
}

// Reset
$("#btnReset").addEventListener("click", () => {
  dateAD.value = "";
  dateROCDisplay.value = "";
  dateROCValue.value = "";
  hideResult();
});
function hideResult(){
  $("#valA").textContent = "—";
  $("#valB").textContent = "—";
  $("#valC").textContent = "—";
  $("#valD").textContent = "—";
  $("#valE").textContent = "—";
  $("#explain").textContent = "";
  $("#result").classList.add("hidden");
}

// Loading
function toggleLoading(isLoading){
  if(isLoading){ btnCalc.classList.add("loading"); btnText.classList.add("hidden"); btnLoader.classList.remove("hidden"); }
  else { btnCalc.classList.remove("loading"); btnText.classList.remove("hidden"); btnLoader.classList.add("hidden"); }
}

// 計算
btnCalc.addEventListener("click", () => {
  if (btnCalc.classList.contains("loading")) return;
  const date = readDate();
  if (!date) { alert("請選擇生日（西元或民國）。"); return; }
  toggleLoading(true);
  setTimeout(() => {
    try {
      const res = computeMaya(date);
      render(res);
    } finally {
      toggleLoading(false);
    }
  }, 300);
});

function readDate(){
  if (calendarMode.value === "ad"){
    const v = dateAD.value; if(!v) return null;
    const d = new Date(v); if(isNaN(d.getTime())) return null;
    return { y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate() };
  } else {
    const v = dateROCValue.value; if(!v) return null;
    const d = new Date(v); if(isNaN(d.getTime())) return null;
    return { y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate(), roc:d.getFullYear()-1911 };
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
  $("#valA").textContent = r.A; $("#valB").textContent = r.B; $("#valC").textContent = r.C; $("#valD").textContent = r.D; $("#valE").textContent = r.E;
  const explain = `計算自：${r.y}/${String(r.m).padStart(2,"0")}/${String(r.d).padStart(2,"0")}。
A/B 為年份十位/個位；1910–1921、2010–2021 例外：A/B 隱藏，C 固定為 10。
D/E 以 (Y+M+D) 的數位和：Sum<22 → D=Sum、E=Sum；否則 D=Sum-22、E=Sum 的數位和。`;
  $("#explain").textContent = explain; $("#result").classList.remove("hidden");
}
