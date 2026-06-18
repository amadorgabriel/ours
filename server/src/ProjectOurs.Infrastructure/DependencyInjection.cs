using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Activity;
using ProjectOurs.Application.Auth;
using ProjectOurs.Application.Family;
using ProjectOurs.Infrastructure.Auth;
using ProjectOurs.Infrastructure.Options;
using ProjectOurs.Infrastructure.Persistence;

namespace ProjectOurs.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSQL");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'PostgreSQL' is not configured.");
        }

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<GoogleAuthOptions>(configuration.GetSection(GoogleAuthOptions.SectionName));

        services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IFamilyRepository, FamilyRepository>();
        services.AddScoped<IActivityRepository, ActivityRepository>();
        services.AddScoped<IGoogleIdTokenValidator, GoogleIdTokenValidator>();
        services.AddScoped<IJwtTokenFactory, JwtTokenFactory>();
        services.AddScoped<AuthService>();
        services.AddScoped<IInviteCodeGenerator, InviteCodeGenerator>();
        services.AddScoped<FamilyService>();
        services.AddScoped<ActivityService>();

        return services;
    }
}
