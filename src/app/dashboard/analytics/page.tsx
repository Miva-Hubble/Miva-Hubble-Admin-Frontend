"use client";

import { useState } from "react";
import {
  Trophy,
  Award,
  TrendingUp,
  Star,
  Users,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useProgression, useUserProgression } from "@/hooks/useProgression";
import type { UserProgression } from "@/types/progression";

export default function ProgressionAnalyticsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    progression,
    total,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProgression({ page, limit: 15, search: search.trim() || undefined });

  const {
    userProgression: selectedUserDetail,
    isLoading: isDetailLoading,
  } = useUserProgression(selectedUserId ?? undefined);

  // Top 3 contributors calculation
  const topContributors = progression.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Student Progression & Leaderboards
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track student contribution points, ranking milestones, and Vault publishing achievements.
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
          Refresh Stats
        </Button>
      </div>

      {/* Top 3 Podium Highlights */}
      {topContributors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topContributors.map((c, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={c.userId || idx}
                onClick={() => setSelectedUserId(c.userId)}
                className={`relative overflow-hidden rounded-3xl p-6 transition-all cursor-pointer ${
                  isFirst
                    ? "bg-gradient-primary text-primary-foreground shadow-elegant border-transparent"
                    : "bg-card border border-border/40 hover:border-primary/40 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge
                    variant={isFirst ? "secondary" : "default"}
                    className="font-mono text-[10px] uppercase font-bold"
                  >
                    #{idx + 1} Contributor
                  </Badge>
                  <Trophy
                    className={`h-5 w-5 ${
                      idx === 0
                        ? "text-amber-300"
                        : idx === 1
                        ? "text-slate-400"
                        : "text-amber-600"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                    {c.user?.avatarUrl && <AvatarImage src={c.user.avatarUrl} />}
                    <AvatarFallback className="font-bold text-xs bg-white/20">
                      {c.user?.name?.slice(0, 2).toUpperCase() || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-bold font-display text-base truncate">
                      {c.user?.name || "Student Contributor"}
                    </h3>
                    <p className={`text-xs truncate ${isFirst ? "text-white/80" : "text-muted-foreground"}`}>
                      {c.user?.department || "Department"} · Level {c.user?.level || "100"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <div>
                    <span className={`text-[10px] uppercase font-semibold ${isFirst ? "text-white/70" : "text-muted-foreground"}`}>
                      Total Points
                    </span>
                    <p className="font-bold text-sm font-display">{c.totalPoints || c.points || 0} pts</p>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold ${isFirst ? "text-white/70" : "text-muted-foreground"}`}>
                      Rank Tier
                    </span>
                    <p className="font-bold text-sm truncate">{c.currentRank || c.rankTier || "Scholar"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contributor List Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-foreground">
            All Student Contributors ({total})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search contributor by name…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 rounded-xl border-border/60 text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold text-foreground">
              Failed to load progression data
            </p>
            <p className="max-w-md text-xs text-muted-foreground">
              {error?.message || "There was an error communicating with the progression service."}
            </p>
          </div>
        ) : progression.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/40 bg-card/50 py-16 text-center">
            <Award className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No progression records yet</p>
            <p className="text-xs text-muted-foreground">
              Once student uploads are approved, their ranking milestones will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-5 pr-3">Contributor</th>
                  <th className="px-3 py-3.5">Department</th>
                  <th className="px-3 py-3.5">Current Rank</th>
                  <th className="px-3 py-3.5">Approved Uploads</th>
                  <th className="px-3 py-3.5">Total Points</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {progression.map((item, i) => (
                  <tr
                    key={item.userId || i}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => setSelectedUserId(item.userId)}
                  >
                    <td className="py-4 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/40">
                          {item.user?.avatarUrl && (
                            <AvatarImage src={item.user.avatarUrl} />
                          )}
                          <AvatarFallback className="bg-gradient-primary text-[10px] font-bold text-primary-foreground">
                            {item.user?.name?.slice(0, 2).toUpperCase() || "ST"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {item.user?.name || "Student"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {item.user?.email || "student@miva.university"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <p className="font-medium text-foreground truncate max-w-[140px]">
                        {item.user?.department || "General"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Level {item.user?.level || "100"}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                        {item.currentRank || item.rankTier || "Contributor"}
                      </Badge>
                    </td>

                    <td className="px-3 py-4">
                      <span className="font-semibold text-foreground">
                        {item.approvedUploadsCount ?? 0}
                      </span>{" "}
                      <span className="text-muted-foreground text-[11px]">uploads</span>
                    </td>

                    <td className="px-3 py-4">
                      <span className="font-bold text-foreground font-display">
                        {(item.totalPoints ?? item.points ?? 0).toLocaleString()}
                      </span>{" "}
                      <span className="text-muted-foreground text-[11px]">pts</span>
                    </td>

                    <td className="py-4 pl-3 pr-5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground group-hover:text-foreground"
                      >
                        View <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <p className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full text-xs h-8 px-3"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full text-xs h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Progression Detail Modal */}
      <Dialog open={Boolean(selectedUserId)} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-primary">
              Contributor Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Progression record and milestone goals
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : selectedUserDetail ? (
            <div className="space-y-5 pt-2">
              {/* User overview */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/15 p-4">
                <Avatar className="h-12 w-12 border border-border/40">
                  {selectedUserDetail.user?.avatarUrl && (
                    <AvatarImage src={selectedUserDetail.user.avatarUrl} />
                  )}
                  <AvatarFallback className="bg-gradient-primary text-xs font-bold text-primary-foreground">
                    {selectedUserDetail.user?.name?.slice(0, 2).toUpperCase() || "ST"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h4 className="font-bold font-display text-sm text-foreground truncate">
                    {selectedUserDetail.user?.name || "Student Contributor"}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedUserDetail.user?.department || "Department"} · Level {selectedUserDetail.user?.level || "100"}
                  </p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Rank
                  </span>
                  <p className="font-bold text-sm text-foreground mt-0.5">
                    {selectedUserDetail.currentRank || selectedUserDetail.rankTier || "Contributor"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Points
                  </span>
                  <p className="font-bold text-sm text-primary mt-0.5">
                    {(selectedUserDetail.totalPoints ?? selectedUserDetail.points ?? 0).toLocaleString()} pts
                  </p>
                </div>
              </div>

              {/* Progress to next rank */}
              {selectedUserDetail.nextRank && (
                <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Next Rank: {selectedUserDetail.nextRank}</span>
                    <span className="text-muted-foreground font-mono">{selectedUserDetail.progressPercentage || 0}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${selectedUserDetail.progressPercentage || 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right">
                    {selectedUserDetail.pointsToNextRank || 0} points needed
                  </p>
                </div>
              )}

              {/* Recent contributions list */}
              {selectedUserDetail.recentContributions && selectedUserDetail.recentContributions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Recent Contribution Points
                  </span>
                  <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card">
                    {selectedUserDetail.recentContributions.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-medium text-foreground truncate">{c.title}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{c.action}</p>
                        </div>
                        <Badge variant="secondary" className="font-mono text-[10px] text-emerald-600 font-bold shrink-0">
                          +{c.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
