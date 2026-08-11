FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/
RUN cd backend && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "dist/app.js"]