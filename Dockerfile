# =============================================================================
# Stage 1 — Build
# =============================================================================
FROM ://microsoft.com AS build
WORKDIR /src

# 1. Copiar la carpeta backend con la sintaxis limpia de Docker
COPY backend/ ./backend/

# 2. Restaurar usando el archivo de solución nuevo de .NET (SmartCards.slnx)
# Esto es mucho más seguro que restaurar un solo .csproj porque jala todas las dependencias
RUN dotnet restore backend/SmartCards.slnx

# 3. Movernos al directorio del proyecto ejecutable para compilar y publicar
WORKDIR /src/backend/SmartCards.API
RUN dotnet publish SmartCards.API.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

# =============================================================================
# Stage 2 — Runtime
# =============================================================================
FROM ://microsoft.com AS runtime
WORKDIR /app

# Copiar el resultado final de la compilación
COPY --from=build /app/publish .

# Forzar el puerto requerido por Render
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "SmartCards.API.dll"]
