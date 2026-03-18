export async function getCropAdvice({ text, lang, languageLabel }) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang, languageLabel }),
  });

  if (!res.ok) {
    const maybeJson = await res.json().catch(() => null);
    const msg =
      maybeJson?.details ||
      maybeJson?.error ||
      (typeof maybeJson === "string" ? maybeJson : "") ||
      (await res.text().catch(() => "")) ||
      `Claude request failed (${res.status})`;
    throw new Error(msg);
  }

  return await res.json();
}

