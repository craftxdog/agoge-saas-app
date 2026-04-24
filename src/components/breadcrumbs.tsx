import { Link } from "react-router-dom";
import { useBreadcrumbs } from "@/shared/hooks/useBreadcrumbs";

export const Breadcrumbs = () => {
  const crumbs = useBreadcrumbs();

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      {crumbs.map((c, i) => (
        <span key={c.url} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground">/</span>}
          <Link
            to={c.url}
            className={
              i === crumbs.length - 1
                ? "rounded-md bg-muted/50 px-2 py-1 font-medium text-foreground"
                : "text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {c.title}
          </Link>
        </span>
      ))}
    </nav>
  );
};
