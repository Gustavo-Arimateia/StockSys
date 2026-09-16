import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <Badge variant="warning">
          Em desenvolvimento
        </Badge>

        <p className="mt-3 text-sm text-text-secondary">
          A listagem de pedidos será
          implementada após a área de produtos.
        </p>
      </Card>
    </div>
  );
}