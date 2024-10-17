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
import { Input } from "@/components/ui/input";
import { Project } from "@/types/project";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export interface Link {
  _id: string;
  name: string;
  url: string;
}

interface LinkEditProps {
  params: Project;
  cancel: () => void;
  link: Link | null;
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Nom est requis",
  }),
  url: z.string().url("Doit être une URL valide"),
});

export const LinkEdit = ({ params, cancel, link }: LinkEditProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: link ? link.name : "",
      url: link ? link.url : "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const url = link
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/links/${params._id}/edit/${link._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/projects/links/${params._id}/add`;

      await axios[link ? "put" : "put"](url, data);
      toast({
        description: link ? "Lien modifié" : "Lien ajouté",
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Une erreur s'est produite",
      });
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 items-end"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nom du lien"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="URL du lien"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {link ? "Modifier" : "Ajouter"}{" "}
          </Button>
          <Button type="button" variant={"outline"} onClick={cancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
};
