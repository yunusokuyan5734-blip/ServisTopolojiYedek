using Microsoft.AspNetCore.Authentication.Cookies;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Servisler
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // PascalCase kullan
    });
builder.Services.AddScoped<JsonStoreService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<TopologyStoreService>();
builder.Services.AddLogging();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5000", "http://localhost")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/index.html";
        options.AccessDeniedPath = "/index.html";
        options.Cookie.Name = "auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Seed default admin if missing
using (var scope = app.Services.CreateScope())
{
    var store = scope.ServiceProvider.GetRequiredService<JsonStoreService>();
    var passwordService = scope.ServiceProvider.GetRequiredService<PasswordService>();
    store.EnsureDefaultAdmin(passwordService);
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
