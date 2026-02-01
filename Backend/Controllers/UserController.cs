using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly JsonStoreService _store;
        private readonly PasswordService _passwordService;

        public UserController(JsonStoreService store, PasswordService passwordService)
        {
            _store = store;
            _passwordService = passwordService;
        }

        // Tüm kullanıcıları listele (Admin only)
        [HttpGet("list")]
        public IActionResult GetUsers()
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "Admin")
            {
                return BadRequest(new { 
                    error = "Yetki reddedildi",
                    role = role,
                    authenticated = User.Identity?.IsAuthenticated,
                    username = User.Identity?.Name,
                    allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
                });
            }

            var users = _store.GetAllUsers();
            
            // Şifreleri gizle
            var sanitizedUsers = users.Select(u => new
            {
                u.Username,
                u.Role,
                u.SeflikId,
                u.SeflikName,
                u.IsLdapUser,
                u.PermissionType,
                u.AllowedTopologyIds,
                u.CreatedAt,
                HasPassword = !string.IsNullOrEmpty(u.PasswordHash)
            });

            return Ok(sanitizedUsers);
        }

        // Yeni kullanıcı ekle (Admin only)
        [HttpPost("add")]
        public IActionResult AddUser([FromBody] UserCreateRequest request)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Forbid();

            if (string.IsNullOrEmpty(request.Username))
                return BadRequest("Kullanıcı adı gerekli");

            // Kullanıcı zaten var mı?
            if (_store.GetUser(request.Username) != null)
                return BadRequest("Bu kullanıcı adı zaten kullanılıyor");

            // LDAP kullanıcısı için şifre kontrolü
            if (!request.IsLdapUser && string.IsNullOrEmpty(request.Password))
                return BadRequest("Lokal kullanıcı için şifre gerekli");

            var newUser = new User
            {
                Username = request.Username,
                PasswordHash = request.IsLdapUser ? null : _passwordService.HashPassword(request.Password!),
                Role = request.Role ?? "User",
                SeflikId = request.SeflikId,
                SeflikName = request.SeflikName,
                IsLdapUser = request.IsLdapUser,
                PermissionType = request.PermissionType ?? "Sheflik",
                AllowedTopologyIds = request.AllowedTopologyIds ?? new List<string>(),
                CreatedAt = DateTime.UtcNow
            };

            _store.AddUser(newUser);

            return Ok(new { message = "Kullanıcı başarıyla eklendi" });
        }

        // Kullanıcı güncelle (Admin only)
        [HttpPut("update")]
        public IActionResult UpdateUser([FromBody] UserUpdateRequest request)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Forbid();

            var user = _store.GetUser(request.Username);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı");

            // Şifre güncellemesi (boş değilse)
            if (!string.IsNullOrEmpty(request.Password) && !user.IsLdapUser)
            {
                user.PasswordHash = _passwordService.HashPassword(request.Password);
            }

            user.Role = request.Role ?? user.Role;
            user.SeflikId = request.SeflikId;
            user.SeflikName = request.SeflikName;
            user.PermissionType = request.PermissionType ?? user.PermissionType;
            user.AllowedTopologyIds = request.AllowedTopologyIds ?? user.AllowedTopologyIds;

            _store.UpdateUser(user);

            return Ok(new { message = "Kullanıcı başarıyla güncellendi" });
        }

        // Kullanıcı sil (Admin only)
        [HttpDelete("delete/{username}")]
        public IActionResult DeleteUser(string username)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Forbid();

            if (username.Equals("admin", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Admin kullanıcısı silinemez");

            var user = _store.GetUser(username);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı");

            _store.DeleteUser(username);

            return Ok(new { message = "Kullanıcı başarıyla silindi" });
        }
    }

    public class UserCreateRequest
    {
        public string Username { get; set; } = "";
        public string? Password { get; set; }
        public string? Role { get; set; }
        public string? SeflikId { get; set; }
        public string? SeflikName { get; set; }
        public bool IsLdapUser { get; set; }
        public string? PermissionType { get; set; }
        public List<string>? AllowedTopologyIds { get; set; }
    }

    public class UserUpdateRequest
    {
        public string Username { get; set; } = "";
        public string? Password { get; set; }
        public string? Role { get; set; }
        public string? SeflikId { get; set; }
        public string? SeflikName { get; set; }
        public string? PermissionType { get; set; }
        public List<string>? AllowedTopologyIds { get; set; }
    }
}
