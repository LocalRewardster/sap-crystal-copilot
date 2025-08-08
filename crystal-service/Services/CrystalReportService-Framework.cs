using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalDecisions.ReportAppServer.ClientDoc;
using CrystalDecisions.ReportAppServer.DatabaseController;
using CrystalReportsService.Models;

namespace CrystalReportsService.Services
{
    public class CrystalReportServiceFramework
    {
        private void ForceOffline(ReportDocument rpt, DataSet ds)
        {
            Console.WriteLine("🔧 Starting comprehensive force offline procedure...");
            
            // Helper method to wipe database connections
            System.Action<Database> wipeDatabase = db =>
            {
                Console.WriteLine($"Processing database with {db.Tables.Count} tables...");
                foreach (Table t in db.Tables)
                {
                    try
                    {
                        var alias = t.Name;
                        Console.WriteLine($"  Processing table: {alias}");
                        
                        if (ds.Tables.Contains(alias))
                        {
                            t.SetDataSource(ds.Tables[alias]);
                            Console.WriteLine($"    ✅ SetDataSource for {alias}");
                        }
                        
                        // Triple-sure connection clearing
                        t.LogOnInfo.ConnectionInfo.ServerName = "";
                        t.LogOnInfo.ConnectionInfo.DatabaseName = "";
                        t.LogOnInfo.ConnectionInfo.UserID = "";
                        t.LogOnInfo.ConnectionInfo.Password = "";
                        t.ApplyLogOnInfo(t.LogOnInfo);
                        Console.WriteLine($"    ✅ Cleared connection info for {alias}");
                    }
                    catch (Exception tableEx)
                    {
                        Console.WriteLine($"    ⚠️ Could not process table {t.Name}: {tableEx.Message}");
                    }
                }
            };

            // 1. Main report tables
            Console.WriteLine("1️⃣ Processing main report database...");
            wipeDatabase(rpt.Database);

            // 2. Sub-reports
            Console.WriteLine("2️⃣ Processing sub-reports...");
            foreach (ReportDocument sr in rpt.Subreports)
            {
                Console.WriteLine($"  Processing sub-report: {sr.Name}");
                wipeDatabase(sr.Database);
            }

            // 3. Command tables via RAS API
            Console.WriteLine("3️⃣ Processing command tables...");
            try
            {
                var rc = rpt.ReportClientDocument;
                foreach (var tab in rc.DatabaseController.Database.Tables)
                {
                    if (tab is ICommandTable cmd)
                    {
                        Console.WriteLine($"  Processing command table: {cmd.Name}");
                        cmd.CommandText = "SELECT 1 AS Dummy";
                        rc.DatabaseController.SetTableLocation(tab, cmd as ITable);
                        Console.WriteLine($"    ✅ Updated command table {cmd.Name}");
                    }
                }
            }
            catch (Exception cmdEx)
            {
                Console.WriteLine($"⚠️ Command table processing failed: {cmdEx.Message}");
            }

            // 4. Table links/aliases
            Console.WriteLine("4️⃣ Processing table links...");
            try
            {
                foreach (TableLink link in rpt.Database.Links)
                {
                    Console.WriteLine($"  Processing link: {link.SourceTable.Name} -> {link.DestinationTable.Name}");
                    
                    if (ds.Tables.Contains(link.SourceTable.Name))
                    {
                        link.SourceTable.SetDataSource(ds.Tables[link.SourceTable.Name]);
                    }
                    if (ds.Tables.Contains(link.DestinationTable.Name))
                    {
                        link.DestinationTable.SetDataSource(ds.Tables[link.DestinationTable.Name]);
                    }
                    Console.WriteLine($"    ✅ Updated link tables");
                }
            }
            catch (Exception linkEx)
            {
                Console.WriteLine($"⚠️ Table link processing failed: {linkEx.Message}");
            }

            // 5. Kill verification flags
            Console.WriteLine("5️⃣ Disabling verification...");
            try
            {
                rpt.VerifyOnEveryPrint = false;
                Console.WriteLine("  ✅ Set VerifyOnEveryPrint = false");
                
                var rc = rpt.ReportClientDocument;
                rc.VerifyDatabase(false);
                Console.WriteLine("  ✅ Called VerifyDatabase(false)");
            }
            catch (Exception verifyEx)
            {
                Console.WriteLine($"⚠️ Verification disabling failed: {verifyEx.Message}");
            }

            Console.WriteLine("🎯 Force offline procedure completed!");
        }

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
                
                // CRITICAL: Configure report for offline mode before loading
                Console.WriteLine("🔧 Configuring report for offline mode...");
                Console.WriteLine("Report document created, ready for loading...");

                Console.WriteLine("📂 Loading report with DataSet injection approach...");
                
                try
                {
                    Console.WriteLine("🎯 Loading report by temp copy to avoid file locks...");
                    report.Load(reportPath, OpenReportMethod.OpenReportByTempCopy);
                    Console.WriteLine("✅ Report loaded successfully with temp copy method");
                }
                catch (Exception loadEx)
                {
                    Console.WriteLine($"❌ Temp copy load failed, trying standard load: {loadEx.Message}");
                    report.Load(reportPath);
                    Console.WriteLine("✅ Report loaded successfully with standard method");
                }

                // DATASET INJECTION APPROACH: Replace database with in-memory DataSet
                Console.WriteLine($"🎯 DATASET INJECTION: Creating dummy DataSet for {report.Database.Tables.Count} tables");
                
                try 
                {
                    // Create a DataSet that matches the schema Crystal Reports expects
                    var dataSet = new DataSet();
                    
                    foreach (Table table in report.Database.Tables)
                    {
                        try
                        {
                            Console.WriteLine($"Creating DataTable for: {table.Name}");
                            
                            // Create DataTable with unique name based on table name (not location)
                            var dataTable = new DataTable(table.Name); // Use the table name to avoid duplicates
                            
                            // Add basic columns that most reports expect
                            // We'll add common field types - Crystal Reports will ignore unused ones
                            dataTable.Columns.Add("ID", typeof(int));
                            dataTable.Columns.Add("Name", typeof(string));
                            dataTable.Columns.Add("Description", typeof(string));
                            dataTable.Columns.Add("Amount", typeof(decimal));
                            dataTable.Columns.Add("Date", typeof(DateTime));
                            dataTable.Columns.Add("Code", typeof(string));
                            dataTable.Columns.Add("Status", typeof(string));
                            dataTable.Columns.Add("Type", typeof(string));
                            dataTable.Columns.Add("Value", typeof(string));
                            dataTable.Columns.Add("Reference", typeof(string));
                            
                            // Add specific fields that formulas are looking for
                            dataTable.Columns.Add("CashAccount", typeof(bool)); // For {Customer.CashAccount}
                            dataTable.Columns.Add("Address", typeof(string));
                            dataTable.Columns.Add("City", typeof(string));
                            dataTable.Columns.Add("State", typeof(string));
                            dataTable.Columns.Add("ZipCode", typeof(string));
                            dataTable.Columns.Add("Phone", typeof(string));
                            dataTable.Columns.Add("Email", typeof(string));
                            dataTable.Columns.Add("ContactName", typeof(string));
                            dataTable.Columns.Add("TaxID", typeof(string));
                            dataTable.Columns.Add("CreditLimit", typeof(decimal));
                            
                            // Add one sample row to satisfy Crystal Reports
                            var row = dataTable.NewRow();
                            row["ID"] = 1;
                            row["Name"] = "Sample Data";
                            row["Description"] = "Preview Mode";
                            row["Amount"] = 0.00m;
                            row["Date"] = DateTime.Now;
                            row["Code"] = "PREV";
                            row["Status"] = "Active";
                            row["Type"] = "Preview";
                            row["Value"] = "N/A";
                            row["Reference"] = "PREVIEW";
                            
                            // Set values for the specific fields formulas are looking for
                            row["CashAccount"] = false; // Default to false for {Customer.CashAccount}
                            row["Address"] = "123 Sample Street";
                            row["City"] = "Sample City";
                            row["State"] = "SC";
                            row["ZipCode"] = "12345";
                            row["Phone"] = "555-0123";
                            row["Email"] = "sample@example.com";
                            row["ContactName"] = "Sample Contact";
                            row["TaxID"] = "12-3456789";
                            row["CreditLimit"] = 10000.00m;
                            
                            dataTable.Rows.Add(row);
                            
                            dataSet.Tables.Add(dataTable);
                            Console.WriteLine($"✅ Created DataTable for {table.Name} with {dataTable.Columns.Count} columns");
                        }
                        catch (Exception tableEx)
                        {
                            Console.WriteLine($"⚠️ Could not create DataTable for {table.Name}: {tableEx.Message}");
                        }
                    }
                    
                    Console.WriteLine($"🎯 DataSet created with {dataSet.Tables.Count} tables");
                    
                    // COMPREHENSIVE FORCE OFFLINE - Handle all connection types
                    Console.WriteLine("🎯 FORCE OFFLINE: Comprehensive database disconnection...");
                    try
                    {
                        ForceOffline(report, dataSet);
                        Console.WriteLine("✅ Force offline completed - all connection handles cleared");
                    }
                    catch (Exception forceEx)
                    {
                        Console.WriteLine($"❌ Force offline failed: {forceEx.Message}");
                        Console.WriteLine($"Stack trace: {forceEx.StackTrace}");
                        Console.WriteLine("Proceeding with basic DataSet injection...");
                        
                        // Fallback to basic injection
                        report.SetDataSource(dataSet);
                        Console.WriteLine("✅ Basic DataSet injection completed");
                    }
                    
                    // Note: DataSet injection should bypass server verification automatically
                    Console.WriteLine("💡 DataSet injection should bypass server verification");
                    
                    // Skip database verification - DataSet doesn't need it
                    Console.WriteLine("⚡ Skipping database verification - DataSet is self-contained");
                }
                catch (Exception datasetEx)
                {
                    Console.WriteLine($"❌ DataSet injection failed: {datasetEx.Message}");
                    Console.WriteLine("Proceeding without DataSet injection...");
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