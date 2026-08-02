# syntax=docker/dockerfile:1

# ═══ Tahap 1: build frontend React ═══════════════════════════════════
FROM node:22-alpine AS web
WORKDIR /web

# package.json disalin duluan supaya layer npm ci ikut cache selama dependensi tidak berubah
COPY gemini-chatbot-api/package.json gemini-chatbot-api/package-lock.json ./
RUN npm ci

COPY gemini-chatbot-api/ ./
RUN npm run build


# ═══ Tahap 2: runtime — Express melayani API + hasil build ═══════════
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY gemini-flash-api/package.json gemini-flash-api/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY gemini-flash-api/ ./
COPY --from=web /web/dist ./public

# Jalan sebagai user tanpa privilege (sudah ada di image node)
USER node

EXPOSE 3000
ENV PORT=3000

# Dokploy/Docker memantau kesehatan container lewat endpoint ini.
# Pakai fetch bawaan Node supaya tidak perlu menambah curl ke image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "index.js"]
