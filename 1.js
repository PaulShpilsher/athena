const bcrypt = require("bcryptjs");
const rounds = 10;
const salt = bcrypt.genSaltSync(rounds);
console.log(`Rounds: ${rounds}, Salt: ${salt}`);
