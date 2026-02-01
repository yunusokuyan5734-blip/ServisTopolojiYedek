namespace Backend.Models
{
    public class User
    {
        public string? Username { get; set; }
        public string? PasswordHash { get; set; }
        public string? Role { get; set; } // "Admin", "SheflikYetkilisi", "User"
        public string? SeflikId { get; set; } // "YAZILIM", "VERI_YONETIM", vb.
        public string? SeflikName { get; set; }
        public string? LdapDistinguishedName { get; set; } // AD'den alınan DN
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsLdapUser { get; set; } = false;
        
        // Granüler izin sistemi
        public string PermissionType { get; set; } = "Sheflik"; // "Sheflik" veya "Specific"
        public List<string> AllowedTopologyIds { get; set; } = new List<string>(); // Spesifik sunucu ID'leri (PermissionType=Specific ise)
    }
}
