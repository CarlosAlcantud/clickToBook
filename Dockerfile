FROM node:18-alpine

# Instala dependencias necesarias para build de algunos paquetes
RUN apk add --no-cache python3 make g++

# Añadir usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Crear directorio de trabajo
WORKDIR /app

# Copiar primero los archivos de dependencia
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY client/package.json client/package-lock.json ./client/

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@17.3.10

# Instalar dependencias raíz
RUN npm ci

# Copiar el resto del código fuente (cliente y backend)
COPY . .

# Construir el frontend (ya con todo el código copiado)
RUN cd ./client && npm run build

# Cambiar propiedad de archivos
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Variables de entorno
ENV NODE_ENV production
ENV PORT 3000

# Exponer puerto
EXPOSE 3000

# Iniciar la aplicación backend
CMD ["npm", "start", "--prefix", "backend"]