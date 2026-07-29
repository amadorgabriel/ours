using Moq;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Goals;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class GoalServiceTests
{
    private readonly Mock<IGoalRepository> _goals = new();
    private readonly Mock<IFamilyRepository> _families = new();
    private readonly Mock<IGoalContributionRepository> _contributions = new();
    private readonly Mock<IActivityRepository> _activities = new();
    private readonly GoalService _sut;

    public GoalServiceTests()
    {
        _sut = new GoalService(
            _goals.Object,
            _families.Object,
            _contributions.Object,
            _activities.Object);
    }

    [Fact]
    public async Task ListAsync_WithMembership_ReturnsActiveGoals()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();

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

        _goals
            .Setup(x => x.ListActiveByFamilyIdAsync(familyId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Goal>
            {
                new()
                {
                    Id = goalId,
                    FamilyId = familyId,
                    Title = "Reserva emergência",
                    TargetAmount = 500m,
                    CurrentAmount = 100m,
                    Status = GoalStatus.Active,
                    CreatedBy = userId,
                    CreatedAt = DateTimeOffset.UtcNow,
                },
            });

        var result = await _sut.ListAsync(userId, familyId);

        Assert.Single(result.Items);
        Assert.Equal(goalId.ToString(), result.Items[0].Id);
        Assert.Equal("Reserva emergência", result.Items[0].Title);
        Assert.Equal(500m, result.Items[0].TargetAmount);
        Assert.Equal(100m, result.Items[0].CurrentAmount);
    }

    [Fact]
    public async Task ListAsync_WithParentFilter_PassesParentIdToRepository()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

        SetupMembership(userId, familyId, FamilyRole.Member);

        _goals
            .Setup(x => x.ListActiveByFamilyIdAsync(familyId, parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Goal>());

        await _sut.ListAsync(userId, familyId, parentId);

        _goals.Verify(
            x => x.ListActiveByFamilyIdAsync(familyId, parentId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ListAsync_WithoutMembership_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((FamilyMembership?)null);

        await Assert.ThrowsAsync<GoalForbiddenException>(() => _sut.ListAsync(userId, familyId));
    }

    [Fact]
    public async Task CreateAsync_AsAdmin_ReturnsGoal()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();

        SetupMembership(userId, familyId, FamilyRole.Admin);

        _goals
            .Setup(x => x.AddAsync(It.IsAny<Goal>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Goal goal, CancellationToken _) => new Goal
            {
                Id = goalId,
                FamilyId = familyId,
                Title = goal.Title,
                TargetAmount = goal.TargetAmount,
                CurrentAmount = goal.CurrentAmount,
                Status = goal.Status,
                CreatedBy = userId,
                CreatedAt = goal.CreatedAt,
                ParentId = goal.ParentId,
            });

        var result = await _sut.CreateAsync(
            userId,
            familyId,
            new CreateGoalRequest("  Fundo saúde  ", 250m, null));

        Assert.Equal(goalId.ToString(), result.Id);
        Assert.Equal("Fundo saúde", result.Title);
        Assert.Equal(250m, result.TargetAmount);
        Assert.Equal(0m, result.CurrentAmount);
        Assert.Equal("Active", result.Status);
        Assert.Null(result.ParentId);
    }

    [Fact]
    public async Task CreateAsync_WithParentId_SetsParentOnGoal()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

        SetupMembership(userId, familyId, FamilyRole.Admin);
        _activities
            .Setup(x => x.ParentBelongsToFamilyAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Goal? capturedGoal = null;
        _goals
            .Setup(x => x.AddAsync(It.IsAny<Goal>(), It.IsAny<CancellationToken>()))
            .Callback<Goal, CancellationToken>((goal, _) => capturedGoal = goal)
            .ReturnsAsync((Goal goal, CancellationToken _) => goal);

        var result = await _sut.CreateAsync(
            userId,
            familyId,
            new CreateGoalRequest("Meta Pai", 100m, parentId.ToString()));

        Assert.NotNull(capturedGoal);
        Assert.Equal(parentId, capturedGoal!.ParentId);
        Assert.Equal(parentId.ToString(), result.ParentId);
    }

    [Fact]
    public async Task CreateAsync_AsMember_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        SetupMembership(userId, familyId, FamilyRole.Member);

        await Assert.ThrowsAsync<GoalForbiddenException>(() =>
            _sut.CreateAsync(userId, familyId, new CreateGoalRequest("Meta", 50m, null)));
    }

    [Fact]
    public async Task CreateAsync_WithLowTarget_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        SetupMembership(userId, familyId, FamilyRole.Admin);

        await Assert.ThrowsAsync<GoalValidationException>(() =>
            _sut.CreateAsync(userId, familyId, new CreateGoalRequest("Meta", 5m, null)));
    }

    [Fact]
    public async Task CreateAsync_WithEmptyTitle_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        SetupMembership(userId, familyId, FamilyRole.Admin);

        await Assert.ThrowsAsync<GoalValidationException>(() =>
            _sut.CreateAsync(userId, familyId, new CreateGoalRequest("   ", 50m, null)));
    }

    [Fact]
    public async Task DeleteAsync_AsCreatorWithoutContributions_DeletesGoal()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();
        var goal = new Goal
        {
            Id = goalId,
            FamilyId = familyId,
            Title = "Meta",
            TargetAmount = 100m,
            CurrentAmount = 0m,
            Status = GoalStatus.Active,
            CreatedBy = userId,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        SetupMembership(userId, familyId, FamilyRole.Member);
        _goals
            .Setup(x => x.GetByIdAndFamilyIdAsync(goalId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(goal);
        _contributions
            .Setup(x => x.ListByGoalIdAsync(goalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<GoalContribution>());
        _goals
            .Setup(x => x.DeleteAsync(
                goal,
                familyId,
                It.IsAny<IReadOnlyList<Guid>>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        await _sut.DeleteAsync(userId, familyId, goalId);

        _goals.Verify(
            x => x.DeleteAsync(
                goal,
                familyId,
                It.Is<IReadOnlyList<Guid>>(ids => ids.Count == 0),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_AsCreatorWithOwnContributions_PassesContributionIdsToRepository()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();
        var contributionId = Guid.NewGuid();
        var goal = new Goal
        {
            Id = goalId,
            FamilyId = familyId,
            Title = "Meta",
            TargetAmount = 100m,
            CurrentAmount = 25m,
            Status = GoalStatus.Active,
            CreatedBy = userId,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        SetupMembership(userId, familyId, FamilyRole.Member);
        _goals
            .Setup(x => x.GetByIdAndFamilyIdAsync(goalId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(goal);
        _contributions
            .Setup(x => x.ListByGoalIdAsync(goalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<GoalContribution>
            {
                new()
                {
                    Id = contributionId,
                    GoalId = goalId,
                    UserId = userId,
                    Amount = 25m,
                    IsPrivate = false,
                    CreatedAt = DateTimeOffset.UtcNow,
                },
            });
        _goals
            .Setup(x => x.DeleteAsync(
                goal,
                familyId,
                It.IsAny<IReadOnlyList<Guid>>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        await _sut.DeleteAsync(userId, familyId, goalId);

        _goals.Verify(
            x => x.DeleteAsync(
                goal,
                familyId,
                It.Is<IReadOnlyList<Guid>>(ids => ids.Single() == contributionId),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_AsMemberNotCreator_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var creatorId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();

        SetupMembership(userId, familyId, FamilyRole.Member);
        _goals
            .Setup(x => x.GetByIdAndFamilyIdAsync(goalId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Goal
            {
                Id = goalId,
                FamilyId = familyId,
                Title = "Meta",
                TargetAmount = 100m,
                CurrentAmount = 0m,
                Status = GoalStatus.Active,
                CreatedBy = creatorId,
                CreatedAt = DateTimeOffset.UtcNow,
            });

        await Assert.ThrowsAsync<GoalForbiddenException>(() =>
            _sut.DeleteAsync(userId, familyId, goalId));
    }

    [Fact]
    public async Task DeleteAsync_WithOtherMemberContribution_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var goalId = Guid.NewGuid();
        var goal = new Goal
        {
            Id = goalId,
            FamilyId = familyId,
            Title = "Meta",
            TargetAmount = 100m,
            CurrentAmount = 50m,
            Status = GoalStatus.Active,
            CreatedBy = userId,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        SetupMembership(userId, familyId, FamilyRole.Admin);
        _goals
            .Setup(x => x.GetByIdAndFamilyIdAsync(goalId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(goal);
        _contributions
            .Setup(x => x.ListByGoalIdAsync(goalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<GoalContribution>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    GoalId = goalId,
                    UserId = otherUserId,
                    Amount = 50m,
                    IsPrivate = false,
                    CreatedAt = DateTimeOffset.UtcNow,
                },
            });

        await Assert.ThrowsAsync<GoalValidationException>(() =>
            _sut.DeleteAsync(userId, familyId, goalId));
    }

    private void SetupMembership(Guid userId, Guid familyId, FamilyRole role)
    {
        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FamilyId = familyId,
                Role = role,
                JoinedAt = DateTimeOffset.UtcNow,
            });
    }
}
