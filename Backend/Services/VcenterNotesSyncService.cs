using Microsoft.Extensions.Hosting;

namespace Backend.Services;

public class VcenterNotesSyncService : BackgroundService
{
    private readonly VcenterNotesUpdater _updater;
    private readonly ILogger<VcenterNotesSyncService> _logger;

    public VcenterNotesSyncService(
        VcenterNotesUpdater updater,
        ILogger<VcenterNotesSyncService> logger)
    {
        _updater = updater;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RunOnceSafe(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = GetDelayUntilNextRun(TimeSpan.FromHours(7));
            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }

            await RunOnceSafe(stoppingToken);
        }
    }

    private async Task RunOnceSafe(CancellationToken stoppingToken)
    {
        try
        {
            var result = _updater.SyncFromFile();
            if (result.Success)
            {
                _logger.LogInformation("vCenter sync: matched={Matched}, updated={Updated}, total={Total}, source={Source}",
                    result.Matched, result.Updated, result.TotalVms, result.SourcePath);
            }
            else
            {
                _logger.LogWarning("vCenter sync skipped: {Message} ({Source})", result.Message, result.SourcePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "vCenter sync failed");
        }

        await Task.CompletedTask;
    }

    private static TimeSpan GetDelayUntilNextRun(TimeSpan runAt)
    {
        var now = DateTime.Now;
        var next = new DateTime(now.Year, now.Month, now.Day, runAt.Hours, runAt.Minutes, runAt.Seconds);
        if (now >= next)
        {
            next = next.AddDays(1);
        }
        return next - now;
    }
}
