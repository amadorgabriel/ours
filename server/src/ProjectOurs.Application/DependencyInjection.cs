using Microsoft.Extensions.DependencyInjection;

namespace ProjectOurs.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Services will be registered here when implemented
        // services.AddScoped<IAuthService, AuthService>();
        // services.AddScoped<IFamilyService, FamilyService>();
        // services.AddScoped<IActivityService, ActivityService>();
        // services.AddScoped<IGoalService, GoalService>();

        return services;
    }
}
