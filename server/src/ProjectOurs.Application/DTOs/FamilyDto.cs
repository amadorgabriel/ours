namespace ProjectOurs.Application.DTOs;

public class CreateFamilyRequest
{
    public string Name { get; set; } = string.Empty;
}

public class FamilyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public UserDto Admin { get; set; } = null!;
    public List<UserDto> Members { get; set; } = new();
    public List<ParentDto> Parents { get; set; } = new();
    public FamilyInviteDto? ActiveInvite { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FamilyInviteDto
{
    public string InviteCode { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string InviteUrl { get; set; } = string.Empty;
}

public class JoinFamilyRequest
{
    public string InviteCode { get; set; } = string.Empty;
}

public class JoinFamilyResponse
{
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class PendingApprovalDto
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Picture { get; set; }
    public DateTime RequestedAt { get; set; }
}
