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
const MIN_SERVICE_ROWS = 5;
const MIN_TIME_ROWS = 700;
const MIN_APPOINTMENT_ROWS = 300;
const SEED_DAYS_WINDOW = 45;

const serviceImages = {
  scissors: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#071f1c"/><stop offset="1" stop-color="#00c2a8"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><circle cx="740" cy="130" r="170" fill="#f3c76b" opacity=".22"/><path d="M284 184l160 156M444 184L284 340" stroke="#f7f0dc" stroke-width="34" stroke-linecap="round"/><circle cx="245" cy="151" r="54" fill="none" stroke="#f7f0dc" stroke-width="28"/><circle cx="245" cy="373" r="54" fill="none" stroke="#f7f0dc" stroke-width="28"/><text x="80" y="465" fill="#f7f0dc" font-family="Arial" font-size="58" font-weight="700">Corte</text></svg>`
  ),
  beard: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#151515"/><stop offset="1" stop-color="#5c3b22"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><path d="M480 120c116 0 210 86 210 192 0 104-89 174-210 174s-210-70-210-174c0-106 94-192 210-192z" fill="#f3c76b" opacity=".24"/><path d="M330 260c64 96 236 96 300 0 4 128-72 204-150 204s-154-76-150-204z" fill="#f7f0dc"/><text x="80" y="465" fill="#f7f0dc" font-family="Arial" font-size="58" font-weight="700">Barba</text></svg>`
  ),
  combo: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#061615"/><stop offset=".55" stop-color="#102f2b"/><stop offset="1" stop-color="#d5a94f"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><path d="M220 300h520" stroke="#f7f0dc" stroke-width="30" stroke-linecap="round"/><path d="M300 185l135 150M435 185L300 335" stroke="#00c2a8" stroke-width="28" stroke-linecap="round"/><path d="M600 180c65 0 118 48 118 108s-50 100-118 100-118-40-118-100 53-108 118-108z" fill="#f7f0dc" opacity=".92"/><text x="80" y="465" fill="#f7f0dc" font-family="Arial" font-size="58" font-weight="700">Corte + Barba</text></svg>`
  ),
  pigment: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#0e1014"/><stop offset="1" stop-color="#253b6d"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><rect x="170" y="120" width="620" height="250" rx="50" fill="#f7f0dc" opacity=".12"/><path d="M260 350c120-170 300-170 440 0" fill="none" stroke="#f7f0dc" stroke-width="38" stroke-linecap="round"/><path d="M290 320c110-96 265-96 380 0" fill="none" stroke="#00c2a8" stroke-width="22" stroke-linecap="round"/><text x="80" y="465" fill="#f7f0dc" font-family="Arial" font-size="58" font-weight="700">Pigmentacao</text></svg>`
  ),
  eyebrow: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#151515"/><stop offset="1" stop-color="#06453d"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><path d="M225 265c115-90 220-90 330 0M570 265c60-50 118-50 175 0" fill="none" stroke="#f7f0dc" stroke-width="34" stroke-linecap="round"/><circle cx="390" cy="320" r="34" fill="#00c2a8"/><circle cx="670" cy="320" r="34" fill="#00c2a8"/><text x="80" y="465" fill="#f7f0dc" font-family="Arial" font-size="58" font-weight="700">Sobrancelha</text></svg>`
  ),
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

function dateAtDayOffset(dayOffset: number, hour: number, minute = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function getStatusForDayOffset(dayOffset: number) {
  if (dayOffset < 0) {
    return randomInt(1, 10) <= 8
      ? AppointmentStatus.COMPLETED
      : AppointmentStatus.CANCELED;
  }

  return randomInt(1, 10) <= 9
    ? AppointmentStatus.SCHEDULED
    : AppointmentStatus.CANCELED;
}

async function clearDatabase() {
  await prisma.appointment.deleteMany();
  await prisma.time.deleteMany();
  await prisma.service.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.client.deleteMany();
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
}

async function upsertClientProfile(userId: string) {
  const client = await prisma.client.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await prisma.customer.upsert({
      where: { whatsapp: user.telephone },
      update: { name: user.name, userId: user.id },
      create: { name: user.name, whatsapp: user.telephone, userId: user.id },
    });
  }
  return client;
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
      imageData: serviceImages.scissors,
      imageMimeType: "image/svg+xml",
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
      imageData: serviceImages.scissors,
    },
    {
      name: "Barba Completa",
      description: "Modelagem e acabamento da barba",
      price: 200,
      imageData: serviceImages.beard,
    },
    {
      name: "Corte + Barba",
      description: "Pacote completo",
      price: 200,
      imageData: serviceImages.combo,
    },
    {
      name: "Pigmentacao",
      description: "Pigmentacao de barba/cabelo",
      price: 200,
      imageData: serviceImages.pigment,
    },
    {
      name: "Sobrancelha",
      description: "Ajuste de sobrancelha",
      price: 200,
      imageData: serviceImages.eyebrow,
    },
  ];

  for (const service of baseServices) {
    const existing = await ensureService(service.name, service.description, service.price);
    await prisma.service.update({
      where: { id: existing.id },
      data: {
        imageData: service.imageData,
        imageMimeType: "image/svg+xml",
      },
    });
  }
}

async function seedTimes(total: number) {
  const barbers = await prisma.barber.findMany();
  if (!barbers.length) return [];

  const createdTimes: Array<{ id: string; barberId: string; date: Date }> = [];
  const slotHours = [8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19];
  const dayOffsets = Array.from(
    { length: SEED_DAYS_WINDOW * 2 + 1 },
    (_, index) => index - SEED_DAYS_WINDOW
  );

  for (let index = 0; index < total; index++) {
    const slotCycle = Math.floor(index / dayOffsets.length);
    const barber = barbers[slotCycle % barbers.length];
    const dayOffset = dayOffsets[index % dayOffsets.length];
    const hour = slotHours[Math.floor(slotCycle / barbers.length) % slotHours.length];
    const date = dateAtDayOffset(dayOffset, hour);

    const created = await prisma.time.create({
      data: {
        barberId: barber.id,
        date,
        disponible: true,
      },
    });

    createdTimes.push({ id: created.id, barberId: created.barberId, date: created.date });
  }

  return createdTimes;
}

async function seedAppointments(
  total: number,
  createdTimes: Array<{ id: string; barberId: string; date: Date }>
) {
  const clients = await prisma.client.findMany({ include: { user: { include: { customer: true } } } });
  const services = await prisma.service.findMany();
  const barbers = await prisma.barber.findMany({ include: { user: true } });

  if (!createdTimes.length || !clients.length || !services.length) return;

  const sortedTimes = [...createdTimes].sort((a, b) => a.date.getTime() - b.date.getTime());
  const pastTimes = sortedTimes.filter((time) => time.date < dateAtDayOffset(0, 0));
  const todayTimes = sortedTimes.filter(
    (time) => time.date >= dateAtDayOffset(0, 0) && time.date < dateAtDayOffset(1, 0)
  );
  const futureTimes = sortedTimes.filter((time) => time.date >= dateAtDayOffset(1, 0));
  const targetPast = Math.floor(total * 0.45);
  const targetToday = Math.min(todayTimes.length, Math.max(0, Math.floor(total * 0.1)));
  const targetFuture = total - targetPast - targetToday;
  const mixedTimes = [
    ...pastTimes.slice(0, targetPast),
    ...todayTimes.slice(0, targetToday),
    ...futureTimes.slice(0, targetFuture),
  ].slice(0, total);

  const appointmentsToCreate = Math.min(total, mixedTimes.length);
  for (let index = 0; index < appointmentsToCreate; index++) {
    const time = mixedTimes[index];

    const randomClient = randomFrom(clients);
    const randomService = randomFrom(services);
    const barber = barbers.find((item) => item.id === time.barberId);
    if (!randomClient.user.customer || !barber) continue;
    const dayOffset = Math.round(
      (time.date.getTime() - dateAtDayOffset(0, 0).getTime()) / (24 * 60 * 60 * 1000)
    );
    const status = getStatusForDayOffset(dayOffset);

    await prisma.appointment.create({
      data: {
        barberId: time.barberId,
        clientId: randomClient.id,
        customerId: randomClient.user.customer.id,
        serviceId: randomService.id,
        timeId: time.id,
        price: randomService.price,
        customerName: randomClient.user.customer.name,
        customerWhatsapp: randomClient.user.customer.whatsapp,
        barberName: barber.user.name,
        barberWhatsapp: barber.user.telephone,
        serviceName: randomService.name,
        scheduledAt: time.date,
        status,
      },
    });

    await prisma.time.update({
      where: { id: time.id },
      data: { disponible: false },
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

  const client = await upsertUser({
    name: "Yuri Cliente",
    email: "cliente@barbearia.local",
    password: "Cliente@123",
    type: UserType.CLIENT,
    telephone: "11977777777",
  });

  await upsertClientProfile(client.id);

  knownUsers.push({
    role: "CLIENT",
    email: "cliente@barbearia.local",
    password: "Cliente@123",
  });

  await seedServices(MIN_SERVICE_ROWS);

  const createdTimes = await seedTimes(MIN_TIME_ROWS);
  await seedAppointments(MIN_APPOINTMENT_ROWS, createdTimes);

  const totals = await Promise.all([
    prisma.user.count(),
    prisma.barber.count(),
    prisma.client.count(),
    prisma.customer.count(),
    prisma.service.count(),
    prisma.time.count(),
    prisma.appointment.count(),
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
    { tabela: "Customer", total: totals[3] },
    { tabela: "Service", total: totals[4] },
    { tabela: "Time", total: totals[5] },
    { tabela: "Appointment", total: totals[6] },
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
