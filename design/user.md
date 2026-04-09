# お願いするときのフォーマット

ツールの現状
design/claude.md

問題点
win8はビジュアライザーです。
win6からの文字を描写している。
win6はwin1のインポートされたjsonを使っている
そのjsonにはrms、f0、spectral_centroid、zcrが含まれる
これらの値を描写に使用する。
まずは、rmsから。
rmsのサイズに応じて、文字のサイズを大きくする。
この際、文字が被らないように描写する

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