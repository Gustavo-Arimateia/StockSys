import Link from "next/link";
import { useRouter } from "next/router";

import {
  Boxes,
  ClipboardList,
  Package,
  ShoppingCart,
  X,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavigationItemProps = {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
};

function NavigationItem({
  href,
  label,
  active,
  icon,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3
        rounded-lg px-3 py-2.5
        text-sm font-medium
        transition-colors
        ${
          active
            ? "bg-sidebar-active text-white"
            : "text-white/75 hover:bg-sidebar-hover hover:text-white"
        }
      `}
    >
      {icon}

      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const { pathname } = useRouter();

  const isProductsActive =
    pathname.startsWith("/products");

  const isNewOrderActive =
    pathname === "/orders/new";

  const isOrdersActive =
    pathname.startsWith("/orders") &&
    pathname !== "/orders/new";

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex w-64 flex-col
        bg-sidebar text-white
        shadow-xl
        transition-transform duration-200
        lg:translate-x-0
        ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >
      <div
        className="
          flex h-[76px]
          items-center justify-between
          border-b border-white/10
          px-5
        "
      >
        <Link
          href="/products"
          className="flex min-w-0 items-center gap-3"
          onClick={onClose}
        >
          <span
            className="
              flex size-10 shrink-0
              items-center justify-center
              rounded-xl
              bg-white/10
              text-sky-300
            "
          >
            <Boxes
              size={23}
              strokeWidth={2}
            />
          </span>

          <span className="min-w-0">
            <strong
              className="
                block
                text-base font-bold
                leading-tight
                text-white
              "
            >
              StockSys
            </strong>

            <span
              className="
                mt-0.5 block
                text-xs text-white/55
              "
            >
              Gestão de estoque
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="
            flex size-9
            items-center justify-center
            rounded-lg
            text-white/70
            transition-colors
            hover:bg-white/10
            hover:text-white
            lg:hidden
          "
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <X size={21} />
        </button>
      </div>

      <nav
        className="
          flex flex-1 flex-col
          gap-1
          px-4 py-6
        "
      >
        <span
          className="
            mb-2 px-3
            text-[11px] font-semibold
            uppercase
            tracking-[0.12em]
            text-white/40
          "
        >
          Operações
        </span>

        <NavigationItem
          href="/products"
          label="Produtos"
          active={isProductsActive}
          icon={<Package size={19} />}
        />

        <NavigationItem
          href="/orders/new"
          label="Novo pedido"
          active={isNewOrderActive}
          icon={<ShoppingCart size={19} />}
        />

        <NavigationItem
          href="/orders"
          label="Pedidos"
          active={isOrdersActive}
          icon={<ClipboardList size={19} />}
        />
      </nav>

      <div
        className="
          border-t border-white/10
          px-5 py-4
        "
      >
        <span
          className="
            block
            text-sm font-medium
            text-white/75
          "
        >
          StockSys
        </span>

        <span
          className="
            mt-0.5 block
            text-xs text-white/40
          "
        >
          Fullstack Challenge
        </span>
      </div>
    </aside>
  );
}