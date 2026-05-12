using Xunit;

namespace ProjectOurs.Api.IntegrationTests.Support;

/// <summary>
/// Ignora o teste quando o Docker não está acessível (Testcontainers).
/// </summary>
public sealed class DockerRequiredFactAttribute : FactAttribute
{
    public DockerRequiredFactAttribute()
    {
        if (!DockerHelper.IsDockerEngineRunning())
        {
            Skip = "Docker não está em execução; inicie o Docker para rodar testes de integração com Testcontainers.";
        }
    }
}
