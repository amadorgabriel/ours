using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Enums;
using ParentEntity = ProjectOurs.Domain.Entities.Parent;

namespace ProjectOurs.Application.Parents;

public sealed class ParentService(
    IParentRepository parents,
    IFamilyRepository families)
{
    public async Task<ParentListResponse> ListAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var items = await parents.ListByFamilyIdAsync(familyId, cancellationToken);
        return new ParentListResponse(items.Select(MapToDto).ToList());
    }

    public async Task<ParentDetailDto> GetAsync(
        Guid userId,
        Guid familyId,
        Guid parentId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var existing = await parents.GetByIdAndFamilyIdAsync(parentId, familyId, cancellationToken);
        if (existing is null)
        {
            throw new ParentNotFoundException("Parent not found.");
        }

        return MapToDetailDto(existing);
    }

    public async Task<ParentDto> CreateAsync(
        Guid userId,
        Guid familyId,
        CreateParentRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAdminAsync(userId, familyId, cancellationToken);
        ValidateBasicFields(request.Name, request.Relationship);

        var parent = new ParentEntity
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            Name = request.Name.Trim(),
            Relationship = request.Relationship.Trim(),
            BirthDate = request.BirthDate,
        };

        var created = await parents.AddAsync(parent, cancellationToken);
        return MapToDto(created);
    }

    public async Task<ParentDetailDto> UpdateAsync(
        Guid userId,
        Guid familyId,
        Guid parentId,
        UpdateParentRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAdminAsync(userId, familyId, cancellationToken);
        ValidateRequest(request);

        var existing = await parents.GetByIdAndFamilyIdAsync(parentId, familyId, cancellationToken);
        if (existing is null)
        {
            throw new ParentNotFoundException("Parent not found.");
        }

        existing.Name = request.Name.Trim();
        existing.Relationship = request.Relationship.Trim();
        existing.BirthDate = request.BirthDate;
        existing.MedicalInfo = NormalizeOptionalText(request.MedicalInfo);
        existing.EmergencyBriefing = NormalizeOptionalText(request.EmergencyBriefing);

        var updated = await parents.UpdateAsync(existing, cancellationToken);
        return MapToDetailDto(updated);
    }

    private static void ValidateRequest(UpdateParentRequest request)
    {
        ValidateBasicFields(request.Name, request.Relationship);

        if (!ParentRules.IsValidMedicalInfo(request.MedicalInfo))
        {
            throw new ParentValidationException(
                $"Medical info must be at most {ParentRules.MaxMedicalInfoLength} characters.");
        }

        if (!ParentRules.IsValidEmergencyBriefing(request.EmergencyBriefing))
        {
            throw new ParentValidationException(
                $"Emergency briefing must be at most {ParentRules.MaxEmergencyBriefingLength} characters.");
        }
    }

    private static void ValidateBasicFields(string name, string relationship)
    {
        if (!ParentRules.IsValidName(name))
        {
            throw new ParentValidationException(
                $"Name is required and must be at most {ParentRules.MaxNameLength} characters.");
        }

        if (!ParentRules.IsValidRelationship(relationship))
        {
            throw new ParentValidationException(
                $"Relationship is required and must be at most {ParentRules.MaxRelationshipLength} characters.");
        }
    }

    private static string? NormalizeOptionalText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }

    private async Task EnsureMembershipAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (membership is null)
        {
            throw new ParentForbiddenException("You are not a member of this family.");
        }
    }

    private async Task EnsureAdminAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (membership is null || membership.Role != FamilyRole.Admin)
        {
            throw new ParentForbiddenException("Only the family admin can manage parents.");
        }
    }

    internal static ParentDto MapToDto(ParentEntity parent) =>
        new(
            parent.Id.ToString(),
            parent.Name,
            parent.Relationship,
            parent.BirthDate);

    internal static ParentDetailDto MapToDetailDto(ParentEntity parent) =>
        new(
            parent.Id.ToString(),
            parent.Name,
            parent.Relationship,
            parent.BirthDate,
            parent.MedicalInfo,
            parent.EmergencyBriefing);
}
