import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "general";
    const crop = searchParams.get("crop") || "Unknown Crop";
    const region = searchParams.get("region") || "Unknown Region";
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Setup Document styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // Green brand color
    doc.text("Agri Decision Platform", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(61, 31, 10);
    doc.text(`Official ${type.replace("_", " ").toUpperCase()}`, 14, 32);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);
    
    // Some mock data generation based on type
    let dataMap: Record<string, string> = {};
    if (type.includes("disease")) {
      dataMap = {
        "Crop Name": crop,
        "Region": region,
        "Risk Level": "High",
        "Detected Issues": "Leaf Blight",
        "Recommendation": "Apply fungicide immediately and reduce watering."
      };
    } else if (type.includes("market")) {
        dataMap = {
        "Crop Name": crop,
        "Region": region,
        "Current Price": "₹2,400 / quintal",
        "Price Trend": "Rising (+5%)",
        "Recommendation": "Hold inventory for 1 week for better margins."
      };
    } else if (type.includes("irrigation")) {
        dataMap = {
        "Crop Name": crop,
        "Region": region,
        "Soil Moisture": "34% (Low)",
        "Water Needed": "15mm / acre",
        "Recommendation": "Schedule drip irrigation for 4 hours tomorrow."
      };
    } else {
        dataMap = {
        "Crop Name": crop,
        "Region": region,
        "Status": "Optimal",
        "Recommendation": "Maintain current agricultural practices."
      };
    }

    // Convert object to autotable array
    const tableData = Object.entries(dataMap).map(([key, value]) => [key, value]);

    // Use AutoTable to draw a clean structured table
    autoTable(doc, {
      startY: 50,
      head: [["Metric", "Details"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [22, 163, 74] },
      styles: { fontSize: 11, cellPadding: 5 }
    });

    // Output buffer
    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    // Return the generated PDF response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}_report.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Generate Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
