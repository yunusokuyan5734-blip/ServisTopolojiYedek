namespace Backend.Models;

public class DiagramSaveRequest
{
    public string? TopologyName { get; set; }
    public string? Dept { get; set; }
    public string? Critical { get; set; }
    public string? Note { get; set; }
    public object? Connections { get; set; }
    public object? ListNotes { get; set; }
    public object? DiagramNotes { get; set; }
}
