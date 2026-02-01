namespace Backend.Models
{
    public class LdapConfig
    {
        public string? Name { get; set; } // LDAP konfigürasyonunun adı (örn: "LDAP İETT")
        public string? Host { get; set; }
        public int Port { get; set; } = 389;
        public string? BaseDn { get; set; }
        public string? BindDn { get; set; }
        public string? BindPassword { get; set; }
        public bool EnableLdap { get; set; } = false;
        public bool EnableJitProvisioning { get; set; } = false;
        public string? UserSearchFilter { get; set; } = "(uid={0})"; // LDAP arama filtresi
        public string? GroupMemberAttribute { get; set; } = "memberOf"; // Grup üyeliği attribute'u
    }
}
