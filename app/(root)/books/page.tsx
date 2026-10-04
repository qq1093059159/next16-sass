import books from "@/app/api/db";

export default async function Books() {
  return (
    <div>
      <code>{JSON.stringify(books, null, 2)}</code>
    </div>
  );
}
