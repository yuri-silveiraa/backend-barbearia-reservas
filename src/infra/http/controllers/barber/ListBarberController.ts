import { ListBarber } from "../../../../core/use-cases/ListBarber";
import { BarberResponseSchema } from "../../schemas/output/BarberResponse.schema";

export class ListBarberController {
  constructor(private listBarber: ListBarber) {}

  async handle(req, res) {
    const barber = await this.listBarber.execute();
    const data = BarberResponseSchema.parse(barber);
    return res.status(200).json(data);
  }
}