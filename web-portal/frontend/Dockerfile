# ---------- Build Stage ----------
FROM node:20-slim AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:alpine

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy runtime config script
COPY public/config.js /usr/share/nginx/html/config.js

# Add entrypoint to inject env vars at container startup
COPY ./env.sh /docker-entrypoint.d/99-env.sh
RUN chmod +x /docker-entrypoint.d/99-env.sh

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
