namespace ProjectOurs.Application.DTOs;

public class CreateGoalRequest
{
    public string Title { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
}

public class GoalDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public int ContributionsCount { get; set; }
    public string CreatorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class GoalDetailDto : GoalDto
{
    public bool IsCompleted { get; set; }
    public decimal MyTotalContribution { get; set; }
    public List<GoalActivityDto> RecentActivity { get; set; } = new();
}

public class GoalActivityDto
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string TimeAgo { get; set; } = string.Empty;
}

public class ContributeRequest
{
    public decimal Amount { get; set; }
}

public class ContributeResponse
{
    public Guid ContributionId { get; set; }
    public int NewProgressPercent { get; set; }
    public bool IsCompleted { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class MyContributionDto
{
    public Guid Id { get; set; }
    public Guid GoalId { get; set; }
    public string GoalTitle { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MyContributionsResponse
{
    public List<MyContributionDto> Contributions { get; set; } = new();
    public decimal TotalContributed { get; set; }
}
