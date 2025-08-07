# Creating a Sample Crystal Report for Testing

## Option 1: Create a Simple Report Without Database

1. **Open Crystal Reports Designer**
2. **Create New Report** → **Blank Report**
3. **Skip database connection** (click Cancel when asked for data source)
4. **Add static text objects:**
   - Go to **Insert** → **Text Object**
   - Add some sample text like "Sample Report", "Company Name", etc.
5. **Add formula fields:**
   - Go to **Insert** → **Formula Field**
   - Create simple formulas like `"Today's Date: " + ToText(CurrentDate)`
6. **Save as** `SampleReport.rpt`

## Option 2: Use Built-in Sample Data

1. **Create New Report** → **Standard Report Wizard**
2. **Select Data Source** → **Create New Connection** → **Access/Excel (DAO)**
3. **Browse** to Crystal Reports sample data (usually in `C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Samples\`)
4. **Select** a sample database like `xtreme.mdb`
5. **Add a few fields** and create a simple report
6. **Save as** `DatabaseSampleReport.rpt`

## Option 3: Download Sample Reports

You can download sample Crystal Reports from:
- SAP Crystal Reports sample gallery
- Crystal Reports community forums
- Create your own with minimal fields

## Testing the Report

Once you have a sample report:

1. **Copy it to your uploads folder**
2. **Upload it through the web interface**
3. **Test the preview generation**

The new database handling code should work with both database-connected and standalone reports.