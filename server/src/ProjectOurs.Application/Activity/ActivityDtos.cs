namespace ProjectOurs.Application.Activity;

public sealed record RegisterCallRequest(string? ParentId, string? Notes);

public sealed record RegisterVisitRequest(
    string? ParentId,
    bool AllDay,
    DateTimeOffset StartAt,
    DateTimeOffset? EndAt,
    string? PhotoBase64,
    string? MimeType);

public sealed record ActivitySeenByDto(string UserId, string UserName, DateTimeOffset SeenAt);

public sealed record ActivityFeedItemDto(
    string Id,
    string Type,
    DateTimeOffset CreatedAt,
    string UserId,
    string UserName,
    string? ParentId,
    string? ParentName,
    string? Notes,
    bool? AllDay = null,
    DateTimeOffset? StartAt = null,
    DateTimeOffset? EndAt = null,
    string? PhotoUrl = null,
    string? GoalId = null,
    string? GoalTitle = null,
    decimal? ContributionAmount = null,
    IReadOnlyList<ActivitySeenByDto>? SeenBy = null);

public sealed record ActivityFeedResponse(
    IReadOnlyList<ActivityFeedItemDto> Items,
    int UnreadCount);
