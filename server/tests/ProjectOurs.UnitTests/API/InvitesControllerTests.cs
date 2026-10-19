using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using ProjectOurs.API.Controllers;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Common;
using ProjectOurs.Application.Family;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;
using Xunit;

namespace ProjectOurs.UnitTests.API;

public sealed class InvitesControllerTests
{
    [Fact]
    public async Task CreateInvite_WhenBrevoRejects_Returns502AndKeepsPending()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var families = new Mock<IFamilyRepository>();
        FamilyInvite? stored = null;

        families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Admin });
        families
            .Setup(x => x.AddInviteAsync(It.IsAny<FamilyInvite>(), It.IsAny<CancellationToken>()))
            .Callback<FamilyInvite, CancellationToken>((invite, _) => stored = invite)
            .Returns(Task.CompletedTask);

        var codes = new Mock<IInviteCodeGenerator>();
        codes.Setup(x => x.Generate()).Returns("AB12CD");

        var sender = new Mock<IInviteEmailSender>();
        sender
            .Setup(x => x.SendAsync("ana@exemplo.com", "AB12CD", It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InviteDeliveryException("Brevo returned 400."));

        var controller = CreateController(userId, familyId, new FamilyService(families.Object, codes.Object), sender.Object);

        var result = await controller.CreateInvite(new CreateInviteRequest("ana@exemplo.com"), CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status502BadGateway, objectResult.StatusCode);
        var body = Assert.IsType<InviteDto>(objectResult.Value);
        Assert.Equal("AB12CD", body.InviteCode);
        Assert.NotNull(stored);
        Assert.Equal(InviteStatus.Pending, stored!.Status);
        families.Verify(x => x.UpdateInviteAsync(It.IsAny<FamilyInvite>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateInvite_WithoutUser_Returns401()
    {
        var controller = CreateController(null, Guid.NewGuid(), new FamilyService(new Mock<IFamilyRepository>().Object, new Mock<IInviteCodeGenerator>().Object), new Mock<IInviteEmailSender>().Object);

        var result = await controller.CreateInvite(new CreateInviteRequest(null), CancellationToken.None);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task CreateInvite_AsMember_Returns403()
    {
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var families = new Mock<IFamilyRepository>();
        families
            .Setup(x => x.GetMembershipAsync(userId, familyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FamilyMembership { UserId = userId, FamilyId = familyId, Role = FamilyRole.Member });

        var controller = CreateController(
            userId,
            familyId,
            new FamilyService(families.Object, new Mock<IInviteCodeGenerator>().Object),
            new Mock<IInviteEmailSender>().Object);

        var result = await controller.CreateInvite(new CreateInviteRequest(null), CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);
    }

    private static InvitesController CreateController(
        Guid? userId,
        Guid familyId,
        FamilyService familyService,
        IInviteEmailSender sender)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers.Authorization = "Bearer test";
        httpContext.Request.Headers[FamilyHeaders.FamilyId] = familyId.ToString();
        if (userId is Guid id)
        {
            httpContext.User = new ClaimsPrincipal(
                new ClaimsIdentity(
                    [new Claim(JwtRegisteredClaimNames.Sub, id.ToString())],
                    "test"));
        }

        var controller = new InvitesController(
            familyService,
            sender,
            new Mock<IAntiforgery>().Object,
            NullLogger<InvitesController>.Instance)
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext },
        };

        return controller;
    }
}
