import { ICustomerRepository, ListedCustomerDTO } from "../repositories/ICustomerRepository";

export class ListCustomers {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(): Promise<ListedCustomerDTO[]> {
    return this.customerRepository.listCustomers();
  }
}
