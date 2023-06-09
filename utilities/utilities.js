const msYear = 31556926000;
const msMonth = 2629800000;
const msWeek = 604800000;
const msDay = 86400000;
const msHour = 3600000;
const msMinute = 60000;
const msSecond = 1000;
const diffTimeTable = [
  msYear,
  msMonth,
  msWeek,
  msDay,
  msHour,
  msMinute,
  msSecond,
];
const diffNameTable = ["yr", "mth", "w", "d", "hr", "m", "s"];

var self = (module.exports = {
  /* Convert diff time in ms to human readable diff time */
  diffTime: function (msTime) {
    itr = 0;
    while (msTime < diffTimeTable[itr]) {
      itr++;
      if (itr >= diffNameTable.length) {
        return "just now"; // return just now if less than 1 second
      }
    }
    diff = Math.floor(msTime / diffTimeTable[itr]);
    return "" + diff + diffNameTable[itr] + " ago"; // e.g. 10s ago, 1yr ago
  },
  paginationHandler: function (rawPage, rawSize) {
    /* Sanitize params and handles pagination */
    const pageAsNumber = Number.parseInt(rawPage);
    const sizeAsNumber = Number.parseInt(rawSize);

    let page = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
      page = pageAsNumber;
    }
    // ensures that posts are delivered in a consistent volume
    let size = 10;
    if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 10) {
      size = sizeAsNumber;
    }
    return { page: page, size: size };
  },
  addDiffTimeToQueryResults: function (queryResult) {
    const now = new Date();
    queryResult.forEach(function (element, index, array) {
      element["diff"] = self.diffTime(now - element["createdAt"]);
      array[index] = element;
    });
    return queryResult;
  },
});
