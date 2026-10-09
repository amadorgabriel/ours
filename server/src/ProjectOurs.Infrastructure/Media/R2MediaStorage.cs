using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using ProjectOurs.Application.Abstractions.Media;
using ProjectOurs.Infrastructure.Options;

namespace ProjectOurs.Infrastructure.Media;

public sealed class R2MediaStorage(IAmazonS3 s3, IOptions<R2Options> options) : IMediaStorage
{
    private readonly R2Options _options = options.Value;

    private static readonly HashSet<string> AllowedMimeTypes =
    [
        "image/jpeg",
        "image/png",
        "image/jpg",
    ];

    public async Task<string> StoreAsync(
        Stream content,
        string mimeType,
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(objectKey))
        {
            throw new ArgumentException("Object key is required.", nameof(objectKey));
        }

        var normalizedMime = NormalizeMimeType(mimeType);
        if (!AllowedMimeTypes.Contains(normalizedMime))
        {
            throw new InvalidOperationException("Only JPEG and PNG images are allowed.");
        }

        using var memory = new MemoryStream();
        await content.CopyToAsync(memory, cancellationToken);
        var bytes = memory.ToArray();

        if (bytes.Length > InlineBase64MediaStorage.MaxBytes)
        {
            throw new InvalidOperationException(
                $"Image exceeds maximum size of {InlineBase64MediaStorage.MaxBytes / 1024}KB.");
        }

        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            InputStream = new MemoryStream(bytes),
            ContentType = normalizedMime,
            Headers =
            {
                CacheControl = "public, max-age=31536000, immutable",
            },
        };

        await s3.PutObjectAsync(request, cancellationToken);

        return BuildPublicUrl(objectKey);
    }

    public async Task DeleteByReferenceAsync(string? storedReference, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storedReference))
        {
            return;
        }

        if (storedReference.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (!TryExtractObjectKey(storedReference, out var key))
        {
            return;
        }

        await s3.DeleteObjectAsync(_options.BucketName, key, cancellationToken);
    }

    internal bool TryExtractObjectKey(string storedReference, out string key)
    {
        key = string.Empty;
        var baseUrl = _options.PublicBaseUrl.TrimEnd('/');
        if (!storedReference.StartsWith(baseUrl + "/", StringComparison.OrdinalIgnoreCase)
            && !storedReference.Equals(baseUrl, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        key = storedReference.Length <= baseUrl.Length
            ? string.Empty
            : storedReference[(baseUrl.Length + 1)..];

        return !string.IsNullOrWhiteSpace(key);
    }

    private string BuildPublicUrl(string objectKey) =>
        $"{_options.PublicBaseUrl.TrimEnd('/')}/{objectKey}";

    private static string NormalizeMimeType(string mimeType)
    {
        if (mimeType.Equals("image/jpg", StringComparison.OrdinalIgnoreCase))
        {
            return "image/jpeg";
        }

        return mimeType.ToLowerInvariant();
    }
}
