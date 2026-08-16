# =============================================================================
# Stage 1 — Build
# Uses the official .NET 10 SDK image to restore, build, and publish the app.
# Build context: repo root
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files first so NuGet restore is cached as a separate layer.
# This layer is only invalidated when a .csproj or .slnx changes.
COPY backend/SmartCards.slnx                                                                        backend/
COPY backend/SmartCards.API/SmartCards.API.csproj                                                   backend/SmartCards.API/
COPY backend/Modules/Flashcards/Flashcards.Core/Flashcards.Core.csproj                              backend/Modules/Flashcards/Flashcards.Core/
COPY backend/Modules/Flashcards/Flashcards.Controllers/Flashcards.Controllers.csproj                backend/Modules/Flashcards/Flashcards.Controllers/
COPY backend/Modules/Flashcards/Flashcards.Infrastructure/Flashcards.Infrastructure.csproj          backend/Modules/Flashcards/Flashcards.Infrastructure/

# Restore only the API entry project (and its transitive dependencies).
RUN dotnet restore backend/SmartCards.API/SmartCards.API.csproj

# Copy the full backend source code.
COPY backend/ backend/

# Publish in Release mode. --no-restore reuses the cache from the step above.
RUN dotnet publish backend/SmartCards.API/SmartCards.API.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

# =============================================================================
# Stage 2 — Runtime
# Uses the official slim ASP.NET Core 10 runtime image (no SDK overhead).
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Copy only the published output from the build stage.
COPY --from=build /app/publish .

# Render.com requires the app to bind to port 10000.
ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "SmartCards.API.dll"]
