import { RequireAuth } from "../_components/require-auth";

/** Todas las rutas bajo /repostajes requieren sesión. */
export default function RepostajesLayout({ children }: LayoutProps<"/repostajes">) {
  return <RequireAuth>{children}</RequireAuth>;
}
