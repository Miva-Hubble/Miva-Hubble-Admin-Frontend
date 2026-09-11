"use client";

import { useState } from "react";
import { Users as UsersIcon, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { UsersTable } from "@/components/users-table";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("ALL");
  const [level, setLevel] = useState<string>("ALL");
  const [onboardedFilter, setOnboardedFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const { departments, levels } = useTaxonomy();

  const queryParams = {
    page,
    limit: 15,
    search: search ? search.trim() : undefined,
    department: department === "ALL" ? undefined : department,
    level: level === "ALL" ? undefined : level,
    onboarded:
      onboardedFilter === "ALL" ? undefined : onboardedFilter === "TRUE",
  };

  const { users, total, totalPages, isLoading, isFetching, isError, error, refetch } =
    useUsers(queryParams);

  return (
    <div className="mx-auto max-w-[1800px] space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every registered student and their onboarding selection (level, department, goals).
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-fit rounded-full text-xs gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 lg:col-span-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, username, or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9.5 rounded-xl border-border/60 text-xs"
          />
        </div>

        <div className="sm:col-span-3 lg:col-span-3">
          <Select
            value={department}
            onValueChange={(val) => {
              if (val) {
                setDepartment(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9.5 rounded-xl border-border/60 text-xs">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-3 lg:col-span-2">
          <Select
            value={level}
            onValueChange={(val) => {
              if (val) {
                setLevel(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9.5 rounded-xl border-border/60 text-xs">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Levels</SelectItem>
              {levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l.startsWith("Level") ? l : `Level ${l}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-6 lg:col-span-3">
          <Select
            value={onboardedFilter}
            onValueChange={(val) => {
              if (val) {
                setOnboardedFilter(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9.5 rounded-xl border-border/60 text-xs">
              <SelectValue placeholder="Onboarding Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Users</SelectItem>
              <SelectItem value="TRUE">Onboarded</SelectItem>
              <SelectItem value="FALSE">Not Onboarded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <UsersTable users={users} isLoading={isLoading} isError={isError} error={error} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <p className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> ({total} users total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full text-xs h-8 px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full text-xs h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
