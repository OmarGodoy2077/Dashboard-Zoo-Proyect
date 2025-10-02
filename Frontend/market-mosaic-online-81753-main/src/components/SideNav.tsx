import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserMenu } from "./UserMenu";

import {
    LayoutDashboard,
    Users,
    ClipboardList,
    Utensils,
    Ticket,
    Car,
    Briefcase,
    FileText,
    Stethoscope,
    Tag
  } from "lucide-react";

export function SideNav({ className }: { className?: string }) {
  return (
    <div className={cn("pb-12 border-r flex flex-col h-screen", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-4 px-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Jungle Planet
            </h2>
            <UserMenu />
          </div>
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-2 rounded-lg",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )
              }
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/animales"
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-2 rounded-lg",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )
              }
            >
              <Users className="mr-2 h-4 w-4" />
              Animales
            </NavLink>
            <NavLink
              to="/alimentos"
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-2 rounded-lg",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )
              }
            >
              <Utensils className="mr-2 h-4 w-4" />
              Alimentos
            </NavLink>
            <NavLink
                to="/limpieza"
                className={({ isActive }) =>
                    cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )
                }
                >
                <ClipboardList className="mr-2 h-4 w-4" />
                Limpieza
                </NavLink>
            <NavLink
                to="/clinico"
                className={({ isActive }) =>
                    cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )
                }
                >
                <Stethoscope className="mr-2 h-4 w-4" />
                Tratamientos Médicos
                </NavLink>
            <NavLink
                to="/promociones"
                className={({ isActive }) =>
                    cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )
                }
                >
                <Tag className="mr-2 h-4 w-4" />
                Promociones
                </NavLink>
            <NavLink
                to="/entradas"
                className={({ isActive }) =>
                    cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )
                }
                >
                <Ticket className="mr-2 h-4 w-4" />
                Entradas / Visitantes
                </NavLink>
            <NavLink
                to="/rrhh"
                className={({ isActive }) =>
                    cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )
                }
                >
                <Briefcase className="mr-2 h-4 w-4" />
                Recursos Humanos
                </NavLink>
            <NavLink
                to="/reportes"
                className={({ isActive }) =>
                    cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )
                }
                >
                <FileText className="mr-2 h-4 w-4" />
                Reportes
                </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
