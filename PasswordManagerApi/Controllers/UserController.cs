using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PasswordManagerApi.Data;
using PasswordManagerApi.Models;
using PasswordManagerApi.Models.Dto;

namespace PasswordManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        public UsersController(AppDbContext db) => _db = db;

        // GET api/users/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = Guid.Parse(User.FindFirst("sub")!.Value);
            var profile = await _db.Profiles.FindAsync(userId);
            if (profile == null) return NotFound();
            return Ok(profile);
        }

        // POST api/users/me
        [HttpPost("me")]
        public async Task<IActionResult> UpsertProfile([FromBody] UserProfileDto dto)
        {
            var userId = Guid.Parse(User.FindFirst("sub")!.Value);
            var profile = await _db.Profiles.FindAsync(userId);

            if (profile == null)
            {
                profile = new UserProfile { Id = userId, Username = dto.Username, AvatarUrl = dto.AvatarUrl };
                _db.Profiles.Add(profile);
            }
            else
            {
                profile.Username  = dto.Username;
                profile.AvatarUrl = dto.AvatarUrl;
            }

            await _db.SaveChangesAsync();
            return Ok(profile);
        }
    }
}
