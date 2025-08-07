using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using CrystalReportsService.Services;
using CrystalReportsService.Models;
using Newtonsoft.Json;

namespace CrystalReportsService
{
    class Program
    {
        private static HttpListener listener;
        private static CrystalReportServiceFramework crystalService;

        static void Main(string[] args)
        {
            Console.WriteLine("🚀 Crystal Reports Web API Service");
            Console.WriteLine("==================================");
            
            crystalService = new CrystalReportServiceFramework();
            
            // Health check
            Console.WriteLine("\n🔍 Performing health check...");
            if (crystalService.HealthCheck())
            {
                Console.WriteLine("✅ Crystal Reports SDK is working!");
            }
            else
            {
                Console.WriteLine("❌ Crystal Reports SDK not available");
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
                return;
            }
            
            // Start HTTP listener
            string url = "http://localhost:5001/";
            listener = new HttpListener();
            listener.Prefixes.Add(url);
            
            try
            {
                listener.Start();
                Console.WriteLine($"\n🌐 Crystal Reports API running at: {url}");
                Console.WriteLine("\nAvailable endpoints:");
                Console.WriteLine("  GET  /api/crystalreports/health");
                Console.WriteLine("  POST /api/crystalreports/metadata");
                Console.WriteLine("  POST /api/crystalreports/preview");
                Console.WriteLine("  POST /api/crystalreports/field-operation");
                Console.WriteLine("\nPress Ctrl+C to stop the server...");
                
                // Handle requests
                while (listener.IsListening)
                {
                    try
                    {
                        var context = listener.GetContext();
                        ThreadPool.QueueUserWorkItem(HandleRequest, context);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error handling request: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to start server: {ex.Message}");
                Console.WriteLine("Make sure port 5001 is not in use by another application.");
            }
            finally
            {
                listener?.Stop();
            }
        }

        static void HandleRequest(object context)
        {
            var httpContext = (HttpListenerContext)context;
            var request = httpContext.Request;
            var response = httpContext.Response;

            try
            {
                Console.WriteLine($"{DateTime.Now:HH:mm:ss} {request.HttpMethod} {request.Url.AbsolutePath}");

                // Enable CORS
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

                // Handle OPTIONS requests (CORS preflight)
                if (request.HttpMethod == "OPTIONS")
                {
                    response.StatusCode = 200;
                    response.Close();
                    return;
                }

                string responseText = "";
                response.ContentType = "application/json";

                switch (request.Url.AbsolutePath.ToLower())
                {
                    case "/api/crystalreports/health":
                        responseText = HandleHealthCheck();
                        break;

                    case "/api/crystalreports/metadata":
                        responseText = HandleMetadata(request);
                        break;

                    case "/api/crystalreports/preview":
                        HandlePreview(request, response);
                        return; // Preview returns binary data, handled separately

                    case "/api/crystalreports/field-operation":
                        responseText = HandleFieldOperation(request);
                        break;

                    default:
                        response.StatusCode = 404;
                        responseText = JsonConvert.SerializeObject(new { error = "Endpoint not found" });
                        break;
                }

                var buffer = Encoding.UTF8.GetBytes(responseText);
                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing request: {ex.Message}");
                response.StatusCode = 500;
                var errorResponse = JsonConvert.SerializeObject(new { error = ex.Message });
                var buffer = Encoding.UTF8.GetBytes(errorResponse);
                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
            }
            finally
            {
                response.Close();
            }
        }

        static string HandleHealthCheck()
        {
            var isHealthy = crystalService.HealthCheck();
            return JsonConvert.SerializeObject(new { 
                status = isHealthy ? "healthy" : "unhealthy",
                service = "Crystal Reports API",
                timestamp = DateTime.UtcNow
            });
        }

        static string HandleMetadata(HttpListenerRequest request)
        {
            if (request.HttpMethod != "POST")
            {
                throw new Exception("Metadata endpoint requires POST method");
            }

            // Read request body
            string requestBody;
            using (var reader = new StreamReader(request.InputStream))
            {
                requestBody = reader.ReadToEnd();
            }

            var requestData = JsonConvert.DeserializeObject<dynamic>(requestBody);
            string reportPath = requestData?.reportPath;

            if (string.IsNullOrEmpty(reportPath))
            {
                throw new Exception("reportPath is required");
            }

            if (!File.Exists(reportPath))
            {
                throw new Exception($"Report file not found: {reportPath}");
            }

            var metadata = crystalService.ExtractMetadata(reportPath);
            return JsonConvert.SerializeObject(metadata);
        }

        static void HandlePreview(HttpListenerRequest request, HttpListenerResponse response)
        {
            if (request.HttpMethod != "POST")
            {
                throw new Exception("Preview endpoint requires POST method");
            }

            // Read request body
            string requestBody;
            using (var reader = new StreamReader(request.InputStream))
            {
                requestBody = reader.ReadToEnd();
            }

            var requestData = JsonConvert.DeserializeObject<dynamic>(requestBody);
            string reportPath = requestData?.reportPath;
            string format = requestData?.format ?? "PDF";

            if (string.IsNullOrEmpty(reportPath))
            {
                throw new Exception("reportPath is required");
            }

            if (!File.Exists(reportPath))
            {
                throw new Exception($"Report file not found: {reportPath}");
            }

            var previewData = crystalService.GeneratePreview(reportPath, format);
            
            response.ContentType = "application/pdf";
            response.ContentLength64 = previewData.Length;
            response.OutputStream.Write(previewData, 0, previewData.Length);
        }

        static string HandleFieldOperation(HttpListenerRequest request)
        {
            if (request.HttpMethod != "POST")
            {
                throw new Exception("Field operation endpoint requires POST method");
            }

            // Read request body
            string requestBody;
            using (var reader = new StreamReader(request.InputStream))
            {
                requestBody = reader.ReadToEnd();
            }

            var requestData = JsonConvert.DeserializeObject<dynamic>(requestBody);
            string reportPath = requestData?.reportPath;
            string fieldName = requestData?.fieldName;
            string operation = requestData?.operation;

            if (string.IsNullOrEmpty(reportPath) || string.IsNullOrEmpty(fieldName) || string.IsNullOrEmpty(operation))
            {
                throw new Exception("reportPath, fieldName, and operation are required");
            }

            if (!File.Exists(reportPath))
            {
                throw new Exception($"Report file not found: {reportPath}");
            }

            var fieldRequest = new FieldOperationRequest
            {
                FieldName = fieldName,
                Operation = operation
            };

            var success = crystalService.PerformFieldOperation(reportPath, fieldRequest);
            return JsonConvert.SerializeObject(new { success = success });
        }
    }
}