import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AppointmentStatus, UserType } from "@prisma/client";
import { prisma } from "./prismaClient";

type SeedUser = {
  name: string;
  email: string;
  password: string;
  type: UserType;
  telephone: string;
};

type PublicSeedUser = {
  role: string;
  email: string;
  password: string;
};

const CLIENT_USERS_TOTAL = 30;
const MIN_SERVICE_ROWS = 20;
const MIN_TIME_ROWS = 300;
const MIN_APPOINTMENT_ROWS = 300;
const MIN_PAYMENT_ROWS = 300;

const statusPool = [
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELED,
];

const firstNames = [
  "Ana",
  "Bruno",
  "Caio",
  "Davi",
  "Elisa",
  "Felipe",
  "Giovana",
  "Heitor",
  "Isabela",
  "Joao",
  "Karen",
  "Leandro",
];

const lastNames = [
  "Silva",
  "Souza",
  "Oliveira",
  "Lima",
  "Costa",
  "Almeida",
  "Santos",
  "Pereira",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomPassword() {
  return crypto.randomBytes(9).toString("base64url");
}

function randomEmail(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, ".")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return `${slug}.${Date.now()}${randomInt(1000, 9999)}@barbearia.local`;
}

async function clearDatabase() {
  await prisma.appointment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.time.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.user.deleteMany();
}

async function upsertUser(data: SeedUser) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      password: hashedPassword,
      type: data.type,
      telephone: data.telephone,
    },
    create: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      type: data.type,
      telephone: data.telephone,
    },
  });
}

async function upsertBarberProfile(userId: string, isAdmin: boolean) {
  const barber = await prisma.barber.upsert({
    where: { userId },
    update: { isAdmin, isActive: true },
    create: { userId, isAdmin, isActive: true },
  });

  await prisma.balance.upsert({
    where: { barberId: barber.id },
    update: {},
    create: { barberId: barber.id, balance: 0 },
  });
}

async function upsertClientProfile(userId: string) {
  await prisma.client.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function ensureService(name: string, description: string, price: number) {
  const existing = await prisma.service.findFirst({
    where: { name },
  });

  if (existing) return existing;

  return prisma.service.create({
    data: {
      name,
      description,
      price,
      active: true,
    },
  });
}

async function createClientUsers(total: number) {
  const created: Array<{ id: string; type: UserType; email: string }> = [];

  for (let index = 0; index < total; index++) {
    const fullName = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
    const email = randomEmail(fullName);
    const password = randomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        type: UserType.CLIENT,
        telephone: `11${randomInt(900000000, 999999999)}`,
      },
    });

    await upsertClientProfile(user.id);

    created.push({ id: user.id, type: UserType.CLIENT, email });
  }

  return created;
}

async function seedServices(total: number) {
  const baseServices = [
    {
      name: "Corte Tradicional",
      description: "Corte masculino tradicional",
      price: 200,
    },
    {
      name: "Barba Completa",
      description: "Modelagem e acabamento da barba",
      price: 200,
    },
    {
      name: "Corte + Barba",
      description: "Pacote completo",
      price: 200,
    },
    {
      name: "Pigmentacao",
      description: "Pigmentacao de barba/cabelo",
      price: 200,
    },
    {
      name: "Sobrancelha",
      description: "Ajuste de sobrancelha",
      price: 200,
    },
  ];

  for (const service of baseServices) {
    await ensureService(service.name, service.description, service.price);
  }

  for (let index = baseServices.length; index < total; index++) {
    const serviceNumber = String(index + 1).padStart(3, "0");
    await prisma.service.create({
      data: {
        name: `Servico ${serviceNumber}`,
        description: `Servico adicional ${serviceNumber} para simular volume real`,
        price: randomInt(45, 250),
        active: true,
      },
    });
  }
}

async function seedTimes(total: number) {
  const barbers = await prisma.barber.findMany();
  if (!barbers.length) return [];

  const createdTimes: Array<{ id: string; barberId: string }> = [];
  const slotHours = [8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let index = 0; index < total; index++) {
    const barber = barbers[index % barbers.length];
    const slotIndex = Math.floor(index / barbers.length);
    const dayOffset = Math.floor(slotIndex / slotHours.length) + 1;
    const hour = slotHours[slotIndex % slotHours.length];

    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayOffset);
    date.setHours(hour, 0, 0, 0);

    const created = await prisma.time.create({
      data: {
        barberId: barber.id,
        date,
        disponible: true,
      },
    });

    createdTimes.push({ id: created.id, barberId: created.barberId });
  }

  return createdTimes;
}

async function seedAppointments(
  total: number,
  createdTimes: Array<{ id: string; barberId: string }>
) {
  const clients = await prisma.client.findMany();
  const services = await prisma.service.findMany();

  if (!createdTimes.length || !clients.length || !services.length) return;

  const appointmentsToCreate = Math.min(total, createdTimes.length);
  for (let index = 0; index < appointmentsToCreate; index++) {
    const time = createdTimes[index];

    const randomClient = randomFrom(clients);
    const randomService = randomFrom(services);
    const status = randomFrom(statusPool);

    await prisma.appointment.create({
      data: {
        barberId: time.barberId,
        clientId: randomClient.id,
        serviceId: randomService.id,
        timeId: time.id,
        status,
      },
    });

    await prisma.time.update({
      where: { id: time.id },
      data: { disponible: false },
    });
  }
}

async function seedPayments(total: number) {
  const barbers = await prisma.barber.findMany({ include: { Balance: true } });
  const balances = barbers
    .map((barber) => barber.Balance)
    .filter((balance): balance is NonNullable<typeof balance> => Boolean(balance));

  if (!balances.length) return;

  const totalsByBalance = new Map<string, number>();
  for (const balance of balances) totalsByBalance.set(balance.id, 0);

  for (let index = 0; index < total; index++) {
    const balance = balances[index % balances.length];
    const amount = randomInt(20, 120);

    await prisma.payment.create({
      data: {
        balanceId: balance.id,
        amount,
      },
    });

    totalsByBalance.set(balance.id, (totalsByBalance.get(balance.id) ?? 0) + amount);
  }

  for (const [balanceId, totalAmount] of totalsByBalance.entries()) {
    await prisma.balance.update({
      where: { id: balanceId },
      data: { balance: totalAmount },
    });
  }
}

async function main() {
  const knownUsers: PublicSeedUser[] = [];

  await clearDatabase();

  const admin = await upsertUser({
    name: "Douglas",
    email: "douglas@barbearia.local",
    password: "Douglas@123",
    type: UserType.BARBER,
    telephone: "11999999999",
  });

  const barber = await upsertUser({
    name: "Carlos",
    email: "carlos@barbearia.local",
    password: "Carlos@123",
    type: UserType.BARBER,
    telephone: "11988888888",
  });

  await upsertBarberProfile(admin.id, true);
  await upsertBarberProfile(barber.id, false);

  knownUsers.push(
    {
      role: "ADMIN (barber + isAdmin=true)",
      email: "douglas@barbearia.local",
      password: "Douglas@123",
    },
    {
      role: "BARBER (barber + isAdmin=false)",
      email: "carlos@barbearia.local",
      password: "Carlos@123",
    }
  );

  const randomUsers = await createClientUsers(CLIENT_USERS_TOTAL);

  await seedServices(MIN_SERVICE_ROWS);

  const createdTimes = await seedTimes(MIN_TIME_ROWS);
  await seedAppointments(MIN_APPOINTMENT_ROWS, createdTimes);
  await seedPayments(MIN_PAYMENT_ROWS);

  const totals = await Promise.all([
    prisma.user.count(),
    prisma.barber.count(),
    prisma.client.count(),
    prisma.service.count(),
    prisma.time.count(),
    prisma.appointment.count(),
    prisma.balance.count(),
    prisma.payment.count(),
  ]);

  console.log("Seed finalizado com sucesso.");
  console.table(knownUsers);

  console.log("Usuarios clientes criados (senhas aleatorias nao exibidas):");
  console.table(
    randomUsers.map((user) => ({
      role: user.type,
      email: user.email,
    }))
  );

  console.log("Resumo do banco apos seed:");
  console.table([
    { tabela: "User", total: totals[0] },
    { tabela: "Barber", total: totals[1] },
    { tabela: "Client", total: totals[2] },
    { tabela: "Service", total: totals[3] },
    { tabela: "Time", total: totals[4] },
    { tabela: "Appointment", total: totals[5] },
    { tabela: "Balance", total: totals[6] },
    { tabela: "Payment", total: totals[7] },
  ]);
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
