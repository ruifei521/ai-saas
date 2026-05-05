import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function generateTwitterThread(articleText: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [
      {
        role: "system",
        content: `You are an expert social media content creator specializing in Twitter/X threads.

Your task: Given a long-form article, create an engaging Twitter thread.

Rules:
1. First tweet MUST have a powerful hook (number/stat/question/opinion that stops the scroll)
2. Each tweet must be under 280 characters
3. Use "1/", "2/", "3/" etc. format as prefixes
4. Cover the 3-5 most valuable insights from the article
5. The final tweet should include a question or call-to-action to drive engagement
6. Use specific numbers and details when possible
7. Do NOT use emojis in tweets
8. Each tweet should be punchy, direct, and valuable on its own

Output format: Just the numbered tweets, one per line. No introduction or conclusion text.`,
      },
      {
        role: "user",
        content: `Please create a Twitter thread from this article:\n\n${articleText}`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });

  return response.choices[0].message.content ?? "";
}

export async function generateLinkedInPost(articleText: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [
      {
        role: "system",
        content: `You are a LinkedIn content expert. You write professional posts that are conversational, not corporate.

Your task: Transform a long-form article into a LinkedIn post.

Rules:
1. Length: 150-300 words
2. Start with a powerful first line that hooks the reader
3. Keep paragraphs short (1-3 sentences max)
4. Include 2-3 relevant hashtags at the end (e.g. #Leadership #Productivity)
5. Professional but authentic voice - avoid corporate buzzwords
6. End with a thought-provoking question or insight
7. Do NOT use emojis

Structure:
- Hook (1-2 sentences)
- Problem or context (1-2 sentences)
- Key insight (the main point of the article, 2-3 paragraphs)
- Takeaway/question (1-2 sentences)
- 2-3 relevant hashtags

Do NOT add any header, title, or label. Just output the raw post text.`,
      },
      {
        role: "user",
        content: `Please create a LinkedIn post from this article:\n\n${articleText}`,
      },
    ],
    max_tokens: 1200,
    temperature: 0.7,
  });

  return response.choices[0].message.content ?? "";
}

export async function extractArticleFromUrl(url: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [
      {
        role: "system",
        content: `You are a content extraction assistant. When given a URL, extract the main article text from the page content provided. Return ONLY the raw article text without any introduction, summary, or your own commentary. Preserve the original structure as much as possible.`,
      },
      {
        role: "user",
        content: `Extract and return the main article text content from this URL: ${url}\n\nIf the content is not accessible or is behind a paywall, return exactly: [UNABLE_TO_EXTRACT]`,
      },
    ],
    max_tokens: 8000,
  });

  const content = response.choices[0].message.content ?? "";
  if (content.includes("[UNABLE_TO_EXTRACT]")) {
    throw new Error("Unable to extract content from this URL. Please paste the article text directly.");
  }
  return content;
}