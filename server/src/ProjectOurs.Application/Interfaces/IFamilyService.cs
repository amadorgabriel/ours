using ProjectOurs.Application.DTOs;

namespace ProjectOurs.Application.Interfaces;

public interface IFamilyService
{
    Task<FamilyDto> CreateFamilyAsync(Guid userId, CreateFamilyRequest request, CancellationToken cancellationToken = default);
    Task<FamilyDto?> GetMyFamilyAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<FamilyInviteDto> GenerateInviteAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<JoinFamilyResponse> JoinFamilyAsync(Guid userId, JoinFamilyRequest request, CancellationToken cancellationToken = default);
    Task<List<PendingApprovalDto>> GetPendingApprovalsAsync(Guid adminId, CancellationToken cancellationToken = default);
    Task ApproveMemberAsync(Guid adminId, Guid userId, CancellationToken cancellationToken = default);
    Task RejectMemberAsync(Guid adminId, Guid userId, CancellationToken cancellationToken = default);
    Task<ParentDto> UpdateParentAsync(Guid adminId, Guid parentId, UpdateParentRequest request, CancellationToken cancellationToken = default);
}
