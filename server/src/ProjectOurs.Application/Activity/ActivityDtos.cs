namespace ProjectOurs.Application.Activity;

public sealed record RegisterCallRequest(string? ParentId, string? Notes);

public sealed record ActivityFeedItemDto(
    string Id,
    string Type,
    DateTimeOffset CreatedAt,
    string UserId,
    string UserName,
    string? ParentId,
    string? ParentName,
    string? Notes);

public sealed record ActivityFeedResponse(IReadOnlyList<ActivityFeedItemDto> Items);
