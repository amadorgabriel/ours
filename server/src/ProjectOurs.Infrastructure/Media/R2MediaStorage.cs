using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using ProjectOurs.Application.Abstractions.Media;
using ProjectOurs.Infrastructure.Options;

namespace ProjectOurs.Infrastructure.Media;

/// <summary>Stores images in Cloudflare R2 through the supplied S3 client and bucket configuration.</summary>
public sealed class R2MediaStorage(IAmazonS3 s3, IOptions<R2Options> options) : IMediaStorage
{
    private readonly R2Options _options = options.Value;

    private static readonly HashSet<string> AllowedMimeTypes =
    [
        "image/jpeg",
        "image/png",
        "image/jpg",
    ];

    /// <summary>
    /// Validates the object key, MIME type, and image size, uploads to R2, and returns the public image URL.
    /// </summary>
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

    /// <summary>
    /// Deletes the R2 object for a reference under the public base URL, ignoring empty, inline, or foreign references.
    /// </summary>
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

    /// <summary>Extracts a nonempty object key from a reference matching the configured public base URL.</summary>
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

    /// <summary>Appends the object key to the public base URL after trimming its trailing slashes.</summary>
    private string BuildPublicUrl(string objectKey) =>
        $"{_options.PublicBaseUrl.TrimEnd('/')}/{objectKey}";

    /// <summary>Normalizes MIME type casing and converts the image/jpg alias to image/jpeg.</summary>
    private static string NormalizeMimeType(string mimeType)
    {
        if (mimeType.Equals("image/jpg", StringComparison.OrdinalIgnoreCase))
        {
            return "image/jpeg";
        }

        return mimeType.ToLowerInvariant();
    }
}
