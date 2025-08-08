using System;
using System.IO;

namespace CrystalReportsStandalone
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("🚀 Crystal Reports Standalone Test");
            Console.WriteLine("Testing database-free PDF generation approaches");
            Console.WriteLine();

            // Get report path from user
            string reportPath;
            if (args.Length > 0)
            {
                reportPath = args[0];
            }
            else
            {
                Console.Write("Enter path to SampleInvoice (1).rpt: ");
                reportPath = Console.ReadLine();
            }

            if (string.IsNullOrEmpty(reportPath) || !File.Exists(reportPath))
            {
                Console.WriteLine("❌ Report file not found. Please provide a valid path.");
                Console.WriteLine("Example: C:\\Reports\\SampleInvoice (1).rpt");
                Console.ReadKey();
                return;
            }

            var service = new StandaloneCrystalService();
            
            // Test Template Clone approach
            Console.WriteLine("🔧 Testing TEMPLATE CLONE approach...");
            try
            {
                var result1 = service.TestTemplateClone(reportPath);
                if (result1 != null)
                {
                    var outputPath1 = Path.Combine(Path.GetDirectoryName(reportPath), "preview_template_clone.pdf");
                    File.WriteAllBytes(outputPath1, result1);
                    Console.WriteLine($"✅ TEMPLATE CLONE SUCCESS! Saved to: {outputPath1}");
                    Console.WriteLine($"   Generated {result1.Length} bytes");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ TEMPLATE CLONE failed: {ex.Message}");
            }

            Console.WriteLine();

            // Test Push Model approach
            Console.WriteLine("🔥 Testing PUSH MODEL approach...");
            try
            {
                var result2 = service.TestPushModel(reportPath);
                if (result2 != null)
                {
                    var outputPath2 = Path.Combine(Path.GetDirectoryName(reportPath), "preview_push_model.pdf");
                    File.WriteAllBytes(outputPath2, result2);
                    Console.WriteLine($"✅ PUSH MODEL SUCCESS! Saved to: {outputPath2}");
                    Console.WriteLine($"   Generated {result2.Length} bytes");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ PUSH MODEL failed: {ex.Message}");
            }

            Console.WriteLine();

            // Test Report Rebuilder approach
            Console.WriteLine("🏗️ Testing REPORT REBUILDER approach...");
            try
            {
                var result3 = service.TestReportRebuilder(reportPath);
                if (result3 != null)
                {
                    var outputPath3 = Path.Combine(Path.GetDirectoryName(reportPath), "preview_report_rebuilder.pdf");
                    File.WriteAllBytes(outputPath3, result3);
                    Console.WriteLine($"✅ REPORT REBUILDER SUCCESS! Saved to: {outputPath3}");
                    Console.WriteLine($"   Generated {result3.Length} bytes");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ REPORT REBUILDER failed: {ex.Message}");
            }

            Console.WriteLine();
            Console.WriteLine("🎯 Testing completed. Check the generated PDF files!");
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}