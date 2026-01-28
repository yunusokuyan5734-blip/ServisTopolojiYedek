using System.Text.Json;
using Backend.Models;

namespace Backend.Services;

public class TopologyStoreService
{
    private readonly string _dataPath;
    private readonly ILogger<TopologyStoreService> _logger;

    public TopologyStoreService(IWebHostEnvironment env, ILogger<TopologyStoreService> logger)
    {
        var dataFolder = Path.Combine(env.ContentRootPath, "Data");
        if (!Directory.Exists(dataFolder))
        {
            Directory.CreateDirectory(dataFolder);
        }
        _dataPath = Path.Combine(dataFolder, "topologies.json");
        _logger = logger;
    }

    public List<Topology> LoadTopologies()
    {
        try
        {
            if (!File.Exists(_dataPath))
            {
                return new List<Topology>();
            }

            var json = File.ReadAllText(_dataPath);
            return JsonSerializer.Deserialize<List<Topology>>(json) ?? new List<Topology>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading topologies");
            return new List<Topology>();
        }
    }

    public void SaveTopologies(List<Topology> topologies)
    {
        try
        {
            var json = JsonSerializer.Serialize(topologies, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            File.WriteAllText(_dataPath, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving topologies");
        }
    }

    public void AddTopology(Topology topology)
    {
        var topologies = LoadTopologies();
        // Aynı sunucu ve IP'ye sahip kayıtları bul (case-insensitive ve trim'li)
        string newServer = (topology.Server ?? "").Trim().ToLowerInvariant();
        string newIp = (topology.Ip ?? "").Trim();
        var sameServer = topologies
            .Where(t =>
                !string.IsNullOrEmpty(t.Server) &&
                !string.IsNullOrEmpty(t.Ip) &&
                t.Server.Trim().ToLowerInvariant() == newServer &&
                t.Ip.Trim() == newIp
            )
            .ToList();

        // Versiyon belirle (tüm geçmişi koru, yeni kayıt bir üst versiyonla eklenir)
        int maxVersion = 0;
        foreach (var t in sameServer)
        {
            if (!string.IsNullOrEmpty(t.Version))
            {
                var vMatch = System.Text.RegularExpressions.Regex.Match(t.Version, @"v(\d+)");
                if (vMatch.Success && int.TryParse(vMatch.Groups[1].Value, out int vNum))
                {
                    if (vNum > maxVersion) maxVersion = vNum;
                }
            }
        }
        // Eğer aynı sunucu ve IP'ye sahip ve aynı versiyonda (örn. v1) kayıt varsa, yeni versiyon ekle
        topology.Version = $"v{(maxVersion + 1)}";
        topologies.Add(topology);
        SaveTopologies(topologies);
    }
}
