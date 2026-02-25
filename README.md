# NISSAN X-SEARCH

日産自動車に関する X (Twitter) ポストを毎日自動収集・要約し、GitHub Pages で公開する Social Intelligence ダッシュボード。

## 機能

- **毎日自動実行** — GitHub Actions が毎朝 7:17 JST に X を検索
- **AI 要約** — xAI Grok API がポストをセンチメント（ポジティブ / ネガティブ / 中立）で分類・日本語要約
- **カレンダー UI** — 日付をクリックしてレポートを閲覧
- **ブックマーク** — 気になったトピックを★でブックマーク、専用ページで一覧表示

## 技術スタック

| 役割 | 技術 |
|------|------|
| 検索・要約 | xAI Grok API (`grok-4-1-fast`) + Responses API `x_search` ツール |
| スクリプト | TypeScript / Node.js 22 |
| サイト | React 18 + Vite + Tailwind CSS |
| CI/CD | GitHub Actions → GitHub Pages |
| データ保存 | `docs/data/YYYY-MM-DD.json`（git 管理） |

## セットアップ（ローカル開発）

```bash
# 検索スクリプト
npm install
cp .env.example .env   # XAI_API_KEY を設定

# サイト
cd site
npm install
npm run dev
```

### 環境変数

| 変数 | 説明 |
|------|------|
| `XAI_API_KEY` | xAI API キー（[console.x.ai](https://console.x.ai/) で取得） |
| `SEARCH_KEYWORDS` | 検索キーワード（カンマ区切り、デフォルト: `日産,Nissan`） |
| `SEARCH_DAYS` | 何日前までのポストを対象にするか（デフォルト: `1`） |

```bash
npm run build   # TypeScript をコンパイル
npm start       # 検索を実行して docs/data/ にデータ生成
```

## GitHub Actions の設定

1. リポジトリの **Settings → Secrets** に `XAI_API_KEY` を追加
2. **Settings → Pages → Source** を `GitHub Actions` に設定
3. 必要に応じて **Settings → Variables** で `SEARCH_KEYWORDS` / `SEARCH_DAYS` を設定

ワークフロー（`.github/workflows/daily-search.yml`）は毎日 22:17 UTC（翌 7:17 JST）に自動実行。
**Actions タブ → Daily Nissan X Search → Run workflow** で手動実行も可能。

## 仕組み

```
GitHub Actions (毎日 22:17 UTC)
  │
  ├─ 1. X 検索 — キーワードごとに x_search で最新ポストを取得
  ├─ 2. AI 要約 — Grok がセンチメント分類・統合 Markdown レポートを生成
  ├─ 3. データ保存 — docs/data/YYYY-MM-DD.json をコミット
  ├─ 4. サイトビルド — Vite で React アプリをビルド
  └─ 5. デプロイ — GitHub Pages に公開
```

## ディレクトリ構成

```
nissan-x-search/
├── src/                  # 検索・要約スクリプト (TypeScript)
│   ├── index.ts          # エントリーポイント
│   ├── xSearch.ts        # xAI API 検索・要約ロジック
│   └── pageGenerator.ts  # JSON データ生成
├── site/                 # フロントエンド (React + Vite)
│   └── src/
│       ├── lib/
│       │   ├── bookmarks.ts  # ブックマーク (localStorage)
│       │   ├── markdown.ts   # Markdown パーサー
│       │   └── data.ts       # JSON データフェッチ
│       └── components/
│           ├── CalendarGrid.tsx
│           ├── ReportView.tsx
│           └── BookmarksPage.tsx
├── docs/                 # GitHub Pages 公開ディレクトリ
│   └── data/             # 日次レポート JSON（git 管理）
└── .github/workflows/
    └── daily-search.yml  # 自動実行ワークフロー
```
