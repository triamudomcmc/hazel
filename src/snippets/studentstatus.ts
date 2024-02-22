import { FirestoreCollection, IDUtil, Mutators } from "@lib";
import type {
  DMap,
  Debugger,
  UserDataCollectionType,
  IUserData,
  ReferableMapEntity,
} from "@lib";

const query = "อภิชญะ สุขสว่าง";

async function fetchDataFromFirestore() {
  const users = new FirestoreCollection<UserDataCollectionType>(
    "data"
  ).setDefaultMutator(
    Mutators.SpecificKeyFieldKVMutator((doc) => doc.get("student_id"))
  );

  return await users.readFromCache(true);
}

function getStudentInfo(
  userData: DMap<string, ReferableMapEntity<IUserData>>,
  key: string
) {
  const student = userData.findValues(
    (userDataItem) =>
      `${userDataItem.get("firstname")} ${userDataItem.get("lastname")}` === key
  );

  const oldclub = student[0]?.get("old_club");
  const club = student[0]?.get("club");

  let clubName = "";
  let oldclubName = "";

  if (oldclub !== undefined) {
    oldclubName = IDUtil.translateToClubName(oldclub);
  }

  if (club !== undefined) {
    clubName = IDUtil.translateToClubName(club);
  }

  return {
    cardID: student[0]?.get("cardID"),
    title: student[0]?.get("title"),
    firstname: student[0]?.get("firstname"),
    lastname: student[0]?.get("lastname"),
    room: student[0]?.get("room"),
    level: student[0]?.get("level"),
    number: student[0]?.get("number"),
    club: student[0]?.get("club"),
    clubname: clubName,
    audition: student[0]?.get("audition"),
    position: student[0]?.get("position"),
    old_club: student[0]?.get("old_club"),
    old_clubname: oldclubName,
  };
}

export const StudentInfoSnippet = async (debug: Debugger) => {
  const userData = await fetchDataFromFirestore();

  if (!userData) {
    return;
  }

  const studentInfo = getStudentInfo(userData, query);
  console.log(studentInfo);
};
