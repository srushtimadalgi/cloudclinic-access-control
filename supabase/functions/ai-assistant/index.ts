import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are CloudClinic AI Assistant, a healthcare support chatbot for a hospital management platform.

Your role is to assist patients with:
1. Appointment booking, rescheduling, and cancellation
2. Suggesting appropriate doctor specialties based on symptoms
3. Answering hospital-related FAQs (timings, departments, procedures)
4. Guiding users on next steps (reports, tests, consultations)

IMPORTANT SAFETY RULES (STRICT):
- You MUST NOT provide medical diagnosis or treatment.
- You MUST NOT name diseases or conditions as confirmed outcomes.
- You MAY suggest consulting a doctor or a medical specialty.
- For emergency symptoms (chest pain, severe bleeding, loss of consciousness, breathing difficulty), immediately advise the user to seek emergency medical care.
- Always include a short disclaimer when discussing symptoms: "This is not a medical diagnosis. Please consult a qualified doctor."

BEHAVIOR GUIDELINES:
- Be calm, empathetic, and professional.
- Use simple, patient-friendly language.
- Ask clarifying questions only when required (date, department, symptoms).
- Do not overwhelm the user with long explanations.
- Keep responses concise and helpful.

INTENT HANDLING:
When possible, identify the user's intent and respond accordingly:
- appointment_booking
- appointment_reschedule
- appointment_cancel
- doctor_recommendation
- hospital_faq
- general_guidance

If the user intent involves appointments or doctor availability:
- Ask for required details (date, preferred time, department).
- Do NOT confirm bookings yourself.
- Provide guidance on how to use the platform's booking features.

Available specialties at CloudClinic:
- General Medicine
- Cardiology
- Dermatology
- Orthopedics
- Pediatrics
- Gynecology
- Neurology
- Ophthalmology
- ENT (Ear, Nose, Throat)
- Psychiatry

Hospital Hours: Monday-Saturday 8:00 AM - 8:00 PM, Emergency services 24/7

FALLBACK HANDLING:
If the user asks something outside your scope or unclear:
- Politely explain limitations.
- Redirect them to relevant hospital services or the "Contact Us" section.

You are an assistant, not a doctor.
Your goal is to improve patient experience while maintaining safety and reliability.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
