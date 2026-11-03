import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";

export type CardReview = {
  readable: boolean;
  complete: boolean;
  missing: string[];
  extracted: { first_name: string; last_name: string; birth_date: string; card_number: string };
  mismatches: string[];
  error?: string;
};

type Input = { image: string; form: Record<string, string> };

export const reviewIdCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Input) => {
    if (typeof d?.image !== "string" || !d.image.startsWith("data:image/") || d.image.length > 9_000_000) throw new Error("صورة غير صالحة");
    return { image: d.image, form: Object.fromEntries(Object.entries(d.form ?? {}).map(([k, v]) => [k, String(v).slice(0, 200)])) };
  })
  .handler(async ({ data }): Promise<CardReview> => {
    const empty: CardReview = { readable: false, complete: false, missing: [], extracted: { first_name: "", last_name: "", birth_date: "", card_number: "" }, mismatches: [] };
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: `You review an Algerian volunteer registration. Form data (JSON): ${JSON.stringify(data.form)}.
1) List form fields that are empty or clearly invalid in "missing" (Arabic labels).
2) Read the attached national ID card image. Extract first_name, last_name, birth_date, card_number exactly as printed (empty string if unreadable).
3) In "mismatches" list in Arabic any difference between the card names and the form names.
Set readable=false if the image is not a readable ID card. complete=true only if missing is empty and readable. Return JSON only.` },
            { type: "input_image", image_url: data.image, detail: "high" },
          ],
        }],
        text: { format: { type: "json_schema", name: "review", strict: true, schema: {
          type: "object", additionalProperties: false,
          required: ["readable", "complete", "missing", "extracted", "mismatches"],
          properties: {
            readable: { type: "boolean" }, complete: { type: "boolean" },
            missing: { type: "array", items: { type: "string" } },
            mismatches: { type: "array", items: { type: "string" } },
            extracted: { type: "object", additionalProperties: false, required: ["first_name", "last_name", "birth_date", "card_number"],
              properties: { first_name: { type: "string" }, last_name: { type: "string" }, birth_date: { type: "string" }, card_number: { type: "string" } } },
          } } } },
      });
      const text = res.output?.flatMap((o) => ("content" in o && Array.isArray(o.content) ? o.content : [])).map((c) => ("text" in c ? c.text : "")).join("") ?? "";
      return JSON.parse(text) as CardReview;
    } catch (e) {
      console.error("id review failed", e);
      const msg = e instanceof GatewayError && e.httpStatus === 402 ? "نفد رصيد الذكاء الاصطناعي" : e instanceof GatewayError && e.httpStatus === 429 ? "ضغط كبير، حاول بعد قليل" : "تعذر فحص الصورة، حاول مجدداً";
      return { ...empty, error: msg };
    }
  });
