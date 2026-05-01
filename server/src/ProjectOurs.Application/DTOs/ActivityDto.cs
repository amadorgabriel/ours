namespace ProjectOurs.Application.DTOs;

public class CreateCallActivityRequest
{
    public Guid? ParentId { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Notes { get; set; }
}

public class ActivityDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public UserSummaryDto User { get; set; } = null!;
    public ParentSummaryDto? Parent { get; set; }
    public ActivityMetadataDto Metadata { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string FormattedTime { get; set; } = string.Empty;
}

public class UserSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
}

public class ParentSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class ActivityMetadataDto
{
    public int? DurationMinutes { get; set; }
    public string? Notes { get; set; }
}

public class ActivityFeedResponse
{
    public List<ActivityDto> Activities { get; set; } = new();
    public bool HasMore { get; set; }
    public int Total { get; set; }
}

public class UserStatsDto
{
    public int TotalCallsThisMonth { get; set; }
    public int TotalCallsLastMonth { get; set; }
    public int TotalDurationThisMonth { get; set; }
    public int CurrentStreakDays { get; set; }
}
