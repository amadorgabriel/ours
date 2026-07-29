using ProjectOurs.Application.Common;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class Base64ImageHelperTests
{
    [Fact]
    public void Decode_accepts_valid_small_payload()
    {
        var bytes = new byte[] { 1, 2, 3 };
        var payload = Convert.ToBase64String(bytes);

        var decoded = Base64ImageHelper.Decode(payload);

        Assert.Equal(bytes, decoded);
    }

    [Fact]
    public void Decode_accepts_data_uri_prefix()
    {
        var bytes = new byte[] { 10, 20 };
        var payload = $"data:image/jpeg;base64,{Convert.ToBase64String(bytes)}";

        var decoded = Base64ImageHelper.Decode(payload);

        Assert.Equal(bytes, decoded);
    }

    [Fact]
    public void Decode_rejects_oversized_payload_before_decode()
    {
        var oversized = new string('A', Base64ImageHelper.MaxPayloadLength + 1);

        var ex = Assert.Throws<InvalidOperationException>(() => Base64ImageHelper.Decode(oversized));

        Assert.Contains("maximum size", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Decode_rejects_invalid_base64()
    {
        Assert.Throws<FormatException>(() => Base64ImageHelper.Decode("!!!not-base64!!!"));
    }
}
