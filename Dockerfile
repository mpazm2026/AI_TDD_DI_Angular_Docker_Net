# =============================================================================
# Stage 1 — Build
# =============================================================================
FROM ubuntu:24.04 AS build
WORKDIR /src

RUN apt-get update && apt-get install -y \
    curl \
    icu-devtools \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# URL Directa del instalador oficial de Microsoft
RUN curl -sSL https://dot.net -o dotnet-install.sh \
    && chmod +x dotnet-install.sh \
    && ./dotnet-install.sh --channel 10.0 --install-dir /usr/share/dotnet \
    && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

COPY backend/ ./backend/

RUN dotnet restore backend/SmartCards.slnx

WORKDIR /src/backend/SmartCards.API
RUN dotnet publish SmartCards.API.csproj -c Release --no-restore -o /app/publish

# =============================================================================
# Stage 2 — Runtime
# =============================================================================
FROM ubuntu:24.04 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    libssl-dev \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# URL Directa para la etapa de ejecución
RUN curl -sSL https://dot.net -o dotnet-install.sh \
    && chmod +x dotnet-install.sh \
    && ./dotnet-install.sh --channel 10.0 --runtime aspnetcore --install-dir /usr/share/dotnet \
    && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "SmartCards.API.dll"]
