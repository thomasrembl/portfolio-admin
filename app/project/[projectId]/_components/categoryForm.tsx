import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseFormProps {
  params: Project;
}

const formSchema = z.object({
  category: z.enum(["personnal", "school", "work"], {
    required_error: "Please select a category to display.",
  }),
});

export const CategoryForm = ({ params }: BaseFormProps) => {
  const router = useRouter();
  let defaultCategory: "personnal" | "school" | "work" = "personnal";
  if (params.translation.fr.category.includes("personnel")) {
    defaultCategory = "personnal";
  } else if (params.translation.fr.category.includes("scolaire")) {
    defaultCategory = "school";
  } else if (params.translation.fr.category.includes("Entreprise")) {
    defaultCategory = "work";
  } else {
    defaultCategory = "personnal";
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: defaultCategory,
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      let categorieFr = "";
      let categorieEn = "";
      const currentYear = new Date().getFullYear();
      if (data.category === "personnal") {
        categorieFr = "Projet personnel " + currentYear;
      } else if (data.category === "school") {
        categorieFr = "Projet scolaire " + currentYear;
      } else if (data.category === "work") {
        categorieFr = "Entreprise " + currentYear;
      } else {
        throw new Error("Invalid category");
      }
      if (data.category === "personnal") {
        categorieEn = "Personnal project " + currentYear;
      } else if (data.category === "school") {
        categorieEn = "School project " + currentYear;
      } else if (data.category === "work") {
        categorieEn = "Work " + currentYear;
      } else {
        throw new Error("Invalid category");
      }
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/getbyid/${params._id}`
      );
      const existingProject = response.data;
      const updatedTranslation = {
        fr: {
          ...existingProject.translation.fr,
          category: categorieFr,
        },
        en: {
          ...existingProject.translation.en,
          category: categorieEn,
        },
      };
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/update/${params._id}`,
        {
          translation: updatedTranslation,
        }
      );
      toast({
        description: "Catégorie modifié",
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Une erreur c'est produite",
      });
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-end gap-4"
      >
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p className=" font-semibold text-xs text-cod-gray-950">
                  Catégorie
                </p>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personnal">Projet personnel</SelectItem>
                    <SelectItem value="school">Ecole</SelectItem>
                    <SelectItem value="work">Entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!isValid || isSubmitting}>
          Modifer
        </Button>
      </form>
    </Form>
  );
};
