using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportsService.Models;

namespace CrystalReportsService.Services
{
    public class CrystalReportServicePushModel
    {
        public async Task<byte[]> GeneratePreview(string reportPath, string format)
        {
            try
            {
                Console.WriteLine($"🔥 PUSH MODEL: Generating {format} preview for: {reportPath}");

                // APPROACH: Create report with ONLY DataSet data - no database connections
                Console.WriteLine("📊 Creating DataSet with sample data...");
                var dataSet = CreateComprehensiveDataSet();
                
                Console.WriteLine("📋 Loading report template...");
                var report = new ReportDocument();
                report.Load(reportPath, OpenReportMethod.OpenReportByTempCopy);
                
                Console.WriteLine("🎯 Setting DataSet as data source (PUSH MODEL)...");
                report.SetDataSource(dataSet);
                
                Console.WriteLine("⚙️ Setting parameters...");
                try
                {
                    // Set parameter for Invoice ID
                    foreach (ParameterFieldDefinition param in report.DataDefinition.ParameterFields)
                    {
                        Console.WriteLine($"Setting parameter: {param.Name} (Type: {param.ValueType})");
                        if (param.Name == "Invoice ID")
                        {
                            report.SetParameterValue(param.Name, 1001);
                            Console.WriteLine($"✅ Set {param.Name} = 1001");
                        }
                    }
                }
                catch (Exception paramEx)
                {
                    Console.WriteLine($"⚠️ Parameter setting failed: {paramEx.Message}");
                }
                
                Console.WriteLine("🚀 Exporting with PUSH MODEL (no database connections)...");
                
                // Export to stream - this should work with DataSet only
                var stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
                var bytes = ((MemoryStream)stream).ToArray();
                
                Console.WriteLine($"✅ PUSH MODEL SUCCESS: Generated {bytes.Length} bytes");
                
                report.Dispose();
                return bytes;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ PUSH MODEL failed: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
        
        private DataSet CreateComprehensiveDataSet()
        {
            var dataSet = new DataSet();
            
            // Create all the tables that the report expects
            var tableNames = new[] { 
                "Customer", "InvoiceHeader", "InvoiceLine", "Currency", "PaymentMethod", 
                "VatRate", "Per", "OrderLine", "OrderLineAVO", "AVO", "AVOOption", 
                "OrderTax", "Product", "OrderHeader", "Per_1", "PaymentTerms", 
                "CustomerDeliveryAddress", "CustomerInvoiceAddress", "OrderLinePriceInfo", 
                "ProductKit", "LinkedOrderLine", "Per_2", "SalesRep", "Users", 
                "ManualOrderLineType", "Branch", "OrderSignature"
            };
            
            foreach (var tableName in tableNames)
            {
                var table = new DataTable(tableName);
                
                // Add comprehensive columns
                table.Columns.Add("ID", typeof(int));
                table.Columns.Add("Name", typeof(string));
                table.Columns.Add("Description", typeof(string));
                table.Columns.Add("Amount", typeof(decimal));
                table.Columns.Add("Date", typeof(DateTime));
                table.Columns.Add("Code", typeof(string));
                table.Columns.Add("Status", typeof(string));
                table.Columns.Add("Type", typeof(string));
                table.Columns.Add("Value", typeof(string));
                table.Columns.Add("Reference", typeof(string));
                
                // CRITICAL: Add the CashAccount field that the formula needs
                table.Columns.Add("CashAccount", typeof(bool));
                table.Columns.Add("Address", typeof(string));
                table.Columns.Add("City", typeof(string));
                table.Columns.Add("State", typeof(string));
                table.Columns.Add("ZipCode", typeof(string));
                table.Columns.Add("Phone", typeof(string));
                table.Columns.Add("Email", typeof(string));
                table.Columns.Add("ContactName", typeof(string));
                table.Columns.Add("TaxID", typeof(string));
                table.Columns.Add("CreditLimit", typeof(decimal));
                table.Columns.Add("CustomerID", typeof(int));
                table.Columns.Add("CustomerName", typeof(string));
                table.Columns.Add("CompanyName", typeof(string));
                table.Columns.Add("AccountNumber", typeof(string));
                table.Columns.Add("Balance", typeof(decimal));
                table.Columns.Add("Terms", typeof(string));
                table.Columns.Add("SalesRep", typeof(string));
                table.Columns.Add("Territory", typeof(string));
                table.Columns.Add("Active", typeof(bool));
                table.Columns.Add("Created", typeof(DateTime));
                
                // Add sample row
                var row = table.NewRow();
                row["ID"] = 1001;
                row["Name"] = $"Sample {tableName}";
                row["Description"] = "Preview Data";
                row["Amount"] = 100.00m;
                row["Date"] = DateTime.Now;
                row["Code"] = "PREV";
                row["Status"] = "Active";
                row["Type"] = "Preview";
                row["Value"] = "Sample";
                row["Reference"] = "REF001";
                row["CashAccount"] = false; // CRITICAL for {Customer.CashAccount} formula
                row["Address"] = "123 Preview St";
                row["City"] = "Preview City";
                row["State"] = "PC";
                row["ZipCode"] = "12345";
                row["Phone"] = "555-0123";
                row["Email"] = "preview@example.com";
                row["ContactName"] = "Preview Contact";
                row["TaxID"] = "TAX-001";
                row["CreditLimit"] = 10000.00m;
                row["CustomerID"] = 1001;
                row["CustomerName"] = "Preview Customer";
                row["CompanyName"] = "Preview Company";
                row["AccountNumber"] = "ACC-001";
                row["Balance"] = 0.00m;
                row["Terms"] = "NET30";
                row["SalesRep"] = "Preview Rep";
                row["Territory"] = "North";
                row["Active"] = true;
                row["Created"] = DateTime.Now;
                
                table.Rows.Add(row);
                dataSet.Tables.Add(table);
                
                Console.WriteLine($"📊 Created table: {tableName} ({table.Columns.Count} columns, 1 row)");
            }
            
            Console.WriteLine($"✅ DataSet created with {dataSet.Tables.Count} tables");
            return dataSet;
        }
    }
}