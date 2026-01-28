using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopologyController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<TopologyController> _logger;
    private readonly TopologyStoreService _topoStore;

    public TopologyController(IWebHostEnvironment env, ILogger<TopologyController> logger, TopologyStoreService topoStore)
    {
        _env = env;
        _logger = logger;
        _topoStore = topoStore;
    }

    [HttpGet("list")]
    public IActionResult GetTopologies()
    {
        var topologies = _topoStore.LoadTopologies();
        return Ok(topologies);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFileCollection files, 
        [FromForm] string dept, [FromForm] string platform, [FromForm] string critical, 
        [FromForm] string? note, [FromForm] string? server, [FromForm] string? ip,
        [FromForm] string? topologyName)
    {
        try
        {
            var username = User.Identity?.Name ?? "admin";
            
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "Dosya seçilmedi" });
            }

            if (string.IsNullOrEmpty(dept) || string.IsNullOrEmpty(platform) || string.IsNullOrEmpty(critical))
            {
                return BadRequest(new { message = "Tüm alanları doldurunuz" });
            }

            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uploadedFiles = new List<string>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var fileName = Path.GetFileName(file.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    
                    uploadedFiles.Add(fileName);
                    
                    // Save topology metadata with versioned name
                    var topology = new Topology
                    {
                        Server = server ?? fileName.Split('.')[0],
                        Ip = ip ?? "N/A",
                        File = fileName,
                        Dept = dept,
                        Version = "v1",
                        Date = DateTime.Now.ToString("yyyy-MM-dd"),
                        User = username,
                        Platform = platform,
                        Critical = critical,
                        Note = note,
                        Name = topologyName ?? server ?? fileName.Split('.')[0]
                    };
                    
                    _topoStore.AddTopology(topology);
                    _logger.LogInformation($"Topology added: {topologyName ?? fileName} by {username}");
                }
            }

            return Ok(new 
            { 
                message = "Dosyalar başarıyla yüklendi",
                files = uploadedFiles,
                user = username
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading files");
            return StatusCode(500, new { message = "Dosya yükleme hatası: " + ex.Message });
        }
    }

    [HttpDelete("delete")]
    public IActionResult DeleteTopology([FromQuery] string file)
    {
        try
        {
            if (string.IsNullOrEmpty(file))
            {
                return BadRequest(new { message = "Dosya adı gerekli" });
            }

            // Dosyayı uploads klasöründen sil
            var filePath = Path.Combine(_env.WebRootPath, "uploads", file);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
                _logger.LogInformation($"File deleted: {file}");
            }

            // Topoloji metadata'sını listeden sil
            var topologies = _topoStore.LoadTopologies();
            var initialCount = topologies.Count;
            
            // File property'si için case-insensitive karşılaştırma
            topologies.RemoveAll(t => 
                string.Equals(t.File, file, StringComparison.OrdinalIgnoreCase)
            );
            
            _topoStore.SaveTopologies(topologies);
            
            var removedCount = initialCount - topologies.Count;
            _logger.LogInformation($"Topology removed: {file}, Count: {removedCount}");

            return Ok(new { 
                message = $"Topoloji başarıyla silindi ({removedCount} kayıt)",
                removed = removedCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting topology");
            return StatusCode(500, new { message = "Silme hatası: " + ex.Message });
        }
    }
}
