FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ["Base.API/Base.API.csproj", "Base.API/"]
COPY ["Base.Application/Base.Application.csproj", "Base.Application/"]
COPY ["Base.Domain/Base.Domain.csproj", "Base.Domain/"]
COPY ["Base.Infrastructure/Base.Infrastructure.csproj", "Base.Infrastructure/"]

RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore "Base.API/Base.API.csproj"

COPY . .

WORKDIR "/src/Base.API"

RUN dotnet publish "Base.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Base.API.dll"]