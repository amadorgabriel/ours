using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Enums;
using GoalEntity = ProjectOurs.Domain.Entities.Goal;

namespace ProjectOurs.Application.Goals;

public sealed class GoalService(
    IGoalRepository goals,
    IFamilyRepository families,
    IGoalContributionRepository contributions,
    IActivityRepository activities)
{
    public async Task<GoalListResponse> ListAsync(
        Guid userId,
        Guid familyId,
        Guid? parentId = null,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var items = await goals.ListActiveByFamilyIdAsync(familyId, parentId, cancellationToken);
        return new GoalListResponse(items.Select(MapToDto).ToList());
    }

    public async Task<GoalDto> CreateAsync(
        Guid userId,
        Guid familyId,
        CreateGoalRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAdminAsync(userId, familyId, cancellationToken);

        if (!GoalRules.IsValidTitle(request.Title))
        {
            throw new GoalValidationException(
                $"Title is required and must be at most {GoalRules.MaxTitleLength} characters.");
        }

        if (!GoalRules.IsValidTargetAmount(request.TargetAmount))
        {
            throw new GoalValidationException(
                $"Target amount must be at least R$ {GoalRules.MinimumTargetAmount:F2}.");
        }

        var resolvedParentId = await ResolveOptionalParentIdAsync(
            request.ParentId,
            familyId,
            cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var goal = new GoalEntity
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            Title = request.Title.Trim(),
            TargetAmount = request.TargetAmount,
            CurrentAmount = 0m,
            Status = GoalStatus.Active,
            CreatedBy = userId,
            CreatedAt = now,
            ParentId = resolvedParentId,
        };

        var created = await goals.AddAsync(goal, cancellationToken);
        return MapToDto(created);
    }

    public async Task DeleteAsync(
        Guid userId,
        Guid familyId,
        Guid goalId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var goal = await goals.GetByIdAndFamilyIdAsync(goalId, familyId, cancellationToken);
        if (goal is null)
        {
            throw new GoalNotFoundException("Goal not found.");
        }

        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        var isCreator = goal.CreatedBy == userId;
        var isAdmin = membership?.Role == FamilyRole.Admin;
        if (!isCreator && !isAdmin)
        {
            throw new GoalForbiddenException("Only the goal creator or family admin can delete this goal.");
        }

        var goalContributions = await contributions.ListByGoalIdAsync(goalId, cancellationToken);
        if (goalContributions.Any(x => x.UserId != userId))
        {
            throw new GoalValidationException(
                "Cannot delete goal with contributions from other family members.");
        }

        await goals.DeleteAsync(
            goal,
            familyId,
            goalContributions.Select(x => x.Id).ToList(),
            cancellationToken);
    }

    private async Task EnsureMembershipAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (membership is null)
        {
            throw new GoalForbiddenException("You are not a member of this family.");
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
            throw new GoalForbiddenException("Only the family admin can create goals.");
        }
    }

    private async Task<Guid?> ResolveOptionalParentIdAsync(
        string? parentId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(parentId))
        {
            return null;
        }

        if (!Guid.TryParse(parentId, out var parsedParentId))
        {
            throw new GoalValidationException("Invalid assistido.");
        }

        var belongs = await activities.ParentBelongsToFamilyAsync(
            parsedParentId,
            familyId,
            cancellationToken);
        if (!belongs)
        {
            throw new GoalValidationException("Assistido not found.");
        }

        return parsedParentId;
    }

    internal static GoalDto MapToDto(GoalEntity goal) =>
        new(
            goal.Id.ToString(),
            goal.Title,
            goal.TargetAmount,
            goal.CurrentAmount,
            goal.Status.ToString(),
            goal.CreatedAt,
            goal.CreatedBy.ToString(),
            goal.ParentId?.ToString());
}
