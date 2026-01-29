namespace Arxis.API.Services;

/// <summary>
/// Interface for file storage service
/// </summary>
public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder);
    Task<Stream> GetFileAsync(string filePath);
    Task<bool> DeleteFileAsync(string filePath);
    Task<bool> FileExistsAsync(string filePath);
    Task<long> GetFileSizeAsync(string filePath);
}

/// <summary>
/// Local file storage implementation
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IConfiguration configuration, ILogger<LocalFileStorageService> logger)
    {
        _basePath = configuration["FileStorage:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        _logger = logger;

        // Ensure base directory exists
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
            _logger.LogInformation("Created file storage directory: {BasePath}", _basePath);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder)
    {
        try
        {
            var folderPath = Path.Combine(_basePath, folder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Generate unique filename to avoid conflicts
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileStreamOutput);
            }

            // Return relative path
            return Path.Combine(folder, uniqueFileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving file {FileName} to folder {Folder}", fileName, folder);
            throw;
        }
    }

    public async Task<Stream> GetFileAsync(string filePath)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException("File not found", filePath);
            }

            var memoryStream = new MemoryStream();
            using (var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read))
            {
                await fileStream.CopyToAsync(memoryStream);
            }
            memoryStream.Position = 0;
            return memoryStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving file {FilePath}", filePath);
            throw;
        }
    }

    public Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("Deleted file: {FilePath}", filePath);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {FilePath}", filePath);
            throw;
        }
    }

    public Task<bool> FileExistsAsync(string filePath)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        return Task.FromResult(File.Exists(fullPath));
    }

    public Task<long> GetFileSizeAsync(string filePath)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException("File not found", filePath);
        }
        var fileInfo = new FileInfo(fullPath);
        return Task.FromResult(fileInfo.Length);
    }
}
