const fs = require('fs');

// Unified number parser that handles both US and Indonesian currency formatting
function parseFormattedNumber(val) {
  if (val === null || val === undefined) return 0;
  let str = String(val).trim().replace(/Rp/g, '').replace(/%/g, '').replace(/\s/g, '');
  if (!str) return 0;

  // Case 1: Has both dot and comma
  if (str.includes('.') && str.includes(',')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      str = str.replace(/\./g, '').replace(/,/g, '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } 
  // Case 2: Only has dots
  else if (str.includes('.') && !str.includes(',')) {
    const dotCount = (str.match(/\./g) || []).length;
    if (dotCount > 1) {
      str = str.replace(/\./g, '');
    } else {
      const parts = str.split('.');
      if (parts[1].length === 3) {
        str = str.replace(/\./g, '');
      }
    }
  }
  // Case 3: Only has commas
  else if (str.includes(',') && !str.includes('.')) {
    const commaCount = (str.match(/,/g) || []).length;
    if (commaCount > 1) {
      str = str.replace(/,/g, '');
    } else {
      const parts = str.split(',');
      if (parts[1].length === 3) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(/,/g, '.');
      }
    }
  }

  const cleaned = str.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

function cleanIDR(val) {
  return parseFormattedNumber(val);
}

function cleanUSC(val) {
  return parseFormattedNumber(val);
}

async function run() {
  console.log('Fetching live data from Google Sheets...');
  const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/1jbm4tDMYOAMpYnDbRz82QNvcMrBj5shV/export?format=csv&gid=1272196974&t=' + Date.now();
  
  const response = await fetch(googleSheetsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
  }
  const csvText = await response.text();
  console.log('Successfully fetched Google Sheet content.');

  // Parse CSV rows handling quotes
  const excelData = csvText.split('\n').map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });

  // Find header positions to dynamically adapt to layout
  let totalModalHeaderIdx = -1;
  let cashflowHeaderIdx = -1;
  let monthlyHeaderIdx = -1;
  
  for (let i = 0; i < excelData.length; i++) {
    const rowStr = excelData[i].join(' ');
    if (rowStr.includes('TOTAL MODAL')) {
      totalModalHeaderIdx = i;
    }
    if (rowStr.includes('REKAPITULASI BULANAN 2026')) {
      monthlyHeaderIdx = i;
    }
    if (rowStr.includes('ARUS KAS DAN BIAYA')) {
      cashflowHeaderIdx = i;
    }
  }

  if (totalModalHeaderIdx === -1 || cashflowHeaderIdx === -1) {
    throw new Error('Google Sheet layout is missing expected headers (TOTAL MODAL or ARUS KAS).');
  }

  // Extract KPIs
  const idrRow = excelData[totalModalHeaderIdx + 1];
  const uscRow = excelData[totalModalHeaderIdx + 2];
  
  const kpis = {
    total_modal_idr: cleanIDR(idrRow[0]),
    total_modal_usc: cleanUSC(uscRow[0]),
    total_withdraw_idr: cleanIDR(idrRow[2]),
    total_withdraw_usc: cleanUSC(uscRow[2]),
    est_saldo_bersih_idr: cleanIDR(idrRow[4]),
    est_saldo_bersih_usc: cleanUSC(uscRow[4]),
    keseluruhan_saldo_mt5_idr: cleanIDR(idrRow[6]),
    keseluruhan_saldo_mt5_usc: cleanUSC(uscRow[6]),
    total_trading_profit_idr: cleanIDR(idrRow[8]),
    total_trading_profit_usc: cleanUSC(uscRow[8]),
    kurs_usd_idr: cleanIDR(idrRow[10])
  };
  
  // Extract Monthly Summary (Including the TOTAL row at the bottom)
  const monthlySummary = [];
  if (monthlyHeaderIdx !== -1) {
    for (let i = monthlyHeaderIdx + 2; i < excelData.length; i++) {
      const row = excelData[i];
      if (!row || !row[0] || row[0].includes('ARUS KAS')) break;
      const bName = row[0].trim();
      monthlySummary.push({
        bulan: bName,
        deposit_idr: cleanIDR(row[1]),
        deposit_usc: cleanUSC(row[2]),
        withdraw_idr: cleanIDR(row[3]),
        withdraw_usc: cleanUSC(row[4]),
        server_idr: cleanIDR(row[5]),
        profit_usc: cleanUSC(row[6]),
        est_profit_idr: cleanIDR(row[7]),
        growth: cleanUSC(row[9]) / 100
      });
      if (bName === 'TOTAL') break;
    }
  }
  
  // Extract Cashflow and Trading Journal tables
  const cashflowRows = [];
  const journalRows = [];
  
  for (let i = cashflowHeaderIdx + 2; i < excelData.length; i++) {
    const row = excelData[i];
    if (!row) continue;
    
    // Left Table: cashflow (indices 0-4)
    const cashDate = row[0];
    if (cashDate && cashDate.trim() !== '') {
      cashflowRows.push({
        tanggal: cashDate,
        tipe: row[1] || '',
        keterangan: row[2] || '',
        nominal_idr: cleanIDR(row[3]),
        nominal_usc: cleanUSC(row[4])
      });
    }
    
    // Right Table: journal (indices 6-10)
    const journalDate = row[6];
    if (journalDate && journalDate.trim() !== '') {
      journalRows.push({
        tanggal: journalDate,
        profit_usc: cleanUSC(row[7]),
        est_profit_idr: cleanIDR(row[8]),
        status: row[9] || '',
        akumulasi_idr: cleanIDR(row[10])
      });
    }
  }

  // Compile output JS without raw trades or CSV metrics
  const outputData = {
    kpis,
    monthlySummary,
    cashflowRows,
    journalRows
  };

  const outputJsContent = `// Auto-generated dashboard data\nconst dashboardData = ${JSON.stringify(outputData, null, 2)};\n`;
  fs.writeFileSync('dashboard_data.js', outputJsContent, 'utf8');
  console.log('Successfully generated minimalist dashboard_data.js!');
}

run().catch(console.error);
