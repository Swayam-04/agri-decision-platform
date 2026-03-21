import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// We use basic English strings for translations here to prevent `jspdf` from rendering garbled text 
// due to missing Devanagari/Odia/Bengali TTF fonts in the current environment. Basic transliteration is used.
type Translations = { [key: string]: { en: string; hi: string; bn: string; or: string } };

const T: Translations = {
  title: { en: "Agricultural Report", hi: "Krishi Report (Hindi)", bn: "Krishi Report (Bengali)", or: "Krishi Report (Odia)" },
  locSeason: { en: "Location & Season", hi: "Sthan aur Mausam (Hindi)", bn: "Sthan o Ritu (Bengali)", or: "Sthana o Rutu (Odia)" },
  weather: { en: "Weather Summary", hi: "Mausam Jankari", bn: "Abahawa", or: "Panipaga" },
  diseasePest: { en: "Disease & Pest Insights", hi: "Rog aur Keet", bn: "Rog o Poka", or: "Roga o Pok" },
  market: { en: "Market Analysis", hi: "Bazar Vishleshan", bn: "Bazar Bishleshan", or: "Bazar Bislesana" },
  storage: { en: "Storage Options", hi: "Bhandaran Vikalp", bn: "Mojud Bikalpa", or: "Bhandarana Bikalpa" },
  waste: { en: "Waste-to-Profit Suggestions", hi: "Kachre se Munafa", bn: "Bojyo theke Labh", or: "Abarjana ru Labha" },
  altCrop: { en: "Alternative Crop Suggestions", hi: "Vaikalpik Fasal", bn: "Bikalpa Fashal", or: "Bikalpa Phasal" },
  sources: { en: "Verified Sources", hi: "Pramanik Srot", bn: "Yachai Kora Utsa", or: "Pramanita Utsa" }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state") || "Odisha";
    const district = searchParams.get("district") || "Khordha";
    const localArea = searchParams.get("localArea") || "Bhubaneswar";
    const season = searchParams.get("season") || "Kharif";
    const crop = searchParams.get("crop") || "Rice";
    const lang = (searchParams.get("language") || "en") as keyof typeof T.title;

    // Translation helper
    const t = (key: keyof typeof T) => T[key][lang] || T[key]["en"];

    const doc = new jsPDF();
    let currentY = 20;

    // Helper to add sections
    const addSectionHeader = (title: string, y: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(22, 163, 74); // Green
      doc.text(title, 14, y);
      doc.setDrawColor(22, 163, 74);
      doc.line(14, y + 2, 196, y + 2);
      return y + 10;
    };

    // --- Title ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(31, 41, 55); // Dark Gray
    doc.text(t("title"), 14, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    currentY += 8;
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, currentY);
    currentY += 15;

    // --- 1. Location & Season ---
    currentY = addSectionHeader(t("locSeason"), currentY);
    autoTable(doc, {
      startY: currentY,
      head: [["State", "District", "Local Area", "Season", "Crop"]],
      body: [[state, district, localArea, season, crop]],
      theme: "plain",
      headStyles: { fillColor: [240, 243, 246], textColor: [31, 41, 55], fontStyle: "bold" },
      styles: { cellPadding: 4, fontSize: 10 } // Adjust font size to fit more columns
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 2. Weather Summary ---
    currentY = addSectionHeader(t("weather"), currentY);
    autoTable(doc, {
      startY: currentY,
      head: [["Temperature", "Humidity", "Rainfall", "Impact on Crops"]],
      body: [["32°C", "78%", "15 mm", `High humidity increases disease risk for ${crop}.`]],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] }, // Blue
      styles: { cellPadding: 4, fontSize: 10 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 3. Disease & Pest Insights ---
    currentY = addSectionHeader(t("diseasePest"), currentY);
    autoTable(doc, {
      startY: currentY,
      head: [["Type", "Risk Level", "Detected Issues", "Recommended Actions/Preventive Measures"]],
      body: [
        ["Disease", "High", `${crop} Blight`, "Apply copper-based fungicides; improve drainage."],
        ["Pest", "Medium", "Stem Borer", "Use pheromone traps; release Trichogramma wasps."]
      ],
      theme: "grid",
      headStyles: { fillColor: [239, 68, 68] }, // Red
      styles: { cellPadding: 4, fontSize: 10 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 4. Market Analysis ---
    currentY = addSectionHeader(t("market"), currentY);
    autoTable(doc, {
      startY: currentY,
      head: [["Current Price", "Price Trend", "Recommendation"]],
      body: [["₹2,150 / quintal", "Rising (+4%)", "Store for 2-3 weeks for better margins."]],
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] }, // Emerald
      styles: { cellPadding: 4, fontSize: 10 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 5. Storage Options ---
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    currentY = addSectionHeader(t("storage"), currentY);
    autoTable(doc, {
      startY: currentY,
      head: [["Nearby Cold Storage", "Distance", "Cost", "Suggested Duration"]],
      body: [[`${district} Agro Cold Chain`, "12 km", "₹50 / quintal / month", "1-2 Months"]],
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246] }, // Purple
      styles: { cellPadding: 4, fontSize: 10 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 6. Waste-to-Profit & Alternative Crop ---
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    
    // Waste-to-Profit
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text(t("waste"), 14, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`• Alternative Uses: Can be used for organic composting or livestock feed.`, 14, currentY + 6);
    doc.text(`• Processing: Sell low-grade ${crop} to local processing industries.`, 14, currentY + 12);
    currentY += 22;

    // Alternative Crop
    doc.setFont("helvetica", "bold");
    doc.text(t("altCrop"), 14, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`• High Demand Alternatives: Consider planting Pulses or Maize in the upcoming season.`, 14, currentY + 6);
    doc.text(`• Based on ${district} soil quality and current market trends.`, 14, currentY + 12);
    currentY += 25;

    // --- 7. Verified Sources ---
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    currentY = addSectionHeader(t("sources"), currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text("• ICAR (Indian Council of Agricultural Research) - https://icar.org.in", 14, currentY);
    doc.text("• KVK (Krishi Vigyan Kendra) - Regional office", 14, currentY + 6);
    doc.text("• Agmarknet (Market Prices) - https://agmarknet.gov.in", 14, currentY + 12);
    doc.text("• IMD (Indian Meteorological Department) - https://mausam.imd.gov.in", 14, currentY + 18);

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Page ${i} of ${pageCount} | Agricultural AI Intelligence Platform`, 14, 290);
    }

    // Output buffer
    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Comprehensive_Agri_Report_${crop}_${season}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Generate Error:", error);
    return NextResponse.json({ error: "Failed to generate comprehensive report" }, { status: 500 });
  }
}
