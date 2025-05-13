namespace PasswordManagerApi.Models.Dto
{
    public class SignInDto
    {
        public string Email    { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}
