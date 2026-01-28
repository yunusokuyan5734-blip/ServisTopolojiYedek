using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using System.IO;
using System.Threading.Tasks;

namespace Backend.Services;

public class VisioParserService
{
    /// <summary>
    /// Visio dosyasından sunucu ve port bilgilerini çıkarır
    /// </summary>
    public async Task<VisioParseResult> ParseVisioFileAsync(Stream fileStream)
    {
        var result = new VisioParseResult
        {
            Servers = new List<ServerInfo>(),
            Ports = new List<PortInfo>(),
            Connections = new List<ConnectionInfo>()
        };

        try
        {
            // Visio dosyasını XML olarak oku
            var doc = XDocument.Load(fileStream);
            var ns = XNamespace.Get("http://schemas.microsoft.com/office/visio/2012/main");

            // Shape'leri analiz et
            var shapes = doc.Descendants(ns + "Shape");
            var shapeTexts = new Dictionary<string, string>();

            foreach (var shape in shapes)
            {
                var shapeId = shape.Attribute("ID")?.Value;
                var text = shape.Descendants(ns + "Text").FirstOrDefault()?.Value ?? "";
                
                if (!string.IsNullOrWhiteSpace(shapeId) && !string.IsNullOrWhiteSpace(text))
                {
                    shapeTexts[shapeId] = text.Trim();
                }
            }

            // Yazı içeriğini analiz et ve sunucuları, portları çıkar
            foreach (var shapeText in shapeTexts.Values)
            {
                // Sunucu adı desenini ara (GenellikleKAPAL harfle başlar, IP içerebilir)
                if (IsServerName(shapeText))
                {
                    var serverInfo = ParseServerInfo(shapeText);
                    if (!result.Servers.Any(s => s.Name == serverInfo.Name))
                    {
                        result.Servers.Add(serverInfo);
                    }
                }

                // Port numaralarını ara
                var ports = ExtractPorts(shapeText);
                foreach (var port in ports)
                {
                    if (!result.Ports.Any(p => p.Number == port.Number))
                    {
                        result.Ports.Add(port);
                    }
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            result.Error = $"Visio dosyası ayrıştırılırken hata oluştu: {ex.Message}";
        }

        return result;
    }

    private bool IsServerName(string text)
    {
        // Sunucu adı kriterleri:
        // - 3-50 karakter uzunluk
        // - Sayı, harf, tire, nokta, altçizgi içerebilir
        // - İçinde IP adresi olabilir
        return Regex.IsMatch(text, @"^[a-zA-Z0-9\-_.()]+$") && text.Length >= 3 && text.Length <= 50;
    }

    private ServerInfo ParseServerInfo(string text)
    {
        var server = new ServerInfo { Name = text };

        // IP adresi araması
        var ipMatch = Regex.Match(text, @"\b(?:\d{1,3}\.){3}\d{1,3}\b");
        if (ipMatch.Success)
        {
            server.Ip = ipMatch.Value;
            server.Name = text.Replace(ipMatch.Value, "").Trim().TrimEnd(new[] { '(', ')' }).Trim();
        }

        return server;
    }

    private List<PortInfo> ExtractPorts(string text)
    {
        var ports = new List<PortInfo>();

        // Port numaralarını ara (1-65535 arasında)
        var portMatches = Regex.Matches(text, @"\b([1-9]\d{0,4})\b");

        foreach (Match match in portMatches)
        {
            if (int.TryParse(match.Groups[1].Value, out var portNum) && portNum >= 1 && portNum <= 65535)
            {
                var portInfo = GetPortInfo(portNum);
                if (!ports.Any(p => p.Number == portNum))
                {
                    ports.Add(portInfo);
                }
            }
        }

        return ports;
    }

    private PortInfo GetPortInfo(int portNumber)
    {
        // Yaygın portları tanı
        return portNumber switch
        {
            80 => new PortInfo { Number = 80, Name = "HTTP", Color = "#10b981" },
            443 => new PortInfo { Number = 443, Name = "HTTPS", Color = "#3b82f6" },
            22 => new PortInfo { Number = 22, Name = "SSH", Color = "#8b5cf6" },
            3306 => new PortInfo { Number = 3306, Name = "MySQL", Color = "#f59e0b" },
            5432 => new PortInfo { Number = 5432, Name = "PostgreSQL", Color = "#06b6d4" },
            1433 => new PortInfo { Number = 1433, Name = "MSSQL", Color = "#ef4444" },
            27017 => new PortInfo { Number = 27017, Name = "MongoDB", Color = "#10b981" },
            6379 => new PortInfo { Number = 6379, Name = "Redis", Color = "#dc2626" },
            5672 => new PortInfo { Number = 5672, Name = "RabbitMQ", Color = "#f97316" },
            8080 => new PortInfo { Number = 8080, Name = "HTTP Alt", Color = "#06b6d4" },
            3389 => new PortInfo { Number = 3389, Name = "RDP", Color = "#0ea5e9" },
            21 => new PortInfo { Number = 21, Name = "FTP", Color = "#6366f1" },
            25 => new PortInfo { Number = 25, Name = "SMTP", Color = "#f43f5e" },
            110 => new PortInfo { Number = 110, Name = "POP3", Color = "#a855f7" },
            2049 => new PortInfo { Number = 2049, Name = "NFS", Color = "#14b8a6" },
            _ => new PortInfo { Number = portNumber, Name = $"Port {portNumber}", Color = "#64748b" }
        };
    }
}

public class VisioParseResult
{
    public List<ServerInfo> Servers { get; set; } = new();
    public List<PortInfo> Ports { get; set; } = new();
    public List<ConnectionInfo> Connections { get; set; } = new();
    public string? Error { get; set; }
    public bool IsSuccess => string.IsNullOrEmpty(Error);
}

public class ServerInfo
{
    public string Name { get; set; } = string.Empty;
    public string? Ip { get; set; }
    public string? Description { get; set; }
}

public class PortInfo
{
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#64748b";
}

public class ConnectionInfo
{
    public string? Source { get; set; }
    public string? Destination { get; set; }
    public List<int> Ports { get; set; } = new();
    public bool HasFirewall { get; set; }
}
