using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Supabase;
using PasswordManager.Api.Data;
using PasswordManager.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// 1) Bind SupabaseSettings from configuration
builder.Services.Configure<SupabaseSettings>(
    builder.Configuration.GetSection("SupabaseSettings"));
var supabaseSettings = builder.Configuration
    .GetSection("SupabaseSettings")
    .Get<SupabaseSettings>()!;

// 2) Register EF Core DbContext for Supabase Postgres
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseNpgsql(builder.Configuration.GetConnectionString("Supabase")));

// 3) Initialize Supabase .NET client and register as singleton
builder.Services.AddSingleton(_ =>
{
    var client = new Client(
        supabaseSettings.Url,
        supabaseSettings.AnonKey,
        new ClientOptions
        {
            AutoRefreshToken = true,
            PersistSession   = true
        });
    // Synchronously initialize at startup
    client.InitializeAsync().GetAwaiter().GetResult();
    return client;
});

// 4) Configure JWT authentication using Supabase JWT secret
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(supabaseSettings.JwtSecret);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(key),
            ValidIssuer              = $"{supabaseSettings.Url}/auth/v1",
            ValidAudience            = "authenticated",
            ValidateLifetime         = true
        };
    });

// 5) Add Controllers & Swagger/OpenAPI
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 6) Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// 7) Map controllers (e.g. AuthController, UsersController)
app.MapControllers();

app.Run();
