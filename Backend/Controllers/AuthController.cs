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
        private readonly LdapService _ldapService;
        private readonly LdapConfigService _ldapConfigService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            JsonStoreService store, 
            PasswordService passwordService,
            LdapService ldapService,
            LdapConfigService ldapConfigService,
            ILogger<AuthController> logger)
        {
            _store = store;
            _passwordService = passwordService;
            _ldapService = ldapService;
            _ldapConfigService = ldapConfigService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Kullanıcı adı ve şifre gerekli");

            // Username formatını normalize et (iett\username veya username@iett.yerel -> username)
            string normalizedUsername = request.Username;
            if (normalizedUsername.Contains("\\"))
            {
                // iett\username formatı
                normalizedUsername = normalizedUsername.Split('\\').Last();
            }
            else if (normalizedUsername.Contains("@"))
            {
                // username@iett.yerel formatı
                normalizedUsername = normalizedUsername.Split('@').First();
            }

            // LDAP yapılandırmasını kontrol et
            var ldapConfig = _ldapConfigService.GetConfig();
            User? user = null;
            string? role = null;
            string? seflikId = null;
            string? seflikName = null;

            // LDAP aktif ise LDAP ile kimlik doğrulama yap
            if (ldapConfig.EnableLdap)
            {
                _logger.LogInformation($"LDAP authentication attempt for user: {normalizedUsername} (original: {request.Username})");
                // LDAP'a orijinal username'i gönder (iett\username formatında olabilir)
                var ldapResult = await _ldapService.AuthenticateAsync(normalizedUsername, request.Password, ldapConfig);
                _logger.LogInformation($"LDAP authentication result: Success={ldapResult.Success}, ErrorMessage={ldapResult.ErrorMessage}");
                
                if (ldapResult.Success)
                {
                    // LDAP'da başarılı - LDAP gruplarından rol ve şeflik belirle
                    (role, seflikId, seflikName) = _ldapConfigService.ResolveGroupsToRole(ldapResult.Groups);

                    // Eğer LDAP gruplarından rol belirlenemezse, kullanıcı yetkili değil
                    if (role == null)
                    {
                        // Manuel olarak eklenmiş kullanıcı var mı kontrol et
                        var existingUser = _store.GetUser(normalizedUsername);
                        if (existingUser == null)
                        {
                            return Unauthorized("Bu kullanıcı hesabı sistem tarafından yetkilendirilmemiş. Lütfen sistem yöneticisi ile iletişime geçin.");
                        }
                        // Manuel eklenmiş kullanıcı varsa rolünü kullan
                        role = existingUser.Role ?? "User";
                        seflikId = existingUser.SeflikId;
                        seflikName = existingUser.SeflikName;
                    }

                    // Yerel veritabanında kullanıcıyı ara
                    user = _store.GetUser(normalizedUsername);

                    // Otomatik Kullanıcı Oluşturma: Kullanıcı veritabanında yoksa ve bu özellik açıksa oluştur
                    if (user == null && ldapConfig.EnableJitProvisioning)
                    {
                        user = new User
                        {
                            Username = normalizedUsername,
                            PasswordHash = null, // LDAP kullanıcısı için şifre saklanmaz
                            Role = role,
                            SeflikId = seflikId,
                            SeflikName = seflikName,
                            LdapDistinguishedName = ldapResult.DistinguishedName,
                            IsLdapUser = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        _store.AddUser(user);
                    }
                    else if (user != null)
                    {
                        // Mevcut kullanıcının rol ve şeflik bilgilerini güncelle
                        user.Role = role;
                        user.SeflikId = seflikId;
                        user.SeflikName = seflikName;
                        user.LdapDistinguishedName = ldapResult.DistinguishedName;
                        user.IsLdapUser = true;
                        _store.UpdateUser(user);
                    }
                }
                else
                {
                    // LDAP kimlik doğrulaması başarısız - yerel DB'ye fallback yap
                    user = _store.GetUser(normalizedUsername);
                    
                    if (user == null)
                    {
                        return Unauthorized("Kullanıcı adı veya şifre yanlış");
                    }
                    
                    // Eğer LDAP kullanıcısı ise, password check'ini bypass et (LDAP directory'de kimlik doğrulandı zaten)
                    if (!user.IsLdapUser)
                    {
                        // Lokal kullanıcı ise, password check yap
                        if (string.IsNullOrEmpty(user.PasswordHash) || 
                            !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                        {
                            return Unauthorized("Kullanıcı adı veya şifre yanlış");
                        }
                    }
                    
                    // Yerel kullanıcının rol bilgilerini al
                    role = user.Role ?? "User";
                    seflikId = user.SeflikId;
                    seflikName = user.SeflikName;
                }
            }
            else
            {
                // LDAP devre dışı ise yerel veritabanında kimlik doğrula
                user = _store.GetUser(normalizedUsername);
                
                if (user == null || string.IsNullOrEmpty(user.PasswordHash) || 
                    !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Unauthorized("Kullanıcı adı veya şifre yanlış");
                }

                // Yerel kullanıcının rol bilgilerini al
                role = user.Role ?? "User";
                seflikId = user.SeflikId;
                seflikName = user.SeflikName;
            }
            if (user == null)
            {
                user = _store.GetUser(normalizedUsername);
                
                if (user == null || string.IsNullOrEmpty(user.PasswordHash) || 
                    !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Unauthorized("Kullanıcı adı veya şifre yanlış");
                }

                // Yerel kullanıcının rol bilgilerini al
                role = user.Role ?? "User";
                seflikId = user.SeflikId;
                seflikName = user.SeflikName;
            }

            // Cookie ile authentication - JWT Claim'leri ekle
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Username ?? string.Empty),
                new Claim(ClaimTypes.Name, user.Username ?? string.Empty),
                new Claim(ClaimTypes.Role, role ?? "User"),
                new Claim("SeflikId", seflikId ?? string.Empty),
                new Claim("SeflikName", seflikName ?? string.Empty),
                new Claim("IsLdapUser", user.IsLdapUser.ToString())
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

            return Ok(new { 
                message = "Giriş başarılı",
                username = user.Username,
                role = role,
                seflikId = seflikId,
                seflikName = seflikName
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Çıkış başarılı" });
        }



        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            
            if (string.IsNullOrEmpty(username))
                return Ok(new { authenticated = false });

            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
            var seflikId = User.FindFirst("SeflikId")?.Value;
            var seflikName = User.FindFirst("SeflikName")?.Value;

            return Ok(new { 
                authenticated = true, 
                username = username,
                role = role,
                seflikId = seflikId,
                seflikName = seflikName
            });
        }
    }
}
