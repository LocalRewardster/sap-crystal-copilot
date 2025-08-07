using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportsService.Models;
using System.Drawing;
using System.Drawing.Imaging;

namespace CrystalReportsService.Services
{
    public class CrystalReportServiceCompatible : ICrystalReportService
    {
        private readonly ILogger<CrystalReportServiceCompatible> _logger;

        public CrystalReportServiceCompatible(ILogger<CrystalReportServiceCompatible> logger)
        {
            _logger = logger;
        }

        public async Task<ReportMetadata> ExtractMetadata(string reportPath, Dictionary<string, object> parameters)
        {
            try
            {
                _logger.LogInformation($"Extracting metadata from: {reportPath}");
                
                var report = new ReportDocument();
                report.Load(reportPath);

                var metadata = new ReportMetadata
                {
                    Name = System.IO.Path.GetFileNameWithoutExtension(reportPath),
                    Description = "Crystal Report",
                    Version = "1.0",
                    Author = "Crystal Reports",
                    CreatedDate = System.IO.File.GetCreationTime(reportPath),
                    ModifiedDate = System.IO.File.GetLastWriteTime(reportPath),
                    Fields = ExtractFields(report),
                    Tables = ExtractTables(report),
                    Parameters = ExtractParameters(report),
                    Sections = ExtractSections(report)
                };

                report.Close();
                report.Dispose();

                return await Task.FromResult(metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting metadata from {reportPath}");
                throw;
            }
        }

        public async Task<byte[]> GeneratePreview(string reportPath, string format, Dictionary<string, object> parameters)
        {
            try
            {
                _logger.LogInformation($"Generating {format} preview for: {reportPath}");

                var report = new ReportDocument();
                report.Load(reportPath);

                // Set parameters if provided
                if (parameters != null)
                {
                    foreach (var param in parameters)
                    {
                        if (report.ParameterFields[param.Key] != null)
                        {
                            report.SetParameterValue(param.Key, param.Value);
                        }
                    }
                }

                byte[] result;

                if (format.ToUpper() == "PDF")
                {
                    var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                    result = ((System.IO.MemoryStream)stream).ToArray();
                }
                else
                {
                    // Default to PDF for other formats
                    var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                    result = ((System.IO.MemoryStream)stream).ToArray();
                }

                report.Close();
                report.Dispose();

                return await Task.FromResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating preview for {reportPath}");
                throw;
            }
        }

        public async Task<bool> PerformFieldOperation(string reportPath, FieldOperationRequest request, Dictionary<string, object> parameters)
        {
            try
            {
                _logger.LogInformation($"Performing {request.Operation} on field {request.FieldName} in {reportPath}");

                var report = new ReportDocument();
                report.Load(reportPath);

                var field = FindReportObject(report, request.FieldName);
                if (field != null)
                {
                    switch (request.Operation.ToLower())
                    {
                        case "hide":
                            field.ObjectFormat.EnableSuppress = true;
                            break;
                        case "show":
                            field.ObjectFormat.EnableSuppress = false;
                            break;
                        case "rename":
                            // Note: Renaming fields requires more complex logic
                            _logger.LogWarning("Rename operation not fully implemented");
                            break;
                    }
                }

                // Save the modified report
                report.SaveAs(reportPath);
                report.Close();
                report.Dispose();

                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error performing field operation on {reportPath}");
                return await Task.FromResult(false);
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
                // Try to create a ReportDocument to test Crystal Reports availability
                using (var report = new ReportDocument())
                {
                    // If we can create it, Crystal Reports is available
                    return await Task.FromResult(true);
                }
            }
            catch
            {
                return await Task.FromResult(false);
            }
        }

        private List<ReportField> ExtractFields(ReportDocument report)
        {
            var fields = new List<ReportField>();
            
            try
            {
                foreach (Section section in report.ReportDefinition.Sections)
                {
                    foreach (ReportObject obj in section.ReportObjects)
                    {
                        if (obj is FieldObject field)
                        {
                            fields.Add(new ReportField
                            {
                                Name = field.Name,
                                Type = "Field",
                                Section = section.Name
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extracting fields");
            }

            return fields;
        }

        private List<ReportTable> ExtractTables(ReportDocument report)
        {
            var tables = new List<ReportTable>();
            
            try
            {
                foreach (Table table in report.Database.Tables)
                {
                    tables.Add(new ReportTable
                    {
                        Name = table.Name,
                        Fields = new List<string>()
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extracting tables");
            }

            return tables;
        }

        private List<ReportParameter> ExtractParameters(ReportDocument report)
        {
            var parameters = new List<ReportParameter>();
            
            try
            {
                foreach (ParameterFieldDefinition param in report.DataDefinition.ParameterFields)
                {
                    parameters.Add(new ReportParameter
                    {
                        Name = param.Name,
                        Type = param.ValueType.ToString(),
                        Required = !param.HasCurrentValue
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extracting parameters");
            }

            return parameters;
        }

        private List<ReportSection> ExtractSections(ReportDocument report)
        {
            var sections = new List<ReportSection>();
            
            try
            {
                foreach (Section section in report.ReportDefinition.Sections)
                {
                    var sectionFields = new List<string>();
                    
                    foreach (ReportObject obj in section.ReportObjects)
                    {
                        if (obj is FieldObject field)
                        {
                            sectionFields.Add(field.Name);
                        }
                    }

                    sections.Add(new ReportSection
                    {
                        Name = section.Name,
                        Fields = sectionFields
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extracting sections");
            }

            return sections;
        }

        private ReportObject FindReportObject(ReportDocument report, string objectName)
        {
            foreach (Section section in report.ReportDefinition.Sections)
            {
                foreach (ReportObject obj in section.ReportObjects)
                {
                    if (obj.Name.Equals(objectName, StringComparison.OrdinalIgnoreCase))
                    {
                        return obj;
                    }
                }
            }
            return null;
        }
    }
}