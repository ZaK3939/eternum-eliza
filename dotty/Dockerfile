# ベースイメージ
FROM node:23.3.0-slim

# 必要な Linux パッケージをインストール
RUN apt-get update && apt-get install -y \
    git python3 gcc g++ make pkg-config libtool \
    autoconf automake libc6 libc6-dev curl tar \
    libpixman-1-dev libcairo2-dev libpango1.0-dev \
    build-essential

# pnpm をグローバルインストール
RUN npm install -g pnpm

# 作業ディレクトリを /app に設定
WORKDIR /app

# -----------------------------
# 1) ルート階層の重要ファイルだけ先にコピー（高速化のため）
# -----------------------------
# pnpm-workspace.yaml, package.json, pnpm-lock.yaml はモノレポ全体の依存関係を管理
COPY ../pnpm-workspace.yaml ./
COPY ../package.json ./
COPY ../pnpm-lock.yaml ./

# -----------------------------
# 2) 残りのソースをすべてコピー
#    - “../” から “./” にコピーする形（dotty/ Dockerfileから見て上位階層）
#    - packages/, dotty/, etc.
# -----------------------------
COPY ../ ./

# 依存インストール
RUN pnpm install

# モノレポ内の依存パッケージをビルド
# 例: ルート package.json で "build:dotty-deps" を定義している想定
RUN pnpm run build:dotty-deps

# dotty ディレクトリに移動
WORKDIR /app/dotty

# ポート公開
EXPOSE 3000

# コンテナ起動時に走るコマンド
# 例: ルート package.json で “start:dotty” = “pnpm build:dotty-deps && pnpm --filter dotty start” があるなら
# ここでそれを直接呼んでもよいし、単に "pnpm start" にするなら dotty/package.json の scripts.start を使う
CMD ["pnpm", "start", "--non-interactive"]
