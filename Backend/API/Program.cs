using API.Middlewares;
using Application.DependencyInjection;
using Infrastructure.DependencyInjection;
using Infrastructure.Persistence;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
  options.SwaggerDoc("v1", new OpenApiInfo
  {
    Title = "StockSys API",
    Version = "v1"
  });
});

var frontendOrigin = builder.Configuration["Cors:FrontendOrigin"] ?? "http://localhost:3001";

builder.Services.AddCors(options =>
{
  options.AddPolicy("Frontend", policy =>
  {
    policy.WithOrigins(frontendOrigin).AllowAnyHeader().AllowAnyMethod();
  });
});

var app = builder.Build();

if (builder.Configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup"))
{
  await DatabaseInitializer.MigrateAsync(app.Services);
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.MapControllers();

app.Run();