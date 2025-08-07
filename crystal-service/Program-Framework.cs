using System;
using System.IO;
using CrystalReportsService.Services;
using CrystalReportsService.Models;

namespace CrystalReportsService
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("🚀 Crystal Reports Service (.NET Framework 4.8)");
            Console.WriteLine("===============================================");
            
            var service = new CrystalReportServiceFramework();
            
            // Health check
            Console.WriteLine("\n🔍 Performing health check...");
            if (service.HealthCheck())
            {
                Console.WriteLine("✅ Crystal Reports SDK is working!");
            }
            else
            {
                Console.WriteLine("❌ Crystal Reports SDK not available");
                return;
            }
            
            // Test with a sample report if provided
            if (args.Length > 0 && File.Exists(args[0]))
            {
                var reportPath = args[0];
                Console.WriteLine($"\n📊 Testing with report: {reportPath}");
                
                try
                {
                    // Test metadata extraction
                    Console.WriteLine("\n🔍 Extracting metadata...");
                    var metadata = service.ExtractMetadata(reportPath);
                    Console.WriteLine($"Report Name: {metadata.Name}");
                    Console.WriteLine($"Fields Count: {metadata.Fields.Count}");
                    Console.WriteLine($"Tables Count: {metadata.Tables.Count}");
                    Console.WriteLine($"Parameters Count: {metadata.Parameters.Count}");
                    Console.WriteLine($"Sections Count: {metadata.Sections.Count}");
                    
                    // Test preview generation
                    Console.WriteLine("\n📄 Generating PDF preview...");
                    var preview = service.GeneratePreview(reportPath, "PDF");
                    Console.WriteLine($"Generated PDF: {preview.Length} bytes");
                    
                    // Save preview to file
                    var previewPath = Path.ChangeExtension(reportPath, ".preview.pdf");
                    File.WriteAllBytes(previewPath, preview);
                    Console.WriteLine($"Preview saved to: {previewPath}");
                    
                    Console.WriteLine("\n✅ All tests passed!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"\n❌ Test failed: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                }
            }
            else
            {
                Console.WriteLine("\n💡 Usage: CrystalReportsService.exe <path-to-report.rpt>");
                Console.WriteLine("   This will test the service with your Crystal Report file.");
            }
            
            Console.WriteLine("\n🎉 Crystal Reports Service is ready!");
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}