
const fs = require("fs-extra");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");

const accounts = [
  { slot: 1, file: "account.txt" },
  { slot: 2, file: "account2.txt" },
  { slot: 3, file: "account3.txt" }
];

const stateFile = path.join(ROOT, "account-slot.json");

function getAvailableAccounts() {
  return accounts.filter(({ file }) => {
    const filePath = path.join(ROOT, file);
    return fs.existsSync(filePath) &&
      fs.readFileSync(filePath, "utf8").trim().length > 0;
  });
}

function getCurrentSlot() {
  try {
    const state = fs.readJsonSync(stateFile);
    return Number(state.slot) || 1;
  } catch {
    return 1;
  }
}

function setCurrentSlot(slot) {
  fs.writeJsonSync(stateFile, { slot }, { spaces: 2 });
}

function getAccountFile(slot) {
  const account = accounts.find(item => item.slot === Number(slot));
  return account ? path.join(ROOT, account.file) : null;
}

module.exports = {
  accounts,
  getAvailableAccounts,
  getCurrentSlot,
  setCurrentSlot,
  getAccountFile
};
    
