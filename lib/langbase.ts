import { Langbase, fromReadableStream } from "langbase";

const apiKey = process.env.LANGBASE_API_KEY;

if (!apiKey) {
  throw new Error("LANGBASE_API_KEY is not set");
}

export const langbase = new Langbase({
  apiKey,
});

export { fromReadableStream };

export default langbase;