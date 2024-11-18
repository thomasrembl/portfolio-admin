"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  category: z.enum(["personnal", "school", "work"], {
    required_error: "Please select a category to display.",
  }),
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
const titleToSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

const translateText = async (text: string, targetLang: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_DEEPL_API_URL as string;
  const apiKey = process.env.NEXT_PUBLIC_DEEPL_API_KEY as string;

  const response = await axios.post(apiUrl, null, {
    params: {
      auth_key: apiKey,
      text: text,
      target_lang: targetLang.toUpperCase(),
    },
  });

  return response.data.translations[0].text;
};

const Create = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "personnal",
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
      const slug = titleToSlug(values.title);

      const translatedTitle = await translateText(values.title, "EN");

      let categorieFr = "";
      let categorieEn = "";
      const currentYear = new Date().getFullYear();
      if (values.category === "personnal") {
        categorieFr = "Projet personnel " + currentYear;
      } else if (values.category === "school") {
        categorieFr = "Projet scolaire " + currentYear;
      } else if (values.category === "work") {
        categorieFr = "Entreprise " + currentYear;
      } else {
        throw new Error("Invalid category");
      }
      if (values.category === "personnal") {
        categorieEn = "Personnal project " + currentYear;
      } else if (values.category === "school") {
        categorieEn = "School project " + currentYear;
      } else if (values.category === "work") {
        categorieEn = "Work " + currentYear;
      } else {
        throw new Error("Invalid category");
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/create`,
        {
          slug: slug,
          imgCover: uploadedImageUrl,
          translation: {
            fr: {
              title: values.title,
              category: categorieFr,
            },
            en: {
              title: translatedTitle,
              category: categorieEn,
            },
          },
        }
      );

      toast({
        description: "Projet créé avec succès",
      });

      router.push(`/project/${response.data._id}`);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        description: "Oups une erreur s'est produite",
      });
    }
  };

  return (
    <main className="flex justify-center items-center h-[100%]">
      <Card>
        <CardHeader>
          <CardTitle>Créer un projet</CardTitle>
          <CardDescription>Ajouter les infos essentiels</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=" flex flex-col gap-5 w-full"
              >
                <div className="flex w-full gap-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <p className=" font-semibold text-xs text-cod-gray-950">
                            Titre
                          </p>
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          <p className=" font-semibold text-xs text-cod-gray-950">
                            Catégorie
                          </p>
                        </FormLabel>
                        <FormControl>
                          <Controller
                            name="category"
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger className="">
                                  <SelectValue placeholder="Theme" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="personnal">
                                    Projet personnel
                                  </SelectItem>
                                  <SelectItem value="school">Ecole</SelectItem>
                                  <SelectItem value="work">
                                    Entreprise
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>

                <div className="flex items-center gap-x-2">
                  <Link href="/">
                    <Button variant="outline" type="button">
                      Annuler
                    </Button>
                  </Link>
                  <Button type="submit" disabled={!isValid || isSubmitting}>
                    Créer
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Create;
