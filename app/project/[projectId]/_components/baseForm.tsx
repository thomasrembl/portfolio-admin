import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";
import { TitleForm } from "./titleForm";
import { SlugForm } from "./slugForm";
import { CategoryForm } from "./categoryForm";
import { ImageForm } from "./imageForm";

interface BaseFormProps {
  params: Project;
}

export const BaseForm = ({ params }: BaseFormProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Info de base</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <TitleForm params={params} />
        <SlugForm params={params} />
        <CategoryForm params={params} />
        <ImageForm params={params} />
      </CardContent>
    </Card>
  );
};
