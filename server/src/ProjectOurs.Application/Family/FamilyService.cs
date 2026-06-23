using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;

namespace ProjectOurs.Application.Family;

public sealed class FamilyService(IFamilyRepository families, IInviteCodeGenerator inviteCodeGenerator)
{
    private const int MaxInviteCodeAttempts = 10;

    public async Task<FamilyDto> CreateFamilyAsync(
        Guid userId,
        string name,
        CancellationToken cancellationToken = default)
    {
        if (!FamilyRules.IsValidName(name))
        {
            throw new FamilyValidationException("Family name must be between 1 and 100 characters.");
        }

        var normalizedName = FamilyRules.NormalizeName(name);
        var family = await families.CreateWithAdminMembershipAsync(userId, normalizedName, cancellationToken);

        return new FamilyDto(family.Id.ToString(), family.Name);
    }

    public async Task<IReadOnlyList<FamilyWithRoleDto>> ListMineAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var memberships = await families.ListMembershipsByUserIdAsync(userId, cancellationToken);

        return memberships
            .Select(m => new FamilyWithRoleDto(
                m.FamilyId.ToString(),
                m.Family.Name,
                m.Role == FamilyRole.Admin ? "Admin" : "Member"))
            .ToList();
    }

    public async Task<InviteDto> CreateInviteAsync(
        Guid userId,
        Guid familyId,
        string? invitedEmail,
        CancellationToken cancellationToken = default)
    {
        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (membership is null || membership.Role != FamilyRole.Admin)
        {
            throw new FamilyForbiddenException("Only the family admin can create invites.");
        }

        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.Add(FamilyRules.InviteValidity);

        for (var attempt = 0; attempt < MaxInviteCodeAttempts; attempt++)
        {
            var code = inviteCodeGenerator.Generate();

            var invite = new FamilyInvite
            {
                Id = Guid.NewGuid(),
                FamilyId = familyId,
                InviteCode = code,
                InvitedEmail = invitedEmail,
                ExpiresAt = expiresAt,
                Status = InviteStatus.Pending,
                CreatedAt = now,
            };

            try
            {
                await families.AddInviteAsync(invite, cancellationToken);
                return new InviteDto(code, expiresAt);
            }
            catch (InviteCodeConflictException)
            {
                continue;
            }
        }

        throw new InvalidOperationException("Failed to generate a unique invite code.");
    }

    public async Task<JoinResponse> JoinWithCodeAsync(
        Guid userId,
        string inviteCode,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(inviteCode))
        {
            throw new FamilyNotFoundException("Invite code not found.");
        }

        var normalizedCode = FamilyRules.NormalizeInviteCode(inviteCode);
        var invite = await families.GetInviteByCodeWithFamilyAsync(normalizedCode, cancellationToken);
        if (invite is null)
        {
            throw new FamilyNotFoundException("Invite code not found.");
        }

        if (DateTimeOffset.UtcNow > invite.ExpiresAt)
        {
            if (invite.Status == InviteStatus.Pending)
            {
                invite.Status = InviteStatus.Expired;
                await families.UpdateInviteAsync(invite, cancellationToken);
            }

            throw new FamilyValidationException("This invite has expired.");
        }

        if (invite.Status != InviteStatus.Pending)
        {
            throw new FamilyValidationException("This invite is no longer valid.");
        }

        if (await families.MembershipExistsAsync(userId, invite.FamilyId, cancellationToken))
        {
            throw new FamilyConflictException("You are already a member of this family.");
        }

        var membership = new FamilyMembership
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FamilyId = invite.FamilyId,
            Role = FamilyRole.Member,
            JoinedAt = DateTimeOffset.UtcNow,
        };

        await families.AcceptInviteAndAddMembershipAsync(invite, membership, cancellationToken);

        return new JoinResponse(
            invite.FamilyId.ToString(),
            invite.Family.Name,
            "Member");
    }

    public async Task<FamilyDto> UpdateFamilyAsync(
        Guid userId,
        Guid familyId,
        string name,
        CancellationToken cancellationToken = default)
    {
        if (!FamilyRules.IsValidName(name))
        {
            throw new FamilyValidationException("Family name must be between 1 and 100 characters.");
        }

        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (membership is null || membership.Role != FamilyRole.Admin)
        {
            throw new FamilyForbiddenException("Only the family admin can update the family.");
        }

        var family = await families.GetByIdAsync(familyId, cancellationToken);
        if (family is null)
        {
            throw new FamilyNotFoundException("Family not found.");
        }

        family.Name = FamilyRules.NormalizeName(name);
        await families.UpdateFamilyAsync(family, cancellationToken);

        return new FamilyDto(family.Id.ToString(), family.Name);
    }

    public async Task DeleteFamilyAsync(
        Guid userId,
        Guid familyId,
        string confirmName,
        CancellationToken cancellationToken = default)
    {
        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (membership is null || membership.Role != FamilyRole.Admin)
        {
            throw new FamilyForbiddenException("Only the family admin can delete the family.");
        }

        var family = await families.GetByIdAsync(familyId, cancellationToken);
        if (family is null)
        {
            throw new FamilyNotFoundException("Family not found.");
        }

        var normalizedConfirm = FamilyRules.NormalizeName(confirmName);
        if (!string.Equals(normalizedConfirm, family.Name, StringComparison.Ordinal))
        {
            throw new FamilyValidationException("Confirmation name does not match the family name.");
        }

        await families.DeleteFamilyAsync(familyId, cancellationToken);
    }

    public async Task<FamilyMemberListResponse> ListMembersAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var members = await families.ListMembersByFamilyIdAsync(familyId, cancellationToken);
        return new FamilyMemberListResponse(
            members.Select(m => new FamilyMemberDto(
                m.UserId.ToString(),
                m.User.Name,
                m.User.Email,
                m.Role == FamilyRole.Admin ? "Admin" : "Member",
                m.JoinedAt)).ToList());
    }

    public async Task RemoveMemberAsync(
        Guid userId,
        Guid familyId,
        Guid memberUserId,
        CancellationToken cancellationToken = default)
    {
        var requesterMembership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (requesterMembership is null || requesterMembership.Role != FamilyRole.Admin)
        {
            throw new FamilyForbiddenException("Only the family admin can remove members.");
        }

        var targetMembership = await families.GetMembershipAsync(memberUserId, familyId, cancellationToken);
        if (targetMembership is null)
        {
            throw new FamilyNotFoundException("Member not found in this family.");
        }

        if (targetMembership.Role == FamilyRole.Admin)
        {
            var adminCount = await families.CountAdminsByFamilyIdAsync(familyId, cancellationToken);
            if (adminCount <= 1)
            {
                throw new FamilyConflictException("Cannot remove the last admin of the family.");
            }
        }

        await families.RemoveMemberAsync(familyId, memberUserId, cancellationToken);
    }

    private async Task EnsureMembershipAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (membership is null)
        {
            throw new FamilyForbiddenException("You are not a member of this family.");
        }
    }
}
