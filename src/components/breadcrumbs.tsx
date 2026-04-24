import { Link } from "react-router-dom";
import { useBreadcrumbs } from "@/shared/hooks/useBreadcrumbs";

export const Breadcrumbs = () => {
  const crumbs = useBreadcrumbs();

  return (
    <nav className="flex items-center gap-2 text-sm">
      {crumbs.map((c, i) => (
        <span key={c.url} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground">/</span>}
          <Link
            to={c.url}
            className={i === crumbs.length - 1 ? "font-medium" : ""}
          >
            {c.title}
          </Link>
        </span>
      ))}
    </nav>
  );
};
