import { ClubRecord, FirestoreCollection, IDUtil } from '@lib';
import type { Debugger, EvaluateCollectionType } from '@lib';
import Excel from 'exceljs';
import path from 'path';

interface Data {
  id: string;
  name: string;
}

async function fetchClubData(): Promise<Data[]> {
  const evalCol = new FirestoreCollection<EvaluateCollectionType>('evaluate');
  const evalData = await evalCol.readFromCache(true);

  if (!evalData) {
    return [];
  }

  const evalRecords = new ClubRecord(evalData.getRecord());

  return evalRecords.map((clubId) => ({
    id: clubId,
    name: IDUtil.translateToClubName(clubId),
  }));
}

async function generateExcelFile(data: Data[]): Promise<void> {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('รายชื่อชมรม');

  worksheet.columns = [
    { key: 'id', header: 'รหัสชมรม' },
    { key: 'name', header: 'ชื่อชมรม' },
  ];

  data.forEach((item) => {
    worksheet.addRow(item);
  });

  const exportPath = path.resolve(__dirname, 'clublists.xlsx');
  await workbook.xlsx.writeFile(exportPath);
}

export const ClubSnippet = async (debug: Debugger) => {
  try {
    const clubData = await fetchClubData();

    if (clubData.length === 0) {
      console.log('No club data found.');
      return;
    }
    
    await generateExcelFile(clubData);
    console.log('Excel file generated successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
};
