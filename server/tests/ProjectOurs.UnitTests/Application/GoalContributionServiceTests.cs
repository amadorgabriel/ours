using Moq;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Goals;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class GoalContributionServiceTests
{
    private readonly Mock<IGoalRepository> _goals = new();
    private readonly Mock<IGoalContributionRepository> _contributions = new();
    private readonly Mock<IFamilyRepository> _families = new();
    private readonly GoalContributionService _sut;

    public GoalContributionServiceTests()
    {
        _sut = new GoalContributionService(_goals.Object, _contributions.Object, _families.Object);
    }

    [Fact]
    public async Task CreateAsync_WithMembership_IncrementsGoalAndReturnsContribution()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();
        var contributionId = Guid.NewGuid();

        SetupMembership(userId, familyId);
        SetupGoal(goalId, familyId);

        _contributions
            .Setup(x => x.AddWithGoalUpdateAsync(It.IsAny<GoalContribution>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((GoalContribution contribution, CancellationToken _) => new GoalContribution
            {
                Id = contributionId,
                GoalId = goalId,
                UserId = userId,
                Amount = contribution.Amount,
                IsPrivate = contribution.IsPrivate,
                CreatedAt = contribution.CreatedAt,
                User = new User { Id = userId, Name = "Ana Silva" },
            });

        var result = await _sut.CreateAsync(
            userId,
            familyId,
            goalId,
            new CreateGoalContributionRequest(50m, false));

        Assert.Equal(contributionId.ToString(), result.Id);
        Assert.Equal(50m, result.Amount);
        Assert.False(result.IsPrivate);
        Assert.Equal("Ana Silva", result.UserName);
    }

    [Fact]
    public async Task CreateAsync_WithLowAmount_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();

        SetupMembership(userId, familyId);
        SetupGoal(goalId, familyId);

        await Assert.ThrowsAsync<GoalValidationException>(() =>
            _sut.CreateAsync(userId, familyId, goalId, new CreateGoalContributionRequest(0.5m, false)));
    }

    [Fact]
    public async Task CreateAsync_WithUnknownGoal_ThrowsNotFound()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();

        SetupMembership(userId, familyId);

        _goals
            .Setup(x => x.GetActiveByIdAndFamilyIdAsync(goalId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Goal?)null);

        await Assert.ThrowsAsync<GoalNotFoundException>(() =>
            _sut.CreateAsync(userId, familyId, goalId, new CreateGoalContributionRequest(10m, false)));
    }

    [Fact]
    public async Task ListAsync_HidesPrivateContributionsFromOtherMembers()
    {
        var viewerId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();

        SetupMembership(viewerId, familyId);
        SetupGoal(goalId, familyId);

        _contributions
            .Setup(x => x.ListByGoalIdAsync(goalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<GoalContribution>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    GoalId = goalId,
                    UserId = authorId,
                    Amount = 100m,
                    IsPrivate = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    User = new User { Id = authorId, Name = "João" },
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    GoalId = goalId,
                    UserId = viewerId,
                    Amount = 25m,
                    IsPrivate = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    User = new User { Id = viewerId, Name = "Ana" },
                },
            });

        var result = await _sut.ListAsync(viewerId, familyId, goalId);

        Assert.Equal(2, result.Items.Count);
        Assert.Null(result.Items[0].Amount);
        Assert.Equal("Contribuição privada", result.Items[0].UserName);
        Assert.Equal(25m, result.Items[1].Amount);
        Assert.Equal("Ana", result.Items[1].UserName);
    }

    [Fact]
    public async Task ListAsync_WithoutMembership_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((FamilyMembership?)null);

        await Assert.ThrowsAsync<GoalForbiddenException>(() =>
            _sut.ListAsync(userId, familyId, goalId));
    }

    private void SetupMembership(Guid userId, Guid familyId)
    {
        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FamilyId = familyId,
                Role = FamilyRole.Member,
                JoinedAt = DateTimeOffset.UtcNow,
            });
    }

    private void SetupGoal(Guid goalId, Guid familyId)
    {
        _goals
            .Setup(x => x.GetActiveByIdAndFamilyIdAsync(goalId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Goal
            {
                Id = goalId,
                FamilyId = familyId,
                Title = "Meta teste",
                TargetAmount = 500m,
                CurrentAmount = 0m,
                Status = GoalStatus.Active,
                CreatedBy = Guid.NewGuid(),
                CreatedAt = DateTimeOffset.UtcNow,
            });
    }
}
