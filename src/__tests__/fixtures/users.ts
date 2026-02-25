import bcrypt from "bcryptjs";

export const testUsers = {
  admin: {
    email: "admin@test.com",
    name: "Admin User",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "admin",
  },
  judge: {
    email: "judge@test.com",
    name: "Judge User",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "judge",
  },
  participant1: {
    email: "participant1@test.com",
    name: "Participant One",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "participant",
  },
  participant2: {
    email: "participant2@test.com",
    name: "Participant Two",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "participant",
  },
};

export const testPasswords = {
  default: "password123",
};
