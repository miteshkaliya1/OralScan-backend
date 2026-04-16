import { prisma } from "./db/prisma.js";
import { hashPassword } from "./utils/password.js";

async function main() {
  const passwordHash = await hashPassword("Pass@1234");

  const patient = await prisma.user.upsert({
    where: { email: "patient@oralscan.test" },
    update: {},
    create: {
      name: "Kiran Solanki",
      email: "patient@oralscan.test",
      mobileNumber: "9876543210",
      role: "PATIENT",
      passwordHash,
      age: 38,
      gender: "MALE",
      address: "Ahmedabad, Gujarat",
      tobaccoGutkaHistory: "FORMER",
      tobaccoGutkaDetails: "Gutka use for 8 years, stopped 2 years ago",
    },
  });

  const doctor = await prisma.user.upsert({
    where: { email: "doctor@oralscan.test" },
    update: {},
    create: {
      name: "Dr. Nidhi Shah",
      email: "doctor@oralscan.test",
      mobileNumber: "9898989898",
      role: "DOCTOR",
      passwordHash,
    },
  });

  console.log("Seeded users:", { patient: patient.email, doctor: doctor.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
