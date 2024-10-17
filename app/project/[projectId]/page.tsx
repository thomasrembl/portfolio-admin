"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { BaseForm } from "./_components/baseForm";
import { TextForm } from "./_components/textForm";
import { LinkForm } from "./_components/linkForm";
import { ImageThreadForm } from "./_components/imageThreadForm";

const Project = ({ params }: { params: { projectId: string } }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const getProject = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/getbyid/${params.projectId}`
        );
        setData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération du projet:", error);
      }
    };

    getProject();
  }, [params.projectId]);

  if (!data) {
    return (
      <>
        <div className="flex flex-col">
          <Link href="/">
            <Button variant={"ghost"}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="font-extrabold text-[48px] text-white">
            Edition d’un projet
          </h1>
          <p className="font-semibold text-slate-400 text-xl">
            Modifier votre projet dès maintenant
          </p>
        </div>
        <p>Chargement des données...</p>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <Link href="/">
          <Button variant={"ghost"}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="font-extrabold text-[48px] text-white">
          Edition d’un projet
        </h1>
        <p className="font-semibold text-slate-400 text-xl">
          Modifier votre projet dès maintenant
        </p>
      </div>
      <section className="flex flex-col gap-4 mt-2">
        <div className="flex gap-4 w-full">
          <BaseForm params={data} />
          <TextForm params={data} />
        </div>
        <ImageThreadForm params={data} />
        <div className="flex gap-4 w-full">
          <LinkForm params={data} />
        </div>
      </section>
    </>
  );
};

export default Project;
