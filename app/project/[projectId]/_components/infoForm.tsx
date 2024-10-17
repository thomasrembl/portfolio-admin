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
  informationText: z.string().min(1, {
    message: "Information is required",
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

export const InfoForm = ({ params }: BaseFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      informationText: params.translation.fr.informationText,
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const translatedInfo = await translateText(data.informationText);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/getbyid/${params._id}`
      );
      const existingProject = response.data;

      const updatedTranslation = {
        fr: {
          ...existingProject.translation.fr,
          informationText: data.informationText,
        },
        en: {
          ...existingProject.translation.en,
          informationText: translatedInfo,
        },
      };
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/update/${params._id}`,
        {
          translation: updatedTranslation,
        }
      );
      toast({
        description: "Information modifié",
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
          name="informationText"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Information</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Project Information"
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
