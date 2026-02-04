using System.Text.Json;
using Backend.Models;
using Microsoft.AspNetCore.Hosting;

namespace Backend.Services
{
    public class JsonStoreService
    {
        private readonly string _usersPath;

        public JsonStoreService(IWebHostEnvironment env)
        {
            _usersPath = Path.Combine(env.ContentRootPath, "Data", "users.json");
        }

        public List<User> LoadUsers()
        {
            if (!File.Exists(_usersPath))
                return new List<User>();

            var json = File.ReadAllText(_usersPath);
            return JsonSerializer.Deserialize<List<User>>(json) ?? new List<User>();
        }

        public void SaveUsers(List<User> users)
        {
            var directory = Path.GetDirectoryName(_usersPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            var json = JsonSerializer.Serialize(users, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_usersPath, json);
        }

        public User? GetUser(string username)
        {
            var users = LoadUsers();
            return users.FirstOrDefault(u =>
                !string.IsNullOrEmpty(u.Username) &&
                string.Equals(u.Username.Trim(), username?.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        public void EnsureDefaultAdmin(PasswordService passwordService)
        {
            var users = LoadUsers();
            users = users.Where(u => !string.IsNullOrWhiteSpace(u.Username)).ToList();
            var admin = users.FirstOrDefault(u => u.Username == "admin");

            if (admin == null)
            {
                users.Add(new User
                {
                    Username = "admin",
                    PasswordHash = passwordService.HashPassword("admin"),
                    Role = "Admin",
                    SeflikId = null,
                    SeflikName = null,
                    IsLdapUser = false,
                    CreatedAt = DateTime.UtcNow
                });
                SaveUsers(users);
                return;
            }

            if (string.IsNullOrEmpty(admin.PasswordHash))
            {
                admin.PasswordHash = passwordService.HashPassword("admin");
                admin.Role = "Admin";
                SaveUsers(users);
                return;
            }

            if (string.IsNullOrWhiteSpace(admin.Role))
            {
                admin.Role = "Admin";
                SaveUsers(users);
            }
        }

        public void UpdateUser(User user)
        {
            var users = LoadUsers();
            var existing = users.FirstOrDefault(u => u.Username == user.Username);
            
            if (existing != null)
            {
                existing.PasswordHash = user.PasswordHash;
                existing.Role = user.Role;
                existing.SeflikId = user.SeflikId;
                existing.SeflikName = user.SeflikName;
                existing.LdapDistinguishedName = user.LdapDistinguishedName;
                existing.IsLdapUser = user.IsLdapUser;
                existing.PermissionType = user.PermissionType;
                existing.AllowedTopologyIds = user.AllowedTopologyIds;
                SaveUsers(users);
            }
        }

        public void AddUser(User user)
        {
            var users = LoadUsers();
            users.Add(user);
            SaveUsers(users);
        }

        public List<User> GetAllUsers()
        {
            return LoadUsers();
        }

        public void DeleteUser(string username)
        {
            var users = LoadUsers();
            users.RemoveAll(u =>
                !string.IsNullOrEmpty(u.Username) &&
                string.Equals(u.Username.Trim(), username?.Trim(), StringComparison.OrdinalIgnoreCase));
            SaveUsers(users);
        }
    }
}
