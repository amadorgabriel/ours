namespace ProjectOurs.Application.Goals;

public sealed record CreateGoalContributionRequest(decimal Amount, bool IsPrivate);

public sealed record UpdateGoalContributionRequest(decimal Amount, bool IsPrivate);

public sealed record GoalContributionDto(
    string Id,
    decimal? Amount,
    bool IsPrivate,
    string UserId,
    string UserName,
    DateTimeOffset CreatedAt);

public sealed record GoalContributionListResponse(IReadOnlyList<GoalContributionDto> Items);
