using Moq;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Parents;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class ParentServiceTests
{
    private readonly Mock<IParentRepository> _parents = new();
    private readonly Mock<IFamilyRepository> _families = new();
    private readonly ParentService _sut;

    public ParentServiceTests()
    {
        _sut = new ParentService(_parents.Object, _families.Object);
    }

    [Fact]
    public async Task ListAsync_WithMembership_ReturnsParents()
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

        _parents
            .Setup(x => x.ListByFamilyIdAsync(familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Parent>
            {
                new()
                {
                    Id = parentId,
                    FamilyId = familyId,
                    Name = "João",
                    Relationship = "Pai",
                },
            });

        var result = await _sut.ListAsync(userId, familyId);

        Assert.Single(result.Items);
        Assert.Equal(parentId.ToString(), result.Items[0].Id);
        Assert.Equal("João", result.Items[0].Name);
        Assert.Equal("Pai", result.Items[0].Relationship);
    }

    [Fact]
    public async Task GetAsync_WithMembership_ReturnsParentDetail()
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

        _parents
            .Setup(x => x.GetByIdAndFamilyIdAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Parent
            {
                Id = parentId,
                FamilyId = familyId,
                Name = "João",
                Relationship = "Pai",
                MedicalInfo = "Alergia a penicilina",
                EmergencyBriefing = "Ligar 192",
            });

        var result = await _sut.GetAsync(userId, familyId, parentId);

        Assert.Equal(parentId.ToString(), result.Id);
        Assert.Equal("João", result.Name);
        Assert.Equal("Alergia a penicilina", result.MedicalInfo);
        Assert.Equal("Ligar 192", result.EmergencyBriefing);
    }

    [Fact]
    public async Task GetAsync_WhenParentNotFound_ThrowsNotFound()
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

        _parents
            .Setup(x => x.GetByIdAndFamilyIdAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Parent?)null);

        await Assert.ThrowsAsync<ParentNotFoundException>(() =>
            _sut.GetAsync(userId, familyId, parentId));
    }

    [Fact]
    public async Task ListAsync_WithoutMembership_ThrowsForbidden()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((FamilyMembership?)null);

        await Assert.ThrowsAsync<ParentForbiddenException>(() => _sut.ListAsync(userId, familyId));
    }

    [Fact]
    public async Task CreateAsync_AsAdmin_ReturnsParent()
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
                Role = FamilyRole.Admin,
                JoinedAt = DateTimeOffset.UtcNow,
            });

        _parents
            .Setup(x => x.AddAsync(It.IsAny<Parent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Parent parent, CancellationToken _) => new Parent
            {
                Id = parentId,
                FamilyId = familyId,
                Name = parent.Name,
                Relationship = parent.Relationship,
                BirthDate = parent.BirthDate,
            });

        var result = await _sut.CreateAsync(
            userId,
            familyId,
            new CreateParentRequest("  Maria  ", "  Mãe  ", new DateOnly(1950, 5, 10)));

        Assert.Equal(parentId.ToString(), result.Id);
        Assert.Equal("Maria", result.Name);
        Assert.Equal("Mãe", result.Relationship);
        Assert.Equal(new DateOnly(1950, 5, 10), result.BirthDate);
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

        await Assert.ThrowsAsync<ParentForbiddenException>(() =>
            _sut.CreateAsync(userId, familyId, new CreateParentRequest("João", "Pai", null)));
    }

    [Fact]
    public async Task UpdateAsync_WhenParentNotFound_ThrowsNotFound()
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
                Role = FamilyRole.Admin,
                JoinedAt = DateTimeOffset.UtcNow,
            });

        _parents
            .Setup(x => x.GetByIdAndFamilyIdAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Parent?)null);

        await Assert.ThrowsAsync<ParentNotFoundException>(() =>
            _sut.UpdateAsync(
                userId,
                familyId,
                parentId,
                new UpdateParentRequest("João", "Pai", null)));
    }

    [Fact]
    public async Task UpdateAsync_AsAdmin_ReturnsUpdatedParent()
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
                Role = FamilyRole.Admin,
                JoinedAt = DateTimeOffset.UtcNow,
            });

        var existing = new Parent
        {
            Id = parentId,
            FamilyId = familyId,
            Name = "João",
            Relationship = "Pai",
        };

        _parents
            .Setup(x => x.GetByIdAndFamilyIdAsync(parentId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        _parents
            .Setup(x => x.UpdateAsync(It.IsAny<Parent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Parent parent, CancellationToken _) => parent);

        var result = await _sut.UpdateAsync(
            userId,
            familyId,
            parentId,
            new UpdateParentRequest(
                "João Silva",
                "Pai",
                null,
                "  Alergia a dipirona  ",
                "  Contato emergência: Maria  "));

        Assert.Equal("João Silva", result.Name);
        Assert.Equal("Pai", result.Relationship);
        Assert.Equal("Alergia a dipirona", result.MedicalInfo);
        Assert.Equal("Contato emergência: Maria", result.EmergencyBriefing);
    }
}
