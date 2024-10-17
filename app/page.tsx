"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { DataTable } from "./_components/dataTable";
import { columns } from "./_components/collums";
import { UserButton } from "@clerk/nextjs";

async function getProjects() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects/getallprojects`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return [];
  }
}

export default function Home() {
  const [data, setData] = useState<Project[]>([]);

  const refreshData = async () => {
    const projects = await getProjects();
    setData(projects);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex justify-between w-full">
        <div className="flex flex-col">
          <h1 className="font-extrabold text-[48px] text-white">Bienvenue</h1>
          <p className="font-semibold text-slate-400 text-xl">
            Modifier votre portfolio dès maintenant{" "}
          </p>
        </div>
        <UserButton />
      </div>
      <section className="w-full">
        <div className="w-full mt-4">
          <DataTable columns={columns} data={data} refreshData={refreshData} />
        </div>
      </section>
    </main>
  );
}
