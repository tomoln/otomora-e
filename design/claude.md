# プロジェクト現状 (otomora-e)

## 概要
Electronアプリ。`npm start` で起動。win1のみ最初に表示。

## ウィンドウ構成
| Win | 役割 | frame |
|-----|------|-------|
| win1 | メイン画面・D&Dドロップ受信・閉じるとアプリ終了 | あり |
| win2 | assets/audio・assets/json のファイル一覧・ドラッグ元 | なし |
| win3 | ログコンソール（成功=緑/失敗=赤、追記式） | なし |
| win4 | JSON可視化（縦書き・word=accent色/mora=text色・等間隔アニメ） | なし |
| win5 | 96マスグリッド(16列×6行)・モーラ表示・BPM連動点灯・Standard/Groupモード | なし |
| win6 | BPMメーター(デフォ120)・16stepシーケンサー・スウィング・Tempo/Handモード | なし |
| win7 | カラーパレット選択（10種）・全ウィンドウに一括適用 | なし |
| win8 | モーラフロー（縦書き390スロット・BPM連動書き込み・単語accent表示） | なし |
| win9 | フォントセレクター（5種）・全ウィンドウに一括適用 | なし |

win2〜9はView menuで表示/非表示切り替え（起動時は非表示）。
win2〜9はframeless、bodyに `-webkit-app-region: drag` でドラッグ移動可。

## フォルダ構成
```
src/
  main/
    windowManager.js   # BrowserWindow生成・管理（win1〜9）
    ipcHandlers.js     # ipc中継・JSONロード・グリッド生成・パレットbroadcast
    logger.js          # win3へログ送信
    menuBuilder.js     # Viewメニュー（win2〜7）
  preload/
    preload1〜9.js     # contextBridgeでapi公開
  renderer/
    window1〜9/
      index.html
      renderer.js
assets/
  audio/  # .wav
  json/   # .json（audioと同名）
```

## データフロー
1. win2からaudioファイルをwin1にD&D
2. win1 → main: `try-load-file`
3. main: audioを読む → 同名JSONを読む
4. → win1: `load-result`（OK/NG表示）
5. → win3: ログ送信
6. → win4: `json-data`（word+mora縦書きアニメ）
7. → win5: `grid-data`（96マスにmora配置）

## win5グリッドのmora配置ルール
- `grid_count=0` → スキップ
- `grid_count=1` → 1マス使用、文字を入れる
- `grid_count=2` → 2マス使用、1マス目に文字、2マス目は空白
- 96マス超は切り捨て

## win5 Standard/Groupモード
### Standardモード（デフォルト）
- tickごとに96マスを順番に点灯、96で折り返し

### Groupモード
- 最大4グループ、各グループにランダムな連続範囲を割り当て
- グループ範囲サイズ: `GROUP_MIN=1` 〜 `GROUP_MAX=4`（renderer.js先頭で変更可）
- グループカラー（固定4色）: `#ff5555` / `#44ddaa` / `#ffaa33` / `#aa55ff`
- 重なりルール: 部分重なり・内包はOK、完全同一はNG（再抽選）。内包時は範囲が短い方が視覚上優先（後から上書き）
- tick時: 現在グループの範囲内を順番に進み、終端で次グループをランダム選択
- `🎲 REROLL` ボタンで範囲を再抽選
- **Standardカーソルはモードに関わらず毎tickバックグラウンドで進め続ける**（GroupモードからStandardに戻っても拍頭がずれない）

## win6 BPM/スウィング/モード
- 16stepをsetTimeoutで再帰ループ（`backgroundThrottling: false` でバックグラウンド時も精度維持）
- スウィング: 表拍=`pair×swing%`、裏拍=`pair×(1-swing%)`
- PLAY/STOP時にipc(`bpm-tick`/`bpm-stop`)→main→win5へ転送

### Tempoモード（デフォルト）
- BPM+Swingで自動進行

### Handモード
- `[HAND]` 切り替え時に即座にPLAY状態になる
- キーボード `a` キーで1ステップ手動進行
- BPM/Swingスライダーは無効化

## カラーパレット（win7）
win7でパレット選択 → ipc `apply-palette` → main → win1〜6・win8・win9へbroadcast → 各ウィンドウのCSS変数を更新。

### CSS変数（全ウィンドウ共通）
`--bg` / `--bg2` / `--bg3` / `--text` / `--text-dim` / `--accent` / `--accent2` / `--border` / `--success` / `--error`

パレットオブジェクト: `{ name, bg, bg2, bg3, text, textDim, accent, accent2, border, success, error }`

### 10パレット
Dark Mono / Midnight Blue / Forest / Amber / Retro CRT / Neon Cyber / Arctic / Sakura / Solar / Monochrome

起動時はwin7のrenderer.jsが `sendPalette(PALETTES[0])` を自動送信（Dark Monoが適用される）。

## フォント（win9）
win9でフォント選択 → ipc `apply-font` → main → win1〜8へbroadcast → 各ウィンドウの `document.body.style.fontFamily` を更新。
起動時は DotGothic16 を自動送信。
使用フォント（Google Fonts）: DotGothic16 / M PLUS 1 Code / Noto Sans JP / Zen Kaku Gothic New / Dela Gothic One
win4の独立フォントセレクターは廃止済み。全ウィンドウの index.html に Google Fonts リンクを追加済み。

## win4アニメ設定
`src/renderer/window4/renderer.js` 4行目の `INTERVAL_MS` で速度調整（ms）。

## Google Fonts
DotGothic16 / M PLUS 1 Code / Noto Sans JP / Zen Kaku Gothic New / Dela Gothic One
ネット接続必要。フォントはwin9で一括切り替え（win4の独立セレクターは廃止）。

## win8 Flowモーラ表示
- 縦書き26列×15行=390スロットに、BPM tickごとに1モーラ順次書き込み
- スロットカーソルはリセットなし（json更新後も続きから上書き）
- 単語が切り替わるたびにword-displayがランダム座標へ移動（accent色・mix-blend-mode: screen）
- grid_count=0スキップ
- 起動時にmainキャッシュからパレットを取得して適用（`get-palette` IPC）

### win8 rmsフォントサイズ
- moraのrmsに応じてフォントサイズを変化（FONT_MIN〜FONT_MAX px）
- rmsをRMS_MIN〜RMS_MAXの範囲で正規化
- 調整定数（renderer.js先頭）: `RMS_MIN=0` / `RMS_MAX=0.4` / `FONT_MIN=12` / `FONT_MAX=48`

### win8 ブロックノイズ（noise-canvas）
- 文字の後ろにnoise-canvasレイヤー（z-index:0、mora-layerはz-index:1）
- **ノイズ密度**: f0が高いほどブロック数増加（F0_MIN以下はスキップ・無声音除外）
- **アニメーション速度**: スロットごとにspectral_centroidから計算（SC高い→速い）
- **凍結**: 書き込みからNOISE_ANIM_DURATION ms後にそのスロットのノイズが静止
- ノイズ色: パレットのaccent / accent2 / success / error からランダム選択
- 調整定数（renderer.js先頭）:
  - `F0_MIN=50` / `F0_MAX=300`（密度の入力範囲 Hz）
  - `NOISE_BLOCK_MIN=3` / `NOISE_BLOCK_MAX=46`（ブロックサイズ px）
  - `NOISE_COUNT_MAX=3`（1スロットの最大ブロック数）
  - `SC_FPS_MIN=1` / `SC_FPS_MAX=30`（速度範囲 fps）
  - `SC_SPEED_MIN=11000` / `SC_SPEED_MAX=30000`（速度の入力範囲 Hz）
  - `NOISE_ANIM_DURATION=2000`（凍結までの時間 ms）
  - `NOISE_ALPHA=1.0`（透明度）
  - `NOISE_BLEND='source-over'`（合成モード: source-over/lighter/screen/multiply/overlay）

## win7 カラーパレット（10種）
Paper / Sky / Lavender / Amber / Retro CRT / Ivory / Mint / Blush / Concrete / Dusk
- 背景が暗い（黒系）のはAmber・Retro CRTのみ、他は白・淡色系
- 選択したパレットはlocalStorageに保存され次回起動時も維持

## パレット永続化
- win7: 選択時に`localStorage.setItem('palette', JSON.stringify(p))`
- win9: 選択時に`localStorage.setItem('font', f.value)`
- 起動時にlocalStorageから読み出し、なければデフォルト（Dark Mono / DotGothic16）

## mainプロセスのパレットキャッシュ
- `ipcHandlers.js`の`currentPalette`変数に最後のパレットをキャッシュ
- `get-palette` IPCハンドラで取得可能
- win8が起動時に呼び出して初期パレットを適用
