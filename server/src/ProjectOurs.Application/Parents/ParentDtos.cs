namespace ProjectOurs.Application.Parents;

public sealed record CreateParentRequest(string Name, string Relationship, DateOnly? BirthDate);

public sealed record UpdateParentRequest(string Name, string Relationship, DateOnly? BirthDate);

public sealed record ParentDto(
    string Id,
    string Name,
    string Relationship,
    DateOnly? BirthDate);

public sealed record ParentListResponse(IReadOnlyList<ParentDto> Items);
