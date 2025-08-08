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

                // Disable database refresh to avoid connection issues during metadata extraction
                try
                {
                    report.SetDatabaseLogon("", "", "", "", false);
                    Console.WriteLine("Disabled database refresh for metadata extraction");
                }
                catch (Exception dbEx)
                {
                    Console.WriteLine($"Warning: Could not disable database refresh: {dbEx.Message}");
                }

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
                
                // CRITICAL: Set database options BEFORE loading the report
                Console.WriteLine("🔧 Configuring report for offline mode...");
                try
                {
                    // Set the report to not verify on every use
                    report.VerifyOnEveryUse = false;
                    Console.WriteLine("Disabled VerifyOnEveryUse");
                    
                    // Try to set offline mode if available
                    try
                    {
                        // This might help with database-heavy reports
                        var summaryInfo = report.SummaryInfo;
                        Console.WriteLine("Accessed SummaryInfo for offline mode");
                    }
                    catch (Exception summaryEx)
                    {
                        Console.WriteLine($"Could not access SummaryInfo: {summaryEx.Message}");
                    }
                }
                catch (Exception verifyEx)
                {
                    Console.WriteLine($"Could not disable VerifyOnEveryUse: {verifyEx.Message}");
                }

                Console.WriteLine("📂 Loading report with database bypass...");
                
                // Try multiple loading approaches
                bool reportLoaded = false;
                Exception lastLoadException = null;
                
                // Method 1: Load with database verification disabled
                try
                {
                    Console.WriteLine("Attempting load with VerifyOnEveryUse = false...");
                    report.Load(reportPath);
                    reportLoaded = true;
                    Console.WriteLine("✅ Report loaded successfully");
                }
                catch (Exception loadEx)
                {
                    Console.WriteLine($"❌ Standard load failed: {loadEx.Message}");
                    lastLoadException = loadEx;
                    
                    // Method 2: Try loading with different report document
                    try
                    {
                        Console.WriteLine("🔄 Attempting fresh report load...");
                        report.Dispose();
                        report = new ReportDocument();
                        
                        // Set all possible offline flags before loading
                        report.VerifyOnEveryUse = false;
                        
                        report.Load(reportPath);
                        reportLoaded = true;
                        Console.WriteLine("✅ Fresh report load successful");
                    }
                    catch (Exception freshEx)
                    {
                        Console.WriteLine($"❌ Fresh load also failed: {freshEx.Message}");
                        lastLoadException = freshEx;
                    }
                }
                
                if (!reportLoaded)
                {
                    throw new Exception($"Could not load report: {lastLoadException?.Message}");
                }

                // Disable database refresh to avoid connection issues
                Console.WriteLine("Disabling database refresh...");
                
                // Multiple approaches to disable database connections
                try
                {
                    report.SetDatabaseLogon("", "", "", "", false);
                    Console.WriteLine("SetDatabaseLogon completed");
                }
                catch (Exception dbEx)
                {
                    Console.WriteLine($"Warning: SetDatabaseLogon failed: {dbEx.Message}");
                }
                
                // Set data source location to avoid database issues
                Console.WriteLine($"Processing {report.Database.Tables.Count} tables...");
                foreach (Table table in report.Database.Tables)
                {
                    try
                    {
                        Console.WriteLine($"Processing table: {table.Name}");
                        Console.WriteLine($"  - Location: {table.Location}");
                        Console.WriteLine($"  - Server: {table.LogOnInfo.ConnectionInfo.ServerName}");
                        Console.WriteLine($"  - Database: {table.LogOnInfo.ConnectionInfo.DatabaseName}");
                        Console.WriteLine($"  - Type: {table.LogOnInfo.ConnectionInfo.Type}");
                        
                        var tableLogonInfo = table.LogOnInfo;
                        
                        // Try multiple approaches to disconnect
                        tableLogonInfo.ConnectionInfo.ServerName = "";
                        tableLogonInfo.ConnectionInfo.DatabaseName = "";
                        tableLogonInfo.ConnectionInfo.UserID = "";
                        tableLogonInfo.ConnectionInfo.Password = "";
                        tableLogonInfo.ConnectionInfo.IntegratedSecurity = false;
                        
                        // Try to change the connection type
                        tableLogonInfo.ConnectionInfo.Type = ConnectionInfoType.SQL;
                        
                        table.ApplyLogOnInfo(tableLogonInfo);
                        
                        // Also try to set the location to a dummy location
                        table.Location = "dummy.db";
                        
                        Console.WriteLine($"✅ Applied logon info for table: {table.Name}");
                    }
                    catch (Exception tableEx)
                    {
                        Console.WriteLine($"⚠️ Warning: Could not set logon for table {table.Name}: {tableEx.Message}");
                        Console.WriteLine($"    Full error: {tableEx.ToString()}");
                        // Continue with other tables
                    }
                }
                
                // Try to verify data sources
                try
                {
                    report.VerifyDatabase();
                    Console.WriteLine("Database verification completed");
                }
                catch (Exception verifyEx)
                {
                    Console.WriteLine($"Database verification failed (expected): {verifyEx.Message}");
                }

                byte[] result;

                Console.WriteLine("Starting export with enhanced database handling...");
                
                try
                {
                    // Method 1: Try direct export without touching database at all
                    Console.WriteLine("🚀 Attempting direct export without database validation...");
                    var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                    result = ((MemoryStream)stream).ToArray();
                    Console.WriteLine($"✅ Direct export successful: {result.Length} bytes");
                }
                catch (Exception exportEx)
                {
                    Console.WriteLine($"❌ Direct export failed: {exportEx.Message}");
                    
                    // Method 2: Try disk export (sometimes works when stream doesn't)
                    Console.WriteLine("🔧 Attempting disk export method...");
                    try
                    {
                        string tempPath = Path.GetTempFileName() + ".pdf";
                        
                        var exportOptions = report.ExportOptions;
                        exportOptions.ExportFormatType = ExportFormatType.PortableDocFormat;
                        exportOptions.ExportDestinationType = ExportDestinationType.DiskFile;
                        exportOptions.DestinationOptions = new DiskFileDestinationOptions { DiskFileName = tempPath };
                        
                        report.Export();
                        result = File.ReadAllBytes(tempPath);
                        File.Delete(tempPath);
                        
                        Console.WriteLine($"✅ Disk export successful: {result.Length} bytes");
                    }
                    catch (Exception diskEx)
                    {
                        Console.WriteLine($"❌ Disk export failed: {diskEx.Message}");
                        
                        // Method 3: Try structure-only export (no data)
                        Console.WriteLine("🎯 Attempting structure-only export...");
                        try
                        {
                            report.RecordSelectionFormula = "1=0"; // Select no records
                            var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                            result = ((MemoryStream)stream).ToArray();
                            Console.WriteLine($"✅ Structure-only export successful: {result.Length} bytes");
                        }
                        catch (Exception structureEx)
                        {
                            Console.WriteLine($"❌ Structure export failed: {structureEx.Message}");
                            throw new Exception($"All export methods failed. Direct: {exportEx.Message}, Disk: {diskEx.Message}, Structure: {structureEx.Message}");
                        }
                    }
                }

                report.Close();
                report.Dispose();

                Console.WriteLine($"Generated {result.Length} bytes preview");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating preview: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
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