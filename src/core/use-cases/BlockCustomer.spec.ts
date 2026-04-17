import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeCustomerRepository } from "../../tests/repositories/FakeCustomerRepository";
import { BlockCustomer } from "./BlockCustomer";
import { UnblockCustomer } from "./UnblockCustomer";

describe("BlockCustomer", () => {
  it("deve permitir admin bloquear e desbloquear cliente", async () => {
    const customerRepository = new FakeCustomerRepository();
    const barberRepository = new FakeBarberRepository();
    const admin = await barberRepository.create({ userId: "admin-user-1", isAdmin: true });
    const customer = await customerRepository.findOrCreateByWhatsapp({
      name: "Yuri Pires",
      whatsapp: "11912345678",
    });

    const blockCustomer = new BlockCustomer(customerRepository, barberRepository);
    const unblockCustomer = new UnblockCustomer(customerRepository, barberRepository);

    const blocked = await blockCustomer.execute(customer.id, "admin-user-1", "Faltas sem aviso");

    expect(blocked.blockedAt).toBeInstanceOf(Date);
    expect(blocked.blockedByBarberId).toBe(admin.id);
    expect(blocked.blockedReason).toBe("Faltas sem aviso");

    const unblocked = await unblockCustomer.execute(customer.id, "admin-user-1");

    expect(unblocked.blockedAt).toBeNull();
    expect(unblocked.blockedByBarberId).toBeNull();
    expect(unblocked.blockedReason).toBeNull();
  });

  it("deve impedir barbeiro sem admin de bloquear cliente", async () => {
    const customerRepository = new FakeCustomerRepository();
    const barberRepository = new FakeBarberRepository();
    await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const customer = await customerRepository.findOrCreateByWhatsapp({
      name: "Yuri Pires",
      whatsapp: "11912345678",
    });
    const blockCustomer = new BlockCustomer(customerRepository, barberRepository);

    await expect(blockCustomer.execute(customer.id, "barber-user-1")).rejects.toThrow(
      "Acesso permitido apenas para administradores"
    );
  });
});
