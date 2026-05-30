import { createClient } from "@/lib/supabase/server";
import { routeIntent } from "@/lib/agents/orchestrator";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  transcript: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const intent = await routeIntent(body.transcript);
    return NextResponse.json({ intent });
  } catch (err) {
    console.error("Intent routing failed:", err);
    return NextResponse.json(
      { error: "Could not understand the query" },
      { status: 500 }
    );
  }
}