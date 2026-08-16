# =============================================================================
# Stage 1 — Build (Using alpine to bypass network filtering)
# =============================================================================
FROM docker.io/alpine/dotnet-sdk:10.0 AS build
WORKDIR /src

# Copiar la carpeta del backend
COPY backend/ ./backend/

# Restaurar paquetes NuGet
RUN dotnet restore backend/SmartCards.slnx

# Compilar y publicar el proyecto API ejecutable
WORKDIR /src/backend/SmartCards.API
RUN dotnet publish SmartCards.API.csproj -c Release --no-restore -o /app/publish

# =============================================================================
# Stage 2 — Runtime
# =============================================================================
FROM docker.io/alpine/dotnet-aspnet:10.0 AS runtime
WORKDIR /app

# Copiar los artefactos compilados desde la etapa de compilación
COPY --from=build /app/publish .

# Variables de entorno mandatorias para Render
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "SmartCards.API.dll"]
