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
        topologies.Add(topology);
        SaveTopologies(topologies);
    }
}
