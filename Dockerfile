# =============================================================================
# Stage 1 — Build
# Uses the full .NET 10 SDK to restore, build, and publish the app
# Build context: repo root
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution file and all project files first for layer-cached restore
COPY backend/SmartCards.slnx                                                                        backend/
COPY backend/SmartCards.API/SmartCards.API.csproj                                                   backend/SmartCards.API/
COPY backend/Modules/Flashcards/Flashcards.Core/Flashcards.Core.csproj                              backend/Modules/Flashcards/Flashcards.Core/
COPY backend/Modules/Flashcards/Flashcards.Controllers/Flashcards.Controllers.csproj                backend/Modules/Flashcards/Flashcards.Controllers/
COPY backend/Modules/Flashcards/Flashcards.Infrastructure/Flashcards.Infrastructure.csproj          backend/Modules/Flashcards/Flashcards.Infrastructure/
COPY backend/Modules/Flashcards/Flashcards.Tests/Flashcards.Tests.csproj                            backend/Modules/Flashcards/Flashcards.Tests/

# Restore NuGet packages (cached layer as long as .csproj files don't change)
RUN dotnet restore backend/SmartCards.API/SmartCards.API.csproj

# Copy remaining backend source code
COPY backend/ backend/

# Publish the API project in Release mode to /app/publish
RUN dotnet publish backend/SmartCards.API/SmartCards.API.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

# =============================================================================
# Stage 2 — Runtime
# Uses the smaller ASP.NET Core 10 runtime image
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Copy published output from the build stage
COPY --from=build /app/publish .

# Render.com requires the app to listen on port 10000
ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "SmartCards.API.dll"]
