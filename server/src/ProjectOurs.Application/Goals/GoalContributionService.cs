using ProjectOurs.Application.Abstractions.Persistence;
using GoalContributionEntity = ProjectOurs.Domain.Entities.GoalContribution;

namespace ProjectOurs.Application.Goals;

public sealed class GoalContributionService(
    IGoalRepository goals,
    IGoalContributionRepository contributions,
    IFamilyRepository families)
{
    public async Task<GoalContributionListResponse> ListAsync(
        Guid userId,
        Guid familyId,
        Guid goalId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);
        await EnsureGoalInFamilyAsync(goalId, familyId, cancellationToken);

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
        await EnsureGoalInFamilyAsync(goalId, familyId, cancellationToken);

        if (!GoalRules.IsValidContributionAmount(request.Amount))
        {
            throw new GoalValidationException(
                $"Contribution amount must be at least R$ {GoalRules.MinimumContributionAmount:F2}.");
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
        return MapToDto(created, userId);
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

    private async Task EnsureGoalInFamilyAsync(
        Guid goalId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        var goal = await goals.GetActiveByIdAndFamilyIdAsync(goalId, familyId, cancellationToken);
        if (goal is null)
        {
            throw new GoalNotFoundException("Goal not found.");
        }
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
