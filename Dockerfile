FROM public.ecr.aws/docker/library/node:24-bullseye-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

FROM public.ecr.aws/docker/library/node:24-bullseye-slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package.json index.ts ./
EXPOSE 3001
CMD ["npx", "tsx", "index.ts"]
