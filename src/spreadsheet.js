const excelJS = require("exceljs");

async function exportToExcel(data) {
  try {
    const workbook = new excelJS.Workbook(); // Create a new workbook
    const worksheet = workbook.addWorksheet("Programblad"); // New Worksheet

    worksheet.columns = [
      { header: "Kampnr.", key: "matchNumber", width: 10 },
      { header: "Titel", key: "title", width: 50 },
      { header: "1 - Tekst", key: "homeText", width: 25 },
      { header: "1 - Odds", key: "homeOdds", width: 10 },
      { header: "X - Tekst", key: "tiedText", width: 25 },
      { header: "X - Odds", key: "tiedOdds", width: 10 },
      { header: "2 - Tekst", key: "awayText", width: 25 },
      { header: "2 - Odds", key: "awayOdds", width: 10 },
    ];

    // sort data by match number
    data.sort((a, b) => a["matchNumber"] - b["matchNumber"]);

    data.forEach((row) => {
      worksheet.addRow(row);
    });

    const dateStr = new Date().toLocaleDateString("da-DK");

    return {
      buffer: await workbook.xlsx.writeBuffer(),
      filename: `programblad_${dateStr}.xlsx`,
    };
  } catch (err) {
    console.log("Could not export file => ", err);
  }
}

module.exports = exportToExcel;
