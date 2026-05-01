import { CheckCircle2, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { cn } from "@/lib/utils";

type MemberOption = {
  id: string;
  status: string;
  phone?: string | null;
  documentId?: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type MemberLookupFieldProps = {
  search: string;
  selectedMemberId: string;
  members: MemberOption[];
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (memberId: string) => void;
};

export function MemberLookupField({
  search,
  selectedMemberId,
  members,
  isLoading = false,
  onSearchChange,
  onSelect,
}: MemberLookupFieldProps) {
  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ?? null;

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Cliente o miembro</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-2xl bg-white/70 pl-9"
            placeholder="Busca por nombre, correo, telefono o documento..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      {selectedMember ? (
        <div className="rounded-[1.2rem] border border-primary/20 bg-primary/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {selectedMember.user.firstName} {selectedMember.user.lastName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedMember.user.email}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedMember.phone ?? "Sin telefono"} ·{" "}
                {selectedMember.documentId ?? "Sin documento"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.2rem] border bg-muted/15 p-2">
        <ScrollPanel heightClassName="max-h-[17rem]" className="pr-1">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-[1rem]" />
              ))
            : members.map((member) => {
                const isSelected = member.id === selectedMemberId;

                return (
                  <Button
                    key={member.id}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-auto w-full justify-start rounded-[1rem] px-3 py-3 text-left",
                      isSelected
                        ? "border border-primary/30 bg-primary/8 hover:bg-primary/10"
                        : "hover:bg-white/80",
                    )}
                    onClick={() => onSelect(member.id)}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted/50 text-muted-foreground">
                      <UserRound className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {member.user.firstName} {member.user.lastName}
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {member.user.email}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                        {member.phone ?? "Sin telefono"} ·{" "}
                        {member.documentId ?? "Sin documento"}
                      </span>
                    </span>
                  </Button>
                );
              })}

          {!isLoading && !members.length ? (
            <div className="rounded-[1rem] border border-dashed p-4 text-sm text-muted-foreground">
              No encontramos miembros con ese criterio.
            </div>
          ) : null}
        </ScrollPanel>
      </div>
    </div>
  );
}
