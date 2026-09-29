# Build stage: install dependencies and produce the static bundle.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Same-origin API path; nginx proxies /api to the backend service.
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

# Runtime stage: nginx serving dist/. The official image renders templates/*.template with envsubst at startup.
FROM nginx:1.29-alpine
ENV BACKEND_URL=http://vulntrack-backend.default.svc.cluster.local:8081
# Exports NGINX_LOCAL_RESOLVERS from /etc/resolv.conf for the resolver directive.
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
