"use client";
import { Project } from "@/types/project";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ImageTable } from "./imageTable";
import { ImageEdit } from "./imageEdit";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Image {
  _id: string;
  alt: string;
  url: string;
  textId: string;
}

interface BaseFormProps {
  params: Project;
}

export const ImageThreadForm = ({ params }: BaseFormProps) => {
  const router = useRouter();
  const [data, setData] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);

  const getProject = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/images/${params._id}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProject();
  }, [params._id]);

  const handleDelete = async (imageId: string, textId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/images/${params._id}/delete/${imageId}`
      );
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/images-text/${params._id}/delete/${textId}`
      );
      toast({
        description: "Image supprimer",
      });
      setData((prevData) => prevData.filter((image) => image._id !== imageId));
    } catch (error) {
      console.error("Erreur lors de la suppression du lien:", error);
    }
  };

  const handleAddLinkClick = () => {
    setIsEditing(true);
    setEditingImage(null);
  };

  const handleEditLinkClick = (image: Image) => {
    setIsEditing(true);
    setEditingImage(image);
  };

  const handleCancelAddLinkClick = () => {
    setIsEditing(false);
    setEditingImage(null);
  };

  if (loading) {
    return (
      <div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {!isEditing ? (
          <>
            <Button className="w-fit" onClick={handleAddLinkClick}>
              <Plus className="h-5 w-5 mr-2" />
              Ajouter une image
            </Button>
            <div className="max-h-[300px] no-scrollbar overflow-y-scroll mt-2 ">
              <ImageTable
                data={data}
                onDelete={handleDelete}
                edit={handleEditLinkClick}
              />
            </div>
          </>
        ) : (
          <div className="  mt-2">
            <ImageEdit
              params={params}
              cancel={handleCancelAddLinkClick}
              image={editingImage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
