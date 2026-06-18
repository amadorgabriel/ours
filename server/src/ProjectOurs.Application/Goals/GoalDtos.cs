namespace ProjectOurs.Application.Goals;

public sealed record CreateGoalRequest(string Title, decimal TargetAmount);

public sealed record GoalDto(
    string Id,
    string Title,
    decimal TargetAmount,
    decimal CurrentAmount,
    string Status,
    DateTimeOffset CreatedAt,
    string CreatedBy);

public sealed record GoalListResponse(IReadOnlyList<GoalDto> Items);
