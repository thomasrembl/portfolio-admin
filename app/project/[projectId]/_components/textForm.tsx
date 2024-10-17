import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";
import { DescriptionForm } from "./descriptionForm";
import { InfoForm } from "./infoForm";

interface BaseFormProps {
  params: Project;
}

export const TextForm = ({ params }: BaseFormProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Texte</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 h-full">
        <DescriptionForm params={params} />
        <InfoForm params={params} />
      </CardContent>
    </Card>
  );
};
