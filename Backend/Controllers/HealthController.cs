using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly TopologyStoreService _topoStore;

        public HealthController(TopologyStoreService topoStore)
        {
            _topoStore = topoStore;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { status = "ok" });
        }

        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            var topologies = _topoStore.LoadTopologies();
            
            // Rol ve şeflik kontrolü
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userSeflikId = User.FindFirst("SeflikId")?.Value;

            // Admin değilse sadece kendi şefliğinin verilerini göster
            if (role != "Admin" && !string.IsNullOrEmpty(userSeflikId))
            {
                topologies = topologies.Where(t => t.Dept == userSeflikId).ToList();
            }

            // İstatistikler
            var totalTopologies = topologies.Count;
            var criticalCount = topologies.Count(t => t.Critical?.ToLower() == "yüksek");
            var uniqueServers = topologies
                .Select(t => new { t.Server, t.Ip })
                .Distinct()
                .Count();

            return Ok(new
            {
                totalTopologies = totalTopologies,
                criticalServers = criticalCount,
                uniqueServers = uniqueServers,
                platformDistribution = topologies
                    .GroupBy(t => t.Platform ?? "Unknown")
                    .Select(g => new { platform = g.Key, count = g.Count() })
                    .ToList(),
                departmentDistribution = topologies
                    .GroupBy(t => t.Dept ?? "Unknown")
                    .Select(g => new { dept = g.Key, count = g.Count() })
                    .ToList()
            });
        }
    }
}
