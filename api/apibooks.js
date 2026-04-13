import { BOOKS } from "../books.js"; // root books.js — the data file

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const safe = Object.fromEntries(
    Object.entries(BOOKS).map(([id, b]) => [
      id,
      {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        author: b.author,
        publisher: b.publisher,
        tagline: b.tagline,
        color: b.color,
        colorLight: b.colorLight,
        colorBorder: b.colorBorder,
        colorDark: b.colorDark,
        links: b.links,
        suggestions: b.suggestions,
      },
    ])
  );

  res.status(200).json(safe);
}
