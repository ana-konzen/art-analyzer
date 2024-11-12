import { getEnvVariable } from "./shared/util.ts";
import OpenAI from "https://deno.land/x/openai@v4.68.2/mod.ts";

async function createQueryVector(queryString) {
  const openai = new OpenAI(getEnvVariable("OPENAI_API_KEY"));

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: queryString,
  });
  return response.data[0].embedding;
}

export async function queryPc(queryString, namespace = "", topK = 10) {
  const url = `${getEnvVariable("PC_URL")}/query`;
  const apiKey = getEnvVariable("PC_API_KEY");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify({
      vector: await createQueryVector(queryString),
      topK: topK,
      namespace: namespace,
      includeMetadata: true,
    }),
  });
  return await response.json();
}
