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
};

type PublicSeedUser = {
  role: string;
  email: string;
  password: string;
};

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

async function upsertUser(data: SeedUser) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      password: hashedPassword,
      type: data.type,
    },
    create: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      type: data.type,
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

async function upsertClientProfile(userId: string, telephone: string) {
  await prisma.client.upsert({
    where: { userId },
    update: { telephone },
    create: { userId, telephone },
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
    },
  });
}

async function createRandomUsers(total: number) {
  const created: Array<{ id: string; type: UserType; email: string }> = [];

  for (let index = 0; index < total; index++) {
    const fullName = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
    const type = Math.random() > 0.5 ? UserType.BARBER : UserType.CLIENT;
    const email = randomEmail(fullName);
    const password = randomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        type,
      },
    });

    if (type === UserType.BARBER) {
      await upsertBarberProfile(user.id, false);
    } else {
      await upsertClientProfile(
        user.id,
        `11${randomInt(900000000, 999999999)}`
      );
    }

    created.push({ id: user.id, type, email });
  }

  return created;
}

async function seedTimesAndAppointments() {
  const barbers = await prisma.barber.findMany({ include: { user: true } });
  const clients = await prisma.client.findMany();
  const services = await prisma.service.findMany();

  if (!barbers.length || !clients.length || !services.length) return;

  const createdTimes: string[] = [];
  const slotHours = [9, 10, 14, 15, 16];

  for (const barber of barbers) {
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      for (const hour of slotHours) {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        date.setHours(hour, 0, 0, 0);

        const exists = await prisma.time.findFirst({
          where: {
            barberId: barber.id,
            date,
          },
        });

        if (!exists) {
          const created = await prisma.time.create({
            data: {
              barberId: barber.id,
              date,
              disponible: true,
            },
          });
          createdTimes.push(created.id);
        }
      }
    }
  }

  const availableTimes = await prisma.time.findMany({
    where: { disponible: true },
    orderBy: { date: "asc" },
  });

  const appointmentsToCreate = Math.min(20, availableTimes.length);
  for (let index = 0; index < appointmentsToCreate; index++) {
    const time = availableTimes[index];
    const existingAppointment = await prisma.appointment.findFirst({
      where: { timeId: time.id },
    });

    if (existingAppointment) continue;

    const randomClient = randomFrom(clients);
    const randomService = randomFrom(services);
    const statusPool = [
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELED,
    ];
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

async function seedPayments() {
  const barbers = await prisma.barber.findMany({ include: { Balance: true } });

  for (const barber of barbers) {
    if (!barber.Balance) continue;

    const existingPayments = await prisma.payment.count({
      where: { balanceId: barber.Balance.id },
    });

    if (existingPayments > 0) continue;

    let total = 0;
    const quantity = randomInt(1, 3);
    for (let index = 0; index < quantity; index++) {
      const amount = randomInt(20, 120);
      total += amount;

      await prisma.payment.create({
        data: {
          balanceId: barber.Balance.id,
          amount,
        },
      });
    }

    await prisma.balance.update({
      where: { id: barber.Balance.id },
      data: {
        balance: { increment: total },
      },
    });
  }
}

async function main() {
  const knownUsers: PublicSeedUser[] = [];

  const admin = await upsertUser({
    name: "Douglas Admin",
    email: "admin@barbearia.local",
    password: "Admin@123",
    type: UserType.BARBER,
  });

  const barber = await upsertUser({
    name: "Carlos Barber",
    email: "barber@barbearia.local",
    password: "Barber@123",
    type: UserType.BARBER,
  });

  const client = await upsertUser({
    name: "Lucas Cliente",
    email: "cliente@barbearia.local",
    password: "Cliente@123",
    type: UserType.CLIENT,
  });

  const clientTwo = await upsertUser({
    name: "Marina Cliente",
    email: "cliente2@barbearia.local",
    password: "Cliente2@123",
    type: UserType.CLIENT,
  });

  await upsertBarberProfile(admin.id, true);
  await upsertBarberProfile(barber.id, false);

  await upsertClientProfile(client.id, "11999990001");
  await upsertClientProfile(clientTwo.id, "11999990002");

  knownUsers.push(
    {
      role: "ADMIN (barber + isAdmin=true)",
      email: "admin@barbearia.local",
      password: "Admin@123",
    },
    {
      role: "BARBER (barber + isAdmin=false)",
      email: "barber@barbearia.local",
      password: "Barber@123",
    },
    {
      role: "CLIENT",
      email: "cliente@barbearia.local",
      password: "Cliente@123",
    },
    {
      role: "CLIENT",
      email: "cliente2@barbearia.local",
      password: "Cliente2@123",
    }
  );

  const randomUsers = await createRandomUsers(10);

  await ensureService("Corte Tradicional", "Corte masculino tradicional", 35);
  await ensureService("Barba Completa", "Modelagem e acabamento da barba", 30);
  await ensureService("Corte + Barba", "Pacote completo", 60);
  await ensureService("Pigmentacao", "Pigmentacao de barba/cabelo", 45);
  await ensureService("Sobrancelha", "Ajuste de sobrancelha", 20);

  await seedTimesAndAppointments();
  await seedPayments();

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

  console.log("Usuarios aleatorios criados (senhas aleatorias nao exibidas):");
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
