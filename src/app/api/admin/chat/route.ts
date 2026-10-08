import { NextResponse } from "next/server";
import { requireCreator } from "@/lib/require-creator";
import { db } from "@/lib/store";
import { llm, llmModel } from "@/lib/llm";
import { APP_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireCreator();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { message?: string; history?: { role: "user" | "assistant"; content: string }[] } | null;
  const message = body?.message?.trim();
  if (!message) return NextResponse.json({ error: "Escriba una pregunta." }, { status: 400 });

  const client = llm();
  if (!client) {
    return NextResponse.json({ error: "No hay modelo de IA configurado." }, { status: 503 });
  }

  const stats = await db.adminStats();
  const history = (body?.history ?? []).slice(-12);

  const completion = await client.chat.completions.create({
    model: llmModel(),
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `Eres el asistente interno de ${APP_NAME}. Solo hablas con los fundadores. Respondes en español de España, claro y breve.
Datos en vivo de la plataforma (ahora mismo):
${JSON.stringify(stats, null, 2)}
Producto: webs de negocio con plantilla tipo Martin (catálogo, reseñas, reservas, panel). Prueba de 1 día solo si hay sesión. Luego 150 €/mes. Invitación: -50 € el mes siguiente, un mes. Correos de estudio: hectorrbussiness@gmail.com y hectorgomez@ideia.builders (acceso libre, no pagan).
Si preguntan por gente, usa los números vivos. No inventes claves ni datos que no estén en el JSON.`,
      },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: message },
    ],
  });

  const reply = completion.choices[0]?.message?.content?.trim() || "No he podido responder ahora.";
  return NextResponse.json({ reply, stats });
}
