using System;
using System.Collections.Generic;
using System.IO;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportsService.Models;

namespace CrystalReportsService.Services
{
    public class CrystalReportServiceFramework
    {
        public ReportMetadata ExtractMetadata(string reportPath)
        {
            try
            {
                Console.WriteLine($"Loading report: {reportPath}");
                
                var report = new ReportDocument();
                report.Load(reportPath);

                var metadata = new ReportMetadata
                {
                    Name = Path.GetFileNameWithoutExtension(reportPath),
                    Description = "Crystal Report",
                    Version = "1.0",
                    Author = "Crystal Reports",
                    CreatedDate = File.GetCreationTime(reportPath),
                    ModifiedDate = File.GetLastWriteTime(reportPath),
                    Fields = ExtractFields(report),
                    Tables = ExtractTables(report),
                    Parameters = ExtractParameters(report),
                    Sections = ExtractSections(report)
                };

                report.Close();
                report.Dispose();

                Console.WriteLine($"Successfully extracted metadata for {metadata.Name}");
                return metadata;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting metadata: {ex.Message}");
                throw;
            }
        }

        public byte[] GeneratePreview(string reportPath, string format = "PDF")
        {
            try
            {
                Console.WriteLine($"Generating {format} preview for: {reportPath}");

                var report = new ReportDocument();
                report.Load(reportPath);

                byte[] result;

                if (format.ToUpper() == "PDF")
                {
                    var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                    result = ((MemoryStream)stream).ToArray();
                }
                else
                {
                    // Default to PDF
                    var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                    result = ((MemoryStream)stream).ToArray();
                }

                report.Close();
                report.Dispose();

                Console.WriteLine($"Generated {result.Length} bytes preview");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating preview: {ex.Message}");
                throw;
            }
        }

        public bool PerformFieldOperation(string reportPath, FieldOperationRequest request)
        {
            try
            {
                Console.WriteLine($"Performing {request.Operation} on field {request.FieldName}");

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
                            Console.WriteLine("Rename operation requires additional implementation");
                            break;
                    }
                }

                report.SaveAs(reportPath);
                report.Close();
                report.Dispose();

                Console.WriteLine("Field operation completed successfully");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error performing field operation: {ex.Message}");
                return false;
            }
        }

        public bool HealthCheck()
        {
            try
            {
                using (var report = new ReportDocument())
                {
                    Console.WriteLine("Crystal Reports SDK is available");
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Crystal Reports SDK not available: {ex.Message}");
                return false;
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
                Console.WriteLine($"Warning: Error extracting fields: {ex.Message}");
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
                Console.WriteLine($"Warning: Error extracting tables: {ex.Message}");
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
                Console.WriteLine($"Warning: Error extracting parameters: {ex.Message}");
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
                Console.WriteLine($"Warning: Error extracting sections: {ex.Message}");
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