"use client";
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
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface Image {
  _id: string;
  alt: string;
  url: string;
  textId: string;
}

interface ImageEditProps {
  params: Project;
  cancel: () => void;
  image: Image | null;
}

const translateText = async (text: string) => {
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

export const ImageEdit = ({ params, cancel, image }: ImageEditProps) => {
  const router = useRouter();
  const [url, setUrl] = useState<File | null>(null);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [placeholder, setPlaceholder] = useState(null);

  useEffect(() => {
    const getTrad = async () => {
      if (image) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/projects/images-text/${params._id}/getbyid/${image.textId}`
          );
          const result = await response.data;
          const place = result.frImageText.text;
          setPlaceholder(place);
        } catch {
          console.error("Erreur lors de la récupération des traductions");
        }
      }
    };

    getTrad();
  }, [image, params._id]);

  const dynamicSchema = z.object({
    alt: z.string().min(1, { message: "Nom est requis" }),
    url: z
      .any()
      .refine(
        (file) =>
          typeof window !== "undefined" &&
          (file instanceof File || file === null),
        { message: "Veuillez télécharger une image valide." }
      ),
    frtext: isCheckboxChecked
      ? z.string().min(1, { message: "Le texte français est requis." })
      : z.string().optional(),
  });

  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      alt: image ? image.alt : "",
      url: image ? image.url : "",
      frtext: image ? (placeholder !== null ? placeholder : undefined) : "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const handleTextUpload = async (frText: string, enText: string) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/images-text/${params._id}`,
        {
          frText: frText,
          enText: enText,
        }
      );
      const result = await response.data;
      return result.uuid;
    } catch (error) {
      console.error("Erreur lors de l'upload du texte : ", error);
    }
  };

  const handleTextEdit = async (
    frText: string,
    enText: string,
    textId: string
  ) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/images-text/${params._id}/edit/${textId}`,
        {
          frText: frText,
          enText: enText,
        }
      );
      const result = await response.data;
      toast({
        description: "Text modifié",
      });
      return result.uuid;
    } catch (error) {
      console.error("Erreur lors de l'upload du texte : ", error);
    }
  };

  const handleImageUpload = async () => {
    if (!url) {
      toast({
        variant: "destructive",
        description: "Veuillez sélectionner une image",
      });
      return null;
    }

    const reader = new FileReader();
    reader.readAsDataURL(url);

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
          if (result.url.includes(".mp4")) {
            resolve(result.publicId);
          } else {
            resolve(result.url);
          }
        } catch (error) {
          console.error("Erreur lors de l'upload : ", error);
          reject(null);
        }
      };
    });
  };
  const onSubmit = async (data: z.infer<typeof dynamicSchema>) => {
    try {
      const uploadedImageUrl = await handleImageUpload();

      if (!uploadedImageUrl) {
        toast({
          variant: "destructive",
          description: "Une erreur s'est produite lors de l'upload de l'image",
        });
        return;
      }
      if (image) {
        let enText = "";
        let textId = "";
        if (isCheckboxChecked) {
          if (data.frtext) {
            enText = await translateText(data.frtext);
            textId = await handleTextEdit(data.frtext, enText, image.textId);
          }
        } else {
          if (image.textId) {
            textId = await handleTextEdit("", "", image.textId);
          }
        }
        const imageApi = `${process.env.NEXT_PUBLIC_API_URL}/api/projects/images/${params._id}/edit/${image._id}`;
        await axios.put(imageApi, {
          url: uploadedImageUrl,
          alt: data.alt,
          textId: textId,
        });
      } else {
        let enText = "";
        let textId = "";
        if (isCheckboxChecked) {
          if (data.frtext) {
            enText = await translateText(data.frtext);
            textId = await handleTextUpload(data.frtext, enText);
          }
        } else {
          textId = await handleTextUpload("", "");
        }
        const imageApi = `${process.env.NEXT_PUBLIC_API_URL}/api/projects/images/${params._id}/add`;
        await axios.put(imageApi, {
          url: uploadedImageUrl,
          alt: data.alt,
          textId: textId,
        });
      }
      toast({
        description: "Image modifiée",
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
          name="alt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alt</FormLabel>
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
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image du projet</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setUrl(file);
                    field.onChange(file);
                  }}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2 w-full">
          <FormField
            control={form.control}
            name="frtext"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texte Français</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Texte en français"
                    {...field}
                    disabled={isSubmitting || !isCheckboxChecked}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isCheckboxChecked}
              onCheckedChange={(checked) => setIsCheckboxChecked(!!checked)}
            />
            <p>L&apos;image contient du texte</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={!isValid || isSubmitting}>
            Modifier
          </Button>
          <Button type="button" variant="outline" onClick={cancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
};
