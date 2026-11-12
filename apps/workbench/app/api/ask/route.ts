const MAX_QUESTION_LENGTH = 2_000;
const REQUEST_TIMEOUT_MS = 90_000;

export const maxDuration = 100;

type Outcome = "answered" | "rejected" | "degraded";

function errorResponse(message: string, status: number) {
  return Response.json(
    {
      error: { message },
    },
    { status },
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("question" in body) ||
    typeof body.question !== "string"
  ) {
    return errorResponse("Please provide a question between 1 and 2,000 characters.", 400);
  }

  const question = body.question.trim();

  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return errorResponse("Please provide a question between 1 and 2,000 characters.", 400);
  }

  const backendUrl = process.env.RAG_API_URL;
  const apiKey = process.env.RAG_API_KEY;

  if (!backendUrl || !apiKey) {
    console.error(
      "AI backend configuration error:",
      !backendUrl ? "RAG_API_URL is missing." : "RAG_API_KEY is missing.",
    );

    return errorResponse("Something went wrong on our end. Please try again later.", 500);
  }

  let url: URL;

  try {
    url = new URL("/ask", backendUrl);
    url.searchParams.set("q", question);
  } catch (error) {
    console.error("Invalid RAG_API_URL configuration:", error);

    return errorResponse("Something went wrong on our end. Please try again later.", 500);
  }

  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  const signal = AbortSignal.any([request.signal, timeoutSignal]);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      signal,
      cache: "no-store",
    });

    if (response.status === 401) {
      console.error("Render authentication failed. Check RAG_API_KEY.");

      return errorResponse("Something went wrong on our end. Please try again later.", 502);
    }

    if (response.status === 429) {
      return errorResponse("Our AI service is temporarily busy. Please try again shortly.", 429);
    }

    if (!response.ok) {
      console.error(`Render backend returned HTTP ${response.status}.`);

      return errorResponse("Our AI service is temporarily unavailable. Please try again.", 502);
    }

    let data: unknown;

    try {
      data = await response.json();
    } catch (error) {
      if (request.signal.aborted) {
        return new Response(null, { status: 499 });
      }

      if (timeoutSignal.aborted) {
        console.error("Render backend request timed out after 90 seconds.");

        return errorResponse("The request took too long. Please try again.", 504);
      }

      console.error("Render returned invalid JSON:", error);

      return errorResponse("We couldn't process the response. Please try again.", 502);
    }

    if (
      typeof data !== "object" ||
      data === null ||
      !("answer" in data) ||
      typeof data.answer !== "string"
    ) {
      console.error("Render returned an invalid response payload.");

      return errorResponse("We couldn't process the response. Please try again.", 502);
    }

    let outcome: Outcome = "answered";

    if ("degraded" in data && data.degraded === true) {
      outcome = "degraded";
    } else if (
      "rejected" in data &&
      typeof data.rejected === "string" &&
      data.rejected.length > 0
    ) {
      outcome = "rejected";
    }

    const sources = "sources" in data && Array.isArray(data.sources) ? data.sources : [];

    return Response.json({
      answer: data.answer,
      sources,
      outcome,
    });
  } catch (error) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    if (timeoutSignal.aborted) {
      console.error("Render backend request timed out after 90 seconds.");

      return errorResponse("The request took too long. Please try again.", 504);
    }

    console.error("AI backend request failed:", error);

    return errorResponse("Unable to connect to our AI service. Please try again shortly.", 503);
  }
}
