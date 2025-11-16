# 瑪雅密碼計算器（Cosmic Lite）— Scheme A

- 單檔前端（無後端）：支援民國/西元、雙胞胎時分
- **D/E 計算法（方案A 命名）**
  - 加總法（年＋月＋日[＋時＋分]）
  - 八位串接法（YYYYMMDD）
- 視覺：宇宙星空色（星雲＋三層閃爍星點）、九宮格結果卡、思源黑體
- 可直接部署 GitHub Pages / Netlify

## 計算規則摘要
- A = 西元年的十位數、B = 西元年的個位數；C = A + B（1910–1921、2010–2021 例外：A/B 隱藏、C=10）
- D/E（加總法）：N = 年＋月＋日（雙胞胎再加 時＋分）→ 位數和 Sum
- D/E（八位串接法）：Sum = 位數和(YYYY) + 位數和(MM) + 位數和(DD)
- 後段：Sum < 22 → D=Sum,E=Sum；Sum ≥ 22 → D=Sum−22,E=位數和(Sum)

## GitHub Pages 部署
1. 新建公開 repo，將 `index.html` 與這份 `README.md` 放在根目錄
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save
3. 用 `https://<user>.github.io/<repo>/` 開啟；Canva 可直接嵌入

## 版本
- 1.3.1-lite (Scheme A) · Build 2025-11-16 10:18
