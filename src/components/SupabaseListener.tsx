'use server'

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers";
import Navigation from "./navigation";

import { Database } from "@/types/database.types";

export default async function SupabaseListener() {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data: { user } } = await supabase.auth.getUser();

    return <Navigation user={user} />
}