namespace ProjectOurs.Application.Goals;

/// <summary>
/// Regras de meta alinhadas ao PRD (valor alvo mínimo R$ 10,00).
/// </summary>
public static class GoalRules
{
    public const decimal MinimumTargetAmount = 10m;

    public static bool IsValidTargetAmount(decimal amount) => amount >= MinimumTargetAmount;
}
