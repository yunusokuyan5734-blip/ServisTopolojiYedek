using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using System.Threading.Tasks;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopologyImportController : ControllerBase
{
    private readonly VisioParserService _visioParser;

    public TopologyImportController()
    {
        _visioParser = new VisioParserService();
    }

    /// <summary>
    /// Visio dosyasını yükle ve sunucu/port bilgilerini çıkar
    /// </summary>
    [HttpPost("upload-visio")]
    public async Task<IActionResult> UploadVisio([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "Dosya seçilmemiş" });

        // Dosya türünü kontrol et
        var allowedExtensions = new[] { ".vsdx", ".vsd", ".xml" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();
        
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest(new { error = "Sadece Visio (.vsdx, .vsd) dosyaları desteklenir" });

        try
        {
            using (var stream = file.OpenReadStream())
            {
                var result = await _visioParser.ParseVisioFileAsync(stream);
                
                if (!result.IsSuccess)
                    return BadRequest(new { error = result.Error });

                return Ok(new
                {
                    success = true,
                    servers = result.Servers,
                    ports = result.Ports,
                    message = $"{result.Servers.Count} sunucu ve {result.Ports.Count} port bulundu"
                });
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Dosya işlenirken hata: {ex.Message}" });
        }
    }
}
