import connectDb, { getDb } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      await connectDb();
      const db = getDb();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

export const users = getCollectionFn("users");
export const hospitals = getCollectionFn("hospitals");

// we can add other feature part later

export default {
  users,
  hospitals,
}
