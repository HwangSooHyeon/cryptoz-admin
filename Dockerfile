# 1. 의존성 설치 (Deps)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. 빌드 (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 시점에 사용할 환경변수 선언 (값은 비워둬도 됨, 에러 방지용)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# 3. 실행 (Runner) - 매우 가벼운 이미지
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# 보안을 위해 nodejs 유저 사용
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# 실행
CMD ["node", "server.js"]