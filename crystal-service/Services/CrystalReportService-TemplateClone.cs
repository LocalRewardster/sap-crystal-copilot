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
    /// Advanced Crystal Reports service using Template Cloning approach
    /// This method creates a new report instance with minimal database references
    /// </summary>
    public class CrystalReportServiceTemplateClone
    {
        public async Task<byte[]> GeneratePreview(string reportPath, string format)
        {
            try
            {
                Console.WriteLine($"🔧 TEMPLATE CLONE: Generating {format} preview for: {reportPath}");

                // APPROACH: Create a temporary clone with database references stripped out
                Console.WriteLine("📋 Creating temporary report clone...");
                var tempReportPath = CreateTemporaryReportClone(reportPath);
                
                try
                {
                    var report = new ReportDocument();
                    
                    // Load the cleaned temporary report
                    Console.WriteLine("📂 Loading cleaned report template...");
                    report.Load(tempReportPath, OpenReportMethod.OpenReportByTempCopy);
                    
                    // Create comprehensive dataset
                    Console.WriteLine("📊 Creating comprehensive dataset...");
                    var dataSet = CreateComprehensiveDataSet();
                    
                    // Apply the dataset using multiple methods
                    Console.WriteLine("🎯 Applying dataset using multiple binding methods...");
                    ApplyDataSetMultipleWays(report, dataSet);
                    
                    // Set parameters
                    Console.WriteLine("⚙️ Setting report parameters...");
                    SetReportParameters(report);
                    
                    // Disable all possible verification
                    Console.WriteLine("🚫 Disabling all verification and refresh operations...");
                    DisableAllVerification(report);
                    
                    Console.WriteLine("🚀 Exporting with zero database dependencies...");
                    var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                    var bytes = ((MemoryStream)stream).ToArray();
                    
                    Console.WriteLine($"✅ TEMPLATE CLONE SUCCESS: Generated {bytes.Length} bytes");
                    
                    report.Dispose();
                    return await Task.FromResult(bytes);
                }
                finally
                {
                    // Clean up temporary file
                    if (File.Exists(tempReportPath))
                    {
                        try
                        {
                            File.Delete(tempReportPath);
                            Console.WriteLine("🧹 Cleaned up temporary report file");
                        }
                        catch (Exception cleanupEx)
                        {
                            Console.WriteLine($"⚠️ Could not delete temp file: {cleanupEx.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ TEMPLATE CLONE failed: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
        
        private string CreateTemporaryReportClone(string originalReportPath)
        {
            Console.WriteLine("🔧 Creating database-stripped report clone...");
            
            // Create temporary file path
            var tempPath = Path.GetTempFileName();
            var tempReportPath = Path.ChangeExtension(tempPath, ".rpt");
            
            try
            {
                // Copy the original file
                File.Copy(originalReportPath, tempReportPath, true);
                Console.WriteLine($"📄 Created temporary report: {tempReportPath}");
                
                // Load and modify the temporary report to remove database dependencies
                var report = new ReportDocument();
                report.Load(tempReportPath);
                
                Console.WriteLine("🔧 Stripping database connections from temporary report...");
                
                // Method 1: Clear all database logon info
                foreach (Table table in report.Database.Tables)
                {
                    try
                    {
                        if (table.LogOnInfo != null)
                        {
                            table.LogOnInfo.ConnectionInfo.ServerName = "";
                            table.LogOnInfo.ConnectionInfo.DatabaseName = "";
                            table.LogOnInfo.ConnectionInfo.UserID = "";
                            table.LogOnInfo.ConnectionInfo.Password = "";
                            table.LogOnInfo.ConnectionInfo.Type = ConnectionInfoType.Unknown;
                            table.ApplyLogOnInfo(table.LogOnInfo);
                            Console.WriteLine($"    🧹 Cleared connection: {table.Name}");
                        }
                    }
                    catch (Exception tableEx)
                    {
                        Console.WriteLine($"    ⚠️ Could not clear table {table.Name}: {tableEx.Message}");
                    }
                }
                
                // Method 2: Clear subreport connections
                foreach (ReportDocument subreport in report.Subreports)
                {
                    foreach (Table table in subreport.Database.Tables)
                    {
                        try
                        {
                            if (table.LogOnInfo != null)
                            {
                                table.LogOnInfo.ConnectionInfo.ServerName = "";
                                table.LogOnInfo.ConnectionInfo.DatabaseName = "";
                                table.LogOnInfo.ConnectionInfo.UserID = "";
                                table.LogOnInfo.ConnectionInfo.Password = "";
                                table.LogOnInfo.ConnectionInfo.Type = ConnectionInfoType.Unknown;
                                table.ApplyLogOnInfo(table.LogOnInfo);
                                Console.WriteLine($"    🧹 Cleared subreport connection: {table.Name}");
                            }
                        }
                        catch (Exception tableEx)
                        {
                            Console.WriteLine($"    ⚠️ Could not clear subreport table {table.Name}: {tableEx.Message}");
                        }
                    }
                }
                
                // Save the modified report
                report.SaveAs(tempReportPath);
                report.Close();
                report.Dispose();
                
                Console.WriteLine("✅ Database-stripped report saved successfully");
                return tempReportPath;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to create report clone: {ex.Message}");
                // If cloning fails, return original path as fallback
                return originalReportPath;
            }
        }
        
        private void ApplyDataSetMultipleWays(ReportDocument report, DataSet dataSet)
        {
            Console.WriteLine("🎯 Applying dataset using multiple binding strategies...");
            
            // Strategy 1: Report-level DataSet binding
            try
            {
                report.SetDataSource(dataSet);
                Console.WriteLine("✅ Strategy 1: Report-level DataSet binding successful");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Strategy 1 failed: {ex.Message}");
            }
            
            // Strategy 2: Table-level binding
            try
            {
                foreach (Table table in report.Database.Tables)
                {
                    var tableName = table.Name;
                    if (dataSet.Tables.Contains(tableName))
                    {
                        table.SetDataSource(dataSet.Tables[tableName]);
                        Console.WriteLine($"✅ Strategy 2: Bound table {tableName}");
                    }
                }
                Console.WriteLine("✅ Strategy 2: Table-level binding completed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Strategy 2 failed: {ex.Message}");
            }
            
            // Strategy 3: Subreport binding
            try
            {
                foreach (ReportDocument subreport in report.Subreports)
                {
                    subreport.SetDataSource(dataSet);
                    Console.WriteLine($"✅ Strategy 3: Bound subreport {subreport.Name}");
                }
                Console.WriteLine("✅ Strategy 3: Subreport binding completed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Strategy 3 failed: {ex.Message}");
            }
        }
        
        private void SetReportParameters(ReportDocument report)
        {
            try
            {
                foreach (ParameterFieldDefinition param in report.DataDefinition.ParameterFields)
                {
                    Console.WriteLine($"Setting parameter: {param.Name} (Type: {param.ValueType})");
                    
                    object value = param.ValueType switch
                    {
                        FieldValueType.NumberField => 1001,
                        FieldValueType.StringField => "PREVIEW_MODE",
                        FieldValueType.CurrencyField => 100.00m,
                        FieldValueType.BooleanField => true,
                        FieldValueType.DateField => DateTime.Now.Date,
                        FieldValueType.DateTimeField => DateTime.Now,
                        _ => "PREVIEW"
                    };
                    
                    if (param.Name.Contains("Invoice") && param.ValueType == FieldValueType.NumberField)
                    {
                        value = 1001;
                    }
                    
                    report.SetParameterValue(param.Name, value);
                    Console.WriteLine($"✅ Set {param.Name} = {value}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Parameter setting failed: {ex.Message}");
            }
        }
        
        private void DisableAllVerification(ReportDocument report)
        {
            try
            {
                // Disable verification on the main report
                report.VerifyOnEveryUse = false;
                
                // Disable for subreports
                foreach (ReportDocument subreport in report.Subreports)
                {
                    subreport.VerifyOnEveryUse = false;
                }
                
                Console.WriteLine("✅ All verification disabled");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Could not disable verification: {ex.Message}");
            }
        }
        
        private DataSet CreateComprehensiveDataSet()
        {
            var dataSet = new DataSet("PreviewData");
            
            // Create tables based on common Crystal Reports patterns
            var tableDefinitions = new Dictionary<string, List<(string Name, Type Type)>>
            {
                ["Customer"] = new List<(string, Type)>
                {
                    ("CustomerID", typeof(int)),
                    ("CustomerName", typeof(string)),
                    ("CompanyName", typeof(string)),
                    ("CashAccount", typeof(bool)), // CRITICAL: The field causing the error
                    ("Address", typeof(string)),
                    ("City", typeof(string)),
                    ("State", typeof(string)),
                    ("ZipCode", typeof(string)),
                    ("Phone", typeof(string)),
                    ("Email", typeof(string)),
                    ("ContactName", typeof(string)),
                    ("CreditLimit", typeof(decimal)),
                    ("Balance", typeof(decimal)),
                    ("Active", typeof(bool))
                },
                ["InvoiceHeader"] = new List<(string, Type)>
                {
                    ("InvoiceID", typeof(int)),
                    ("CustomerID", typeof(int)),
                    ("InvoiceDate", typeof(DateTime)),
                    ("DueDate", typeof(DateTime)),
                    ("InvoiceNumber", typeof(string)),
                    ("TotalAmount", typeof(decimal)),
                    ("Status", typeof(string)),
                    ("Terms", typeof(string))
                },
                ["InvoiceLine"] = new List<(string, Type)>
                {
                    ("LineID", typeof(int)),
                    ("InvoiceID", typeof(int)),
                    ("ProductID", typeof(int)),
                    ("Description", typeof(string)),
                    ("Quantity", typeof(decimal)),
                    ("UnitPrice", typeof(decimal)),
                    ("LineTotal", typeof(decimal))
                }
            };
            
            // Add all the other tables mentioned in your problem description
            var additionalTables = new[] { 
                "Currency", "PaymentMethod", "VatRate", "Per", "OrderLine", "OrderLineAVO", 
                "AVO", "AVOOption", "OrderTax", "Product", "OrderHeader", "Per_1", 
                "PaymentTerms", "CustomerDeliveryAddress", "CustomerInvoiceAddress", 
                "OrderLinePriceInfo", "ProductKit", "LinkedOrderLine", "Per_2", 
                "SalesRep", "Users", "ManualOrderLineType", "Branch", "OrderSignature"
            };
            
            foreach (var tableName in additionalTables)
            {
                if (!tableDefinitions.ContainsKey(tableName))
                {
                    tableDefinitions[tableName] = new List<(string, Type)>
                    {
                        ("ID", typeof(int)),
                        ("Name", typeof(string)),
                        ("Description", typeof(string)),
                        ("Amount", typeof(decimal)),
                        ("Date", typeof(DateTime)),
                        ("Active", typeof(bool))
                    };
                }
            }
            
            // Create DataTables
            foreach (var tableDef in tableDefinitions)
            {
                var table = new DataTable(tableDef.Key);
                
                // Add columns
                foreach (var (name, type) in tableDef.Value)
                {
                    table.Columns.Add(name, type);
                }
                
                // Add sample row
                var row = table.NewRow();
                foreach (var (name, type) in tableDef.Value)
                {
                    row[name] = type switch
                    {
                        Type t when t == typeof(int) => name.Contains("ID") ? 1001 : 1,
                        Type t when t == typeof(string) => $"Preview {name}",
                        Type t when t == typeof(decimal) => 100.00m,
                        Type t when t == typeof(DateTime) => DateTime.Now,
                        Type t when t == typeof(bool) => name == "CashAccount" ? false : true,
                        _ => DBNull.Value
                    };
                }
                
                table.Rows.Add(row);
                dataSet.Tables.Add(table);
                
                Console.WriteLine($"📊 Created table: {tableDef.Key} ({tableDef.Value.Count} columns)");
            }
            
            Console.WriteLine($"✅ Comprehensive DataSet created with {dataSet.Tables.Count} tables");
            return dataSet;
        }
    }
}