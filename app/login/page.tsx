import { redirect } from "next/navigation";

// Auth UI is disabled for the MVP launch; Login.tsx is kept intact for when it's re-enabled.
export default function LoginPage() {
  redirect("/");
}
