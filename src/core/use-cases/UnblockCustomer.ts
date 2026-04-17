import { Customer } from "../entities/Customer";
import { AppError } from "../errors/AppError";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ICustomerRepository } from "../repositories/ICustomerRepository";

export class UnblockCustomer {
  constructor(
    private customerRepository: ICustomerRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(customerId: string, barberUserId: string): Promise<Customer> {
    const barber = await this.barberRepository.findByUserId(barberUserId);
    if (!barber || !barber.isAdmin) {
      throw new AppError("Acesso permitido apenas para administradores", 403);
    }

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError("Cliente não encontrado", 404);
    }

    return this.customerRepository.unblock(customerId);
  }
}
