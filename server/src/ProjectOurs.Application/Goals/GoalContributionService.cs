using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Activity;
using GoalContributionEntity = ProjectOurs.Domain.Entities.GoalContribution;

namespace ProjectOurs.Application.Goals;

public sealed class GoalContributionService(
    IGoalRepository goals,
    IGoalContributionRepository contributions,
    IFamilyRepository families,
    ActivityService activityService)
{
    public async Task<GoalContributionListResponse> ListAsync(
        Guid userId,
        Guid familyId,
        Guid goalId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);
        var goal = await EnsureGoalInFamilyAsync(goalId, familyId, cancellationToken);

        var items = await contributions.ListByGoalIdAsync(goalId, cancellationToken);
        return new GoalContributionListResponse(
            items.Select(x => MapToDto(x, userId)).ToList());
    }

    public async Task<GoalContributionDto> CreateAsync(
        Guid userId,
        Guid familyId,
        Guid goalId,
        CreateGoalContributionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);
        var goal = await EnsureGoalInFamilyAsync(goalId, familyId, cancellationToken);

        if (!GoalRules.IsValidContributionAmount(request.Amount))
        {
            throw new GoalValidationException(
                $"Contribution amount must be at least R$ {GoalRules.MinimumContributionAmount:F2}.");
        }

        Guid parentId;
        try
        {
            parentId = await activityService.EnsureParentAsync(request.ParentId, familyId, cancellationToken);
        }
        catch (ActivityValidationException ex)
        {
            throw new GoalValidationException(ex.Message);
        }

        var now = DateTimeOffset.UtcNow;
        var contribution = new GoalContributionEntity
        {
            Id = Guid.NewGuid(),
            GoalId = goalId,
            UserId = userId,
            Amount = request.Amount,
            IsPrivate = request.IsPrivate,
            CreatedAt = now,
        };

        var created = await contributions.AddWithGoalUpdateAsync(contribution, cancellationToken);

        if (!request.IsPrivate)
        {
            await activityService.CreateContributionActivityAsync(
                userId,
                familyId,
                goalId,
                goal.Title,
                created.Id,
                created.Amount,
                parentId,
                cancellationToken);
        }

        return MapToDto(created, userId);
    }

    public async Task<GoalContributionDto> UpdateAsync(
        Guid userId,
        Guid familyId,
        Guid goalId,
        Guid contributionId,
        UpdateGoalContributionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);
        var goal = await EnsureGoalInFamilyAsync(goalId, familyId, cancellationToken);

        var existing = await contributions.GetByIdAndGoalIdAsync(contributionId, goalId, cancellationToken);
        if (existing is null)
        {
            throw new GoalNotFoundException("Contribution not found.");
        }

        if (existing.UserId != userId)
        {
            throw new GoalForbiddenException("Only the author can edit this contribution.");
        }

        if (!GoalRules.IsValidContributionAmount(request.Amount))
        {
            throw new GoalValidationException(
                $"Contribution amount must be at least R$ {GoalRules.MinimumContributionAmount:F2}.");
        }

        var previousAmount = existing.Amount;
        existing.Amount = request.Amount;
        existing.IsPrivate = request.IsPrivate;

        var updated = await contributions.UpdateWithGoalAdjustAsync(existing, previousAmount, cancellationToken);

        await activityService.SyncContributionActivityAsync(
            userId,
            familyId,
            contributionId,
            goalId,
            goal.Title,
            updated.Amount,
            updated.IsPrivate,
            cancellationToken);

        return MapToDto(updated, userId);
    }

    public async Task DeleteAsync(
        Guid userId,
        Guid familyId,
        Guid goalId,
        Guid contributionId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);
        await EnsureGoalInFamilyAsync(goalId, familyId, cancellationToken);

        var existing = await contributions.GetByIdAndGoalIdAsync(contributionId, goalId, cancellationToken);
        if (existing is null)
        {
            throw new GoalNotFoundException("Contribution not found.");
        }

        if (existing.UserId != userId)
        {
            throw new GoalForbiddenException("Only the author can delete this contribution.");
        }

        await contributions.DeleteWithGoalUpdateAsync(existing, cancellationToken);
        await activityService.DeleteContributionActivityAsync(familyId, contributionId, cancellationToken);
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

    private async Task<Domain.Entities.Goal> EnsureGoalInFamilyAsync(
        Guid goalId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        var goal = await goals.GetActiveByIdAndFamilyIdAsync(goalId, familyId, cancellationToken);
        if (goal is null)
        {
            throw new GoalNotFoundException("Goal not found.");
        }

        return goal;
    }

    internal static GoalContributionDto MapToDto(GoalContributionEntity contribution, Guid currentUserId)
    {
        var isAuthor = contribution.UserId == currentUserId;
        if (contribution.IsPrivate && !isAuthor)
        {
            return new GoalContributionDto(
                contribution.Id.ToString(),
                null,
                true,
                contribution.UserId.ToString(),
                "Contribuição privada",
                contribution.CreatedAt);
        }

        return new GoalContributionDto(
            contribution.Id.ToString(),
            contribution.Amount,
            contribution.IsPrivate,
            contribution.UserId.ToString(),
            contribution.User.Name,
            contribution.CreatedAt);
    }
}
