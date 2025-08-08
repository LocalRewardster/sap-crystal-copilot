using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
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
                        
                        // REORDER: Clear connection info FIRST, then set DataSource
                        // Triple-sure connection clearing
                        t.LogOnInfo.ConnectionInfo.ServerName = "";
                        t.LogOnInfo.ConnectionInfo.DatabaseName = "";
                        t.LogOnInfo.ConnectionInfo.UserID = "";
                        t.LogOnInfo.ConnectionInfo.Password = "";
                        t.ApplyLogOnInfo(t.LogOnInfo);
                        Console.WriteLine($"    ✅ Cleared connection info for {alias}");
                        
                        if (ds.Tables.Contains(alias))
                        {
                            t.SetDataSource(ds.Tables[alias]);
                            Console.WriteLine($"    ✅ SetDataSource for {alias}");
                            
                            // Skip table.Location setting - it triggers database connections
                            // DataSource should be sufficient for field resolution
                            Console.WriteLine($"    💡 Skipping table.Location to avoid database connection triggers");
                        }
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

            // 3. Command tables (limited support without RAS API)
            Console.WriteLine("3️⃣ Processing command tables...");
            Console.WriteLine("  ⚠️ RAS API not available - skipping command table processing");

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
                        Console.WriteLine($"    ✅ Set source table DataSource: {link.SourceTable.Name}");
                    }
                    if (ds.Tables.Contains(link.DestinationTable.Name))
                    {
                        link.DestinationTable.SetDataSource(ds.Tables[link.DestinationTable.Name]);
                        Console.WriteLine($"    ✅ Set destination table DataSource: {link.DestinationTable.Name}");
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
            Console.WriteLine("  ⚠️ VerifyOnEveryPrint property not available in this SDK version");
            Console.WriteLine("  💡 Relying on cleared connection info to prevent verification");

            // 6. Handle report parameters - CORRECT SDK APPROACH
            Console.WriteLine("6️⃣ Processing report parameters...");
            try
            {
                // Use DataDefinition.ParameterFields to get parameter definitions with ValueType
                if (rpt.DataDefinition.ParameterFields.Count > 0)
                {
                    Console.WriteLine($"  Found {rpt.DataDefinition.ParameterFields.Count} parameters in DataDefinition");
                    foreach (ParameterFieldDefinition paramDef in rpt.DataDefinition.ParameterFields)
                    {
                        try
                        {
                            Console.WriteLine($"    Processing parameter: {paramDef.Name} (Type: {paramDef.ValueType})");
                            
                            // Set appropriate default value based on parameter type
                            object defaultValue = GetDefaultValueForParameterType(paramDef.ValueType);
                            
                            // Use the correct SDK method: SetParameterValue
                            rpt.SetParameterValue(paramDef.Name, defaultValue);
                            Console.WriteLine($"      ✅ Set parameter '{paramDef.Name}' = {defaultValue} (Type: {paramDef.ValueType})");
                        }
                        catch (Exception paramEx)
                        {
                            Console.WriteLine($"      ⚠️ Could not set parameter {paramDef.Name}: {paramEx.Message}");
                        }
                    }
                }
                else
                {
                    Console.WriteLine("  No parameters found in DataDefinition");
                }
            }
            catch (Exception paramEx)
            {
                Console.WriteLine($"⚠️ Parameter processing failed: {paramEx.Message}");
            }
            
            Console.WriteLine("🎯 Force offline procedure completed!");
        }

        private object GetDefaultValueForParameterType(FieldValueType valueType)
        {
            switch (valueType)
            {
                case FieldValueType.StringField:
                    return "PREVIEW_INVOICE_001";
                case FieldValueType.NumberField:
                    return 1001;
                case FieldValueType.CurrencyField:
                    return 100.00m;
                case FieldValueType.BooleanField:
                    return true;
                case FieldValueType.DateField:
                    return DateTime.Now.Date;
                case FieldValueType.TimeField:
                    return DateTime.Now.TimeOfDay;
                case FieldValueType.DateTimeField:
                    return DateTime.Now;
                case FieldValueType.Int8sField:
                case FieldValueType.Int8uField:
                case FieldValueType.Int16sField:
                case FieldValueType.Int16uField:
                case FieldValueType.Int32sField:
                case FieldValueType.Int32uField:
                    return 1001;
                default:
                    Console.WriteLine($"      ⚠️ Unknown parameter type {valueType}, using string default");
                    return "PREVIEW_VALUE";
            }
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
                            Console.WriteLine($"  Table Location: {table.Location}");
                            try
                            {
                                if (table.LogOnInfo != null)
                                {
                                    Console.WriteLine($"  Table has LogOnInfo (ConnectionInfo available)");
                                }
                                else
                                {
                                    Console.WriteLine($"  Table LogOnInfo: null");
                                }
                            }
                            catch
                            {
                                Console.WriteLine($"  Table LogOnInfo: not accessible");
                            }
                            
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
                            // Based on the error: {Customer.CashAccount}
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
                            
                            // Add more fields that might be referenced in formulas
                            dataTable.Columns.Add("CustomerID", typeof(int));
                            dataTable.Columns.Add("CustomerName", typeof(string));
                            dataTable.Columns.Add("CompanyName", typeof(string));
                            dataTable.Columns.Add("AccountNumber", typeof(string));
                            dataTable.Columns.Add("Balance", typeof(decimal));
                            dataTable.Columns.Add("Terms", typeof(string));
                            dataTable.Columns.Add("SalesRep", typeof(string));
                            dataTable.Columns.Add("Territory", typeof(string));
                            dataTable.Columns.Add("Active", typeof(bool));
                            dataTable.Columns.Add("Created", typeof(DateTime));
                            
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
                            
                            // Set values for additional fields
                            row["CustomerID"] = 1001;
                            row["CustomerName"] = "Sample Customer";
                            row["CompanyName"] = "Sample Company Inc.";
                            row["AccountNumber"] = "ACCT-001";
                            row["Balance"] = 0.00m;
                            row["Terms"] = "NET30";
                            row["SalesRep"] = "Sample Rep";
                            row["Territory"] = "North";
                            row["Active"] = true;
                            row["Created"] = DateTime.Now;
                            
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
                    
                    // Debug: Show what's in our DataSet
                    Console.WriteLine("🔍 DATASET DEBUG INFO:");
                    foreach (DataTable dt in dataSet.Tables)
                    {
                        Console.WriteLine($"  Table: {dt.TableName} ({dt.Columns.Count} columns, {dt.Rows.Count} rows)");
                        
                        // Build column names list without LINQ
                        var columnNames = new List<string>();
                        foreach (DataColumn column in dt.Columns)
                        {
                            columnNames.Add(column.ColumnName);
                        }
                        Console.WriteLine($"    Columns: {string.Join(", ", columnNames)}");
                    }
                    
                    // ALTERNATIVE APPROACH: Use report.SetDataSource() and disable verification
                    Console.WriteLine("🎯 ALTERNATIVE: Using report-level DataSet injection...");
                    try
                    {
                        // Set the entire DataSet as the report's data source
                        report.SetDataSource(dataSet);
                        Console.WriteLine("✅ Report-level DataSet injection completed");
                        
                        // Try to disable database refresh/verification
                        try
                        {
                            report.VerifyDatabase();
                            Console.WriteLine("✅ Database verification completed with DataSet");
                        }
                        catch (Exception verifyEx)
                        {
                            Console.WriteLine($"⚠️ Database verification failed (expected with DataSet): {verifyEx.Message}");
                            Console.WriteLine("💡 Proceeding without verification - DataSet should work");
                        }
                    }
                    catch (Exception dsEx)
                    {
                        Console.WriteLine($"❌ DataSet injection failed: {dsEx.Message}");
                        Console.WriteLine("🔄 Trying comprehensive force offline approach...");
                        
                        // Fallback to force offline
                        ForceOffline(report, dataSet);
                        Console.WriteLine("✅ Force offline fallback completed");
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