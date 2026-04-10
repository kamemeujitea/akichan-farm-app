# あきちゃんファーム 栽培管理アプリ

## プロジェクト構成
- Next.js 14 App Router + TypeScript + Tailwind CSS
- PWA対応（manifest.json）
- データはlocalStorage + IndexedDB（写真保存用）
- 天気APIはOpenWeatherMap（無料枠）

## コマンド
- `npm run dev` で開発サーバー起動
- `npm run build` でビルド
- `npm run lint` でリント

## ディレクトリ構造
```
src/
  app/
    layout.tsx        # 下部タブバー付きレイアウト
    page.tsx          # 畑マップ（ホーム）
    calendar/page.tsx # 作業カレンダー
    harvest/page.tsx  # 収穫記録
    weather/page.tsx  # 天気・アラート
    shift/page.tsx    # シフト管理
  components/
    FarmMap.tsx       # 畝マップコンポーネント
    BedDetail.tsx     # 畝詳細パネル
    CalendarView.tsx  # カレンダー表示
    HarvestForm.tsx   # 収穫入力フォーム
    HarvestChart.tsx  # 収穫集計グラフ
    HarvestList.tsx   # 収穫履歴
    TabBar.tsx        # 下部タブバー
  lib/
    farmData.ts       # 畝・品目の初期データ
    schedule.ts       # 年間作業スケジュール
    storage.ts        # localStorage/IndexedDB操作
    weather.ts        # 天気API連携 + アラート生成
  types/
    index.ts          # 型定義
```

## 重要な実装ルール
- すべてのテキストは日本語
- 日付は和暦でなく西暦（2026年形式）
- 品目名は絵文字付きで表示（🍅トマト、🍆ナス等）
- 畝番号は①〜⑬の丸数字で表示
- 色は品目カテゴリで統一（芋=黄土色、夏野菜=薄緑、豆=緑、ネギ=深緑、とうもろこし=黄色）

## 初期設定
- 天気APIは設定タブからOpenWeatherMap APIキーを入力すると有効化
- 未設定時はサンプルデータで動作
