import { useState } from "react";
import {
  DollarSign,
  Play,
  TrendingUp,
  Users,
  ArrowUpRight,
  Music,
  Clapperboard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useGetUserStatisticsQuery,
  useGetUserGrowthQuery,
  useGetUserEarningQuery,
} from "@/features/users/usersApi";
import { useGetSongsQuery } from "@/features/songs/songsApi";
import { unwrapList } from "@/utils/list";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { Song } from "@/features/songs/types";
import { resolveMediaUrl } from "@/utils/mediaUrl";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function BarChart({
  data,
  max,
  color = "amber",
}: {
  data: number[];
  max: number;
  color?: string;
}) {
  const colors =
    color === "emerald"
      ? "from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300"
      : "from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300";
  return (
    <div
      className="grid items-end gap-2 h-40 pb-2 border-b border-[#231d18]"
      style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
    >
      {data.map((val, i) => {
        const pct = max > 0 ? Math.max(4, Math.round((val / max) * 100)) : 4;
        return (
          <div
            key={i}
            className="group relative flex flex-col items-center h-full justify-end"
          >
            <span className="absolute -top-6 text-[10px] font-bold text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {formatNumber(val)}
            </span>
            <div
              className={`w-full rounded-t-lg bg-gradient-to-t ${colors} transition-all duration-300 shadow-sm shadow-amber-500/20`}
              style={{ height: `${pct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [growthYear, setGrowthYear] = useState(currentYear);
  const [earningYear, setEarningYear] = useState(currentYear);

  const statsQuery = useGetUserStatisticsQuery();
  const growthQuery = useGetUserGrowthQuery(growthYear);
  console.log(growthQuery);
  const earningQuery = useGetUserEarningQuery(earningYear);
  const songs = useGetSongsQuery({ page: 1, limit: 5, sort: "latest" });

  const stats = statsQuery.data?.data;
  const songList = unwrapList<Song>(songs.data);

  const growthStats = growthQuery.data?.data?.userStats ?? [];
  const earningStats = earningQuery.data?.data?.earningStats ?? [];
  const totalEarning = earningQuery.data?.data?.totalEarning ?? 0;

  const growthNewUsers = growthStats.map((s) => s.newUsers ?? 0);
  console.log(growthNewUsers);
  const earningValues = earningStats.map((s) => s.earning ?? 0);

  const growthMax = Math.max(...growthNewUsers, 1);
  const earningMax = Math.max(...earningValues, 1);

  const statCards = [
    {
      label: "TOTAL USERS",
      value: formatNumber(stats?.totalUser ?? 0),
      icon: Users,
      to: "/admin/users",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
    },
    {
      label: "TOTAL SONGS",
      value: formatNumber(stats?.totalSongs ?? 0),
      icon: Music,
      to: "/admin/songs",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      label: "TOTAL VIDEOS",
      value: formatNumber(stats?.totalVideos ?? 0),
      icon: Play,
      to: "/admin/videos",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30",
    },
    {
      label: "TOTAL BTS",
      value: formatNumber(stats?.totalBTs ?? 0),
      icon: Clapperboard,
      to: "/admin/bts",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/30",
    },
    {
      label: "TOTAL REVENUE",
      value: formatCurrency(stats?.totalRavanue ?? 0),
      icon: DollarSign,
      to: "/admin/subscribers",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
  ];

  const topTracks = songList.items.slice(0, 5).map((s, idx) => ({
    id: s._id,
    title: s.title,
    artist: s.artist,
    plays: `${formatNumber(s.playCount ?? s.viewsCount ?? 0)} plays`,
    image: resolveMediaUrl(s.cover_image),
    rank: idx + 1,
  }));

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of Urban Music Flow platform performance"
      />

      {/* Stats Grid — from GET /user/statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.to}>
              <Card hoverable className="p-5 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-wider text-stone-500 uppercase truncate">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-white tracking-tight">
                      {statsQuery.isLoading ? (
                        <span className="inline-block h-7 w-16 animate-pulse rounded-lg bg-stone-800" />
                      ) : (
                        card.value
                      )}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400">
                        Live
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${card.bg} ${card.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* User Growth Chart — GET /user/user-statistics?year=YYYY */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-200">User Growth</h3>
              <p className="text-xs text-stone-500 mt-0.5">Monthly new users</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <select
                value={growthYear}
                onChange={(e) => setGrowthYear(Number(e.target.value))}
                className="rounded-lg border border-[#29221b] bg-[#120f0d] px-2 py-1 text-xs text-stone-300 outline-none focus:border-amber-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {growthQuery.isLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-stone-800/50" />
          ) : growthStats.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-stone-500">
              No data available for {growthYear}
            </div>
          ) : (
            <>
              <BarChart data={growthNewUsers} max={growthMax} />
              <div
                className="grid gap-2 text-center text-[10px] font-semibold text-stone-500"
                style={{
                  gridTemplateColumns: `repeat(${growthStats.length}, 1fr)`,
                }}
              >
                {growthStats.map((s) => (
                  <span key={s.month}>
                    {MONTHS_SHORT[parseInt(s.month) - 1] ?? s.month}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 inline-block" />
                  New Users
                </span>
              </div>
            </>
          )}
        </Card>

        {/* Earnings Chart — GET /user/user-earning?year=YYYY */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-200">Revenue</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Total:{" "}
                <span className="text-emerald-400 font-bold">
                  {earningQuery.isLoading
                    ? "..."
                    : formatCurrency(totalEarning)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <select
                value={earningYear}
                onChange={(e) => setEarningYear(Number(e.target.value))}
                className="rounded-lg border border-[#29221b] bg-[#120f0d] px-2 py-1 text-xs text-stone-300 outline-none focus:border-amber-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {earningQuery.isLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-stone-800/50" />
          ) : earningStats.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-stone-500">
              No data available for {earningYear}
            </div>
          ) : (
            <>
              <BarChart data={earningValues} max={earningMax} color="emerald" />
              <div
                className="grid gap-2 text-center text-[10px] font-semibold text-stone-500"
                style={{
                  gridTemplateColumns: `repeat(${earningStats.length}, 1fr)`,
                }}
              >
                {earningStats.map((s) => (
                  <span key={s.month}>
                    {MONTHS_SHORT[parseInt(s.month) - 1] ?? s.month}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />
                  Monthly Revenue
                </span>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Top Tracks */}
      <Card className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-bold text-base text-white">Top Tracks</h3>
          <Link
            to="/admin/songs"
            className="text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            View all
          </Link>
        </div>
        {songs.isFetching ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-stone-800/50"
              />
            ))}
          </div>
        ) : topTracks.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-8">
            No songs uploaded yet.
          </p>
        ) : (
          <div className="space-y-3.5">
            {topTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between gap-3 rounded-xl p-2 hover:bg-[#1f1a15] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-sm font-black text-amber-500">
                    {track.rank}
                  </span>
                  <img
                    src={track.image}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover bg-stone-800 border border-[#2b221a]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-stone-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-stone-400 shrink-0">
                  {track.plays}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
