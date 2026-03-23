FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY index.ts ./
EXPOSE 3001
CMD ["npx", "tsx", "index.ts"]
