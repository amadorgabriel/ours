using ProjectOurs.Application.Devices;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class DeviceRulesTests
{
    [Theory]
    [InlineData("ExponentPushToken[abc]", true)]
    [InlineData("   ", false)]
    [InlineData("", false)]
    public void IsValidPushToken_ValidatesInput(string token, bool expected) =>
        Assert.Equal(expected, DeviceRules.IsValidPushToken(token));

    [Theory]
    [InlineData("ios", true)]
    [InlineData("Android", true)]
    [InlineData("web", false)]
    public void IsValidPlatform_ValidatesInput(string platform, bool expected) =>
        Assert.Equal(expected, DeviceRules.IsValidPlatform(platform));

    [Fact]
    public void NormalizePlatform_ReturnsLowercase() =>
        Assert.Equal("ios", DeviceRules.NormalizePlatform("IOS"));
}
