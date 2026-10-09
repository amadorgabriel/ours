using Amazon.S3;
using Microsoft.Extensions.Options;
using Moq;
using ProjectOurs.Infrastructure.Media;
using ProjectOurs.Infrastructure.Options;
using Xunit;

namespace ProjectOurs.UnitTests.Infrastructure;

public sealed class R2MediaStorageTests
{
    /// <summary>Verifies that an image URL under the configured public base URL yields its object key.</summary>
    [Fact]
    public void TryExtractObjectKey_WithPublicBaseUrl_ReturnsKey()
    {
        var storage = CreateStorage("https://cdn.ours.app");

        var ok = storage.TryExtractObjectKey(
            "https://cdn.ours.app/families/g/parents/p/photo.jpg",
            out var key);

        Assert.True(ok);
        Assert.Equal("families/g/parents/p/photo.jpg", key);
    }

    /// <summary>Verifies that a URL from another host is rejected when extracting an R2 object key.</summary>
    [Fact]
    public void TryExtractObjectKey_WithForeignUrl_ReturnsFalse()
    {
        var storage = CreateStorage("https://cdn.ours.app");

        var ok = storage.TryExtractObjectKey("https://other.example/object.jpg", out _);

        Assert.False(ok);
    }

    /// <summary>Creates R2 storage with synthetic options and a mock S3 client for URL extraction tests.</summary>
    private static R2MediaStorage CreateStorage(string publicBaseUrl)
    {
        var options = Options.Create(new R2Options
        {
            BucketName = "test-bucket",
            AccountId = "acc",
            AccessKeyId = "key",
            SecretAccessKey = "secret",
            PublicBaseUrl = publicBaseUrl,
        });

        return new R2MediaStorage(Mock.Of<IAmazonS3>(), options);
    }
}
