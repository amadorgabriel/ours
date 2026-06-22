using Moq;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Family;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class FamilyServiceTests
{
    private readonly Mock<IFamilyRepository> _families = new();
    private readonly Mock<IInviteCodeGenerator> _codeGenerator = new();
    private readonly FamilyService _sut;

    public FamilyServiceTests()
    {
        _sut = new FamilyService(_families.Object, _codeGenerator.Object);
    }

    [Fact]
    public async Task CreateFamily_WithValidName_ReturnsFamilyDto()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        _families
            .Setup(x => x.CreateWithAdminMembershipAsync(userId, "Silva", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Domain.Entities.Family
            {
                Id = familyId,
                Name = "Silva",
                AdminId = userId,
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var result = await _sut.CreateFamilyAsync(userId, "  Silva  ");

        Assert.Equal(familyId.ToString(), result.Id);
        Assert.Equal("Silva", result.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateFamily_WithInvalidName_ThrowsFamilyValidationException(string? name)
    {
        var act = () => _sut.CreateFamilyAsync(Guid.NewGuid(), name!);

        await Assert.ThrowsAsync<FamilyValidationException>(act);
    }

    [Fact]
    public async Task CreateFamily_WithTooLongName_ThrowsFamilyValidationException()
    {
        var name = new string('a', FamilyRules.MaxNameLength + 1);

        var act = () => _sut.CreateFamilyAsync(Guid.NewGuid(), name);

        await Assert.ThrowsAsync<FamilyValidationException>(act);
    }

    [Fact]
    public async Task ListMine_ReturnsFamiliesWithRoles()
    {
        var userId = Guid.NewGuid();
        var adminFamilyId = Guid.NewGuid();
        var memberFamilyId = Guid.NewGuid();

        _families
            .Setup(x => x.ListMembershipsByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<FamilyMembership>
            {
                new()
                {
                    FamilyId = adminFamilyId,
                    Role = FamilyRole.Admin,
                    Family = new Domain.Entities.Family { Id = adminFamilyId, Name = "Admin Family" },
                },
                new()
                {
                    FamilyId = memberFamilyId,
                    Role = FamilyRole.Member,
                    Family = new Domain.Entities.Family { Id = memberFamilyId, Name = "Member Family" },
                },
            });

        var result = await _sut.ListMineAsync(userId);

        Assert.Equal(2, result.Count);
        Assert.Contains(result, x => x.Id == adminFamilyId.ToString() && x.Role == "Admin");
        Assert.Contains(result, x => x.Id == memberFamilyId.ToString() && x.Role == "Member");
    }

    [Fact]
    public async Task CreateInvite_AsAdmin_ReturnsInviteDto()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var expiresAt = DateTimeOffset.UtcNow.AddHours(24);

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Admin });
        _codeGenerator.Setup(x => x.Generate()).Returns("ABC123");
        _families
            .Setup(x => x.AddInviteAsync(It.IsAny<FamilyInvite>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await _sut.CreateInviteAsync(userId, familyId, null);

        Assert.Equal("ABC123", result.InviteCode);
        Assert.True(result.ExpiresAt > DateTimeOffset.UtcNow);
    }

    [Fact]
    public async Task CreateInvite_AsMember_ThrowsFamilyForbiddenException()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Member });

        var act = () => _sut.CreateInviteAsync(userId, familyId, null);

        await Assert.ThrowsAsync<FamilyForbiddenException>(act);
    }

    [Fact]
    public async Task CreateInvite_RetriesWhenCodeExists()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Admin });
        _codeGenerator.SetupSequence(x => x.Generate())
            .Returns("TAKEN1")
            .Returns("FREE99");
        _families
            .SetupSequence(x => x.AddInviteAsync(It.IsAny<FamilyInvite>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InviteCodeConflictException())
            .Returns(Task.CompletedTask);

        var result = await _sut.CreateInviteAsync(userId, familyId, null);

        Assert.Equal("FREE99", result.InviteCode);
    }

    [Fact]
    public async Task JoinWithCode_WithValidCode_ReturnsJoinResponse()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var invite = new FamilyInvite
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            InviteCode = "ABC123",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
            Status = InviteStatus.Pending,
            Family = new Domain.Entities.Family { Id = familyId, Name = "Silva" },
        };

        _families
            .Setup(x => x.GetInviteByCodeWithFamilyAsync("ABC123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(invite);
        _families
            .Setup(x => x.MembershipExistsAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _families
            .Setup(x => x.AcceptInviteAndAddMembershipAsync(invite, It.IsAny<FamilyMembership>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await _sut.JoinWithCodeAsync(userId, " abc123 ");

        Assert.Equal(familyId.ToString(), result.FamilyId);
        Assert.Equal("Silva", result.FamilyName);
        Assert.Equal("Member", result.Role);
    }

    [Fact]
    public async Task JoinWithCode_WithUnknownCode_ThrowsFamilyNotFoundException()
    {
        _families
            .Setup(x => x.GetInviteByCodeWithFamilyAsync("MISSNG", It.IsAny<CancellationToken>()))
            .ReturnsAsync((FamilyInvite?)null);

        var act = () => _sut.JoinWithCodeAsync(Guid.NewGuid(), "MISSNG");

        await Assert.ThrowsAsync<FamilyNotFoundException>(act);
    }

    [Fact]
    public async Task JoinWithCode_WithExpiredCode_ThrowsFamilyValidationException()
    {
        var invite = new FamilyInvite
        {
            Id = Guid.NewGuid(),
            FamilyId = Guid.NewGuid(),
            InviteCode = "OLD123",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(-1),
            Status = InviteStatus.Pending,
            Family = new Domain.Entities.Family { Name = "Silva" },
        };

        _families
            .Setup(x => x.GetInviteByCodeWithFamilyAsync("OLD123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(invite);
        _families
            .Setup(x => x.UpdateInviteAsync(invite, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var act = () => _sut.JoinWithCodeAsync(Guid.NewGuid(), "OLD123");

        await Assert.ThrowsAsync<FamilyValidationException>(act);
        Assert.Equal(InviteStatus.Expired, invite.Status);
    }

    [Fact]
    public async Task JoinWithCode_WhenAlreadyMember_ThrowsFamilyConflictException()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var invite = new FamilyInvite
        {
            FamilyId = familyId,
            InviteCode = "ABC123",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
            Status = InviteStatus.Pending,
            Family = new Domain.Entities.Family { Id = familyId, Name = "Silva" },
        };

        _families
            .Setup(x => x.GetInviteByCodeWithFamilyAsync("ABC123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(invite);
        _families
            .Setup(x => x.MembershipExistsAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var act = () => _sut.JoinWithCodeAsync(userId, "ABC123");

        await Assert.ThrowsAsync<FamilyConflictException>(act);
    }

    [Fact]
    public async Task UpdateFamily_AsAdmin_ReturnsUpdatedDto()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var family = new Domain.Entities.Family
        {
            Id = familyId,
            Name = "Silva",
            AdminId = userId,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Admin });
        _families
            .Setup(x => x.GetByIdAsync(familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(family);
        _families
            .Setup(x => x.UpdateFamilyAsync(family, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await _sut.UpdateFamilyAsync(userId, familyId, "  Costa  ");

        Assert.Equal(familyId.ToString(), result.Id);
        Assert.Equal("Costa", result.Name);
        Assert.Equal("Costa", family.Name);
    }

    [Fact]
    public async Task UpdateFamily_AsMember_ThrowsFamilyForbiddenException()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Member });

        var act = () => _sut.UpdateFamilyAsync(userId, familyId, "Costa");

        await Assert.ThrowsAsync<FamilyForbiddenException>(act);
    }

    [Fact]
    public async Task DeleteFamily_WithMatchingConfirmName_DeletesFamily()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Admin });
        _families
            .Setup(x => x.GetByIdAsync(familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Domain.Entities.Family { Id = familyId, Name = "Silva" });
        _families
            .Setup(x => x.DeleteFamilyAsync(familyId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        await _sut.DeleteFamilyAsync(userId, familyId, " Silva ");

        _families.Verify(x => x.DeleteFamilyAsync(familyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteFamily_WithWrongConfirmName_ThrowsFamilyValidationException()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();

        _families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Admin });
        _families
            .Setup(x => x.GetByIdAsync(familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Domain.Entities.Family { Id = familyId, Name = "Silva" });

        var act = () => _sut.DeleteFamilyAsync(userId, familyId, "Outro Nome");

        await Assert.ThrowsAsync<FamilyValidationException>(act);
    }

    [Fact]
    public void InviteCodeGenerator_GeneratesSixCharacterAlphanumericCode()
    {
        var generator = new InviteCodeGenerator();

        var code = generator.Generate();

        Assert.Equal(FamilyRules.InviteCodeLength, code.Length);
        Assert.Matches("^[A-Z0-9]{6}$", code);
    }
}
