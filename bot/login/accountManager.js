const fs = require("fs-extra");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const STATE_FILE = path.join(ROOT, "account-slot.json");

const accounts = [
  { slot: 1, file: "account.txt" },
  { slot: 2, file: "account2.txt" },
  { slot: 3, file: "account3.txt" }
];

function getAccountFile(slot) {
  const account = accounts.find(a => a.slot === Number(slot));
  return account ? path.join(ROOT, account.file) : null;
}

function getAvailableAccounts() {
  return accounts.filter(account => {
    const file = getAccountFile(account.slot);
    return file && fs.existsSync(file) &&
      fs.readFileSync(file, "utf8").trim().length > 0;
  });
}

function getCurrentSlot() {
  try {
    const state = fs.readJsonSync(STATE_FILE);
    return Number(state.slot) || 1;
  } catch {
    return 1;
  }
}

function setCurrentSlot(slot) {
  if (!accounts.some(a => a.slot === Number(slot))) {
    throw new Error("Invalid account slot");
  }

  fs.writeJsonSync(STATE_FILE, { slot: Number(slot) }, {
    spaces: 2
  });
}

function getNextAccount() {
  const available = getAvailableAccounts();
  if (!available.length) return null;

  const current = getCurrentSlot();

  for (let i = 1; i <= 3; i++) {
    const next = ((current - 1 + i) % 3) + 1;
    const found = available.find(a => a.slot === next);

    if (found) return found;
  }

  return null;
}

module.exports = {
  accounts,
  getAvailableAccounts,
  getCurrentSlot,
  setCurrentSlot,
  getAccountFile,
  getNextAccount
};
