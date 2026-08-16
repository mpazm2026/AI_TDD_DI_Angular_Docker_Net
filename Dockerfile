ARG REGISTRY=://microsoft.com

FROM ${REGISTRY}/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/ ./backend/

RUN dotnet restore backend/SmartCards.slnx

WORKDIR /src/backend/SmartCards.API
RUN dotnet publish SmartCards.API.csproj -c Release --no-restore -o /app/publish

FROM ${REGISTRY}/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "SmartCards.API.dll"]
