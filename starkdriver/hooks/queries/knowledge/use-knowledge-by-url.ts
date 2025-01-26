"use client"

import useSWR from "swr";

import { Knowledge } from "@/db/types";

export const useKnowledgeByUrl = (url: string) => {
    const { data, isLoading, error } = useSWR<Knowledge | null>(
        `/api/knowledge/${url}`, 
        () => fetch("/api/knowledge", {
            method: "POST",
            body: JSON.stringify({ url })
        }).then(res => res.json())
    );

    return { data, isLoading, error };
}