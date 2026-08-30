"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Store, ClipboardList, Wrench, Tag, LogOut } from "lucide-react";

const items = [
  { icon: LayoutGrid,    label: "Painel",      href: "/dashboard/admin" },
  { icon: Users,         label: "Usuários",    href: "/dashboard/admin/usuarios" },
  { icon: Store,         label: "Feiras",      href: "/dashboard/admin/feiras" },
  { icon: ClipboardList, label: "Inscrições",  href: "/dashboard/admin/inscricoes" },
  { icon: Tag,           label: "Categorias",  href: "/dashboard/admin/categorias" },
  { icon: Wrench,        label: "Serviços",    href: "/dashboard/admin/servicos" },
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <span className="text-xl font-bold text-primary">Feirinha</span>
        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Admin</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <form action="/auth/logout" method="post">
          <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}