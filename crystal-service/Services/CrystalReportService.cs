using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportsService.Models;
using System.Drawing;
using System.Drawing.Imaging;

namespace CrystalReportsService.Services
{
    public class CrystalReportService : ICrystalReportService
    {
        private readonly ILogger<CrystalReportService> _logger;

        public CrystalReportService(ILogger<CrystalReportService> logger)
        {
            _logger = logger;
        }

        public async Task<byte[]> GeneratePreviewAsync(string reportPath, string format = "PDF", Dictionary<string, object>? parameters = null)
        {
            return await Task.Run(() =>
            {
                try
                {
                    _logger.LogInformation($"Generating {format} preview for report: {reportPath}");

                    var report = new ReportDocument();
                    report.Load(reportPath);

                    // Set parameters if provided
                    if (parameters != null)
                    {
                        SetReportParameters(report, parameters);
                    }

                    // Export to specified format
                    var exportFormat = GetExportFormatType(format);
                    using var stream = report.ExportToStream(exportFormat);
                    
                    var buffer = new byte[stream.Length];
                    stream.Read(buffer, 0, buffer.Length);

                    report.Close();
                    report.Dispose();

                    _logger.LogInformation($"Successfully generated {format} preview ({buffer.Length} bytes)");
                    return buffer;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to generate preview for report: {reportPath}");
                    throw;
                }
            });
        }

        public async Task<CrystalReportMetadata> ExtractMetadataAsync(string reportPath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    _logger.LogInformation($"Extracting metadata from report: {reportPath}");

                    var report = new ReportDocument();
                    report.Load(reportPath);

                    var metadata = new CrystalReportMetadata
                    {
                        Id = Path.GetFileNameWithoutExtension(reportPath),
                        Title = report.SummaryInfo.ReportTitle ?? Path.GetFileNameWithoutExtension(reportPath),
                        Author = report.SummaryInfo.ReportAuthor ?? "Unknown",
                        CreatedDate = File.GetCreationTime(reportPath),
                        ModifiedDate = File.GetLastWriteTime(reportPath),
                        FileSize = new FileInfo(reportPath).Length
                    };

                    // Extract sections and fields
                    metadata.Sections = ExtractSections(report);

                    // Extract database information
                    metadata.Tables = ExtractTables(report);
                    metadata.DatabaseConnections = ExtractDatabaseConnections(report);

                    // Extract parameters
                    metadata.Parameters = ExtractParameters(report);

                    report.Close();
                    report.Dispose();

                    _logger.LogInformation($"Successfully extracted metadata: {metadata.Sections.Count} sections, {metadata.Sections.Sum(s => s.Fields.Count)} fields");
                    return metadata;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to extract metadata from report: {reportPath}");
                    throw;
                }
            });
        }

        public async Task<bool> ModifyFieldAsync(string reportPath, string fieldName, string operation, Dictionary<string, object>? parameters = null)
        {
            return await Task.Run(() =>
            {
                try
                {
                    _logger.LogInformation($"Performing {operation} operation on field {fieldName} in report: {reportPath}");

                    var report = new ReportDocument();
                    report.Load(reportPath);

                    bool success = false;

                    // Find and modify the field
                    foreach (Section section in report.ReportDefinition.Sections)
                    {
                        foreach (ReportObject reportObject in section.ReportObjects)
                        {
                            if (reportObject.Name == fieldName || 
                                (reportObject is FieldObject field && field.DataSource.ToString().Contains(fieldName)))
                            {
                                success = PerformFieldOperation(reportObject, operation, parameters);
                                if (success) break;
                            }
                        }
                        if (success) break;
                    }

                    if (success)
                    {
                        // Save the modified report
                        var backupPath = reportPath + ".backup";
                        File.Copy(reportPath, backupPath, true);
                        
                        report.SaveAs(reportPath);
                        _logger.LogInformation($"Successfully modified field {fieldName} with operation {operation}");
                    }

                    report.Close();
                    report.Dispose();

                    return success;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to modify field {fieldName} in report: {reportPath}");
                    throw;
                }
            });
        }

        public async Task<byte[]> ExportReportAsync(string reportPath, string format, Dictionary<string, object>? parameters = null)
        {
            // Use the same logic as GeneratePreviewAsync
            return await GeneratePreviewAsync(reportPath, format, parameters);
        }

        public async Task<bool> ValidateReportAsync(string reportPath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    if (!File.Exists(reportPath))
                        return false;

                    var report = new ReportDocument();
                    report.Load(reportPath);
                    
                    // Basic validation - can we load the report?
                    var isValid = report.ReportDefinition != null;
                    
                    report.Close();
                    report.Dispose();
                    
                    return isValid;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Report validation failed for: {reportPath}");
                    return false;
                }
            });
        }

        public async Task<byte[]> GenerateThumbnailAsync(string reportPath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    _logger.LogInformation($"Generating thumbnail for report: {reportPath}");

                    var report = new ReportDocument();
                    report.Load(reportPath);

                    // Export first page as image for thumbnail
                    using var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                    
                    // For now, return PDF bytes - in production, you'd convert to image
                    var buffer = new byte[stream.Length];
                    stream.Read(buffer, 0, buffer.Length);

                    report.Close();
                    report.Dispose();

                    return buffer;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to generate thumbnail for report: {reportPath}");
                    throw;
                }
            });
        }

        #region Private Helper Methods

        private List<CrystalReportSection> ExtractSections(ReportDocument report)
        {
            var sections = new List<CrystalReportSection>();

            foreach (Section section in report.ReportDefinition.Sections)
            {
                var crystalSection = new CrystalReportSection
                {
                    Name = section.Name,
                    SectionType = GetSectionTypeName(section.Kind),
                    Height = section.Height,
                    Fields = ExtractFieldsFromSection(section)
                };

                sections.Add(crystalSection);
            }

            return sections;
        }

        private List<CrystalReportField> ExtractFieldsFromSection(Section section)
        {
            var fields = new List<CrystalReportField>();

            foreach (ReportObject reportObject in section.ReportObjects)
            {
                var field = new CrystalReportField
                {
                    Id = reportObject.Name,
                    Name = reportObject.Name,
                    X = reportObject.Left,
                    Y = reportObject.Top,
                    Width = reportObject.Width,
                    Height = reportObject.Height,
                    Visible = !reportObject.ObjectFormat.EnableSuppress
                };

                // Determine field type and extract additional info
                if (reportObject is FieldObject fieldObj)
                {
                    field.FieldType = "DatabaseField";
                    field.DataType = fieldObj.DataSource.GetType().Name;
                    
                    if (fieldObj.DataSource is DatabaseFieldDefinition dbField)
                    {
                        field.TableName = dbField.TableName;
                        field.ColumnName = dbField.Name;
                    }
                }
                else if (reportObject is TextObject textObj)
                {
                    field.FieldType = "TextObject";
                    field.Text = textObj.Text;
                }
                else if (reportObject is FormulaFieldDefinition formulaObj)
                {
                    field.FieldType = "Formula";
                    field.Formula = formulaObj.Text;
                }

                // Extract formatting
                field.Format = ExtractFieldFormat(reportObject);

                fields.Add(field);
            }

            return fields;
        }

        private CrystalFieldFormat ExtractFieldFormat(ReportObject reportObject)
        {
            var format = new CrystalFieldFormat();

            if (reportObject.ObjectFormat.Font != null)
            {
                format.FontName = reportObject.ObjectFormat.Font.Name;
                format.FontSize = (int)reportObject.ObjectFormat.Font.Size;
                format.Bold = reportObject.ObjectFormat.Font.Bold;
                format.Italic = reportObject.ObjectFormat.Font.Italic;
                format.Underline = reportObject.ObjectFormat.Font.Underline;
            }

            format.Color = ColorTranslator.ToHtml(reportObject.ObjectFormat.Color);
            
            return format;
        }

        private List<string> ExtractTables(ReportDocument report)
        {
            var tables = new List<string>();

            foreach (Table table in report.Database.Tables)
            {
                tables.Add(table.Name);
            }

            return tables;
        }

        private List<CrystalDatabaseConnection> ExtractDatabaseConnections(ReportDocument report)
        {
            var connections = new List<CrystalDatabaseConnection>();

            foreach (Table table in report.Database.Tables)
            {
                if (table.LogOnInfo != null)
                {
                    var connection = new CrystalDatabaseConnection
                    {
                        Server = table.LogOnInfo.ConnectionInfo.ServerName,
                        Database = table.LogOnInfo.ConnectionInfo.DatabaseName,
                        Username = table.LogOnInfo.ConnectionInfo.UserID
                    };
                    
                    if (!connections.Any(c => c.Server == connection.Server && c.Database == connection.Database))
                    {
                        connections.Add(connection);
                    }
                }
            }

            return connections;
        }

        private List<CrystalReportParameter> ExtractParameters(ReportDocument report)
        {
            var parameters = new List<CrystalReportParameter>();

            foreach (ParameterFieldDefinition param in report.DataDefinition.ParameterFields)
            {
                var parameter = new CrystalReportParameter
                {
                    Name = param.Name,
                    Type = param.ValueType.ToString(),
                    Required = !param.Optional,
                    PromptText = param.PromptText
                };

                if (param.DefaultValues.Count > 0)
                {
                    parameter.DefaultValue = param.DefaultValues[0];
                }

                parameters.Add(parameter);
            }

            return parameters;
        }

        private string GetSectionTypeName(AreaSectionKind sectionKind)
        {
            return sectionKind switch
            {
                AreaSectionKind.ReportHeader => "ReportHeader",
                AreaSectionKind.PageHeader => "PageHeader",
                AreaSectionKind.GroupHeader => "GroupHeader",
                AreaSectionKind.Detail => "Details",
                AreaSectionKind.GroupFooter => "GroupFooter",
                AreaSectionKind.ReportFooter => "ReportFooter",
                AreaSectionKind.PageFooter => "PageFooter",
                _ => "Unknown"
            };
        }

        private ExportFormatType GetExportFormatType(string format)
        {
            return format.ToUpper() switch
            {
                "PDF" => ExportFormatType.PortableDocFormat,
                "HTML" => ExportFormatType.HTML40,
                "EXCEL" => ExportFormatType.Excel,
                "WORD" => ExportFormatType.WordForWindows,
                "RTF" => ExportFormatType.RichText,
                "CSV" => ExportFormatType.CharSeparatedValues,
                _ => ExportFormatType.PortableDocFormat
            };
        }

        private bool PerformFieldOperation(ReportObject reportObject, string operation, Dictionary<string, object>? parameters)
        {
            try
            {
                switch (operation.ToLower())
                {
                    case "hide":
                        reportObject.ObjectFormat.EnableSuppress = true;
                        return true;

                    case "show":
                        reportObject.ObjectFormat.EnableSuppress = false;
                        return true;

                    case "move":
                        if (parameters != null)
                        {
                            if (parameters.ContainsKey("x"))
                                reportObject.Left = Convert.ToInt32(parameters["x"]);
                            if (parameters.ContainsKey("y"))
                                reportObject.Top = Convert.ToInt32(parameters["y"]);
                            return true;
                        }
                        break;

                    case "resize":
                        if (parameters != null)
                        {
                            if (parameters.ContainsKey("width"))
                                reportObject.Width = Convert.ToInt32(parameters["width"]);
                            if (parameters.ContainsKey("height"))
                                reportObject.Height = Convert.ToInt32(parameters["height"]);
                            return true;
                        }
                        break;

                    case "rename":
                        if (parameters != null && parameters.ContainsKey("newName"))
                        {
                            // Note: Renaming fields in Crystal Reports is complex
                            // This is a simplified approach
                            if (reportObject is TextObject textObj)
                            {
                                textObj.Text = parameters["newName"].ToString();
                                return true;
                            }
                        }
                        break;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to perform operation {operation} on field");
                return false;
            }
        }

        private void SetReportParameters(ReportDocument report, Dictionary<string, object> parameters)
        {
            foreach (var param in parameters)
            {
                try
                {
                    report.SetParameterValue(param.Key, param.Value);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to set parameter {param.Key}");
                }
            }
        }

        #endregion
    }
}