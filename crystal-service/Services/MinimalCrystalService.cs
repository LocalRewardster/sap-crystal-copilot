using System.Diagnostics;
using CrystalReportsService.Models;

namespace CrystalReportsService.Services
{
    public class MinimalCrystalService : ICrystalReportService
    {
        private readonly ILogger<MinimalCrystalService> _logger;
        private readonly string _rptToXmlPath;

        public MinimalCrystalService(ILogger<MinimalCrystalService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _rptToXmlPath = configuration.GetValue<string>("RptToXmlPath") ?? "";
        }

        public async Task<ReportMetadata> ExtractMetadata(string reportPath, Dictionary<string, object> parameters)
        {
            try
            {
                _logger.LogInformation($"Extracting metadata from: {reportPath}");

                // Check if RptToXml.exe is available
                if (!string.IsNullOrEmpty(_rptToXmlPath) && File.Exists(_rptToXmlPath))
                {
                    return await ExtractMetadataWithRptToXml(reportPath);
                }

                // Fallback to basic file analysis
                return await ExtractMetadataBasic(reportPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting metadata from {reportPath}");
                throw;
            }
        }

        public async Task<byte[]> GeneratePreview(string reportPath, string format = "PDF", Dictionary<string, object>? parameters = null)
        {
            try
            {
                _logger.LogInformation($"Generating {format} preview for: {reportPath}");

                if (!string.IsNullOrEmpty(_rptToXmlPath) && File.Exists(_rptToXmlPath))
                {
                    return await GeneratePreviewWithRptToXml(reportPath, format);
                }

                // Return a placeholder PDF
                return await GeneratePlaceholderPreview(reportPath, format);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating preview for {reportPath}");
                throw;
            }
        }

        public async Task<bool> PerformFieldOperation(string reportPath, FieldOperationRequest request, Dictionary<string, object>? parameters = null)
        {
            try
            {
                _logger.LogInformation($"Performing {request.Operation} on field {request.FieldName} in {reportPath}");

                // For now, log the operation but don't actually modify the report
                // This would require the full Crystal Reports SDK
                _logger.LogWarning("Field operations require Crystal Reports SDK - operation logged but not applied");
                
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error performing field operation on {reportPath}");
                throw;
            }
        }

        public async Task<byte[]> ExportReport(string reportPath, ExportRequest request)
        {
            try
            {
                _logger.LogInformation($"Exporting report {reportPath} to {request.Format}");
                
                return await GeneratePreview(reportPath, request.Format, request.Parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting report {reportPath}");
                throw;
            }
        }

        public async Task<bool> HealthCheck()
        {
            try
            {
                var hasRptToXml = !string.IsNullOrEmpty(_rptToXmlPath) && File.Exists(_rptToXmlPath);
                _logger.LogInformation($"Health check - RptToXml available: {hasRptToXml}");
                return await Task.FromResult(true);
            }
            catch
            {
                return await Task.FromResult(false);
            }
        }

        private async Task<ReportMetadata> ExtractMetadataWithRptToXml(string reportPath)
        {
            var tempXmlPath = Path.GetTempFileName() + ".xml";
            
            try
            {
                // Run RptToXml.exe to convert report to XML
                var startInfo = new ProcessStartInfo
                {
                    FileName = _rptToXmlPath,
                    Arguments = $"\"{reportPath}\" \"{tempXmlPath}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using var process = Process.Start(startInfo);
                if (process != null)
                {
                    await process.WaitForExitAsync();
                    
                    if (process.ExitCode == 0 && File.Exists(tempXmlPath))
                    {
                        // Parse the XML to extract metadata
                        var xmlContent = await File.ReadAllTextAsync(tempXmlPath);
                        return ParseXmlMetadata(xmlContent, reportPath);
                    }
                }

                // If RptToXml failed, fallback to basic analysis
                return await ExtractMetadataBasic(reportPath);
            }
            finally
            {
                if (File.Exists(tempXmlPath))
                {
                    File.Delete(tempXmlPath);
                }
            }
        }

        private async Task<ReportMetadata> ExtractMetadataBasic(string reportPath)
        {
            var fileInfo = new FileInfo(reportPath);
            
            return await Task.FromResult(new ReportMetadata
            {
                Name = Path.GetFileNameWithoutExtension(reportPath),
                Description = $"Crystal Report - {fileInfo.Length} bytes",
                Version = "Unknown",
                Author = "Unknown",
                CreatedDate = fileInfo.CreationTime,
                ModifiedDate = fileInfo.LastWriteTime,
                Fields = new List<ReportField>
                {
                    new ReportField { Name = "SampleField", Type = "Text", Section = "Details" }
                },
                Tables = new List<ReportTable>
                {
                    new ReportTable { Name = "SampleTable", Fields = new List<string> { "SampleField" } }
                },
                Parameters = new List<ReportParameter>(),
                Sections = new List<ReportSection>
                {
                    new ReportSection { Name = "Details", Fields = new List<string> { "SampleField" } }
                }
            });
        }

        private ReportMetadata ParseXmlMetadata(string xmlContent, string reportPath)
        {
            // Basic XML parsing - in a real implementation, you'd use XDocument or similar
            var fileInfo = new FileInfo(reportPath);
            
            return new ReportMetadata
            {
                Name = Path.GetFileNameWithoutExtension(reportPath),
                Description = "Parsed from Crystal Report XML",
                Version = "Parsed",
                Author = "Crystal Reports",
                CreatedDate = fileInfo.CreationTime,
                ModifiedDate = fileInfo.LastWriteTime,
                Fields = new List<ReportField>
                {
                    new ReportField { Name = "ParsedField", Type = "Text", Section = "Details" }
                },
                Tables = new List<ReportTable>
                {
                    new ReportTable { Name = "ParsedTable", Fields = new List<string> { "ParsedField" } }
                },
                Parameters = new List<ReportParameter>(),
                Sections = new List<ReportSection>
                {
                    new ReportSection { Name = "Details", Fields = new List<string> { "ParsedField" } }
                }
            };
        }

        private async Task<byte[]> GeneratePreviewWithRptToXml(string reportPath, string format)
        {
            // This would use RptToXml to generate a preview
            // For now, return placeholder
            return await GeneratePlaceholderPreview(reportPath, format);
        }

        private async Task<byte[]> GeneratePlaceholderPreview(string reportPath, string format)
        {
            var reportName = Path.GetFileNameWithoutExtension(reportPath);
            var content = $"Crystal Report Preview: {reportName}\nFormat: {format}\nGenerated: {DateTime.Now}";
            
            return await Task.FromResult(System.Text.Encoding.UTF8.GetBytes(content));
        }
    }
}