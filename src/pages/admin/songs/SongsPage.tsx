import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/search/SearchInput'
import { Pagination } from '@/components/pagination/Pagination'
import { DataTable } from '@/components/table/DataTable'
import { useGetSongsQuery } from '@/features/songs/songsApi'
import type { Song } from '@/features/songs/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { unwrapList } from '@/utils/list'
import { formatDate, formatNumber } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import type { SortableListQuery } from '@/types/api'

export function SongsPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortableListQuery['sort']>('latest')
  const searchTerm = useDebouncedValue(search)

  useEffect(() => {
    setPage(1)
  }, [searchTerm, sort])

  const { data, isFetching, isError, error, refetch } = useGetSongsQuery({
    page,
    limit,
    sort,
    searchTerm: searchTerm || undefined,
  })
  const { items, pagination } = unwrapList<Song>(data)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Songs"
        description="Manage track catalog and review community feedback."
        actions={
          <Link to="/admin/songs/upload">
            <Button variant="amber-pill">Upload Song</Button>
          </Link>
        }
      />
      <Card className="bg-[#161310]">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search songs..." className="w-full md:max-w-md" />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortableListQuery['sort'])}
          >
            <option value="latest">Latest</option>
            <option value="top-rated">Top rated</option>
            <option value="most-played">Most played</option>
          </Select>
        </div>
        {isError ? (
          <div className="p-4">
            <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'title',
                header: 'Title',
                render: (song) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveMediaUrl(song.cover_image)}
                      alt=""
                      className="h-11 w-11 rounded-xl object-cover bg-stone-800 border border-[#2b221a]"
                    />
                    <div>
                      <p className="font-bold text-white text-sm hover:text-amber-400 transition-colors">{song.title}</p>
                      <p className="text-xs text-stone-400">{song.artist}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'duration', header: 'Duration', render: (song) => <span className="font-mono text-stone-300">{song.duration ?? '—'}</span> },
              { key: 'plays', header: 'Plays', render: (song) => <span className="font-semibold text-stone-200">{formatNumber(song.playCount)}</span> },
              {
                key: 'rating',
                header: 'Rating',
                render: (song) => (
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-400">
                      {(song.averageRating ?? song.avgRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-stone-500">({song.ratingCount ?? 0})</span>
                  </div>
                ),
              },
              { key: 'released', header: 'Released', render: (song) => <span className="text-stone-400 text-xs">{formatDate(song.releaseDate)}</span> },
              {
                key: 'actions',
                header: 'Actions',
                render: (song) => (
                  <Link to={`/admin/songs/${song._id}/reviews`}>
                    <Button variant="secondary" size="sm" className="hover:border-amber-500/50 hover:text-amber-400">
                      Reviews
                    </Button>
                  </Link>
                ),
              },
            ]}
            rows={items}
            rowKey={(song) => song._id}
            isLoading={isFetching}
            empty={
              <EmptyState title={searchTerm ? `No songs found for "${searchTerm}".` : 'No songs found.'} />
            }
          />
        )}
        <Pagination
          meta={pagination}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value)
            setPage(1)
          }}
        />
      </Card>
    </div>
  )
}
