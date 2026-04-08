M1: GLcanvas追加（黒画面確認）
作業: index.html にGL用canvasを追加、renderer.js にWebGL初期化コードを追加
✅ 確認: win8が真っ黒（または背景色）で表示されること

M2: 文字テクスチャ表示（GL経由で同じ見た目に）
作業: オフスクリーン2D canvasに mora/word を描画、GLテクスチャとして表示
✅ 確認: 今のDOM表示と同じ文字がGL canvas上に見えること

M3: Distortion歪み（tickで揺れる）
作業: フラグメントシェーダにsin/noiseベースの歪みを追加、tickごとにtimeを進める
✅ 確認: 文字がふわっと揺れているか、負荷が高すぎないか

M4: Fluid simulation導入（velocity/pressure ping-pong FBO）
作業: splat → advection → divergence → pressure → gradient subtract の一式を追加、tickごとに注入点を文字位置に合わせる
✅ 確認: 文字ごとに流体が広がっているか、滑らかか

M4-1 基盤だけ
作る: FBOとping-pongの枠だけ作る（まだ見た目はM3と同じ）
確認: 画面が出る、クラッシュしない、FPSが落ちすぎない

M4-2 Advectionだけ
作る: 速度場なしの簡易advectionで、文字テクスチャが少し流れる状態にする
確認: 文字が「流れる」方向に変化するか（破綻しないか）

M4-3 Splat注入
作る: tick時に文字位置へ速度と色を注入
確認: 新しい文字が入るたび、その周辺が押し出される感じになるか

M4-4 Divergence + Pressure solve
作る: divergence計算、pressure反復、gradient subtractを追加
確認: 流れが不自然に膨張し続けず、液体っぽくまとまるか

M4-5 Curlと減衰調整
作る: curl強調、dissipation/viscosityの調整定数を追加
確認: うるさすぎず、でも静止しすぎない最適点に入るか


M5: 仕上げ調整
作業: viscosity / dissipation / curl / splatRadius の定数調整、背景色・blend modeの最適化
✅ 確認: OKなら完成