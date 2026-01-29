using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SheflikController : ControllerBase
{
    private readonly string _dataPath = Path.Combine("Data", "sheflikler.json");

    [HttpGet("list")]
    public string GetSheflikler()
    {
        try
        {
            if (!System.IO.File.Exists(_dataPath))
            {
                var defaultSheflikler = GetDefaultSheflikler();
                SaveSheflikler(defaultSheflikler);
            }

            var json = System.IO.File.ReadAllText(_dataPath);
            return json;
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new { error = ex.Message });
        }
    }

    [HttpPost("add")]
    public IActionResult AddSheflik([FromBody] Sheflik sheflik)
    {
        try
        {
            var sheflikler = LoadSheflikler();
            sheflik.Date = DateTime.Now.ToString("dd.MM.yyyy HH:mm");
            sheflik.Status = "Aktif";
            sheflikler.Add(sheflik);
            SaveSheflikler(sheflikler);
            return Ok(sheflik);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("update/{index}")]
    public IActionResult UpdateSheflik(int index, [FromBody] Sheflik sheflik)
    {
        try
        {
            var sheflikler = LoadSheflikler();
            if (index < 0 || index >= sheflikler.Count)
            {
                return BadRequest(new { error = "Geçersiz index" });
            }

            sheflikler[index].Name = sheflik.Name;
            sheflikler[index].Date = DateTime.Now.ToString("dd.MM.yyyy HH:mm");
            SaveSheflikler(sheflikler);
            return Ok(sheflikler[index]);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("delete/{index}")]
    public IActionResult DeleteSheflik(int index)
    {
        try
        {
            var sheflikler = LoadSheflikler();
            if (index < 0 || index >= sheflikler.Count)
            {
                return BadRequest(new { error = "Geçersiz index" });
            }

            sheflikler.RemoveAt(index);
            SaveSheflikler(sheflikler);
            return Ok(new { message = "Şeflik silindi" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private List<Sheflik> LoadSheflikler()
    {
        if (!System.IO.File.Exists(_dataPath))
        {
            return GetDefaultSheflikler();
        }

        var json = System.IO.File.ReadAllText(_dataPath);
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        return JsonSerializer.Deserialize<List<Sheflik>>(json, options) ?? new List<Sheflik>();
    }

    private void SaveSheflikler(List<Sheflik> sheflikler)
    {
        var directory = Path.GetDirectoryName(_dataPath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(sheflikler, new JsonSerializerOptions 
        { 
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        });
        System.IO.File.WriteAllText(_dataPath, json);
    }

    private List<Sheflik> GetDefaultSheflikler()
    {
        return new List<Sheflik>
        {
            new Sheflik { Name = "YAZILIM ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "VERİ YÖNETİM ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "BİLİŞİM HİZMETLERİ ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "KURUMSAL MİMARİ ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "AKILLI TOPLU ULAŞIM ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "AR-GE ve FİNANSAL TEKNOLOJİLER ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "HABERLEŞME SİSTEMLERİ VE KURUMSAL HAT ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "ARAÇ İÇİ SİSTEMLER VE SAHA ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "SUNUCU VE NETWORK SİSTEMLER ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "Bakım Onarım Tesisat", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "ULAŞIM PLANLAMA", Status = "Aktif", Date = "07.05.2025 16:13" },
            new Sheflik { Name = "İŞ ZEKASI ŞEFLİĞİ", Status = "Aktif", Date = "07.05.2025 16:13" }
        };
    }
}

public class Sheflik
{
    public string Name { get; set; } = "";
    public string Status { get; set; } = "Aktif";
    public string Date { get; set; } = "";
}
