namespace ProjectOurs.Application.Abstractions.Media;

public interface IMediaStorage
{
    Task<string> StoreAsync(
        Stream content,
        string mimeType,
        string objectKey,
        CancellationToken cancellationToken = default);

    Task DeleteByReferenceAsync(string? storedReference, CancellationToken cancellationToken = default);
}
