# Crystal Reports Setup for Windows

## Option 1: Automatic Setup
Run `setup-crystal-reports-windows.bat` to automatically detect and configure Crystal Reports.

## Option 2: Manual Setup

### 1. Install Crystal Reports
Download and install one of:
- **SAP Crystal Reports for Visual Studio** (Free): https://www.sap.com/products/technology-platform/crystal-reports.html
- **Crystal Reports Runtime**
- **SAP Crystal Reports Developer Edition**

### 2. Find RptToXml.exe
Common locations:
```
C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\Crystal Reports 2020\RptToXml.exe
C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\RptToXml.exe
C:\Program Files (x86)\Common Files\Crystal Decisions\2.5\bin\RptToXml.exe
C:\Program Files\Common Files\Crystal Decisions\2.5\bin\RptToXml.exe
```

### 3. Update Backend Configuration
Edit `backend/.env` and update:
```env
RPTTOXML_PATH=C:/path/to/your/RptToXml.exe
CRYSTAL_SDK_PATH=C:/Program Files/SAP BusinessObjects/Crystal Reports for .NET Framework 4.0/Common/SAP BusinessObjects Enterprise XI 4.0/win64_x64/
```

### 4. Test the Setup
```bash
cd backend
python -c "
from app.core.config import get_settings
from pathlib import Path
settings = get_settings()
rpt_path = Path(settings.RPTTOXML_PATH)
print(f'RptToXml path: {rpt_path}')
print(f'Exists: {rpt_path.exists()}')
"
```

### 5. Restart Backend
```bash
cd backend
python main.py
```

## Verification
1. Upload a .rpt file
2. Check backend logs for "Starting report parsing" (not "using mock XML data")
3. The ReportAnalysis should show real field counts and names from your .rpt file