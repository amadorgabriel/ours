namespace ProjectOurs.Application.DTOs;

public class ParentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public string? MedicalInfo { get; set; }
    public string? EmergencyBriefing { get; set; }
}

public class UpdateParentRequest
{
    public string Name { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public string? MedicalInfo { get; set; }
    public string? EmergencyBriefing { get; set; }
}
