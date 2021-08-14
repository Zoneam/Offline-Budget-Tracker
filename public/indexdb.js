let db;
const request = indexedDB.open("offlineBudget", 1);

request.onupgradeneeded = (e) => {
  let db = e.target.result;
  db.createObjectStore("newTransactions", { autoIncrement: true });
};

request.onsuccess = (e) => {
  db = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = () => {
  console.log("Database Error");
};

function saveRecord(record) {
  const transaction = db.transaction(["newTransactions"], "readwrite");
  const store = transaction.objectStore("newTransactions");
  console.log("record: ", record);
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["newTransactions"], "readwrite");
  const store = transaction.objectStore("newTransactions");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      console.log("--------");
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          //delete from indexdb
          const transaction = db.transaction(["newTransactions"], "readwrite");
          const store = transaction.objectStore("newTransactions");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
