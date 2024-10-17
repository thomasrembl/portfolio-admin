import { ColumnDef, TableMeta } from "@tanstack/react-table";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { ArrowUpDown } from "lucide-react";

interface CustomTableMeta extends TableMeta<Project> {
  refreshData: () => Promise<void>;
}

export const handleDelete = async (
  projectId: string,
  refreshData: () => Promise<void>
) => {
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects/delete/${projectId}`
    );
    toast({
      description: "Projet supprimé",
    });
    await refreshData();
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error);
    toast({
      description: "Erreur lors de la suppression du projet",
    });
  }
};

export const columns: ColumnDef<Project, any>[] = [
  {
    id: "title",
    accessorKey: "translation.fr.title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom du projet
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "category",
    accessorKey: "translation.fr.category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Catégorie
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const projectId = row.original._id;
      const refreshData = (table.options.meta as CustomTableMeta).refreshData;

      return (
        <div className="flex space-x-2">
          <Link href={`/project/${projectId}`}>
            <Button variant={"ghost"}>
              <Edit className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant={"destructive"}
            onClick={() => handleDelete(projectId, refreshData!)}
          >
            <Trash className="h-5 w-5" />
          </Button>
        </div>
      );
    },
  },
];
