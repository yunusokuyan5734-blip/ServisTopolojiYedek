using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Backend.Models;
using Backend.Services;


namespace Backend.Controllers
{
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

        [HttpPost("update")]
        public IActionResult UpdateTopology([FromBody] Topology updated)
        {
            if (updated == null || string.IsNullOrEmpty(updated.Server) || string.IsNullOrEmpty(updated.Ip))
                return BadRequest(new { message = "Geçersiz veri" });

            var topologies = _topoStore.LoadTopologies();
            var idx = topologies.FindIndex(t =>
                (t.Server ?? t.Name ?? "").Trim().ToLowerInvariant() == (updated.Server ?? updated.Name ?? "").Trim().ToLowerInvariant()
                && (t.Ip ?? "").Trim() == (updated.Ip ?? "").Trim()
                && (t.Version ?? "v1") == (updated.Version ?? "v1")
            );
            if (idx == -1)
                return NotFound(new { message = "Kayıt bulunamadı" });

            // Güncelle
            topologies[idx].Name = updated.Name;
            topologies[idx].Server = updated.Server;
            topologies[idx].Ip = updated.Ip;
            topologies[idx].File = updated.File;
            topologies[idx].Dept = updated.Dept;
            topologies[idx].Platform = updated.Platform;
            topologies[idx].Critical = updated.Critical;
            topologies[idx].Note = updated.Note;
            topologies[idx].Date = updated.Date;
            topologies[idx].User = updated.User;
            // Versiyon ve diğer alanlar değişmeden kalır
            _topoStore.SaveTopologies(topologies);
            return Ok(new { message = "Güncellendi" });
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

                        // Dosya adından server ve ip çek
                        string parsedServer = server;
                        string parsedIp = ip;
                        var nameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                        var regex = new System.Text.RegularExpressions.Regex(@"^(.+?)\(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\)");
                        var match = regex.Match(nameWithoutExt);
                        if (string.IsNullOrWhiteSpace(parsedServer) || string.IsNullOrWhiteSpace(parsedIp))
                        {
                            if (match.Success)
                            {
                                if (string.IsNullOrWhiteSpace(parsedServer)) parsedServer = match.Groups[1].Value.Trim();
                                if (string.IsNullOrWhiteSpace(parsedIp)) parsedIp = match.Groups[2].Value.Trim();
                            }
                            else
                            {
                                if (string.IsNullOrWhiteSpace(parsedServer)) parsedServer = nameWithoutExt;
                                if (string.IsNullOrWhiteSpace(parsedIp)) parsedIp = "N/A";
                            }
                        }

                        var topology = new Topology
                        {
                            Server = parsedServer,
                            Ip = parsedIp,
                            File = fileName,
                            Dept = dept,
                            Version = "v1", // AddTopology backend'de otomatik set edecek
                            Date = DateTime.Now.ToString("yyyy-MM-dd"),
                            User = username,
                            Platform = platform,
                            Critical = critical,
                            Note = note,
                            Name = topologyName ?? parsedServer ?? nameWithoutExt
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

                return Ok(new
                {
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

        [HttpPost("save-diagram")]
        public IActionResult SaveDiagram([FromBody] DiagramSaveRequest request)
        {
            try
            {
                var username = User.Identity?.Name ?? "admin";

                if (string.IsNullOrEmpty(request.TopologyName) || request.Connections == null)
                {
                    return BadRequest(new { message = "Topoloji adı ve bağlantılar gerekli" });
                }

                var fileName = $"{request.TopologyName.Replace(" ", "_")}_diagram.json";
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);
                var json = System.Text.Json.JsonSerializer.Serialize(request.Connections, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
                System.IO.File.WriteAllText(filePath, json);

                var topology = new Topology
                {
                    Server = request.TopologyName,
                    Ip = "Diagram",
                    File = fileName,
                    Dept = request.Dept ?? "Çizim Alanı",
                    Version = "v1",
                    Date = DateTime.Now.ToString("yyyy-MM-dd"),
                    User = username,
                    Platform = "Diagram",
                    Critical = request.Critical ?? "Orta",
                    Note = request.Note,
                    Name = request.TopologyName
                };
                _topoStore.AddTopology(topology);
                _logger.LogInformation($"Diagram saved: {request.TopologyName} by {username}");

                return Ok(new { message = "Topoloji diyagramı başarıyla kaydedildi", file = fileName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving diagram");
                return StatusCode(500, new { message = "Kaydetme hatası: " + ex.Message });
            }
        }
    }
}
