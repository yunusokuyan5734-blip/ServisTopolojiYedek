using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;
using Backend.Services;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LdapController : ControllerBase
    {
        private readonly LdapConfigService _ldapConfigService;
        private readonly LdapService _ldapService;

        public LdapController(LdapConfigService ldapConfigService, LdapService ldapService)
        {
            _ldapConfigService = ldapConfigService;
            _ldapService = ldapService;
        }

        [HttpGet("config")]
        public IActionResult GetConfig([FromQuery] string? name = null)
        {
            // Yönetici kontrolü
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            var config = _ldapConfigService.GetConfig(name);
            // Şifreyi frontend'e gönderme
            if (config != null && !string.IsNullOrEmpty(config.BindPassword))
                config.BindPassword = "********";
            return Ok(config);
        }

        [HttpGet("configs")]
        public IActionResult GetAllConfigs()
        {
            // Yönetici kontrolü
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            var configs = _ldapConfigService.GetAllConfigs();
            // Şifreleri frontend'e gönderme
            foreach (var config in configs)
            {
                if (!string.IsNullOrEmpty(config.BindPassword))
                    config.BindPassword = "********";
            }
            return Ok(configs);
        }

        [HttpPost("config")]
        public IActionResult SaveConfig([FromBody] LdapConfig config)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            if (string.IsNullOrWhiteSpace(config.Name))
                return BadRequest(new { message = "LDAP İsmi gereklidir" });

            // Şifre değiştirilmemişse mevcut şifreyi koru
            var existingConfig = _ldapConfigService.GetConfig(config.Name);
            if (string.IsNullOrWhiteSpace(config.BindPassword) || config.BindPassword == "********")
            {
                config.BindPassword = existingConfig?.BindPassword ?? "";
            }

            if (config.Port <= 0)
            {
                config.Port = 636;
            }

            if (string.IsNullOrWhiteSpace(config.UserSearchFilter))
            {
                config.UserSearchFilter = "(sAMAccountName={0})";
            }

            if (string.IsNullOrWhiteSpace(config.GroupMemberAttribute))
            {
                config.GroupMemberAttribute = "memberOf";
            }

            _ldapConfigService.SaveConfig(config);
            return Ok(new { message = "LDAP yapılandırması kaydedildi", name = config.Name });
        }

        [HttpDelete("config/{name}")]
        public IActionResult DeleteConfig(string name)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            _ldapConfigService.DeleteConfig(System.Net.WebUtility.UrlDecode(name));
            return Ok(new { message = "LDAP yapılandırması silindi" });
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestConnection([FromBody] LdapConfig config)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            var testResult = await _ldapService.TestConnectionAsync(config);
            if (testResult.Success)
                return Ok(new { success = true, message = testResult.Message });
            else
                return Ok(new { success = false, message = testResult.Message });
        }

        [HttpGet("mappings")]
        public IActionResult GetMappings()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            var mappings = _ldapConfigService.GetMappings();
            return Ok(mappings);
        }

        [HttpPost("mappings")]
        public IActionResult AddMapping([FromBody] LdapGroupMapping mapping)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            _ldapConfigService.AddMapping(mapping);
            return Ok(new { message = "Grup eşleşmesi eklendi" });
        }

        [HttpPut("mappings/{id}")]
        public IActionResult UpdateMapping(int id, [FromBody] LdapGroupMapping mapping)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            _ldapConfigService.UpdateMapping(id, mapping);
            return Ok(new { message = "Grup eşleşmesi güncellendi" });
        }

        [HttpDelete("mappings/{id}")]
        public IActionResult DeleteMapping(int id)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });
            _ldapConfigService.DeleteMapping(id);
            return Ok(new { message = "Grup eşleşmesi silindi" });
        }

        [HttpPost("search-groups")]
        public async Task<IActionResult> SearchGroups([FromBody] SearchGroupRequest request)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            if (string.IsNullOrEmpty(request.ConfigName) || string.IsNullOrEmpty(request.SearchTerm))
                return BadRequest(new { message = "ConfigName ve SearchTerm gereklidir" });

            var config = _ldapConfigService.GetConfig(request.ConfigName);
            if (config == null)
                return NotFound(new { message = "LDAP yapılandırması bulunamadı" });

            var groups = await _ldapService.SearchGroupsAsync(config, request.SearchTerm);
            return Ok(new { groups = groups });
        }

        [HttpPost("search-users")]
        public async Task<IActionResult> SearchUsers([FromBody] SearchGroupRequest request)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
                return Unauthorized(new { message = "Yalnızca yöneticiler bu işlemi yapabilir" });

            if (string.IsNullOrEmpty(request.ConfigName) || string.IsNullOrEmpty(request.SearchTerm))
                return BadRequest(new { message = "ConfigName ve SearchTerm gereklidir" });

            var config = _ldapConfigService.GetConfig(request.ConfigName);
            if (config == null)
                return NotFound(new { message = "LDAP yapılandırması bulunamadı" });

            var users = await _ldapService.SearchUsersAsync(config, request.SearchTerm);
            return Ok(new { users = users });
        }
    }

    public class SearchGroupRequest
    {
        public string? ConfigName { get; set; }
        public string? SearchTerm { get; set; }
    }
}

