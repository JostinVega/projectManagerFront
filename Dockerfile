# Etapa de construcción (build)
FROM node:18-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json package-lock.json ./
RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar Angular en modo producción (asegúrate que el nombre sea "demo")
RUN npx ng build --configuration production --project demo

# Etapa de servicio con NGINX
FROM nginx:alpine

# Copiar los archivos compilados al servidor NGINX
COPY --from=build /app/dist/demo/browser /usr/share/nginx/html

# Exponer el puerto por donde atenderá NGINX
EXPOSE 80

# Iniciar el servidor NGINX en primer plano
CMD ["nginx", "-g", "daemon off;"]