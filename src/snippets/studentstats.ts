// eslint-disable-next-line quotes
import type {
  Debugger,
  EvaluateCollectionType,
  EvaluateType,
  IUserData,
  ReferableMapEntity,
  UserDataCollectionType,
} from "@lib";
import { ClubRecord, DMap, FirestoreCollection, IDUtil, Mutators } from "@lib";

import { Workbook } from "../lib/builtin/data/Workbook";
import { Worksheet } from "../lib/builtin/data/Worksheet";

let clubscnt = 0;
let studentscnt = 0;

async function fetchDataFromFirestore() {
  const evalCol = new FirestoreCollection<EvaluateCollectionType>("evaluate");
  const users = new FirestoreCollection<UserDataCollectionType>(
    "data"
  ).setDefaultMutator(
    Mutators.SpecificKeyFieldKVMutator((doc) => doc.get("student_id"))
  );

  const [evalData, userData] = await Promise.all([
    evalCol.readFromCache(true),
    users.readFromCache(true),
  ]);

  return { evalData, userData };
}

function getStudentInfo(
  userData: DMap<string, ReferableMapEntity<IUserData>>,
  key: string
) {
  const student = userData.findValues(
    (userDataItem) => userDataItem.get("student_id") === key
  );

  return {
    title: student[0]?.get("title"),
    firstname: student[0]?.get("firstname"),
    lastname: student[0]?.get("lastname"),
    number: student[0]?.get("number"),
    room: student[0]?.get("room"),
  };
}

function createSheetData(
  clubId: string,
  val: ReferableMapEntity<EvaluateType>,
  userData: DMap<string, ReferableMapEntity<IUserData>>
) {
  return new DMap(val.data()).map((key, val) => {
    const studentInfo = getStudentInfo(userData, key);
    studentscnt++;

    return {
      ID: key,
      clubid: clubId,
      clubs: IDUtil.translateToClubName(clubId),
      ...studentInfo,
      report: val.action,
    };
  });
}

export const StatsSnippet = async (debug: Debugger) => {
  const { evalData, userData } = await fetchDataFromFirestore();

  if (!evalData || !userData) {
    return;
  }

  const evalRecords = new ClubRecord(evalData.getRecord());

  const books = evalRecords.map((clubId, val) => {
    const sheetData = createSheetData(clubId, val, userData);
    clubscnt++;

    return new Worksheet(sheetData).setName(clubId);
  });

  const workbook = new Workbook(books);

  workbook.setStyle((l, cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    if (l.r === 1) {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    }

    if (l.c === 2) {
      cell.alignment = { horizontal: "center" };
    }
  });

  debug.dump(
    `Total clubs: ${clubscnt} | Total students passed: ${studentscnt}`
  );
  workbook.save("evals.xlsx");
};
