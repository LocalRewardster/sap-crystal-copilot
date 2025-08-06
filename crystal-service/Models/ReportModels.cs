using System.ComponentModel.DataAnnotations;

namespace CrystalReportsService.Models
{
    public class ReportPreviewRequest
    {
        [Required]
        public string ReportPath { get; set; } = string.Empty;
        
        public string Format { get; set; } = "PDF"; // PDF, HTML, Excel, Word
        
        public Dictionary<string, object>? Parameters { get; set; }
    }

    public class ReportMetadataRequest
    {
        [Required]
        public string ReportPath { get; set; } = string.Empty;
    }

    public class ReportFieldOperation
    {
        [Required]
        public string ReportPath { get; set; } = string.Empty;
        
        [Required]
        public string FieldName { get; set; } = string.Empty;
        
        [Required]
        public string Operation { get; set; } = string.Empty; // hide, show, rename, move
        
        public Dictionary<string, object>? Parameters { get; set; }
    }

    public class CrystalReportMetadata
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public long FileSize { get; set; }
        public List<CrystalReportSection> Sections { get; set; } = new();
        public List<string> Tables { get; set; } = new();
        public List<CrystalReportParameter> Parameters { get; set; } = new();
        public List<CrystalDatabaseConnection> DatabaseConnections { get; set; } = new();
    }

    public class CrystalReportSection
    {
        public string Name { get; set; } = string.Empty;
        public string SectionType { get; set; } = string.Empty;
        public int Height { get; set; }
        public List<CrystalReportField> Fields { get; set; } = new();
    }

    public class CrystalReportField
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public bool Visible { get; set; } = true;
        public string? Formula { get; set; }
        public string? TableName { get; set; }
        public string? ColumnName { get; set; }
        public string? Text { get; set; }
        public CrystalFieldFormat? Format { get; set; }
    }

    public class CrystalFieldFormat
    {
        public string FontName { get; set; } = string.Empty;
        public int FontSize { get; set; }
        public bool Bold { get; set; }
        public bool Italic { get; set; }
        public bool Underline { get; set; }
        public string Color { get; set; } = string.Empty;
        public string BackgroundColor { get; set; } = string.Empty;
        public string Alignment { get; set; } = string.Empty;
    }

    public class CrystalReportParameter
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public object? DefaultValue { get; set; }
        public bool Required { get; set; }
        public string? PromptText { get; set; }
    }

    public class CrystalDatabaseConnection
    {
        public string Driver { get; set; } = string.Empty;
        public string Server { get; set; } = string.Empty;
        public string Database { get; set; } = string.Empty;
        public string? Username { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Error { get; set; }
        public string? Message { get; set; }
    }
}