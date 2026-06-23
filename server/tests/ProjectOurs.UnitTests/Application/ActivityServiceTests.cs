using Moq;
using ProjectOurs.Application.Abstractions.Media;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Activity;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class ActivityServiceTests
{
    private readonly Mock<IActivityRepository> _activities = new();
    private readonly Mock<IFamilyRepository> _families = new();
    private readonly Mock<IMediaStorage> _media = new();
    private readonly ActivityService _sut;

    public ActivityServiceTests()
    {
        _sut = new ActivityService(_activities.Object, _families.Object, _media.Object);
    }

    [Fact]
    public async Task RegisterCall_WithValidRequest_ReturnsFeedItem()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var activityId = Guid.NewGuid();

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

        _activities
            .Setup(x => x.ParentBelongsToFamilyAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _activities
            .Setup(x => x.AddAsync(It.IsAny<Activity>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Activity activity, CancellationToken _) => new Activity
            {
                Id = activityId,
                FamilyId = familyId,
                UserId = userId,
                ParentId = parentId,
                Type = ActivityType.Call,
                Metadata = activity.Metadata,
                CreatedAt = activity.CreatedAt,
                User = new User { Id = userId, Name = "Ana" },
                Parent = new Parent { Id = parentId, Name = "Pai" },
            });

        var result = await _sut.RegisterCallAsync(
            userId,
            familyId,
            new RegisterCallRequest(parentId.ToString(), "  Ligação rápida  "));

        Assert.Equal(activityId.ToString(), result.Id);
        Assert.Equal("Call", result.Type);
        Assert.Equal("Ana", result.UserName);
        Assert.Equal(parentId.ToString(), result.ParentId);
        Assert.Equal("Pai", result.ParentName);
        Assert.Equal("Ligação rápida", result.Notes);
    }

    [Fact]
    public async Task RegisterCall_WithoutMembership_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((FamilyMembership?)null);

        var act = () => _sut.RegisterCallAsync(
            userId,
            familyId,
            new RegisterCallRequest(null, null));

        await Assert.ThrowsAsync<ActivityForbiddenException>(act);
    }

    [Fact]
    public async Task RegisterCall_WithInvalidParent_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

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

        _activities
            .Setup(x => x.ParentBelongsToFamilyAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var act = () => _sut.RegisterCallAsync(
            userId,
            familyId,
            new RegisterCallRequest(parentId.ToString(), null));

        await Assert.ThrowsAsync<ActivityValidationException>(act);
    }

    [Fact]
    public async Task RegisterCall_WithTooLongNotes_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var notes = new string('a', ActivityRules.MaxNotesLength + 1);

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

        var act = () => _sut.RegisterCallAsync(
            userId,
            familyId,
            new RegisterCallRequest(null, notes));

        await Assert.ThrowsAsync<ActivityValidationException>(act);
    }

    [Fact]
    public async Task GetFeed_WithMembership_ReturnsMappedItems()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();

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

        _activities
            .Setup(x => x.ListByFamilyIdAsync(familyId, 50, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new Activity
                {
                    Id = activityId,
                    FamilyId = familyId,
                    UserId = userId,
                    Type = ActivityType.Call,
                    CreatedAt = DateTimeOffset.UtcNow,
                    User = new User { Id = userId, Name = "Bruno" },
                },
            ]);

        _activities
            .Setup(x => x.ListViewsByActivityIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<Guid, IReadOnlyList<ActivityViewInfo>>());

        _activities
            .Setup(x => x.CountUnreadAsync(familyId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var result = await _sut.GetFeedAsync(userId, familyId, null);

        Assert.Single(result.Items);
        Assert.Equal(activityId.ToString(), result.Items[0].Id);
        Assert.Equal("Bruno", result.Items[0].UserName);
        Assert.Equal(1, result.UnreadCount);
    }

    [Fact]
    public async Task GetFeed_WithDateRange_PassesRangeToRepository()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var from = new DateTimeOffset(2026, 6, 1, 0, 0, 0, TimeSpan.Zero);
        var to = new DateTimeOffset(2026, 6, 30, 23, 59, 59, TimeSpan.Zero);

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

        _activities
            .Setup(x => x.ListByFamilyIdAsync(familyId, 50, from, to, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        _activities
            .Setup(x => x.ListViewsByActivityIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<Guid, IReadOnlyList<ActivityViewInfo>>());

        _activities
            .Setup(x => x.CountUnreadAsync(familyId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        var result = await _sut.GetFeedAsync(userId, familyId, null, from, to);

        Assert.Empty(result.Items);
        _activities.Verify(
            x => x.ListByFamilyIdAsync(familyId, 50, from, to, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetFeed_WithParentId_PassesParentFilterToRepository()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

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

        _activities
            .Setup(x => x.ParentBelongsToFamilyAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _activities
            .Setup(x => x.ListByFamilyIdAsync(familyId, 50, null, null, parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        _activities
            .Setup(x => x.ListViewsByActivityIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<Guid, IReadOnlyList<ActivityViewInfo>>());

        _activities
            .Setup(x => x.CountUnreadAsync(familyId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        var result = await _sut.GetFeedAsync(userId, familyId, null, null, null, parentId.ToString());

        Assert.Empty(result.Items);
        _activities.Verify(
            x => x.ListByFamilyIdAsync(familyId, 50, null, null, parentId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetFeed_WithInvalidParentId_ThrowsValidation()
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

        var act = () => _sut.GetFeedAsync(userId, familyId, null, null, null, "not-a-guid");

        await Assert.ThrowsAsync<ActivityValidationException>(act);
    }

    [Fact]
    public async Task GetFeed_WithInvalidDateRange_ThrowsValidation()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var from = new DateTimeOffset(2026, 6, 30, 0, 0, 0, TimeSpan.Zero);
        var to = new DateTimeOffset(2026, 6, 1, 0, 0, 0, TimeSpan.Zero);

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

        var act = () => _sut.GetFeedAsync(userId, familyId, null, from, to, null);

        await Assert.ThrowsAsync<ActivityValidationException>(act);
    }
}
