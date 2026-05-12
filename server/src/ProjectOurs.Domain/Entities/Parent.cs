namespace ProjectOurs.Domain.Entities;

public class Parent
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly? BirthDate { get; set; }
    public string? MedicalInfo { get; set; }
    public string? EmergencyBriefing { get; set; }

    public Family Family { get; set; } = null!;
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
