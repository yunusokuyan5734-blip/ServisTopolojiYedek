using System.Text.Json;
using Backend.Models;
using Microsoft.AspNetCore.Hosting;

namespace Backend.Services;

public class VcenterNotesUpdater
{
    private readonly IWebHostEnvironment _env;
    private readonly TopologyStoreService _topoStore;
    private readonly ILogger<VcenterNotesUpdater> _logger;

    public VcenterNotesUpdater(
        IWebHostEnvironment env,
        TopologyStoreService topoStore,
        ILogger<VcenterNotesUpdater> logger)
    {
        _env = env;
        _topoStore = topoStore;
        _logger = logger;
    }

    public VcenterSyncResult SyncFromFile(string? path = null)
    {
        var dataPath = path ?? Path.Combine(_env.ContentRootPath, "Data", "vcenter.json");
        if (!File.Exists(dataPath))
        {
            return new VcenterSyncResult
            {
                Success = false,
                Message = "vCenter veri dosyasi bulunamadi",
                SourcePath = dataPath
            };
        }

        List<VcenterVmInfo> vms;
        try
        {
            using var stream = File.OpenRead(dataPath);
            vms = ReadVmList(stream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "vCenter veri dosyasi okunamadi");
            return new VcenterSyncResult
            {
                Success = false,
                Message = "vCenter veri dosyasi okunamadi",
                SourcePath = dataPath
            };
        }

        if (vms.Count == 0)
        {
            return new VcenterSyncResult
            {
                Success = true,
                Message = "vCenter veri dosyasi bos",
                SourcePath = dataPath
            };
        }

        var byIp = vms
            .Where(v => !string.IsNullOrWhiteSpace(v.IpAddress))
            .GroupBy(v => NormalizeIp(v.IpAddress))
            .ToDictionary(g => g.Key, g => g.First());

        var byName = vms
            .Where(v => !string.IsNullOrWhiteSpace(v.Name))
            .GroupBy(v => NormalizeName(v.Name))
            .ToDictionary(g => g.Key, g => g.First());

        var topologies = _topoStore.LoadTopologies();
        var updated = 0;
        var matched = 0;

        foreach (var topo in topologies)
        {
            var server = (topo.Server ?? topo.Name ?? string.Empty).Trim();
            var ip = (topo.Ip ?? string.Empty).Trim();

            VcenterVmInfo? vm = null;
            var normalizedIp = NormalizeIp(ip);
            if (normalizedIp != null)
            {
                byIp.TryGetValue(normalizedIp, out vm);
            }

            if (vm == null)
            {
                var normalizedName = NormalizeName(server);
                if (normalizedName != null)
                {
                    byName.TryGetValue(normalizedName, out vm);
                }
            }

            if (vm == null)
            {
                continue;
            }

            matched++;
            var vcenterNote = BuildVcenterNote(vm);
            if (string.IsNullOrWhiteSpace(vcenterNote))
            {
                continue;
            }

            var merged = MergeVcenterNote(topo.Note, vcenterNote);
            if (merged != topo.Note)
            {
                topo.Note = merged;
                updated++;
            }
        }

        if (updated > 0)
        {
            _topoStore.SaveTopologies(topologies);
        }

        return new VcenterSyncResult
        {
            Success = true,
            Message = "vCenter notlari guncellendi",
            SourcePath = dataPath,
            Matched = matched,
            Updated = updated,
            TotalVms = vms.Count
        };
    }

    public VcenterNoteResult TryGetNote(string? serverName, string? ipAddress, string? topologyName, string? path = null)
    {
        var dataPath = path ?? Path.Combine(_env.ContentRootPath, "Data", "vcenter.json");
        if (!File.Exists(dataPath))
        {
            return VcenterNoteResult.Fail("vCenter veri dosyasi bulunamadi", dataPath);
        }

        List<VcenterVmInfo> vms;
        try
        {
            using var stream = File.OpenRead(dataPath);
            vms = ReadVmList(stream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "vCenter veri dosyasi okunamadi");
            return VcenterNoteResult.Fail("vCenter veri dosyasi okunamadi", dataPath);
        }

        if (vms.Count == 0)
        {
            return VcenterNoteResult.Fail("vCenter veri dosyasi bos", dataPath);
        }

        var (parsedName, parsedIp) = ParseNameIpFromTopologyName(topologyName);
        var name = NormalizeName(serverName) ?? NormalizeName(parsedName);
        var ip = NormalizeIp(ipAddress) ?? NormalizeIp(parsedIp);

        var byIp = vms
            .Where(v => !string.IsNullOrWhiteSpace(v.IpAddress))
            .GroupBy(v => NormalizeIp(v.IpAddress))
            .ToDictionary(g => g.Key, g => g.First());

        var byName = vms
            .Where(v => !string.IsNullOrWhiteSpace(v.Name))
            .GroupBy(v => NormalizeName(v.Name))
            .ToDictionary(g => g.Key, g => g.First());

        VcenterVmInfo? vm = null;
        if (ip != null)
        {
            byIp.TryGetValue(ip, out vm);
        }

        if (vm == null && name != null)
        {
            byName.TryGetValue(name, out vm);
        }

        if (vm == null)
        {
            return VcenterNoteResult.Fail("vCenter eslesmesi bulunamadi", dataPath);
        }

        var note = BuildVcenterNote(vm);
        if (string.IsNullOrWhiteSpace(note))
        {
            return VcenterNoteResult.Fail("vCenter notu bulunamadi", dataPath);
        }

        return VcenterNoteResult.FromSuccess(note, dataPath, vm.Name, vm.IpAddress);
    }

    private static List<VcenterVmInfo> ReadVmList(Stream stream)
    {
        using var doc = JsonDocument.Parse(stream);
        if (doc.RootElement.ValueKind != JsonValueKind.Array)
        {
            return new List<VcenterVmInfo>();
        }

        var list = new List<VcenterVmInfo>();
        foreach (var item in doc.RootElement.EnumerateArray())
        {
            var name = GetString(item, "Name");
            var description = GetString(item, "Description") ?? GetString(item, "Annotation");
            var ip = GetString(item, "Ip")
                ?? GetString(item, "IpAddress")
                ?? GetString(item, "IP")
                ?? GetString(item, "IP Address");
            var uptime = GetUptime(item);

            if (string.IsNullOrWhiteSpace(name))
            {
                continue;
            }

            var ipList = SplitIpList(ip);
            if (ipList.Count == 0)
            {
                list.Add(new VcenterVmInfo
                {
                    Name = name,
                    Description = description,
                    IpAddress = null,
                    UptimeDays = uptime
                });
                continue;
            }

            foreach (var ipItem in ipList)
            {
                list.Add(new VcenterVmInfo
                {
                    Name = name,
                    Description = description,
                    IpAddress = ipItem,
                    UptimeDays = uptime
                });
            }
        }

        return list;
    }

    private static string? GetString(JsonElement element, string property)
    {
        if (element.TryGetProperty(property, out var value))
        {
            return value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString();
        }
        return null;
    }

    private static string? GetUptime(JsonElement element)
    {
        var uptime = GetString(element, "Uptime (days)")
            ?? GetString(element, "UptimeDays")
            ?? GetString(element, "Uptime");
        return string.IsNullOrWhiteSpace(uptime) ? null : uptime;
    }

    private static string BuildVcenterNote(VcenterVmInfo vm)
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(vm.Description))
        {
            parts.Add("Description: " + vm.Description.Trim());
        }
        if (!string.IsNullOrWhiteSpace(vm.UptimeDays))
        {
            parts.Add("Uptime (days): " + vm.UptimeDays.Trim());
        }
        if (parts.Count == 0)
        {
            return string.Empty;
        }
        return string.Join("\n", parts);
    }

    private static string MergeVcenterNote(string? existing, string vcenterNote)
    {
        const string start = "[vcenter]";
        const string end = "[/vcenter]";
        var block = start + "\n" + vcenterNote + "\n" + end;

        if (string.IsNullOrWhiteSpace(existing))
        {
            return block;
        }

        var current = existing;
        var startIndex = current.IndexOf(start, StringComparison.OrdinalIgnoreCase);
        var endIndex = current.IndexOf(end, StringComparison.OrdinalIgnoreCase);
        if (startIndex >= 0 && endIndex > startIndex)
        {
            var before = current.Substring(0, startIndex).TrimEnd();
            var after = current.Substring(endIndex + end.Length).TrimStart();
            if (!string.IsNullOrEmpty(before) && !string.IsNullOrEmpty(after))
            {
                return before + "\n" + block + "\n" + after;
            }
            if (!string.IsNullOrEmpty(before))
            {
                return before + "\n" + block;
            }
            if (!string.IsNullOrEmpty(after))
            {
                return block + "\n" + after;
            }
            return block;
        }

        return current.TrimEnd() + "\n" + block;
    }

    private static string? NormalizeName(string? value)
    {
        var trimmed = (value ?? string.Empty).Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed.ToLowerInvariant();
    }

    private static string? NormalizeIp(string? value)
    {
        var trimmed = (value ?? string.Empty).Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static List<string> SplitIpList(string? ipValue)
    {
        if (string.IsNullOrWhiteSpace(ipValue))
        {
            return new List<string>();
        }

        var raw = ipValue
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(ip => ip.Trim())
            .Where(ip => ip.Length > 0)
            .ToList();

        return raw;
    }

    private static (string? Name, string? Ip) ParseNameIpFromTopologyName(string? topologyName)
    {
        if (string.IsNullOrWhiteSpace(topologyName))
        {
            return (null, null);
        }

        var match = System.Text.RegularExpressions.Regex.Match(
            topologyName,
            @"^(?<name>.+?)\((?<ip>\d{1,3}(?:\.\d{1,3}){3})\)$");

        if (!match.Success)
        {
            return (null, null);
        }

        return (match.Groups["name"].Value.Trim(), match.Groups["ip"].Value.Trim());
    }
}

public class VcenterVmInfo
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? IpAddress { get; set; }
    public string? UptimeDays { get; set; }
}

public class VcenterSyncResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? SourcePath { get; set; }
    public int TotalVms { get; set; }
    public int Matched { get; set; }
    public int Updated { get; set; }
}

public class VcenterNoteResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? SourcePath { get; set; }
    public string? Note { get; set; }
    public string? MatchedName { get; set; }
    public string? MatchedIp { get; set; }

    public static VcenterNoteResult Fail(string message, string? sourcePath)
    {
        return new VcenterNoteResult { Success = false, Message = message, SourcePath = sourcePath };
    }

    public static VcenterNoteResult FromSuccess(string note, string? sourcePath, string? matchedName, string? matchedIp)
    {
        return new VcenterNoteResult
        {
            Success = true,
            Message = "OK",
            SourcePath = sourcePath,
            Note = note,
            MatchedName = matchedName,
            MatchedIp = matchedIp
        };
    }
}
