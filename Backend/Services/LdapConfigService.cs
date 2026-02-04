using System.Text.Json;
using Backend.Models;

namespace Backend.Services
{
    public class LdapConfigService
    {
        private readonly string _configPath = Path.Combine("Data", "ldap_config.json");
        private readonly string _mappingsPath = Path.Combine("Data", "ldap_mappings.json");

        public LdapConfigService()
        {
            Directory.CreateDirectory("Data");
        }

        public List<LdapConfig> GetAllConfigs()
        {
            if (!File.Exists(_configPath))
            {
                return new List<LdapConfig>();
            }

            var json = File.ReadAllText(_configPath);
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var configs = JsonSerializer.Deserialize<List<LdapConfig>>(json, options) ?? new List<LdapConfig>();
                // Null veya boş isimli konfigürasyonları filtrele
                return configs.Where(c => !string.IsNullOrEmpty(c.Name)).ToList();
            }
            catch
            {
                // Eski tek config formatı varsa convert et
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var oldConfig = JsonSerializer.Deserialize<LdapConfig>(json, options);
                if (oldConfig != null)
                {
                    if (string.IsNullOrEmpty(oldConfig.Name))
                        oldConfig.Name = "Varsayılan LDAP";
                    return new List<LdapConfig> { oldConfig };
                }
                return new List<LdapConfig>();
            }
        }

        public LdapConfig? GetConfig(string? name = null)
        {
            var configs = GetAllConfigs();
            if (string.IsNullOrEmpty(name) && configs.Count > 0)
                return configs.First();
            
            return configs.FirstOrDefault(c => c.Name == name) ?? new LdapConfig();
        }

        public void SaveConfig(LdapConfig config)
        {
            var configs = GetAllConfigs();
            
            if (string.IsNullOrEmpty(config.Name))
                config.Name = "Varsayılan LDAP";

            var existing = configs.FirstOrDefault(c => c.Name == config.Name);
            if (existing != null)
            {
                existing.Host = config.Host;
                existing.Port = config.Port;
                existing.BaseDn = config.BaseDn;
                existing.BindDn = config.BindDn;
                existing.BindPassword = config.BindPassword;
                existing.EnableLdap = config.EnableLdap;
                existing.EnableJitProvisioning = config.EnableJitProvisioning;
                existing.UserSearchFilter = config.UserSearchFilter;
                existing.GroupMemberAttribute = config.GroupMemberAttribute;
            }
            else
            {
                configs.Add(config);
            }

            var json = JsonSerializer.Serialize(configs, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_configPath, json);
        }

        public void DeleteConfig(string name)
        {
            var configs = GetAllConfigs();
            configs.RemoveAll(c => c.Name == name);
            
            var json = JsonSerializer.Serialize(configs, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_configPath, json);
        }

        public List<LdapGroupMapping> GetMappings()
        {
            if (!File.Exists(_mappingsPath))
            {
                var defaultMappings = new List<LdapGroupMapping>();
                SaveMappings(defaultMappings);
                return defaultMappings;
            }

            var json = File.ReadAllText(_mappingsPath);
            return JsonSerializer.Deserialize<List<LdapGroupMapping>>(json) ?? new List<LdapGroupMapping>();
        }

        public void SaveMappings(List<LdapGroupMapping> mappings)
        {
            var json = JsonSerializer.Serialize(mappings, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_mappingsPath, json);
        }

        public void AddMapping(LdapGroupMapping mapping)
        {
            var mappings = GetMappings();
            mapping.Id = mappings.Count > 0 ? mappings.Max(m => m.Id) + 1 : 1;
            mapping.CreatedAt = DateTime.UtcNow;
            mappings.Add(mapping);
            SaveMappings(mappings);
        }

        public void UpdateMapping(int id, LdapGroupMapping updatedMapping)
        {
            var mappings = GetMappings();
            var existing = mappings.FirstOrDefault(m => m.Id == id);
            if (existing != null)
            {
                existing.LdapGroupName = updatedMapping.LdapGroupName;
                existing.SeflikId = updatedMapping.SeflikId;
                existing.SeflikName = updatedMapping.SeflikName;
                existing.AssignedRole = updatedMapping.AssignedRole;
                SaveMappings(mappings);
            }
        }

        public void DeleteMapping(int id)
        {
            var mappings = GetMappings();
            mappings.RemoveAll(m => m.Id == id);
            SaveMappings(mappings);
        }

        public (string? Role, string? SeflikId, string? SeflikName) ResolveGroupsToRole(List<string> userGroups)
        {
            var mappings = GetMappings();

            string NormalizeGroupName(string value)
            {
                if (string.IsNullOrWhiteSpace(value)) return string.Empty;

                var trimmed = value.Trim();
                // DN içindeki CN= değerini çek
                var cnMatch = System.Text.RegularExpressions.Regex.Match(trimmed, @"CN=([^,]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                if (cnMatch.Success)
                {
                    return cnMatch.Groups[1].Value.Trim().ToLower();
                }

                return trimmed.ToLower();
            }
            
            // Kullanıcının grupları ile eşleşen mapping'leri bul
            foreach (var group in userGroups)
            {
                var normalizedUserGroup = NormalizeGroupName(group);
                
                var mapping = mappings.FirstOrDefault(m => 
                    !string.IsNullOrEmpty(m.LdapGroupName) && 
                    NormalizeGroupName(m.LdapGroupName).Equals(normalizedUserGroup, StringComparison.OrdinalIgnoreCase));

                if (mapping != null)
                {
                    // İlk eşleşen mapping'i döndür (Admin öncelikli olabilir)
                    if (mapping.AssignedRole == "Admin")
                    {
                        return ("Admin", mapping.SeflikId, mapping.SeflikName);
                    }
                    
                    return (mapping.AssignedRole, mapping.SeflikId, mapping.SeflikName);
                }
            }

            // Hiçbir grup eşleşmezse null döndür (giriş engellenecek)
            return (null, null, null);
        }
    }
}
