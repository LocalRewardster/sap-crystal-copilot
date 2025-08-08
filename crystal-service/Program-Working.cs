using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using CrystalReportsService.Services;

namespace CrystalReportsService
{
    public class Program
    {
        private static HttpListener _listener;
        private static bool _keepAlive = true;

        public static void Main(string[] args)
        {
            Console.WriteLine("🚀 Starting Crystal Reports Service - Working Configuration");
            Console.WriteLine("💡 Using HttpListener for .NET Framework 4.8 compatibility");
            
            try
            {
                StartWebServer();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to start service: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                Console.ReadKey();
            }
        }

        private static void StartWebServer()
        {
            _listener = new HttpListener();
            _listener.Prefixes.Add("http://localhost:5000/");
            _listener.Start();
            
            Console.WriteLine("✅ Server started at http://localhost:5000/");
            Console.WriteLine("📋 Available endpoints:");
            Console.WriteLine("   POST /api/crystalreports/preview - Generate preview");
            Console.WriteLine("   GET  /health - Health check");
            Console.WriteLine("Press 'Q' to quit...");

            Task.Run(() => HandleRequests());
            
            // Keep running until user presses Q
            ConsoleKeyInfo key;
            do
            {
                key = Console.ReadKey();
            } while (key.Key != ConsoleKey.Q);
            
            _keepAlive = false;
            _listener?.Stop();
        }

        private static async Task HandleRequests()
        {
            while (_keepAlive && _listener.IsListening)
            {
                try
                {
                    var context = await _listener.GetContextAsync();
                    await ProcessRequest(context);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error handling request: {ex.Message}");
                }
            }
        }

        private static async Task ProcessRequest(HttpListenerContext context)
        {
            var request = context.Request;
            var response = context.Response;

            Console.WriteLine($"📨 {request.HttpMethod} {request.Url?.PathAndQuery}");

            try
            {
                // Set CORS headers
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

                if (request.HttpMethod == "OPTIONS")
                {
                    response.StatusCode = 200;
                    response.Close();
                    return;
                }

                var path = request.Url?.AbsolutePath?.ToLower();

                if (path == "/health")
                {
                    await HandleHealthCheck(response);
                }
                else if (path == "/api/crystalreports/preview" && request.HttpMethod == "POST")
                {
                    await HandlePreviewRequest(request, response);
                }
                else
                {
                    response.StatusCode = 404;
                    await SendJsonResponse(response, new { error = "Endpoint not found" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error processing request: {ex.Message}");
                response.StatusCode = 500;
                await SendJsonResponse(response, new { error = ex.Message });
            }
        }

        private static async Task HandleHealthCheck(HttpListenerResponse response)
        {
            var healthData = new
            {
                service = "Crystal Reports Service",
                status = "Healthy",
                version = "1.0.0",
                timestamp = DateTime.UtcNow
            };
            
            await SendJsonResponse(response, healthData);
            Console.WriteLine("✅ Health check completed");
        }

        private static async Task HandlePreviewRequest(HttpListenerRequest request, HttpListenerResponse response)
        {
            try
            {
                // Read request body
                string requestBody;
                using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
                {
                    requestBody = await reader.ReadToEndAsync();
                }

                var previewRequest = JsonConvert.DeserializeObject<PreviewRequest>(requestBody);
                Console.WriteLine($"🔄 Processing preview request for: {previewRequest?.ReportPath}");

                if (string.IsNullOrEmpty(previewRequest?.ReportPath))
                {
                    response.StatusCode = 400;
                    await SendJsonResponse(response, new { error = "ReportPath is required" });
                    return;
                }

                if (!File.Exists(previewRequest.ReportPath))
                {
                    response.StatusCode = 400;
                    await SendJsonResponse(response, new { error = "Report file not found" });
                    return;
                }

                // Try our new services in order
                byte[] pdfBytes = null;
                string successMethod = null;

                // 1. Template Clone approach
                try
                {
                    Console.WriteLine("🔧 Trying TEMPLATE CLONE approach...");
                    var templateService = new CrystalReportServiceTemplateClone();
                    pdfBytes = await templateService.GeneratePreview(previewRequest.ReportPath, previewRequest.Format ?? "PDF");
                    successMethod = "Template Clone";
                    Console.WriteLine("✅ TEMPLATE CLONE succeeded!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ TEMPLATE CLONE failed: {ex.Message}");

                    // 2. Push Model approach
                    try
                    {
                        Console.WriteLine("🔥 Trying PUSH MODEL approach...");
                        var pushService = new CrystalReportServicePushModel();
                        pdfBytes = await pushService.GeneratePreview(previewRequest.ReportPath, previewRequest.Format ?? "PDF");
                        successMethod = "Push Model";
                        Console.WriteLine("✅ PUSH MODEL succeeded!");
                    }
                    catch (Exception ex2)
                    {
                        Console.WriteLine($"❌ PUSH MODEL failed: {ex2.Message}");
                        throw new Exception($"All methods failed. Template Clone: {ex.Message}, Push Model: {ex2.Message}");
                    }
                }

                // Return the PDF
                response.ContentType = "application/pdf";
                response.Headers.Add("Content-Disposition", $"attachment; filename=\"preview.pdf\"");
                response.ContentLength64 = pdfBytes.Length;
                
                await response.OutputStream.WriteAsync(pdfBytes, 0, pdfBytes.Length);
                response.Close();
                
                Console.WriteLine($"✅ Preview generated successfully using {successMethod}: {pdfBytes.Length} bytes");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Preview generation failed: {ex.Message}");
                response.StatusCode = 500;
                await SendJsonResponse(response, new { error = $"Preview generation failed: {ex.Message}" });
            }
        }

        private static async Task SendJsonResponse(HttpListenerResponse response, object data)
        {
            var json = JsonConvert.SerializeObject(data, Formatting.Indented);
            var buffer = Encoding.UTF8.GetBytes(json);
            
            response.ContentType = "application/json";
            response.ContentLength64 = buffer.Length;
            
            await response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
            response.Close();
        }

        public class PreviewRequest
        {
            public string ReportPath { get; set; }
            public string Format { get; set; }
        }
    }
}