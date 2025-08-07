using System;
using System.Collections.Generic;

namespace CrystalReportsService.Models
{
    public class ReportMetadata
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public List<ReportField> Fields { get; set; } = new List<ReportField>();
        public List<ReportTable> Tables { get; set; } = new List<ReportTable>();
        public List<ReportParameter> Parameters { get; set; } = new List<ReportParameter>();
        public List<ReportSection> Sections { get; set; } = new List<ReportSection>();
    }

    public class ReportField
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
    }

    public class ReportTable
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Fields { get; set; } = new List<string>();
    }

    public class ReportParameter
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool Required { get; set; }
    }

    public class ReportSection
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Fields { get; set; } = new List<string>();
    }

    public class FieldOperationRequest
    {
        public string FieldName { get; set; } = string.Empty;
        public string Operation { get; set; } = string.Empty; // hide, show, rename, move
    }

    public class ExportRequest
    {
        public string Format { get; set; } = "PDF";
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
    }
}