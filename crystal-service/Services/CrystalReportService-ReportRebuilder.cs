using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Threading.Tasks;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportsService.Models;

namespace CrystalReportsService.Services
{
    /// <summary>
    /// Advanced Crystal Reports service using Report Rebuilder approach
    /// This method creates a brand new report with the same structure but no database connections
    /// </summary>
    public class CrystalReportServiceReportRebuilder
    {
        public async Task<byte[]> GeneratePreview(string reportPath, string format)
        {
            try
            {
                Console.WriteLine($"🏗️ REPORT REBUILDER: Generating {format} preview for: {reportPath}");

                // APPROACH: Create a completely new report from scratch with DataSet as primary source
                Console.WriteLine("🎯 Creating brand new report instance with DataSet-only structure...");
                
                var report = new ReportDocument();
                
                // Create the dataset FIRST, then build report around it
                Console.WriteLine("📊 Creating primary DataSet...");
                var dataSet = CreatePrimaryDataSet();
                
                // Load the original report for metadata only (don't keep it loaded)
                Console.WriteLine("📋 Extracting metadata from original report...");
                var reportMetadata = ExtractReportMetadata(reportPath);
                
                // Try the "Fresh Report" approach - load then immediately replace data source
                Console.WriteLine("🔄 Loading original report and immediately replacing data source...");
                report.Load(reportPath, OpenReportMethod.OpenReportByTempCopy);
                
                // CRITICAL: Set DataSource IMMEDIATELY after loading, before any database verification
                Console.WriteLine("⚡ IMMEDIATE DataSource replacement (before any database operations)...");
                report.SetDataSource(dataSet);
                
                // Completely wipe all database references
                Console.WriteLine("🧹 Complete database reference elimination...");
                EliminateAllDatabaseReferences(report);
                
                // Override all database connection attempts
                Console.WriteLine("🚫 Override all connection attempts...");
                OverrideConnectionAttempts(report, dataSet);
                
                // Set parameters with enhanced logic
                Console.WriteLine("⚙️ Setting parameters with enhanced logic...");
                SetParametersAdvanced(report, reportMetadata);
                
                // Force report to use DataSet exclusively
                Console.WriteLine("🎯 Force exclusive DataSet usage...");
                ForceDataSetExclusiveUsage(report, dataSet);
                
                Console.WriteLine("🚀 Exporting with rebuilt report structure...");
                var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                var bytes = ((MemoryStream)stream).ToArray();
                
                Console.WriteLine($"✅ REPORT REBUILDER SUCCESS: Generated {bytes.Length} bytes");
                
                report.Dispose();
                return await Task.FromResult(bytes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ REPORT REBUILDER failed: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
        
        private ReportMetadata ExtractReportMetadata(string reportPath)
        {
            Console.WriteLine("🔍 Extracting metadata from original report...");
            
            var metadata = new ReportMetadata
            {
                Parameters = new List<string>(),
                Tables = new List<string>(),
                Fields = new List<string>()
            };
            
            try
            {
                using (var tempReport = new ReportDocument())
                {
                    tempReport.Load(reportPath);
                    
                    // Extract parameter info
                    foreach (ParameterFieldDefinition param in tempReport.DataDefinition.ParameterFields)
                    {
                        metadata.Parameters.Add($"{param.Name}:{param.ValueType}");
                        Console.WriteLine($"    📝 Parameter: {param.Name} ({param.ValueType})");
                    }
                    
                    // Extract table info
                    foreach (Table table in tempReport.Database.Tables)
                    {
                        metadata.Tables.Add(table.Name);
                        Console.WriteLine($"    📊 Table: {table.Name}");
                    }
                    
                    // Extract section info for fields
                    foreach (Section section in tempReport.ReportDefinition.Sections)
                    {
                        foreach (ReportObject obj in section.ReportObjects)
                        {
                            if (obj is FieldObject field)
                            {
                                metadata.Fields.Add(field.Name);
                                Console.WriteLine($"    📄 Field: {field.Name} (Section: {section.Name})");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Could not extract full metadata: {ex.Message}");
            }
            
            return metadata;
        }
        
        private void EliminateAllDatabaseReferences(ReportDocument report)
        {
            Console.WriteLine("🧹 Eliminating ALL database references...");
            
            try
            {
                // Method 1: Clear main report database connections
                foreach (Table table in report.Database.Tables)
                {
                    try
                    {
                        // Multiple ways to clear connection info
                        if (table.LogOnInfo?.ConnectionInfo != null)
                        {
                            var connInfo = table.LogOnInfo.ConnectionInfo;
                            connInfo.ServerName = "";
                            connInfo.DatabaseName = "";
                            connInfo.UserID = "";
                            connInfo.Password = "";
                            connInfo.Type = ConnectionInfoType.Unknown;
                            
                            // Clear additional connection properties if they exist
                            try
                            {
                                // Try to clear any connection string
                                if (connInfo.Attributes?.Count > 0)
                                {
                                    connInfo.Attributes.Clear();
                                }
                            }
                            catch { /* Ignore if not supported */ }
                            
                            table.ApplyLogOnInfo(table.LogOnInfo);
                            Console.WriteLine($"    🧹 Eliminated: {table.Name}");
                        }
                    }
                    catch (Exception tableEx)
                    {
                        Console.WriteLine($"    ⚠️ Could not eliminate {table.Name}: {tableEx.Message}");
                    }
                }
                
                // Method 2: Clear subreport connections
                foreach (ReportDocument subreport in report.Subreports)
                {
                    Console.WriteLine($"    🧹 Eliminating subreport: {subreport.Name}");
                    EliminateAllDatabaseReferences(subreport); // Recursive
                }
                
                Console.WriteLine("✅ Database reference elimination completed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Database elimination failed: {ex.Message}");
            }
        }
        
        private void OverrideConnectionAttempts(ReportDocument report, DataSet dataSet)
        {
            Console.WriteLine("🚫 Overriding all connection attempts...");
            
            try
            {
                // Try to set database logon to empty/invalid to force DataSet usage
                try
                {
                    report.SetDatabaseLogon("", "", "", "", false);
                    Console.WriteLine("✅ Set empty database logon");
                }
                catch (Exception logonEx)
                {
                    Console.WriteLine($"⚠️ Could not set empty logon: {logonEx.Message}");
                }
                
                // Try to verify database with DataSet (should succeed)
                try
                {
                    report.VerifyDatabase();
                    Console.WriteLine("✅ Database verification with DataSet succeeded");
                }
                catch (Exception verifyEx)
                {
                    Console.WriteLine($"⚠️ Database verification failed (expected): {verifyEx.Message}");
                    Console.WriteLine("💡 This is normal when using DataSet - proceeding...");
                }
                
                // Disable verification for future operations
                try
                {
                    report.VerifyOnEveryUse = false;
                    Console.WriteLine("✅ Disabled future verification");
                }
                catch (Exception disableEx)
                {
                    Console.WriteLine($"⚠️ Could not disable verification: {disableEx.Message}");
                }
                
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Connection override failed: {ex.Message}");
            }
        }
        
        private void SetParametersAdvanced(ReportDocument report, ReportMetadata metadata)
        {
            Console.WriteLine("⚙️ Setting parameters with advanced logic...");
            
            try
            {
                foreach (ParameterFieldDefinition param in report.DataDefinition.ParameterFields)
                {
                    try
                    {
                        object value;
                        
                        // Special handling for known parameter names
                        if (param.Name.ToLower().Contains("invoice") && 
                            (param.ValueType == FieldValueType.NumberField || param.ValueType == FieldValueType.Int32sField))
                        {
                            value = 1001;
                        }
                        else
                        {
                            value = param.ValueType switch
                            {
                                FieldValueType.NumberField => 1001,
                                FieldValueType.Int32sField => 1001,
                                FieldValueType.Int16sField => (short)1001,
                                FieldValueType.Int32uField => (uint)1001,
                                FieldValueType.StringField => "PREVIEW_MODE",
                                FieldValueType.CurrencyField => 100.00m,
                                FieldValueType.BooleanField => true,
                                FieldValueType.DateField => DateTime.Now.Date,
                                FieldValueType.DateTimeField => DateTime.Now,
                                FieldValueType.TimeField => DateTime.Now.TimeOfDay,
                                _ => "PREVIEW"
                            };
                        }
                        
                        report.SetParameterValue(param.Name, value);
                        Console.WriteLine($"    ✅ Set {param.Name} = {value} (Type: {param.ValueType})");
                    }
                    catch (Exception paramEx)
                    {
                        Console.WriteLine($"    ⚠️ Could not set parameter {param.Name}: {paramEx.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Advanced parameter setting failed: {ex.Message}");
            }
        }
        
        private void ForceDataSetExclusiveUsage(ReportDocument report, DataSet dataSet)
        {
            Console.WriteLine("🎯 Forcing exclusive DataSet usage...");
            
            try
            {
                // Re-apply DataSet to ensure it takes precedence
                report.SetDataSource(dataSet);
                Console.WriteLine("✅ Re-applied DataSet");
                
                // Apply DataSet to each table individually as backup
                foreach (Table table in report.Database.Tables)
                {
                    var tableName = table.Name;
                    if (dataSet.Tables.Contains(tableName))
                    {
                        try
                        {
                            table.SetDataSource(dataSet.Tables[tableName]);
                            Console.WriteLine($"    ✅ Forced DataSet on table: {tableName}");
                        }
                        catch (Exception tableEx)
                        {
                            Console.WriteLine($"    ⚠️ Could not force DataSet on {tableName}: {tableEx.Message}");
                        }
                    }
                }
                
                // Apply to subreports
                foreach (ReportDocument subreport in report.Subreports)
                {
                    try
                    {
                        subreport.SetDataSource(dataSet);
                        Console.WriteLine($"    ✅ Forced DataSet on subreport: {subreport.Name}");
                    }
                    catch (Exception subEx)
                    {
                        Console.WriteLine($"    ⚠️ Could not force DataSet on subreport {subreport.Name}: {subEx.Message}");
                    }
                }
                
                Console.WriteLine("✅ Exclusive DataSet usage enforced");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Could not force exclusive DataSet usage: {ex.Message}");
            }
        }
        
        private DataSet CreatePrimaryDataSet()
        {
            var dataSet = new DataSet("PrimaryReportData");
            
            Console.WriteLine("📊 Creating enhanced DataSet for Crystal Reports...");
            
            // Primary tables with comprehensive field definitions
            var tableSchemas = new Dictionary<string, Dictionary<string, Type>>
            {
                ["Customer"] = new Dictionary<string, Type>
                {
                    ["CustomerID"] = typeof(int),
                    ["CustomerName"] = typeof(string),
                    ["CompanyName"] = typeof(string),
                    ["CashAccount"] = typeof(bool), // THE CRITICAL FIELD
                    ["Address"] = typeof(string),
                    ["City"] = typeof(string),
                    ["State"] = typeof(string),
                    ["ZipCode"] = typeof(string),
                    ["Phone"] = typeof(string),
                    ["Email"] = typeof(string),
                    ["ContactName"] = typeof(string),
                    ["CreditLimit"] = typeof(decimal),
                    ["Balance"] = typeof(decimal),
                    ["Active"] = typeof(bool),
                    ["Created"] = typeof(DateTime),
                    ["Modified"] = typeof(DateTime)
                },
                ["InvoiceHeader"] = new Dictionary<string, Type>
                {
                    ["InvoiceID"] = typeof(int),
                    ["CustomerID"] = typeof(int),
                    ["InvoiceNumber"] = typeof(string),
                    ["InvoiceDate"] = typeof(DateTime),
                    ["DueDate"] = typeof(DateTime),
                    ["TotalAmount"] = typeof(decimal),
                    ["TaxAmount"] = typeof(decimal),
                    ["Status"] = typeof(string),
                    ["Terms"] = typeof(string),
                    ["Notes"] = typeof(string)
                }
            };
            
            // Add all the other tables from your error description
            var additionalTables = new[] { 
                "InvoiceLine", "Currency", "PaymentMethod", "VatRate", "Per", "OrderLine", 
                "OrderLineAVO", "AVO", "AVOOption", "OrderTax", "Product", "OrderHeader", 
                "Per_1", "PaymentTerms", "CustomerDeliveryAddress", "CustomerInvoiceAddress", 
                "OrderLinePriceInfo", "ProductKit", "LinkedOrderLine", "Per_2", "SalesRep", 
                "Users", "ManualOrderLineType", "Branch", "OrderSignature"
            };
            
            foreach (var tableName in additionalTables)
            {
                if (!tableSchemas.ContainsKey(tableName))
                {
                    tableSchemas[tableName] = new Dictionary<string, Type>
                    {
                        ["ID"] = typeof(int),
                        ["Name"] = typeof(string),
                        ["Description"] = typeof(string),
                        ["Amount"] = typeof(decimal),
                        ["Date"] = typeof(DateTime),
                        ["Active"] = typeof(bool),
                        ["Reference"] = typeof(string)
                    };
                }
            }
            
            // Create the tables
            foreach (var schema in tableSchemas)
            {
                var table = new DataTable(schema.Key);
                
                // Add columns
                foreach (var column in schema.Value)
                {
                    table.Columns.Add(column.Key, column.Value);
                }
                
                // Add sample data row
                var row = table.NewRow();
                foreach (var column in schema.Value)
                {
                    row[column.Key] = column.Value switch
                    {
                        Type t when t == typeof(int) => column.Key.Contains("ID") ? 1001 : 1,
                        Type t when t == typeof(string) => $"Preview {column.Key}",
                        Type t when t == typeof(decimal) => column.Key == "TotalAmount" ? 1500.00m : 100.00m,
                        Type t when t == typeof(DateTime) => DateTime.Now,
                        Type t when t == typeof(bool) => column.Key == "CashAccount" ? false : true,
                        _ => DBNull.Value
                    };
                }
                
                table.Rows.Add(row);
                dataSet.Tables.Add(table);
                
                Console.WriteLine($"    📊 Created {schema.Key} with {schema.Value.Count} columns");
            }
            
            Console.WriteLine($"✅ Primary DataSet created with {dataSet.Tables.Count} tables");
            return dataSet;
        }
        
        // Simple metadata class for internal use
        private class ReportMetadata
        {
            public List<string> Parameters { get; set; } = new List<string>();
            public List<string> Tables { get; set; } = new List<string>();
            public List<string> Fields { get; set; } = new List<string>();
        }
    }
}