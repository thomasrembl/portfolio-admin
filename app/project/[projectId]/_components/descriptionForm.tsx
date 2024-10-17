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
import { Textarea } from "@/components/ui/textarea";

interface BaseFormProps {
  params: Project;
}

const formSchema = z.object({
  descriptionText: z.string().min(1, {
    message: "Description is required",
  }),
});

const translateText = async (text: string) => {
  console.log("traduction");
  const apiUrl = process.env.NEXT_PUBLIC_DEEPL_API_URL as string;
  const apiKey = process.env.NEXT_PUBLIC_DEEPL_API_KEY as string;

  const response = await axios.post(apiUrl, null, {
    params: {
      auth_key: apiKey,
      text: text,
      target_lang: "EN",
    },
  });
  return response.data.translations[0].text;
};

export const DescriptionForm = ({ params }: BaseFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descriptionText: params.translation.fr.descriptionText,
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const translatedDescription = await translateText(data.descriptionText);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/getbyid/${params._id}`
      );
      const existingProject = response.data;

      const updatedTranslation = {
        fr: {
          ...existingProject.translation.fr,
          descriptionText: data.descriptionText,
        },
        en: {
          ...existingProject.translation.en,
          descriptionText: translatedDescription,
        },
      };
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/update/${params._id}`,
        {
          translation: updatedTranslation,
        }
      );
      toast({
        description: "Description modifié",
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
        className="flex items-end gap-4 "
      >
        <FormField
          control={form.control}
          name="descriptionText"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Project desciption"
                  {...field}
                  disabled={isSubmitting}
                />
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
