FROM node:20-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール（postinstallスクリプトを無効化）
RUN npm ci --ignore-scripts

# ソースコードをコピー
COPY . .

# Prismaクライアントを生成
RUN npx prisma generate

# 開発サーバーのポートを公開
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
