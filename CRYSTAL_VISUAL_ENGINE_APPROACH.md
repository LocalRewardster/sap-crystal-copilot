# Crystal Reports Visual Engine Integration

## 🎯 Approach: Hybrid Architecture

### **Phase 1: Current State (Working)**
- ✅ **RptToXml**: Extract metadata, fields, sections
- ✅ **Web Preview**: HTML/CSS visual representation  
- ✅ **Field Operations**: Hide/show/rename/move via XML manipulation

### **Phase 2: Crystal Runtime Integration (Recommended)**

#### **Option A: Crystal Reports .NET SDK (Recommended)**
```csharp
// C# Service (Windows-only)
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;

public class CrystalReportService 
{
    public byte[] GenerateReportPreview(string rptPath, string format = "PDF")
    {
        var report = new ReportDocument();
        report.Load(rptPath);
        
        // Export to PDF/HTML for web display
        return report.ExportToStream(ExportFormatType.PortableDocFormat);
    }
    
    public ReportMetadata ExtractMetadata(string rptPath)
    {
        var report = new ReportDocument();
        report.Load(rptPath);
        
        // Extract real field positions, formatting, etc.
        return ParseReportStructure(report);
    }
}
```

#### **Option B: Crystal Reports Server API**
```typescript
// REST API integration with Crystal Reports Server
const crystalServerConfig = {
    serverUrl: 'http://your-crystal-server:8080',
    username: 'Administrator',
    password: 'password'
};

async function generateReportPreview(reportId: string) {
    const response = await fetch(`${crystalServerConfig.serverUrl}/raygun/v2/reports/${reportId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'PDF' })
    });
    return response.blob(); // PDF blob for display
}
```

#### **Option C: Embedded Crystal Reports Viewer**
```html
<!-- Crystal Reports HTML5 Viewer -->
<div id="crystalReportViewer"></div>
<script>
    var viewer = new SAP.CR.Viewer({
        reportServerUrl: "http://your-server:8080",
        reportPath: "/reports/SampleInvoice.rpt"
    });
    viewer.renderTo("crystalReportViewer");
</script>
```

## 🏗️ **Recommended Implementation Plan**

### **Phase 1: Enhanced Parsing (Immediate)**
1. **Set up RptToXml** on your Windows machine
2. **Enhance parser** to extract exact pixel positions, fonts, colors
3. **Improve web preview** with accurate positioning and styling

### **Phase 2: .NET SDK Integration (2-4 weeks)**
```
Backend Architecture:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FastAPI       │    │  C# Crystal      │    │   Crystal       │
│   (Python)      │◄──►│  Service         │◄──►│   Reports       │
│                 │    │  (.NET)          │    │   Runtime       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        ▲                        ▲                        ▲
        │                        │                        │
    REST API              Named Pipes/          .rpt Files
                         HTTP Bridge
```

### **Phase 3: Real-time Preview (1-2 months)**
- **Live preview** updates as fields are modified
- **WYSIWYG editing** with drag-and-drop
- **Export capabilities** (PDF, Excel, Word)

## 🛠️ **Implementation Steps**

### **Step 1: Create C# Crystal Service**
```bash
# Create new .NET project
dotnet new webapi -n CrystalReportsService
cd CrystalReportsService

# Add Crystal Reports NuGet packages
dotnet add package CrystalReports.Engine
dotnet add package CrystalReports.Shared
```

### **Step 2: FastAPI Bridge**
```python
# backend/app/services/crystal_bridge.py
import httpx
import asyncio
from pathlib import Path

class CrystalBridgeService:
    def __init__(self):
        self.crystal_service_url = "http://localhost:5001"  # C# service
    
    async def generate_preview(self, rpt_path: Path) -> bytes:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.crystal_service_url}/api/reports/preview",
                json={"reportPath": str(rpt_path)}
            )
            return response.content
    
    async def extract_visual_metadata(self, rpt_path: Path) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.crystal_service_url}/api/reports/metadata",
                json={"reportPath": str(rpt_path)}
            )
            return response.json()
```

### **Step 3: Frontend Integration**
```typescript
// Display PDF preview in React
const ReportPreview = ({ reportId }) => {
    const [previewUrl, setPreviewUrl] = useState<string>('');
    
    useEffect(() => {
        apiService.getReportPreview(reportId).then(blob => {
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        });
    }, [reportId]);
    
    return (
        <iframe 
            src={previewUrl} 
            width="100%" 
            height="600px"
            title="Crystal Report Preview"
        />
    );
};
```

## 📋 **Next Steps for You**

1. **Immediate**: Run `setup-crystal-reports-windows.bat` to enable real parsing
2. **This Week**: Test with real .rpt files to see actual field data
3. **Next Phase**: Decide on Crystal Runtime integration approach
4. **Future**: Implement C# bridge service for visual rendering

The current web-based preview is actually quite good for MVP! The Crystal Runtime integration would be for production-grade visual fidelity.