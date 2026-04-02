# Invoice Extractor — Vercel版

## ファイル構成

```
invoice-app-vercel/
├── index.html        # フロントエンド
├── api/
│   └── extract.js    # Anthropic APIプロキシ（Vercel Serverless Function）
├── vercel.json       # Vercel設定
└── README.md
```

## デプロイ手順

### 1. GitHubリポジトリにプッシュ

既存のリポジトリを使う場合はファイルを差し替えてプッシュ：
```bash
git add .
git commit -m "migrate to vercel"
git push
```

新規の場合：
```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/YOUR_USERNAME/invoice-app.git
git push -u origin main
```

### 2. Vercelにインポート

1. https://vercel.com にアクセス → GitHubでログイン
2. 「Add New Project」→ リポジトリを選択
3. Framework Preset は「Other」のまま
4. 「Deploy」をクリック

### 3. 環境変数にAPIキーを設定

1. Vercelのプロジェクトダッシュボード
2. Settings → Environment Variables
3. 以下を追加：
   - Name: ANTHROPIC_API_KEY
   - Value: sk-ant-... （AnthropicのAPIキー）
   - Environment: Production / Preview / Development すべてチェック
4. 「Save」

### 4. 再デプロイ

Deployments タブ → 最新のデプロイの「...」→「Redeploy」

これで完了です。発行されたURLを社内に共有してください。

## Netlifyからの変更点

- `netlify/functions/extract.js` → `api/extract.js` に移動
- `netlify.toml` → `vercel.json` に変更
- フロントエンドのコード変更は不要（APIパスは同じ `/api/extract`）
