# =============================================================================
# Stage 1 — Build (Using Ubuntu to bypass Microsoft domain blocks)
# =============================================================================
FROM ubuntu:24.04 AS build
WORKDIR /src

# Instalar dependencias necesarias para el SDK de .NET
RUN apt-get update && apt-get install -y \
    curl \
    icu-devtools \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Descargar e instalar el SDK de .NET 10 mediante el script oficial de instalación
RUN curl -sSL https://dot.net -o dotnet-install.sh \
    && chmod +x dotnet-install.sh \
    && ./dotnet-install.sh --channel 10.0 --install-dir /usr/share/dotnet \
    && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

# Copiar el código fuente del proyecto
COPY backend/ ./backend/

# Restaurar dependencias
RUN dotnet restore backend/SmartCards.slnx

# Publicar el ejecutable de la API
WORKDIR /src/backend/SmartCards.API
RUN dotnet publish SmartCards.API.csproj -c Release --no-restore -o /app/publish

# =============================================================================
# Stage 2 — Runtime
# =============================================================================
FROM ubuntu:24.04 AS runtime
WORKDIR /app

# Instalar dependencias mínimas para ejecutar ASP.NET Core
RUN apt-get update && apt-get install -y \
    curl \
    libssl-dev \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Descargar e instalar únicamente el ASP.NET Runtime 10
RUN curl -sSL https://dot.net -o dotnet-install.sh \
    && chmod +x dotnet-install.sh \
    && ./dotnet-install.sh --channel 10.0 --runtime aspnetcore --install-dir /usr/share/dotnet \
    && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

# Copiar los archivos compilados desde la etapa previa
COPY --from=build /app/publish .

# Variables requeridas por Render
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "SmartCards.API.dll"]
