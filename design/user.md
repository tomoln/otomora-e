# お願いするときのフォーマット

ツールの現状
design/claude.md

問題点
win5で、現在モーラごとに文字がグリッドに収まっています。
これの下に、対応しているwordも表示させたいのです。

やらない事
依存関係的に関係のないファイルは読まない

まだコードを書かないで、実装できるかの検証と、どれくらいの工程かを教えてください。

# 継承フォーマット

一度claude codeを閉じるから、また新規のclaude codeが見ても今のツールの現状が分かるように、
最小プロンプト(design/claude.md)を更新してほしい

# ウインドウの名前
window2/index.html → Assets
window3/index.html → Log
window4/index.html → Visualizer
window5/index.html → Grid
window6/index.html → BPM
window7/index.html → Palette

win1は BrowserWindow のオプションで title: 'Main' を指定しています。win2〜7はframelessでタイトルバーがないため、windowManager.js側には title の指定がありません。

src/main/menuBuilder.js の label を変えればOKです。

12行目: 'Assets (win2)'
22行目: 'Log (win3)'
32行目: 'Visualizer (win4)'
42行目: 'Grid (win5)'
52行目: 'BPM (win6)'
62行目: 'Palette (win7)'

win5からきている文字を描写している
win8の文字データはjsonファイルのmorasから来ており、rms / f0 / spectral_centroid / zcr もすでにwin8に届いているデータ
これを