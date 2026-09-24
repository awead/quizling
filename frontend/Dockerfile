# Builder stage that will compile the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Vite inlines VITE_* values into the bundle at build time, so they must be
# build args; runtime container env has no effect on the served app.
ARG VITE_API_BASE_URL=/api
ARG VITE_API_TIMEOUT=10000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT

RUN npm run build

# Production stage that runs the compiled application
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
