using ProjectOurs.Application.Abstractions.Media;
using ProjectOurs.Application.Common;

namespace ProjectOurs.Infrastructure.Media;

public sealed class InlineBase64MediaStorage : IMediaStorage
{
    public const int MaxBytes = Base64ImageHelper.MaxDecodedBytes;

    private static readonly HashSet<string> AllowedMimeTypes =
    [
        "image/jpeg",
        "image/png",
        "image/jpg",
    ];

    /// <summary>Completes without side effects because inline images have no external object to delete.</summary>
    public Task DeleteByReferenceAsync(string? storedReference, CancellationToken cancellationToken = default) =>
        Task.CompletedTask;

    /// <summary>
    /// Validates the image MIME type and size, then returns a base64 data URI; the object key is unused.
    /// </summary>
    public async Task<string> StoreAsync(
        Stream content,
        string mimeType,
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        if (!AllowedMimeTypes.Contains(mimeType.ToLowerInvariant()))
        {
            throw new InvalidOperationException("Only JPEG and PNG images are allowed.");
        }

        using var memory = new MemoryStream();
        await content.CopyToAsync(memory, cancellationToken);
        var bytes = memory.ToArray();

        if (bytes.Length > MaxBytes)
        {
            throw new InvalidOperationException($"Image exceeds maximum size of {MaxBytes / 1024}KB.");
        }

        var normalizedMime = mimeType.Equals("image/jpg", StringComparison.OrdinalIgnoreCase)
            ? "image/jpeg"
            : mimeType.ToLowerInvariant();

        return $"data:{normalizedMime};base64,{Convert.ToBase64String(bytes)}";
    }
}
