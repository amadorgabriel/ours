using Moq;
using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Auth;
using ProjectOurs.Domain.Entities;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task SignInWithGoogle_creates_user_and_returns_token()
    {
        const string email = "new@example.com";
        var google = new Mock<IGoogleIdTokenValidator>();
        google.Setup(x => x.ValidateAsync("tok", default))
            .ReturnsAsync(new GoogleTokenPayload(email, true, "N", "https://x/y.png"));

        var users = new Mock<IUserRepository>();
        users.SetupSequence(x => x.GetByEmailWithMembershipsAsync(email, default))
            .ReturnsAsync((User?)null)
            .ReturnsAsync(
                new User
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Email = email,
                    Name = "N",
                    Picture = "https://x/y.png",
                    CreatedAt = DateTimeOffset.UtcNow,
                    Memberships = [],
                });

        var jwt = new Mock<IJwtTokenIssuer>();
        jwt.Setup(x => x.CreateAccessToken(It.IsAny<User>())).Returns("jwt-value");

        var sut = new AuthService(google.Object, users.Object, jwt.Object);

        var result = await sut.SignInWithGoogleAsync("tok");

        Assert.True(result.Response.IsNewUser);
        Assert.Equal(0, result.Response.FamilyCount);
        Assert.Equal("jwt-value", result.AccessToken);
        users.Verify(x => x.AddAsync(It.Is<User>(u => u.Email == email), default), Times.Once);
    }

    [Fact]
    public async Task SignInWithGoogle_updates_existing_user()
    {
        const string email = "old@example.com";
        var id = Guid.NewGuid();
        var google = new Mock<IGoogleIdTokenValidator>();
        google.Setup(x => x.ValidateAsync("tok", default))
            .ReturnsAsync(new GoogleTokenPayload(email, true, "Updated", "https://pic"));

        var before = new User
        {
            Id = id,
            Email = email,
            Name = "Old",
            Picture = null,
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
            Memberships = [],
        };

        var after = new User
        {
            Id = id,
            Email = email,
            Name = "Updated",
            Picture = "https://pic",
            CreatedAt = before.CreatedAt,
            Memberships = [],
        };

        var users = new Mock<IUserRepository>();
        users.SetupSequence(x => x.GetByEmailWithMembershipsAsync(email, default))
            .ReturnsAsync(before)
            .ReturnsAsync(after);

        users.Setup(x => x.UpdateProfileAsync(id, "Updated", "https://pic", default)).Returns(Task.CompletedTask);

        var jwt = new Mock<IJwtTokenIssuer>();
        jwt.Setup(x => x.CreateAccessToken(It.IsAny<User>())).Returns("jwt");

        var sut = new AuthService(google.Object, users.Object, jwt.Object);

        var result = await sut.SignInWithGoogleAsync("tok");

        Assert.False(result.Response.IsNewUser);
        users.Verify(x => x.UpdateProfileAsync(id, "Updated", "https://pic", default), Times.Once);
    }

    [Fact]
    public async Task SignInWithGoogle_unverified_email_throws()
    {
        var google = new Mock<IGoogleIdTokenValidator>();
        google.Setup(x => x.ValidateAsync("tok", default))
            .ReturnsAsync(new GoogleTokenPayload("a@b.com", false, "A", null));

        var users = new Mock<IUserRepository>();
        var jwt = new Mock<IJwtTokenIssuer>();
        var sut = new AuthService(google.Object, users.Object, jwt.Object);

        await Assert.ThrowsAsync<EmailNotVerifiedException>(() => sut.SignInWithGoogleAsync("tok"));
    }
}
