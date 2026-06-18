using Moq;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Common;
using ProjectOurs.Application.Goals;
using ProjectOurs.Domain.Entities;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class GoalRulesTests
{
    [Theory]
    [InlineData(9.99, false)]
    [InlineData(10, true)]
    [InlineData(100, true)]
    public void IsValidTargetAmount_respects_minimum(decimal amount, bool expected) =>
        Assert.Equal(expected, GoalRules.IsValidTargetAmount(amount));

    [Theory]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData("Fundo saúde", true)]
    public void IsValidTitle_respects_length_and_whitespace(string title, bool expected) =>
        Assert.Equal(expected, GoalRules.IsValidTitle(title));

    [Fact]
    public void FamilyHeaders_uses_prd_header_name() =>
        Assert.Equal("X-Family-Id", FamilyHeaders.FamilyId);

    [Fact]
    public async Task IUserRepository_can_be_mocked()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", Name = "A", CreatedAt = DateTimeOffset.UtcNow };
        var mock = new Mock<IUserRepository>();
        mock.Setup(x => x.GetByIdAsync(user.Id, It.IsAny<CancellationToken>()))
            .Returns(Task.FromResult<User?>(user));

        var result = await mock.Object.GetByIdAsync(user.Id);

        Assert.NotNull(result);
        Assert.Equal(user.Email, result.Email);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(50.5)]
    public void IsValidContributionAmount_WithValidValues_ReturnsTrue(decimal amount)
    {
        Assert.True(GoalRules.IsValidContributionAmount(amount));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(0.99)]
    public void IsValidContributionAmount_WithInvalidValues_ReturnsFalse(decimal amount)
    {
        Assert.False(GoalRules.IsValidContributionAmount(amount));
    }
}
