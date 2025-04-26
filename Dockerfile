# Dockerfile
FROM node:20-slim

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos sólo dependencias de producción
RUN npm ci --omit=dev

# Copiamos el resto del código
COPY . .

# Expone el puerto configurado (8080 por defecto)
ENV PORT=8080
EXPOSE 8080

# Arranca tu app
ENTRYPOINT ["node", "src/app.js"]
