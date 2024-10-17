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

interface Image {
  _id: string;
  alt: string;
  url: string;
  textId: string;
}

interface ImageTableProps {
  data: Image[];
  edit: (image: Image) => void;
  onDelete: (linkId: string, image: string) => Promise<void>;
}

export const ImageTable = ({ data, edit, onDelete }: ImageTableProps) => {
  return (
    <Table>
      <TableCaption>Liste des images</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Alt</TableHead>
          <TableHead className="">Lien</TableHead>
          <TableHead className="w-[30px]"></TableHead>
          <TableHead className="w-[30px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((image) => (
          <TableRow key={image._id}>
            <TableCell className="font-medium">{image.alt}</TableCell>
            <TableCell>{image.url}</TableCell>
            <TableCell>
              <Button variant="ghost" onClick={() => edit(image)}>
                <Edit2 className="h-5 w-5" />
              </Button>
            </TableCell>
            <TableCell>
              <Button
                variant="destructive"
                onClick={() => onDelete(image._id, image.textId)}
              >
                <Trash className="h-5 w-5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
