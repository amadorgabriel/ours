using Amazon.S3;
using Amazon.S3.Model;
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

        const string objectKey =
            "families/11111111-1111-1111-1111-111111111111/parents/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.jpg";

        var ok = storage.TryExtractObjectKey(
            $"https://cdn.ours.app/{objectKey}",
            out var key);

        Assert.True(ok);
        Assert.Equal(objectKey, key);
    }

    /// <summary>Verifies that a URL from another host is rejected when extracting an R2 object key.</summary>
    [Fact]
    public void TryExtractObjectKey_WithForeignUrl_ReturnsFalse()
    {
        var storage = CreateStorage("https://cdn.ours.app");

        var ok = storage.TryExtractObjectKey("https://other.example/object.jpg", out _);

        Assert.False(ok);
    }

    [Fact]
    public async Task StoreAsync_UsesR2CompatiblePutObjectFlags()
    {
        PutObjectRequest? captured = null;
        var s3 = new Mock<IAmazonS3>();
        s3.Setup(x => x.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .Callback<PutObjectRequest, CancellationToken>((request, _) => captured = request)
            .ReturnsAsync(new PutObjectResponse());

        var options = Options.Create(new R2Options
        {
            BucketName = "project-ours-media",
            AccountId = "acc",
            AccessKeyId = "key",
            SecretAccessKey = "secret",
            PublicBaseUrl = "https://pub-example.r2.dev",
        });

        var storage = new R2MediaStorage(s3.Object, options);
        await using var image = new MemoryStream([0xFF, 0xD8, 0xFF, 0xD9]);

        var url = await storage.StoreAsync(image, "image/jpeg", "families/test/photo.jpg");

        Assert.Equal("https://pub-example.r2.dev/families/test/photo.jpg", url);
        Assert.NotNull(captured);
        Assert.False(captured!.UseChunkEncoding);
        Assert.True(captured.DisablePayloadSigning);
        Assert.True(captured.DisableDefaultChecksumValidation);
    }

    [Fact]
    public void TryExtractObjectKey_WithLegacyPublicBaseUrl_StillReturnsKey()
    {
        var storage = CreateStorage("https://pub-new.r2.dev");
        const string key =
            "families/11111111-1111-1111-1111-111111111111/parents/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.jpg";

        var ok = storage.TryExtractObjectKey($"https://pub-old.r2.dev/{key}", out var extracted);

        Assert.True(ok);
        Assert.Equal(key, extracted);
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
