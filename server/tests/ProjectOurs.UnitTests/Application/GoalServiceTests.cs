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
    private readonly GoalService _sut;

    public GoalServiceTests()
    {
        _sut = new GoalService(_goals.Object, _families.Object);
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
            .Setup(x => x.ListActiveByFamilyIdAsync(familyId, It.IsAny<CancellationToken>()))
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

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FamilyId = familyId,
                Role = FamilyRole.Admin,
                JoinedAt = DateTimeOffset.UtcNow,
            });

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
            });

        var result = await _sut.CreateAsync(
            userId,
            familyId,
            new CreateGoalRequest("  Fundo saúde  ", 250m));

        Assert.Equal(goalId.ToString(), result.Id);
        Assert.Equal("Fundo saúde", result.Title);
        Assert.Equal(250m, result.TargetAmount);
        Assert.Equal(0m, result.CurrentAmount);
        Assert.Equal("Active", result.Status);
    }

    [Fact]
    public async Task CreateAsync_AsMember_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

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

        await Assert.ThrowsAsync<GoalForbiddenException>(() =>
            _sut.CreateAsync(userId, familyId, new CreateGoalRequest("Meta", 50m)));
    }

    [Fact]
    public async Task CreateAsync_WithLowTarget_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FamilyId = familyId,
                Role = FamilyRole.Admin,
                JoinedAt = DateTimeOffset.UtcNow,
            });

        await Assert.ThrowsAsync<GoalValidationException>(() =>
            _sut.CreateAsync(userId, familyId, new CreateGoalRequest("Meta", 5m)));
    }

    [Fact]
    public async Task CreateAsync_WithEmptyTitle_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FamilyId = familyId,
                Role = FamilyRole.Admin,
                JoinedAt = DateTimeOffset.UtcNow,
            });

        await Assert.ThrowsAsync<GoalValidationException>(() =>
            _sut.CreateAsync(userId, familyId, new CreateGoalRequest("   ", 50m)));
    }
}
