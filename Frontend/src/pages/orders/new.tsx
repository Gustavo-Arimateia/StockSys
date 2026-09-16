import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <Card>
        <Badge variant="info">
          Em desenvolvimento
        </Badge>

        <p className="mt-3 text-sm text-text-secondary">
          O formulário de criação de pedidos
          será implementado em uma etapa futura.
        </p>
      </Card>
    </div>
  );
}