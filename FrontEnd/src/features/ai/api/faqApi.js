import { post } from "../../../lib/api/client.js";

export function askPatientFAQ(question) {
  return post("/api/ai/faq", { question });
}
