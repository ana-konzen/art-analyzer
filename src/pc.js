import { getEnvVariable } from "./shared/util.ts";
import OpenAI from "https://deno.land/x/openai@v4.68.2/mod.ts";
import { Pinecone } from "npm:@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: getEnvVariable("PC_API_KEY"),
});
const index = pc.index(getEnvVariable("PC_INDEX"));

async function createQueryVector(queryString) {
  const openai = new OpenAI(getEnvVariable("OPENAI_API_KEY"));

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: queryString,
  });
  return response.data[0].embedding;
}

export async function queryPc(query, namespace = "", topK = 5) {
  const queryVector = await createQueryVector(query);
  const response = await index.namespace(namespace).query({
    vector: queryVector,
    topK: topK,
    includeMetadata: true,
  });
  // console.log(response);
  return response;
}
