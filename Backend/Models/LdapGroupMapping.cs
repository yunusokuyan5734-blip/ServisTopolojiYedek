namespace Backend.Models
{
    public class LdapGroupMapping
    {
        public int Id { get; set; }
        public string? LdapGroupName { get; set; } // "CN=Yazilim,OU=Groups,..."
        public string? SeflikId { get; set; }
        public string? SeflikName { get; set; }
        public string? AssignedRole { get; set; } // "Admin", "SheflikYetkilisi", "User"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
