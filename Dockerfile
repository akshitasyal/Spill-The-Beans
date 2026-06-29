# Multi-stage build for React SPA serving with Nginx

# ── Stage 1: Build ──
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Set build environment variables
ENV VITE_API_URL=http://localhost:4000
RUN npm run build

# ── Stage 2: Serve ──
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom Nginx config to handle SPA routing fallback
RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
  } \
  error_page 500 502 503 504 /50x.html; \
  location = /50x.html { \
    root /usr/share/nginx/html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
