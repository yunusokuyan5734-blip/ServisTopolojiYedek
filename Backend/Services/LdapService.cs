using System.DirectoryServices.Protocols;
using System.Net;
using Backend.Models;

namespace Backend.Services
{
    public class LdapService
    {
        private readonly ILogger<LdapService> _logger;

        public LdapService(ILogger<LdapService> logger)
        {
            _logger = logger;
        }

        public async Task<LdapAuthResult> AuthenticateAsync(string username, string password, LdapConfig config)
        {
            if (config == null || !config.EnableLdap || string.IsNullOrEmpty(config.Host))
            {
                return new LdapAuthResult { Success = false, ErrorMessage = "LDAP not configured" };
            }

            try
            {
                // Port 636 için SSL etkinleştir
                bool useSsl = config.Port == 636;
                
                using var connection = new LdapConnection(new LdapDirectoryIdentifier(config.Host, config.Port));
                connection.SessionOptions.ProtocolVersion = 3;
                
                if (useSsl)
                {
                    connection.SessionOptions.SecureSocketLayer = true;
                    // Kendi imzalı sertifikaları kabul et (özellikle test ortamları için)
                    connection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                    // SSL bağlantısı için timeout'u biraz daha artır
                    connection.Timeout = TimeSpan.FromSeconds(15);
                }
                else
                {
                    connection.Timeout = TimeSpan.FromSeconds(10);
                }

                // İlk bind: Admin credentials ile bağlan
                if (!string.IsNullOrEmpty(config.BindDn) && !string.IsNullOrEmpty(config.BindPassword))
                {
                    connection.Credential = new NetworkCredential(config.BindDn, config.BindPassword);
                    connection.Bind();
                }

                // Kullanıcıyı ara
                var searchFilter = string.Format(config.UserSearchFilter ?? "(uid={0})", username);
                _logger.LogInformation($"LDAP search filter: {searchFilter} (BaseDn: {config.BaseDn})");
                var searchRequest = new SearchRequest(
                    config.BaseDn,
                    searchFilter,
                    SearchScope.Subtree,
                    new[] { "distinguishedName", "cn", "memberOf", "mail", "displayName", "userPrincipalName" }
                );

                var searchResponse = (SearchResponse)connection.SendRequest(searchRequest);
                
                if (searchResponse?.Entries == null || searchResponse.Entries.Count == 0)
                {
                    _logger.LogWarning($"LDAP user not found: {username}");
                    return new LdapAuthResult { Success = false, ErrorMessage = "User not found in LDAP" };
                }
                
                _logger.LogInformation($"LDAP user found: {username}, entries count: {searchResponse.Entries.Count}");

                var userEntry = searchResponse.Entries[0];
                var userDn = userEntry.Attributes["distinguishedName"]?[0]?.ToString();
                var userUpn = userEntry.Attributes["userPrincipalName"]?[0]?.ToString();

                if (string.IsNullOrEmpty(userDn))
                {
                    return new LdapAuthResult { Success = false, ErrorMessage = "User DN not found" };
                }

                // Kullanıcının şifresi ile bind yap (authenticate)
                using var userConnection = new LdapConnection(new LdapDirectoryIdentifier(config.Host, config.Port));
                userConnection.SessionOptions.ProtocolVersion = 3;
                userConnection.SessionOptions.SecureSocketLayer = useSsl;
                
                if (useSsl)
                {
                    userConnection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                    userConnection.Timeout = TimeSpan.FromSeconds(15);
                }
                else
                {
                    userConnection.Timeout = TimeSpan.FromSeconds(10);
                }
                
                userConnection.Credential = new NetworkCredential(userDn, password);
                
                try
                {
                    _logger.LogInformation($"LDAP bind attempt for user: {userDn}");
                    userConnection.Bind();
                    _logger.LogInformation($"LDAP bind successful for user: {userDn}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"LDAP bind failed for user: {userDn}, error: {ex.Message}");

                    var fallbackUpn = !string.IsNullOrWhiteSpace(userUpn)
                        ? userUpn
                        : BuildUpnFromBaseDn(username, config.BaseDn);

                    if (!string.IsNullOrWhiteSpace(fallbackUpn))
                    {
                        try
                        {
                            _logger.LogInformation($"LDAP bind fallback attempt for user: {fallbackUpn}");
                            userConnection.Credential = new NetworkCredential(fallbackUpn, password);
                            userConnection.Bind();
                            _logger.LogInformation($"LDAP bind successful for user (fallback UPN): {fallbackUpn}");
                        }
                        catch (Exception ex2)
                        {
                            _logger.LogWarning($"LDAP bind failed for fallback UPN: {fallbackUpn}, error: {ex2.Message}");
                            return new LdapAuthResult { Success = false, ErrorMessage = "Invalid credentials" };
                        }
                    }
                    else
                    {
                        return new LdapAuthResult { Success = false, ErrorMessage = "Invalid credentials" };
                    }
                }

                // Grup üyeliklerini al (memberOf)
                var memberOfAttribute = userEntry.Attributes[config.GroupMemberAttribute ?? "memberOf"];
                var groups = new List<string>();
                
                if (memberOfAttribute != null)
                {
                    for (int i = 0; i < memberOfAttribute.Count; i++)
                    {
                        var group = memberOfAttribute[i]?.ToString();
                        if (!string.IsNullOrEmpty(group))
                        {
                            groups.Add(group);
                        }
                    }
                }

                // Nested grupları da dahil etmek için LDAP_MATCHING_RULE_IN_CHAIN ile arama
                try
                {
                    var nestedGroups = SearchGroupsByMemberDn(connection, config.BaseDn, userDn);
                    if (nestedGroups.Count > 0)
                    {
                        foreach (var g in nestedGroups)
                        {
                            if (!string.IsNullOrWhiteSpace(g) && !groups.Contains(g))
                                groups.Add(g);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Nested group search failed for user {Username}", username);
                }

                return new LdapAuthResult
                {
                    Success = true,
                    Username = username,
                    DistinguishedName = userDn,
                    DisplayName = userEntry.Attributes["displayName"]?[0]?.ToString() ?? username,
                    Email = userEntry.Attributes["mail"]?[0]?.ToString(),
                    Groups = groups
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LDAP authentication failed for user {Username}", username);
                return new LdapAuthResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        public class LdapTestResult
        {
            public bool Success { get; set; }
            public string Message { get; set; } = string.Empty;
        }

        public async Task<LdapTestResult> TestConnectionAsync(LdapConfig config)
        {
            try
            {
                // Eksik alan kontrolü
                if (string.IsNullOrEmpty(config.Host))
                    return new LdapTestResult { Success = false, Message = "LDAP sunucusu adı boş" };
                
                if (string.IsNullOrEmpty(config.BindDn))
                    return new LdapTestResult { Success = false, Message = "Bind DN boş" };
                
                if (string.IsNullOrEmpty(config.BindPassword))
                    return new LdapTestResult { Success = false, Message = "Bind şifresi boş" };

                // Port 636 için SSL etkinleştir
                bool useSsl = config.Port == 636;
                
                using var connection = new LdapConnection(new LdapDirectoryIdentifier(config.Host, config.Port));
                connection.SessionOptions.ProtocolVersion = 3;
                
                if (useSsl)
                {
                    connection.SessionOptions.SecureSocketLayer = true;
                    // Kendi imzalı sertifikaları kabul et (özellikle test ortamları için)
                    connection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                    // SSL bağlantısı için timeout'u biraz daha artır
                    connection.Timeout = TimeSpan.FromSeconds(15);
                }
                else
                {
                    connection.Timeout = TimeSpan.FromSeconds(5);
                }
                
                connection.Credential = new NetworkCredential(config.BindDn, config.BindPassword);
                
                // Bu bind çağrısı gerçekten credentials'i doğrular
                connection.Bind();
                _logger.LogInformation($"LDAP connection test successful for {config.BindDn} (SSL: {useSsl})");
                return new LdapTestResult { Success = true, Message = "Bağlantı başarılı" };
            }
            catch (System.DirectoryServices.Protocols.LdapException ex) when (ex.ErrorCode == 49)
            {
                // Error code 49 = Invalid Credentials
                _logger.LogWarning($"LDAP connection test failed: Invalid credentials for {config?.BindDn}");
                return new LdapTestResult { Success = false, Message = "LDAP sunucusunda kullanıcı adı veya şifre hatalı" };
            }
            catch (System.DirectoryServices.Protocols.LdapException ex)
            {
                _logger.LogError(ex, $"LDAP connection test failed for {config?.BindDn}");
                return new LdapTestResult { Success = false, Message = $"LDAP hatası: {ex.Message}" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"LDAP connection test failed for {config?.BindDn}");
                return new LdapTestResult { Success = false, Message = $"Bağlantı hatası: {ex.Message}" };
            }
        }

        private List<string> SearchGroupsByMemberDn(LdapConnection connection, string baseDn, string userDn)
        {
            var results = new List<string>();
            if (string.IsNullOrWhiteSpace(baseDn) || string.IsNullOrWhiteSpace(userDn))
                return results;

            // Kullanıcının üye olduğu (nested dahil) tüm grupları getir
            var filter = $"(&(objectClass=group)(member:1.2.840.113556.1.4.1941:={userDn}))";
            var request = new SearchRequest(
                baseDn,
                filter,
                SearchScope.Subtree,
                new[] { "distinguishedName", "cn" }
            );

            var response = (SearchResponse)connection.SendRequest(request);
            if (response?.Entries == null || response.Entries.Count == 0)
                return results;

            for (int i = 0; i < response.Entries.Count; i++)
            {
                var entry = response.Entries[i];
                var dn = entry.DistinguishedName;
                if (!string.IsNullOrWhiteSpace(dn))
                {
                    results.Add(dn);
                    continue;
                }

                var cn = entry.Attributes["cn"]?[0]?.ToString();
                if (!string.IsNullOrWhiteSpace(cn))
                    results.Add($"CN={cn}");
            }

            return results;
        }

        private static string? BuildUpnFromBaseDn(string username, string? baseDn)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(baseDn))
                return null;

            var parts = baseDn.Split(',')
                .Select(p => p.Trim())
                .Where(p => p.StartsWith("DC=", StringComparison.OrdinalIgnoreCase))
                .Select(p => p.Substring(3))
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .ToList();

            if (parts.Count == 0)
                return null;

            var domain = string.Join('.', parts);
            return $"{username}@{domain}";
        }
        public async Task<List<string>> SearchGroupsAsync(LdapConfig config, string searchTerm)
        {
            var groups = new List<string>();

            try
            {
                bool useSsl = config.Port == 636;

                using var connection = new LdapConnection(new LdapDirectoryIdentifier(config.Host, config.Port));
                connection.SessionOptions.ProtocolVersion = 3;
                connection.SessionOptions.SecureSocketLayer = useSsl;
                connection.Timeout = TimeSpan.FromSeconds(10);

                // SSL sertifika doğrulamasını atla (self-signed sertifikalar için)
                if (useSsl)
                {
                    connection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                }

                // Admin credentials ile bağlan
                if (!string.IsNullOrEmpty(config.BindDn) && !string.IsNullOrEmpty(config.BindPassword))
                {
                    connection.Credential = new NetworkCredential(config.BindDn, config.BindPassword);
                    connection.Bind();
                }

                _logger.LogInformation($"LDAP group search: '{searchTerm}' in {config.Host}");

                // Grup arama: objectClass=group ve cn'de arama terimi içeren grupları ara
                var searchFilter = $"(&(objectClass=group)(cn=*{searchTerm}*))";
                var searchRequest = new SearchRequest(
                    config.BaseDn,
                    searchFilter,
                    SearchScope.Subtree,
                    new[] { "cn", "name" }
                );

                var searchResponse = (SearchResponse)connection.SendRequest(searchRequest);
                
                _logger.LogInformation($"LDAP search returned {searchResponse?.Entries?.Count ?? 0} results");
                
                if (searchResponse?.Entries != null && searchResponse.Entries.Count > 0)
                {
                    for (int i = 0; i < searchResponse.Entries.Count; i++)
                    {
                        var entry = searchResponse.Entries[i] as SearchResultEntry;
                        if (entry != null)
                        {
                            // DN'den grup adını çıkar (CN=GroupName,OU=...)
                            var dn = entry.DistinguishedName;
                            if (!string.IsNullOrEmpty(dn))
                            {
                                // CN= kısmını çıkar
                                var cnMatch = System.Text.RegularExpressions.Regex.Match(dn, @"CN=([^,]+)");
                                if (cnMatch.Success)
                                {
                                    var groupName = cnMatch.Groups[1].Value;
                                    if (!string.IsNullOrEmpty(groupName) && !groups.Contains(groupName))
                                        groups.Add(groupName);
                                }
                            }
                        }
                    }
                }

                return groups.OrderBy(g => g).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LDAP group search failed");
                return new List<string>();
            }
        }

        public async Task<List<string>> SearchUsersAsync(LdapConfig config, string searchTerm)
        {
            var users = new List<string>();

            try
            {
                bool useSsl = config.Port == 636;

                using var connection = new LdapConnection(new LdapDirectoryIdentifier(config.Host, config.Port));
                connection.SessionOptions.ProtocolVersion = 3;
                connection.SessionOptions.SecureSocketLayer = useSsl;
                connection.Timeout = TimeSpan.FromSeconds(10);

                // SSL sertifika doğrulamasını atla
                if (useSsl)
                {
                    connection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                }

                // Admin credentials ile bağlan
                if (!string.IsNullOrEmpty(config.BindDn) && !string.IsNullOrEmpty(config.BindPassword))
                {
                    connection.Credential = new NetworkCredential(config.BindDn, config.BindPassword);
                    connection.Bind();
                }

                _logger.LogInformation($"LDAP user search: '{searchTerm}' in {config.Host}");

                // Kullanıcı arama: objectClass=user ve sAMAccountName veya displayName'de arama terimi
                var searchFilter = $"(&(objectClass=user)(|(sAMAccountName=*{searchTerm}*)(displayName=*{searchTerm}*)(cn=*{searchTerm}*)))";
                var searchRequest = new SearchRequest(
                    config.BaseDn,
                    searchFilter,
                    SearchScope.Subtree,
                    new[] { "sAMAccountName", "displayName", "cn" }
                );

                var searchResponse = (SearchResponse)connection.SendRequest(searchRequest);
                
                _logger.LogInformation($"LDAP user search returned {searchResponse?.Entries?.Count ?? 0} results");
                
                if (searchResponse?.Entries != null && searchResponse.Entries.Count > 0)
                {
                    for (int i = 0; i < searchResponse.Entries.Count; i++)
                    {
                        var entry = searchResponse.Entries[i] as SearchResultEntry;
                        if (entry != null)
                        {
                            // sAMAccountName'i al
                            var samAccountName = entry.Attributes["sAMAccountName"]?[0]?.ToString();
                            var displayName = entry.Attributes["displayName"]?[0]?.ToString();
                            
                            if (!string.IsNullOrEmpty(samAccountName))
                            {
                                var userDisplay = !string.IsNullOrEmpty(displayName) 
                                    ? $"{samAccountName} ({displayName})" 
                                    : samAccountName;
                                    
                                if (!users.Contains(userDisplay))
                                    users.Add(userDisplay);
                            }
                        }
                    }
                }

                return users.OrderBy(u => u).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LDAP user search failed");
                return new List<string>();
            }
        }
    }

    public class LdapAuthResult
    {
        public bool Success { get; set; }
        public string? Username { get; set; }
        public string? DistinguishedName { get; set; }
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public List<string> Groups { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }
}
