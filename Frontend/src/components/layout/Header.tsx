import { Menu } from "lucide-react";
import { useRouter } from "next/router";

type HeaderProps = {
  onMenuClick: () => void;
};

type PageInformation = {
  title: string;
  description: string;
};

function getPageInformation(pathname: string): PageInformation {
  if (pathname === "/orders/new") {
    return {
      title: "Novo pedido",
      description: "Selecione os produtos e quantidades do pedido."
    };
  }

  if (pathname.startsWith("/orders")) {
    return {
      title: "Pedidos",
      description: "Acompanhe e gerencie os pedidos cadastrados."
    };
  }

  if (pathname === "/products/new") {
    return {
      title: "Novo produto",
      description: "Cadastre um novo produto no estoque."
    };
  }

  if (pathname === "/products/[id]/edit") {
    return {
      title: "Editar produto",
      description: "Atualize as informações do produto selecionado."
    };
  }

  if (pathname.startsWith("/products")) {
    return {
      title: "Produtos",
      description: "Gerencie os produtos disponíveis no estoque."
    };
  }

  return {
    title: "StockSys",
    description: "Sistema de gestão de estoque e pedidos."
  };
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useRouter();
  const page = getPageInformation(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[76px] w-full max-w-[1600px] items-center px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="mr-3 flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text transition-colors hover:bg-surface-secondary lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-text">{page.title}</h1>
          <p className="mt-0.5 truncate text-sm text-text-secondary">{page.description}</p>
        </div>
      </div>
    </header>
  );
}