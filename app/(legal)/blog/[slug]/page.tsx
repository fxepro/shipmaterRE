'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import { blogApi } from '@/lib/api';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogApi.get(slug).then(r => r.data.data),
    enabled: !!slug,
  });

  const post = data;

  const date = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  if (isLoading) {
    return (
      <div className="bg-[var(--color-cream)] min-h-screen">
        <div className="mx-auto max-w-3xl px-6 py-20 animate-pulse space-y-6">
          <div className="h-6 w-24 rounded bg-[var(--color-cream-dark)]" />
          <div className="h-12 w-3/4 rounded bg-[var(--color-cream-dark)]" />
          <div className="h-64 rounded-2xl bg-[var(--color-cream-dark)]" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`h-4 rounded bg-[var(--color-cream-dark)] ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="bg-[var(--color-cream)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-[var(--color-slate)] mb-2">Post not found</p>
          <p className="text-[var(--color-text-muted)] mb-6">This article may have been moved or removed.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)] hover:underline">
            <ArrowLeft size={14} /> Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-cream)]">

      {/* Hero */}
      <div className="bg-[var(--color-slate)] text-white px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-sage-light)] hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} /> All posts
          </Link>
          {post.category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-teal)] px-3 py-1 text-xs font-semibold text-white mb-4">
              <Tag size={10} /> {post.category}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl text-white leading-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--color-sage-light)] flex-wrap">
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User size={13} /> {post.author.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {post.read_time_mins} min read
            </span>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {post.cover_image_url && (
        <div className="mx-auto max-w-3xl px-6 -mt-8">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full rounded-2xl shadow-lg object-cover max-h-96"
          />
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div
          className="prose prose-slate max-w-none
            prose-headings:font-semibold prose-headings:text-[var(--color-slate)]
            prose-p:text-[var(--color-text-muted)] prose-p:leading-relaxed
            prose-a:text-[var(--color-teal)] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[var(--color-text)]
            prose-ul:text-[var(--color-text-muted)] prose-li:text-[var(--color-text-muted)]
            prose-blockquote:border-[var(--color-teal)] prose-blockquote:text-[var(--color-text-muted)]
            prose-code:text-[var(--color-teal)] prose-code:bg-[var(--color-cream)] prose-code:px-1 prose-code:rounded"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[var(--color-cream-dark)] flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-[var(--color-text-faint)]" />
            {post.tags.map((tag: string) => (
              <span key={tag} className="rounded-full border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-[var(--color-cream-dark)]">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)] hover:underline">
            <ArrowLeft size={14} /> Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}
