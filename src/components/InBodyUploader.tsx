import React, { useState } from "react";
import Papa from "papaparse";
import { read, utils } from "xlsx";
import { InBodyEntry } from "../types";
import { UploadCloud, FileSpreadsheet, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

const PT_RED = "#C63527";

interface InBodyUploaderProps {
  data: InBodyEntry[];
  onDataLoaded: (data: InBodyEntry[]) => void;
}

const InBodyUploader: React.FC<InBodyUploaderProps> = ({ data, onDataLoaded }) => {
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const parseRowData = (rows: any[]): InBodyEntry[] => {
    return rows.map((row) => ({
        date: row["Date"] || row["date"] || "Unknown",
        weight: parseFloat(row["Weight (lb)"] || row["Weight"] || 0),
        bodyFat: parseFloat(row["Body Fat %"] || row["PBF"] || 0),
        skeletalMuscleMass: parseFloat(
          row["Skeletal Muscle Mass (lb)"] || row["SMM"] || 0
        ),
        basalMetabolicRate: parseFloat(row["BMR"] || 0),
      }))
      .filter(entry => !isNaN(entry.weight) && entry.weight > 0);
  };

  const processFile = async (file: File) => {
    setError("");
    setInfoMessage("");
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsed = parseRowData(results.data as any[]);
            if (parsed.length === 0) {
                setError("No valid InBody data found in CSV. Please check column headers.");
            } else {
                onDataLoaded(parsed);
                setInfoMessage(`Successfully loaded ${parsed.length} records from CSV.`);
            }
          } catch (err) {
            console.error(err);
            setError("Invalid InBody CSV format.");
          }
        },
        error: (err) => setError(`CSV Parse Error: ${err.message}`)
      });
    } 
    else if (ext === 'xlsx' || ext === 'xls') {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(worksheet);
        
        const parsed = parseRowData(jsonData);
        
        if (parsed.length === 0) {
            setError("No valid InBody data found in Excel file. Ensure headers match standard export (Date, Weight (lb), etc).");
        } else {
            onDataLoaded(parsed);
            setInfoMessage(`Successfully loaded ${parsed.length} records from Excel.`);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to parse Excel file. It might be corrupted or protected.");
      }
    } 
    else if (ext === 'pdf') {
      // PDF Parsing logic for data extraction is complex client-side.
      // We acknowledge the upload but warn about data extraction.
      setInfoMessage("PDF Uploaded. Note: Automatic data extraction from PDF is not supported. Please use CSV or Excel for trend visualization.");
    } 
    else {
      setError("Unsupported file format. Please upload CSV, XLSX, or PDF.");
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
          setDragActive(true);
      } else if (e.type === "dragleave") {
          setDragActive(false);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
      }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-gray-200 pb-4">
        <h2
          className="text-2xl font-extrabold tracking-tight mb-1"
          style={{ color: PT_RED }}
        >
          InBody Scan Manager
        </h2>
        <p className="text-sm text-gray-500">
          Upload InBody exports (CSV, Excel) to visualize trends. PDF reports can be stored but not graphed.
        </p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all
            ${dragActive ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
             <UploadCloud className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">
            Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1 mb-4">
            Supported formats: .CSV, .XLSX, .PDF
        </p>
        <input
            type="file"
            accept=".csv, .xlsx, .xls, .pdf"
            onChange={handleUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold py-2 px-4 rounded-lg shadow-sm z-10 pointer-events-none">
            Select File
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {infoMessage && (
        <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {infoMessage}
        </div>
      )}

      {data.length > 0 && (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Parsed Data Preview
            </h3>
            <div className="overflow-hidden border border-gray-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Weight (lb)</th>
                    <th className="p-3 text-left">Body Fat %</th>
                    <th className="p-3 text-left">SMM (lb)</th>
                    <th className="p-3 text-left">BMR</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {data.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-900">{entry.date}</td>
                    <td className="p-3 text-gray-600">{entry.weight}</td>
                    <td className="p-3 text-gray-600">{entry.bodyFat}</td>
                    <td className="p-3 text-gray-600">{entry.skeletalMuscleMass}</td>
                    <td className="p-3 text-gray-600">{entry.basalMetabolicRate}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 flex items-start gap-2">
        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
            <strong>Privacy Note:</strong> InBody data uploaded here is processed in your browser's memory. No files are sent to external servers.
        </div>
      </div>
    </div>
  );
};

export default InBodyUploader;