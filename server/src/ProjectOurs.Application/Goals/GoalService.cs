using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Enums;
using GoalEntity = ProjectOurs.Domain.Entities.Goal;

namespace ProjectOurs.Application.Goals;

public sealed class GoalService(
    IGoalRepository goals,
    IFamilyRepository families)
{
    public async Task<GoalListResponse> ListAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var items = await goals.ListActiveByFamilyIdAsync(familyId, cancellationToken);
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
        };

        var created = await goals.AddAsync(goal, cancellationToken);
        return MapToDto(created);
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

    internal static GoalDto MapToDto(GoalEntity goal) =>
        new(
            goal.Id.ToString(),
            goal.Title,
            goal.TargetAmount,
            goal.CurrentAmount,
            goal.Status.ToString(),
            goal.CreatedAt,
            goal.CreatedBy.ToString());
}
