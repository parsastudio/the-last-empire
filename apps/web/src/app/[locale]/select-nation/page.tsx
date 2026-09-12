import React from "react";
import { setRequestLocale } from "next-intl/server";
import { SelectNationView } from "@/presentation/components/select-nation/select-nation-view";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SelectNationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SelectNationView />;
}
