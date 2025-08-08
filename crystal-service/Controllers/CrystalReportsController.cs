using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CrystalReportsService.Models;
using CrystalReportsService.Services;

namespace CrystalReportsService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CrystalReportsController : ControllerBase
    {
        private readonly ICrystalReportService _crystalService;
        private readonly ILogger<CrystalReportsController> _logger;

        public CrystalReportsController(ICrystalReportService crystalService, ILogger<CrystalReportsController> logger)
        {
            _crystalService = crystalService;
            _logger = logger;
        }

        /// <summary>
        /// Generate a preview of a Crystal Report
        /// </summary>
        [HttpPost("preview")]
        public async Task<IActionResult> GeneratePreview([FromBody] ReportPreviewRequest request)
        {
            try
            {
                if (!System.IO.File.Exists(request.ReportPath))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Error = "Report file not found"
                    });
                }

                byte[] previewBytes;
                
                // TRY PUSH MODEL FIRST - completely database-free approach
                try
                {
                    _logger.LogInformation("🔥 Attempting PUSH MODEL approach...");
                    var pushModelService = new CrystalReportServicePushModel();
                    previewBytes = await pushModelService.GeneratePreview(request.ReportPath, request.Format);
                    _logger.LogInformation("✅ PUSH MODEL succeeded!");
                }
                catch (Exception pushEx)
                {
                    _logger.LogWarning($"❌ PUSH MODEL failed: {pushEx.Message}");
                    _logger.LogInformation("🔄 Falling back to original service...");
                    
                    // Fallback to original service
                    previewBytes = await _crystalService.GeneratePreviewAsync(
                        request.ReportPath, 
                        request.Format, 
                        request.Parameters
                    );
                }

                var contentType = GetContentType(request.Format);
                var fileName = $"{Path.GetFileNameWithoutExtension(request.ReportPath)}.{request.Format.ToLower()}";

                return File(previewBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate preview for report: {ReportPath}", request.ReportPath);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Error = $"Failed to generate preview: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Extract metadata from a Crystal Report
        /// </summary>
        [HttpPost("metadata")]
        public async Task<ActionResult<ApiResponse<CrystalReportMetadata>>> ExtractMetadata([FromBody] ReportMetadataRequest request)
        {
            try
            {
                if (!System.IO.File.Exists(request.ReportPath))
                {
                    return BadRequest(new ApiResponse<CrystalReportMetadata>
                    {
                        Success = false,
                        Error = "Report file not found"
                    });
                }

                var metadata = await _crystalService.ExtractMetadataAsync(request.ReportPath);

                return Ok(new ApiResponse<CrystalReportMetadata>
                {
                    Success = true,
                    Data = metadata,
                    Message = "Metadata extracted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to extract metadata for report: {ReportPath}", request.ReportPath);
                return StatusCode(500, new ApiResponse<CrystalReportMetadata>
                {
                    Success = false,
                    Error = $"Failed to extract metadata: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Perform field operations (hide, show, rename, move)
        /// </summary>
        [HttpPost("field-operation")]
        public async Task<ActionResult<ApiResponse<bool>>> PerformFieldOperation([FromBody] ReportFieldOperation request)
        {
            try
            {
                if (!System.IO.File.Exists(request.ReportPath))
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Report file not found"
                    });
                }

                var success = await _crystalService.ModifyFieldAsync(
                    request.ReportPath,
                    request.FieldName,
                    request.Operation,
                    request.Parameters
                );

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Data = success,
                    Message = success ? 
                        $"Field operation '{request.Operation}' completed successfully" : 
                        $"Field operation '{request.Operation}' failed"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to perform field operation: {Operation} on {FieldName}", request.Operation, request.FieldName);
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Error = $"Failed to perform field operation: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Export Crystal Report to various formats
        /// </summary>
        [HttpPost("export")]
        public async Task<IActionResult> ExportReport([FromBody] ReportPreviewRequest request)
        {
            try
            {
                if (!System.IO.File.Exists(request.ReportPath))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Error = "Report file not found"
                    });
                }

                var exportBytes = await _crystalService.ExportReportAsync(
                    request.ReportPath,
                    request.Format,
                    request.Parameters
                );

                var contentType = GetContentType(request.Format);
                var fileName = $"{Path.GetFileNameWithoutExtension(request.ReportPath)}_export.{request.Format.ToLower()}";

                return File(exportBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export report: {ReportPath}", request.ReportPath);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Error = $"Failed to export report: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Validate if a Crystal Report is accessible
        /// </summary>
        [HttpPost("validate")]
        public async Task<ActionResult<ApiResponse<bool>>> ValidateReport([FromBody] ReportMetadataRequest request)
        {
            try
            {
                var isValid = await _crystalService.ValidateReportAsync(request.ReportPath);

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Data = isValid,
                    Message = isValid ? "Report is valid" : "Report is invalid or inaccessible"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate report: {ReportPath}", request.ReportPath);
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Error = $"Failed to validate report: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Generate thumbnail for a Crystal Report
        /// </summary>
        [HttpPost("thumbnail")]
        public async Task<IActionResult> GenerateThumbnail([FromBody] ReportMetadataRequest request)
        {
            try
            {
                if (!System.IO.File.Exists(request.ReportPath))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Error = "Report file not found"
                    });
                }

                var thumbnailBytes = await _crystalService.GenerateThumbnailAsync(request.ReportPath);

                return File(thumbnailBytes, "application/pdf", $"{Path.GetFileNameWithoutExtension(request.ReportPath)}_thumbnail.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate thumbnail for report: {ReportPath}", request.ReportPath);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Error = $"Failed to generate thumbnail: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Crystal Reports Service is running",
                Data = new
                {
                    Service = "Crystal Reports Service",
                    Version = "1.0.0",
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow
                }
            });
        }

        private static string GetContentType(string format)
        {
            return format.ToUpper() switch
            {
                "PDF" => "application/pdf",
                "HTML" => "text/html",
                "EXCEL" => "application/vnd.ms-excel",
                "WORD" => "application/msword",
                "RTF" => "application/rtf",
                "CSV" => "text/csv",
                _ => "application/octet-stream"
            };
        }
    }
}