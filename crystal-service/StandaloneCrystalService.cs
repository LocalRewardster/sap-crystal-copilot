using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;

namespace CrystalReportsStandalone
{
    public class StandaloneCrystalService
    {
        public byte[] TestTemplateClone(string reportPath)
        {
            Console.WriteLine($"🔧 TEMPLATE CLONE: Processing {Path.GetFileName(reportPath)}");

            // Create temporary report clone
            var tempReportPath = CreateTemporaryReportClone(reportPath);
            
            try
            {
                var report = new ReportDocument();
                report.Load(tempReportPath, OpenReportMethod.OpenReportByTempCopy);
                
                // Create comprehensive dataset
                var dataSet = CreateComprehensiveDataSet();
                
                // Apply dataset
                report.SetDataSource(dataSet);
                
                // Set parameters
                SetReportParameters(report);
                
                // Export
                var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                var bytes = ((MemoryStream)stream).ToArray();
                
                report.Dispose();
                return bytes;
            }
            finally
            {
                if (File.Exists(tempReportPath))
                {
                    try { File.Delete(tempReportPath); } catch { }
                }
            }
        }

        public byte[] TestPushModel(string reportPath)
        {
            Console.WriteLine($"🔥 PUSH MODEL: Processing {Path.GetFileName(reportPath)}");
            
            var dataSet = CreateComprehensiveDataSet();
            
            var report = new ReportDocument();
            report.Load(reportPath, OpenReportMethod.OpenReportByTempCopy);
            
            // Set DataSource immediately
            report.SetDataSource(dataSet);
            
            // Set parameters
            SetReportParameters(report);
            
            // Export
            var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
            var bytes = ((MemoryStream)stream).ToArray();
            
            report.Dispose();
            return bytes;
        }

        public byte[] TestReportRebuilder(string reportPath)
        {
            Console.WriteLine($"🏗️ REPORT REBUILDER: Processing {Path.GetFileName(reportPath)}");
            
            var report = new ReportDocument();
            var dataSet = CreateComprehensiveDataSet();
            
            report.Load(reportPath, OpenReportMethod.OpenReportByTempCopy);
            
            // Immediate DataSource replacement
            report.SetDataSource(dataSet);
            
            // Eliminate database references
            EliminateAllDatabaseReferences(report);
            
            // Force DataSet usage
            ForceDataSetExclusiveUsage(report, dataSet);
            
            // Set parameters
            SetReportParameters(report);
            
            // Export
            var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
            var bytes = ((MemoryStream)stream).ToArray();
            
            report.Dispose();
            return bytes;
        }

        private string CreateTemporaryReportClone(string originalReportPath)
        {
            var tempPath = Path.GetTempFileName();
            var tempReportPath = Path.ChangeExtension(tempPath, ".rpt");
            
            try
            {
                File.Copy(originalReportPath, tempReportPath, true);
                
                var report = new ReportDocument();
                report.Load(tempReportPath);
                
                // Clear database connections
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
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"  ⚠️ Could not clear table {table.Name}: {ex.Message}");
                    }
                }
                
                report.SaveAs(tempReportPath);
                report.Close();
                report.Dispose();
                
                return tempReportPath;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to create report clone: {ex.Message}");
                return originalReportPath;
            }
        }

        private void EliminateAllDatabaseReferences(ReportDocument report)
        {
            try
            {
                foreach (Table table in report.Database.Tables)
                {
                    try
                    {
                        if (table.LogOnInfo != null && table.LogOnInfo.ConnectionInfo != null)
                        {
                            var connInfo = table.LogOnInfo.ConnectionInfo;
                            connInfo.ServerName = "";
                            connInfo.DatabaseName = "";
                            connInfo.UserID = "";
                            connInfo.Password = "";
                            connInfo.Type = ConnectionInfoType.Unknown;
                            
                            table.ApplyLogOnInfo(table.LogOnInfo);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"  ⚠️ Could not eliminate {table.Name}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Database elimination failed: {ex.Message}");
            }
        }

        private void ForceDataSetExclusiveUsage(ReportDocument report, DataSet dataSet)
        {
            try
            {
                report.SetDataSource(dataSet);
                
                foreach (Table table in report.Database.Tables)
                {
                    var tableName = table.Name;
                    if (dataSet.Tables.Contains(tableName))
                    {
                        try
                        {
                            table.SetDataSource(dataSet.Tables[tableName]);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"  ⚠️ Could not force DataSet on {tableName}: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Could not force exclusive DataSet usage: {ex.Message}");
            }
        }

        private void SetReportParameters(ReportDocument report)
        {
            try
            {
                foreach (ParameterFieldDefinition param in report.DataDefinition.ParameterFields)
                {
                    try
                    {
                        object value;
                        
                        if (param.Name.ToLower().Contains("invoice") && 
                            (param.ValueType == FieldValueType.NumberField || param.ValueType == FieldValueType.Int32sField))
                        {
                            value = 1001;
                        }
                        else
                        {
                            switch (param.ValueType)
                            {
                                case FieldValueType.NumberField:
                                case FieldValueType.Int32sField:
                                    value = 1001;
                                    break;
                                case FieldValueType.StringField:
                                    value = "PREVIEW_MODE";
                                    break;
                                case FieldValueType.CurrencyField:
                                    value = 100.00m;
                                    break;
                                case FieldValueType.BooleanField:
                                    value = true;
                                    break;
                                case FieldValueType.DateField:
                                    value = DateTime.Now.Date;
                                    break;
                                case FieldValueType.DateTimeField:
                                    value = DateTime.Now;
                                    break;
                                default:
                                    value = "PREVIEW";
                                    break;
                            }
                        }
                        
                        report.SetParameterValue(param.Name, value);
                        Console.WriteLine($"  ✅ Set {param.Name} = {value}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"  ⚠️ Could not set parameter {param.Name}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Parameter setting failed: {ex.Message}");
            }
        }

        private DataSet CreateComprehensiveDataSet()
        {
            var dataSet = new DataSet("TestData");
            
            // Primary tables with the critical fields
            var tableSchemas = new Dictionary<string, Dictionary<string, Type>>
            {
                ["Customer"] = new Dictionary<string, Type>
                {
                    ["CustomerID"] = typeof(int),
                    ["CustomerName"] = typeof(string),
                    ["CompanyName"] = typeof(string),
                    ["CashAccount"] = typeof(bool), // THE CRITICAL FIELD causing the error
                    ["Address"] = typeof(string),
                    ["City"] = typeof(string),
                    ["State"] = typeof(string),
                    ["ZipCode"] = typeof(string),
                    ["Phone"] = typeof(string),
                    ["Email"] = typeof(string),
                    ["ContactName"] = typeof(string),
                    ["CreditLimit"] = typeof(decimal),
                    ["Balance"] = typeof(decimal),
                    ["Active"] = typeof(bool)
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
                    ["Status"] = typeof(string)
                }
            };
            
            // Add all the other tables mentioned in the error
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
                        ["Active"] = typeof(bool)
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
                
                // Add sample data
                var row = table.NewRow();
                foreach (var column in schema.Value)
                {
                    if (column.Value == typeof(int))
                    {
                        row[column.Key] = column.Key.Contains("ID") ? 1001 : 1;
                    }
                    else if (column.Value == typeof(string))
                    {
                        row[column.Key] = $"Test {column.Key}";
                    }
                    else if (column.Value == typeof(decimal))
                    {
                        row[column.Key] = column.Key == "TotalAmount" ? 1500.00m : 100.00m;
                    }
                    else if (column.Value == typeof(DateTime))
                    {
                        row[column.Key] = DateTime.Now;
                    }
                    else if (column.Value == typeof(bool))
                    {
                        row[column.Key] = column.Key == "CashAccount" ? false : true;
                    }
                }
                
                table.Rows.Add(row);
                dataSet.Tables.Add(table);
                
                Console.WriteLine($"  📊 Created {schema.Key} with {schema.Value.Count} columns");
            }
            
            Console.WriteLine($"✅ Dataset created with {dataSet.Tables.Count} tables");
            return dataSet;
        }
    }
}