import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();

  redirect(`/dashboard/${formData.get("username")}`);
}
