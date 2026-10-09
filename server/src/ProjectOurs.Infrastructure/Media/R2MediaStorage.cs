using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using ProjectOurs.Application.Abstractions.Media;
using ProjectOurs.Application.Common;
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

        // R2 rejects STREAMING-AWS4-HMAC-SHA256-PAYLOAD (aws-chunked uploads). Buffer is
        // already in memory — use a single signed payload compatible with S3-compatible APIs.
        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            InputStream = new MemoryStream(bytes),
            ContentType = normalizedMime,
            DisablePayloadSigning = true,
            UseChunkEncoding = false,
            DisableDefaultChecksumValidation = true,
            Headers =
            {
                CacheControl = "public, max-age=3600",
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

    /// <summary>Extracts a validated R2 object key from a public URL or path, regardless of the configured base URL.</summary>
    internal bool TryExtractObjectKey(string storedReference, out string key) =>
        MediaReferenceKeys.TryGetObjectKey(storedReference, out key);

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
