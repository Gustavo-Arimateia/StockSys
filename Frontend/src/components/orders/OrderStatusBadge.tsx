import Badge from "@/components/ui/Badge";
import { OrderStatus } from "@/types/order";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  switch (status) {
    case OrderStatus.Pending:
      return <Badge variant="warning">Pendente</Badge>;

    case OrderStatus.Processing:
      return <Badge variant="info">Em processamento</Badge>;

    case OrderStatus.Completed:
      return <Badge variant="success">Concluído</Badge>;

    case OrderStatus.Cancelled:
      return <Badge variant="danger">Cancelado</Badge>;

    default:
      return <Badge variant="neutral">Desconhecido</Badge>;
  }
}