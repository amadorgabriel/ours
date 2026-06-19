namespace ProjectOurs.Application.Parents;

public sealed record CreateParentRequest(string Name, string Relationship, DateOnly? BirthDate);

public sealed record UpdateParentRequest(
    string Name,
    string Relationship,
    DateOnly? BirthDate,
    string? MedicalInfo = null,
    string? EmergencyBriefing = null);

public sealed record ParentDto(
    string Id,
    string Name,
    string Relationship,
    DateOnly? BirthDate);

public sealed record ParentDetailDto(
    string Id,
    string Name,
    string Relationship,
    DateOnly? BirthDate,
    string? MedicalInfo,
    string? EmergencyBriefing);

public sealed record ParentListResponse(IReadOnlyList<ParentDto> Items);
