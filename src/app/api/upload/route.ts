import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Entre en su cuenta." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Elija una foto." }, { status: 400 });
  }
  if (file.size > 4_000_000) return NextResponse.json({ error: "La foto pesa más de 4 MB." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "El archivo tiene que ser una imagen." }, { status: 400 });
  try {
    const url = await saveImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
