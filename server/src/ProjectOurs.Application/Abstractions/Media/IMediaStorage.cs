namespace ProjectOurs.Application.Abstractions.Media;

public interface IMediaStorage
{
    /// <summary>
    /// Stores an image and returns its public URL or inline data URI, using the object key for external storage.
    /// </summary>
    Task<string> StoreAsync(
        Stream content,
        string mimeType,
        string objectKey,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an externally stored image owned by this provider; ignores empty, inline, or foreign references.
    /// </summary>
    Task DeleteByReferenceAsync(string? storedReference, CancellationToken cancellationToken = default);
}
