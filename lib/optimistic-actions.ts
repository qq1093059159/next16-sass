"use server";

export async function addMessage(text: string) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { id: crypto.randomUUID(), text, createdAt: Date.now() };
}
