# nissan-x-search

Nissan に関する情報を X (Twitter) で検索し、Discord webhook に投稿するツール。
検索には xAI の Grok API (Responses API + `x_search` ツール) を使用。

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` ファイルを編集して、以下の値を設定:

| 変数 | 説明 |
|------|------|
| `XAI_API_KEY` | xAI の API キー ([console.x.ai](https://console.x.ai/) で取得) |
| `DISCORD_WEBHOOK_URL` | Discord の Webhook URL |
| `SEARCH_KEYWORDS` | 検索キーワード (カンマ区切り、デフォルト: `日産,Nissan`) |
| `SEARCH_DAYS` | 何日前までのポストを検索するか (デフォルト: `1`) |

## 使い方

```bash
# ビルドして実行
npm run build
npm start

# 開発時 (tsx でビルドなしで実行)
npm run dev
```

## 仕組み

1. 設定されたキーワードごとに xAI Responses API の `x_search` ツールで X を検索
2. Grok が検索結果を日本語で要約
3. 要約を Discord embed 形式に変換して webhook に送信
