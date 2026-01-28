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
            return users.FirstOrDefault(u => u.Username == username);
        }

        public void EnsureDefaultAdmin(PasswordService passwordService)
        {
            var users = LoadUsers();
            var admin = users.FirstOrDefault(u => u.Username == "admin");

            if (admin == null)
            {
                users.Add(new User
                {
                    Username = "admin",
                    PasswordHash = passwordService.HashPassword("admin")
                });
                SaveUsers(users);
                return;
            }

            if (string.IsNullOrEmpty(admin.PasswordHash))
            {
                admin.PasswordHash = passwordService.HashPassword("admin");
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
                SaveUsers(users);
            }
        }
    }
}
