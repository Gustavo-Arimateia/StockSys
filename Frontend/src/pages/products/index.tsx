import { Plus } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <div
          className="
            flex flex-col gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <Badge variant="success">
              Layout configurado
            </Badge>

            <h2
              className="
                mt-3
                text-lg font-semibold
                text-text
              "
            >
              Área de produtos pronta para integração
            </h2>

            <p
              className="
                mt-1
                max-w-2xl
                text-sm leading-6
                text-text-secondary
              "
            >
              Na próxima etapa vamos conectar
              esta tela à API e substituir este
              conteúdo pela listagem real de
              produtos.
            </p>
          </div>

          <Button className="shrink-0">
            <Plus size={18} />

            Novo produto
          </Button>
        </div>
      </Card>
    </div>
  );
}