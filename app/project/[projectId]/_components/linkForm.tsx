"use client";
import { Project } from "@/types/project";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkTable } from "./linkTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LinkEdit } from "./linkEdit";

interface Link {
  _id: string;
  name: string;
  url: string;
}

interface BaseFormProps {
  params: Project;
}

export const LinkForm = ({ params }: BaseFormProps) => {
  const [data, setData] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const getProject = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/links/${params._id}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des liens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProject();
  }, [params._id]);

  const handleDelete = async (linkId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/links/${params._id}/delete/${linkId}`
      );
      setData((prevData) => prevData.filter((link) => link._id !== linkId));
    } catch (error) {
      console.error("Erreur lors de la suppression du lien:", error);
    }
  };

  const handleAddLinkClick = () => {
    setIsEditing(true);
    setEditingLink(null);
  };

  const handleEditLinkClick = (link: Link) => {
    setIsEditing(true);
    setEditingLink(link);
  };

  const handleCancelAddLinkClick = () => {
    setIsEditing(false);
    setEditingLink(null);
  };

  if (loading) {
    return (
      <div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <Card className="w-[50%]">
      <CardHeader>
        <CardTitle>Liens</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {!isEditing ? (
          <>
            <Button className="w-fit" onClick={handleAddLinkClick}>
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un lien
            </Button>
            <LinkTable
              data={data}
              onDelete={handleDelete}
              edit={handleEditLinkClick}
            />
          </>
        ) : (
          <LinkEdit
            params={params}
            cancel={handleCancelAddLinkClick}
            link={editingLink}
          />
        )}
      </CardContent>
    </Card>
  );
};
