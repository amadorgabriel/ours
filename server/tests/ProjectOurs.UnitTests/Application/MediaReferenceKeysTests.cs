using ProjectOurs.Application.Common;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class MediaReferenceKeysTests
{
    [Fact]
    public void TryGetObjectKey_WithValidParentPhotoUrl_ReturnsKey()
    {
        const string key =
            "families/11111111-1111-1111-1111-111111111111/parents/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.jpg";

        var ok = MediaReferenceKeys.TryGetObjectKey($"https://cdn.example.com/{key}", out var extracted);

        Assert.True(ok);
        Assert.Equal(key, extracted);
    }

    [Fact]
    public void TryGetObjectKey_WithDataUri_ReturnsFalse()
    {
        var ok = MediaReferenceKeys.TryGetObjectKey("data:image/jpeg;base64,abc", out _);

        Assert.False(ok);
    }

    [Fact]
    public void TryGetObjectKey_WithUnrelatedHttpUrl_ReturnsFalse()
    {
        var ok = MediaReferenceKeys.TryGetObjectKey("https://other.example/not-ours.jpg", out _);

        Assert.False(ok);
    }
}
