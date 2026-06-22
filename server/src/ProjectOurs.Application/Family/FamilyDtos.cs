namespace ProjectOurs.Application.Family;

public sealed record CreateFamilyRequest(string Name);

public sealed record FamilyDto(string Id, string Name);

public sealed record FamilyWithRoleDto(string Id, string Name, string Role);

public sealed record CreateInviteRequest(string? InvitedEmail);

public sealed record InviteDto(string InviteCode, DateTimeOffset ExpiresAt);

public sealed record JoinRequest(string InviteCode);

public sealed record JoinResponse(string FamilyId, string FamilyName, string Role);

public sealed record UpdateFamilyRequest(string Name);

public sealed record DeleteFamilyRequest(string ConfirmName);
