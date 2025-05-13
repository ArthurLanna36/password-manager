namespace PasswordManagerApi.Models.Dto
{
    public class UserProfileDto
    {
        public string Username   { get; set; } = default!;
        public string? AvatarUrl { get; set; }
    }
}
