// 瑪雅密碼 Lite v2：AD/ROC 皆採用 calendar 日期選擇器
// ROC 模式：使用 <input type=date> 選 AD 日期，旁顯 ROC 年提示（年 = 年-1911）

const $ = (q) => document.querySelector(q);
const calendarMode = $("#calendarMode");
const adInputs = $("#adInputs");
const rocInputs = $("#rocInputs");
const rocHint = $("#rocHint");
const btnCalc = $("#btnCalc"); // 計算按鈕

calendarMode.addEventListener("change", () => {
  if (calendarMode.value === "ad") {
    rocInputs.classList.add("hidden");
    adInputs.classList.remove("hidden");
    $("#dateROC").value = "";
    rocHint.textContent = "";
  } else {
    adInputs.classList.add("hidden");
    rocInputs.classList.remove("hidden");
    $("#dateAD").value = "";
  }
});

$("#dateROC").addEventListener("input", () => {
  const v = $("#dateROC").value;
  if (!v) { rocHint.textContent = ""; return; }
  const d = new Date(v);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear() - 1911;
    rocHint.textContent = (y >= 1) ? `提示：民國 ${y} 年` : "";
  }
});

$("#btnReset").addEventListener("click", () => {
  $("#dateAD").value = "";
  $("#dateROC").value = "";
  rocHint.textContent = "";
  $("#valA").textContent = "—";
  $("#valB").textContent = "—";
  $("#valC").textContent = "—";
  $("#valD").textContent = "—";
  $("#valE").textContent = "—";
  $("#explain").textContent = "";
  $("#result").classList.add("hidden");
});

// Loading 狀態切換
function toggleLoading(isLoading) {
  const btnText = document.querySelector(".btn-text");
  const loader = document.querySelector(".loader");
  if (isLoading) {
    if (!btnCalc.classList.contains("loading")) btnCalc.classList.add("loading");
    btnText.classList.add("hidden");
    loader.classList.remove("hidden");
  } else {
    btnCalc.classList.remove("loading");
    btnText.classList.remove("hidden");
    loader.classList.add("hidden");
  }
}

// 防重複點擊 + 模擬延遲
btnCalc.addEventListener("click", () => {
  if (btnCalc.classList.contains("loading")) return; // 避免重複觸發
  const date = readDate();
  if (!date) { alert("請用日曆選擇生日（西元或民國模式）。"); return; }
  toggleLoading(true);
  setTimeout(() => {
    try {
      const res = computeMaya(date);
      render(res);
    } finally {
      toggleLoading(false);
    }
  }, 1000);
});

function isValidYMD(y, m, d) {
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === (m - 1) && dt.getDate() === d;
}

function readDate() {
  const v = (calendarMode.value === "ad") ? $("#dateAD").value : $("#dateROC").value;
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  if (!isValidYMD(y, m, day)) return null;   // 多一道保險
  return (calendarMode.value === "ad")
    ? { y, m, d: day }
    : { y, m, d: day, roc: y - 1911 };
}

function sumDigits(n) {
  const s = String(Math.trunc(Number(n))); // 保證是整數字串
  return s.split("").reduce((a, c) => a + (isNaN(+c) ? 0 : +c), 0);
}

function computeMaya({ y, m, d }) {
  const A_raw = Math.floor((y % 100) / 10);
  const B_raw = y % 10;
  // 例外年段：1910–1921、2010–2021 → A/B 隱藏（"—"）、C=10
  const isException = (y >= 1910 && y <= 1921) || (y >= 2010 && y <= 2021);
  const C = isException ? 10 : (A_raw + B_raw);

  const Sum = sumDigits(y + m + d);
  const Dv = (Sum < 22) ? Sum : (Sum - 22);
  const Ev = (Sum < 22) ? Sum : sumDigits(Sum);

  return {
    y, m, d,
    A: isException ? "—" : String(A_raw),
    B: isException ? "—" : String(B_raw),
    C, D: Dv, E: Ev
  };
}

function render(r) {
  $("#valA").textContent = r.A;
  $("#valB").textContent = r.B;
  $("#valC").textContent = r.C;
  $("#valD").textContent = r.D;
  $("#valE").textContent = r.E;

  const explain = `計算自：${r.y}/${String(r.m).padStart(2,"0")}/${String(r.d).padStart(2,"0")}。
A/B 為年份十位/個位；1910–1921、2010–2021 例外：A/B 隱藏，C 固定為 10。
D/E 以 (Y+M+D) 的數位和：Sum<22 → D=Sum、E=Sum；否則 D=Sum-22、E=Sum 的數位和。`;
  $("#explain").textContent = explain;
  $("#result").classList.remove("hidden");
}
