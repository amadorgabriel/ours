namespace ProjectOurs.Application.Abstractions.Media;

public interface IMediaStorage
{
    Task<string> StoreAsync(Stream content, string mimeType, CancellationToken cancellationToken = default);
}
