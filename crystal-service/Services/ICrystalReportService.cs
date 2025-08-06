using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CrystalReportsService.Models;

namespace CrystalReportsService.Services
{
    public interface ICrystalReportService
    {
        /// <summary>
        /// Generate a preview of the Crystal Report in the specified format
        /// </summary>
        Task<byte[]> GeneratePreviewAsync(string reportPath, string format = "PDF", Dictionary<string, object>? parameters = null);

        /// <summary>
        /// Extract comprehensive metadata from a Crystal Report
        /// </summary>
        Task<CrystalReportMetadata> ExtractMetadataAsync(string reportPath);

        /// <summary>
        /// Perform field operations (hide, show, rename, move) on a Crystal Report
        /// </summary>
        Task<bool> ModifyFieldAsync(string reportPath, string fieldName, string operation, Dictionary<string, object>? parameters = null);

        /// <summary>
        /// Export Crystal Report to various formats
        /// </summary>
        Task<byte[]> ExportReportAsync(string reportPath, string format, Dictionary<string, object>? parameters = null);

        /// <summary>
        /// Validate if a Crystal Report file is accessible and valid
        /// </summary>
        Task<bool> ValidateReportAsync(string reportPath);

        /// <summary>
        /// Get report thumbnail/preview image
        /// </summary>
        Task<byte[]> GenerateThumbnailAsync(string reportPath);
    }
}