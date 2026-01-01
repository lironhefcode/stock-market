"use client"

import { formatTimeAgo } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface WatchlistNewsProps {
  news?: MarketNewsArticle[]
}

export default function WatchlistNews({ news }: WatchlistNewsProps) {
  if (!news || news.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="watchlist-title mb-4">Related News</h2>
        <p className="text-gray-500 text-center py-8">No news available at this time.</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="watchlist-title mb-4">Related News</h2>
      <div className="watchlist-news">
        {news.map((article) => (
          <Card
            key={article.id}
            className="news-item cursor-pointer"
            onClick={() => window.open(article.url, "_blank")}
          >
            <CardContent className="p-4">
              {article.related && <span className="news-tag">{article.related}</span>}
              <h3 className="news-title">{article.headline}</h3>
              <div className="news-meta">
                <span>{article.source}</span>
                {article.datetime && <span className="ml-2">• {formatTimeAgo(article.datetime)}</span>}
              </div>
              <p className="news-summary">{article.summary}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-cta"
                onClick={(e) => e.stopPropagation()}
              >
                Read More →
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
