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
import { useState } from "react";

interface BaseFormProps {
  params: Project;
}

const formSchema = z.object({
  image: z
    .any()
    .refine(
      (file) =>
        typeof window !== "undefined" &&
        (file instanceof File || file === null),
      {
        message: "Please upload a valid image.",
      }
    ),
});

export const ImageForm = ({ params }: BaseFormProps) => {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: null,
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const handleImageUpload = async () => {
    if (!image) {
      toast({
        variant: "destructive",
        description: "Selectionne une image",
      });
      return null;
    }

    const reader = new FileReader();
    reader.readAsDataURL(image);

    return new Promise<string | null>((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/projects/upload`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ data: reader.result }),
            }
          );

          const result = await res.json();
          console.log("Image URL:", result.url);
          resolve(result.url);
        } catch (error) {
          console.error("Upload error: ", error);
          reject(null);
        }
      };
    });
  };

  const onSubmit = async () => {
    try {
      const uploadedImageUrl = await handleImageUpload();

      if (!uploadedImageUrl) {
        toast({
          variant: "destructive",
          description:
            "Oups une erreur s'est produite avec l'upload de l'image",
        });
        return;
      }
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/update/${params._id}`,
        {
          imgCover: uploadedImageUrl,
        }
      );
      toast({
        description: "Image modifié",
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
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p className=" font-semibold text-xs text-cod-gray-950">
                  Image du projet
                </p>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    field.onChange(file);
                  }}
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
