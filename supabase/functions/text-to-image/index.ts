import "https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

const hf = new HfInference(Deno.env.get("HUGGING_FACE_ACCESS_TOKEN"));

serve(async (req) => {
  const { prompt, path, word } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  console.log(`Generating with prompt: ${prompt}`);

  try {
    const image = await hf.textToImage(
      {
        inputs: prompt,
        model: "CompVis/stable-diffusion-v1-4",
      },
      {
        use_cache: false,
      },
    );
    console.log("Image generated successfully");

    await supabase.storage
      .from("images")
      .upload(`${path}/image.png`, image, {
        cacheControl: "3600",
        upsert: true,
      });
  } catch (err) {
    console.log(err);
    console.log("Using default image!");
    await supabase.storage.from("images").copy(
      `defaults/${word}.png`,
      `${path}/image.png`,
    );
  }

  return new Response("ok");
});
