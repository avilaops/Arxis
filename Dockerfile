# Build stage for API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-api
WORKDIR /src

# Copy csproj files and restore
COPY ["src/Arxis.API/Arxis.API.csproj", "Arxis.API/"]
COPY ["src/Arxis.Domain/Arxis.Domain.csproj", "Arxis.Domain/"]
COPY ["src/Arxis.Infrastructure/Arxis.Infrastructure.csproj", "Arxis.Infrastructure/"]
RUN dotnet restore "Arxis.API/Arxis.API.csproj"

# Copy everything else and build
COPY src/ .
WORKDIR "/src/Arxis.API"
RUN dotnet build "Arxis.API.csproj" -c Release -o /app/build

# Publish
FROM build-api AS publish-api
RUN dotnet publish "Arxis.API.csproj" -c Release -o /app/publish

# Runtime stage for API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS api
WORKDIR /app
COPY --from=publish-api /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "Arxis.API.dll"]

# Build stage for Web
FROM node:20-alpine AS build-web
WORKDIR /app

# Copy package files
COPY src/Arxis.Web/package*.json ./
RUN npm ci

# Copy source and build
COPY src/Arxis.Web/ ./
RUN npm run build

# Runtime stage for Web (nginx)
FROM nginx:alpine AS web
COPY --from=build-web /app/dist /usr/share/nginx/html
COPY src/Arxis.Web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
