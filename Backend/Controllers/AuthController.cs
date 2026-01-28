using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly JsonStoreService _store;
        private readonly PasswordService _passwordService;

        public AuthController(JsonStoreService store, PasswordService passwordService)
        {
            _store = store;
            _passwordService = passwordService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Kullanıcı adı ve şifre gerekli");

            var user = _store.GetUser(request.Username);
            
            if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized("Kullanıcı adı veya şifre yanlış");

            // Cookie ile authentication
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Username ?? string.Empty),
                new Claim(ClaimTypes.Name, user.Username ?? string.Empty)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24)
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            return Ok(new { message = "Giriş başarılı" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Çıkış başarılı" });
        }

        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Giriş yapmanız gerekli");

            var user = _store.GetUser(username);
            
            if (user == null)
                return Unauthorized("Kullanıcı bulunamadı");

            if (string.IsNullOrEmpty(request.OldPassword) || string.IsNullOrEmpty(user.PasswordHash) || !_passwordService.VerifyPassword(request.OldPassword, user.PasswordHash))
                return BadRequest("Eski şifre yanlış");

            var newPassword = request.NewPassword ?? string.Empty;

            if (string.IsNullOrEmpty(newPassword) || newPassword.Length < 3)
                return BadRequest("Yeni şifre en az 3 karakter olmalı");

            user.PasswordHash = _passwordService.HashPassword(newPassword);
            _store.UpdateUser(user);

            return Ok(new { message = "Şifre başarıyla değiştirildi" });
        }

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            
            if (string.IsNullOrEmpty(username))
                return Ok(new { authenticated = false });

            return Ok(new { authenticated = true, username = username });
        }
    }
}
