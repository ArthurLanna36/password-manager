using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Supabase;
using PasswordManagerApi.Data;
using PasswordManagerApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1) Bind SupabaseSettings (Url + AnonKey + ServiceRoleKey + JwtSecret)
builder.Services.Configure<SupabaseSettings>(
    builder.Configuration.GetSection("SupabaseSettings"));

var supaSettings = builder.Configuration
    .GetSection("SupabaseSettings")
    .Get<SupabaseSettings>()!; // null-forgiving para não gerar warning

// 2) DbContext para Postgres/Supabase
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseNpgsql(builder.Configuration.GetConnectionString("Supabase")));

// 3) Inicializa e registra o Supabase.Client
builder.Services.AddSingleton(_ =>
{
    // Apenas URL e AnonKey
    var client = new Client(
        supaSettings.Url,
        supaSettings.AnonKey);

    // Inicialização obrigatória
    client.InitializeAsync().GetAwaiter().GetResult();
    return client;
});

// 4) Configura JWT Bearer usando o JwtSecret
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var keyBytes = Encoding.UTF8.GetBytes(supaSettings.JwtSecret);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(keyBytes),
            ValidIssuer              = $"{supaSettings.Url}/auth/v1",
            ValidAudience            = "authenticated",
            ValidateLifetime         = true
        };
    });

// 5) Controllers + Swagger/OpenAPI
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 6) Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
