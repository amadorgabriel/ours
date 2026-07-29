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
        var parentId = Guid.NewGuid();
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

        _activities
            .Setup(x => x.ParentBelongsToFamilyAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var act = () => _sut.RegisterCallAsync(
            userId,
            familyId,
            new RegisterCallRequest(parentId.ToString(), notes));

        await Assert.ThrowsAsync<ActivityValidationException>(act);
    }

    [Fact]
    public async Task RegisterCall_WithoutParent_ThrowsValidation()
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

        var act = () => _sut.RegisterCallAsync(
            userId,
            familyId,
            new RegisterCallRequest(null, null));

        await Assert.ThrowsAsync<ActivityValidationException>(act);
    }

    [Fact]
    public async Task UpdateCall_WithAuthorWithinWindow_UpdatesNotes()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow.AddHours(-1);

        SetupMembership(userId, familyId);

        _activities
            .Setup(x => x.GetByIdAndFamilyIdAsync(activityId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Activity
            {
                Id = activityId,
                FamilyId = familyId,
                UserId = userId,
                Type = ActivityType.Call,
                Metadata = """{"notes":"old"}""",
                CreatedAt = createdAt,
                User = new User { Id = userId, Name = "Ana" },
            });

        _activities
            .Setup(x => x.UpdateAsync(It.IsAny<Activity>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await _sut.UpdateAsync(
            userId,
            familyId,
            activityId,
            new UpdateActivityRequest("new note", null, null, null, null, null));

        Assert.Equal("new note", result.Notes);
    }

    [Fact]
    public async Task UpdateCall_WhenNotAuthor_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();

        SetupMembership(userId, familyId);

        _activities
            .Setup(x => x.GetByIdAndFamilyIdAsync(activityId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Activity
            {
                Id = activityId,
                FamilyId = familyId,
                UserId = authorId,
                Type = ActivityType.Call,
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var act = () => _sut.UpdateAsync(
            userId,
            familyId,
            activityId,
            new UpdateActivityRequest("note", null, null, null, null, null));

        await Assert.ThrowsAsync<ActivityForbiddenException>(act);
    }

    [Fact]
    public async Task UpdateCall_WhenOlderThan24h_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();

        SetupMembership(userId, familyId);

        _activities
            .Setup(x => x.GetByIdAndFamilyIdAsync(activityId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Activity
            {
                Id = activityId,
                FamilyId = familyId,
                UserId = userId,
                Type = ActivityType.Call,
                CreatedAt = DateTimeOffset.UtcNow.AddHours(-25),
            });

        var act = () => _sut.UpdateAsync(
            userId,
            familyId,
            activityId,
            new UpdateActivityRequest("note", null, null, null, null, null));

        await Assert.ThrowsAsync<ActivityForbiddenException>(act);
    }

    [Fact]
    public async Task UpdateContribution_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();

        SetupMembership(userId, familyId);

        _activities
            .Setup(x => x.GetByIdAndFamilyIdAsync(activityId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Activity
            {
                Id = activityId,
                FamilyId = familyId,
                UserId = userId,
                Type = ActivityType.Contribution,
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var act = () => _sut.UpdateAsync(
            userId,
            familyId,
            activityId,
            new UpdateActivityRequest(null, null, null, null, null, null));

        await Assert.ThrowsAsync<ActivityForbiddenException>(act);
    }

    [Fact]
    public async Task DeleteCall_WithAuthorWithinWindow_DeletesActivity()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var activity = new Activity
        {
            Id = activityId,
            FamilyId = familyId,
            UserId = userId,
            Type = ActivityType.Call,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        SetupMembership(userId, familyId);

        _activities
            .Setup(x => x.GetByIdAndFamilyIdAsync(activityId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        await _sut.DeleteAsync(userId, familyId, activityId);

        _activities.Verify(x => x.DeleteAsync(activity, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateVisit_WithRemovePhoto_ClearsPhotoUrl()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var startAt = DateTimeOffset.UtcNow.AddDays(-1);
        var metadata =
            $$"""{"allDay":true,"startAt":"{{startAt:O}}","endAt":null,"photoBase64":"https://old-photo","mimeType":"image/jpeg"}""";

        SetupMembership(userId, familyId);

        _activities
            .Setup(x => x.GetByIdAndFamilyIdAsync(activityId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Activity
            {
                Id = activityId,
                FamilyId = familyId,
                UserId = userId,
                Type = ActivityType.Visit,
                Metadata = metadata,
                CreatedAt = DateTimeOffset.UtcNow.AddHours(-1),
                User = new User { Id = userId, Name = "Ana" },
            });

        _activities
            .Setup(x => x.UpdateAsync(It.IsAny<Activity>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await _sut.UpdateAsync(
            userId,
            familyId,
            activityId,
            new UpdateActivityRequest(null, null, null, null, null, null, RemovePhoto: true));

        Assert.Null(result.PhotoUrl);
    }

    [Fact]
    public async Task UpdateVisit_WithNewPhoto_ReplacesStoredPhoto()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var startAt = DateTimeOffset.UtcNow.AddDays(-1);
        var metadata =
            $$"""{"allDay":true,"startAt":"{{startAt:O}}","endAt":null,"photoBase64":"https://old-photo","mimeType":"image/jpeg"}""";
        var photoBytes = new byte[] { 1, 2, 3 };
        var photoBase64 = Convert.ToBase64String(photoBytes);
        const string newPhotoUrl = "https://storage/new-photo";

        SetupMembership(userId, familyId);

        _activities
            .Setup(x => x.GetByIdAndFamilyIdAsync(activityId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Activity
            {
                Id = activityId,
                FamilyId = familyId,
                UserId = userId,
                Type = ActivityType.Visit,
                Metadata = metadata,
                CreatedAt = DateTimeOffset.UtcNow.AddHours(-1),
                User = new User { Id = userId, Name = "Ana" },
            });

        _activities
            .Setup(x => x.UpdateAsync(It.IsAny<Activity>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _media
            .Setup(x => x.StoreAsync(It.IsAny<Stream>(), "image/jpeg", It.IsAny<CancellationToken>()))
            .ReturnsAsync(newPhotoUrl);

        var result = await _sut.UpdateAsync(
            userId,
            familyId,
            activityId,
            new UpdateActivityRequest(null, null, null, null, photoBase64, "image/jpeg"));

        Assert.Equal(newPhotoUrl, result.PhotoUrl);
        _media.Verify(
            x => x.StoreAsync(It.IsAny<Stream>(), "image/jpeg", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetFeed_WithMembership_ReturnsMappedItems()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();

        SetupMembership(userId, familyId);

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
            .Setup(x => x.CountUnreadAsync(familyId, userId, null, It.IsAny<CancellationToken>()))
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
            .Setup(x => x.CountUnreadAsync(familyId, userId, null, It.IsAny<CancellationToken>()))
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
            .Setup(x => x.CountUnreadAsync(familyId, userId, parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        var result = await _sut.GetFeedAsync(userId, familyId, null, null, null, parentId.ToString());

        Assert.Empty(result.Items);
        _activities.Verify(
            x => x.ListByFamilyIdAsync(familyId, 50, null, null, parentId, It.IsAny<CancellationToken>()),
            Times.Once);
        _activities.Verify(
            x => x.CountUnreadAsync(familyId, userId, parentId, It.IsAny<CancellationToken>()),
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
}
