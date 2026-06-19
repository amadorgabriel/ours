namespace ProjectOurs.Domain.Entities;

public class Device
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string PushToken { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public DateTimeOffset UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
