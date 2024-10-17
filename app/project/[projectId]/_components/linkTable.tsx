"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash } from "lucide-react";

interface Link {
  _id: string;
  name: string;
  url: string;
}

interface LinkTableProps {
  data: Link[];
  edit: (link: Link) => void;
  onDelete: (linkId: string) => Promise<void>;
}

export const LinkTable = ({ data, edit, onDelete }: LinkTableProps) => {
  return (
    <Table>
      <TableCaption>Liste des liens</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Nom</TableHead>
          <TableHead className="">Lien</TableHead>
          <TableHead className="w-[30px]"></TableHead>
          <TableHead className="w-[30px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((link) => (
          <TableRow key={link._id}>
            <TableCell className="font-medium">{link.name}</TableCell>
            <TableCell>{link.url}</TableCell>
            <TableCell>
              <Button variant="ghost" onClick={() => edit(link)}>
                <Edit2 className="h-5 w-5" />
              </Button>
            </TableCell>
            <TableCell>
              <Button variant="destructive" onClick={() => onDelete(link._id)}>
                <Trash className="h-5 w-5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
