<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    // ── Public ────────────────────────────────────────────────────────────────

    // GET /api/v1/blog
    public function index(Request $request): JsonResponse
    {
        $posts = BlogPost::published()
            ->with('author:id,name')
            ->orderByDesc('published_at')
            ->when($request->query('category'), fn($q, $cat) => $q->where('category', $cat))
            ->paginate(12);

        return response()->json([
            'data' => $posts->map(fn($p) => $this->summary($p)),
            'meta' => [
                'total'        => $posts->total(),
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
            ],
        ]);
    }

    // GET /api/v1/blog/{slug}
    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::published()->where('slug', $slug)->with('author:id,name')->firstOrFail();

        return response()->json(['data' => $this->full($post)]);
    }

    // ── Admin (auth:sanctum + admin role) ──────────────────────────────────────

    // GET /api/v1/admin/blog
    public function adminIndex(): JsonResponse
    {
        $posts = BlogPost::with('author:id,name')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $posts->map(fn($p) => array_merge($this->summary($p), [
                'status'     => $p->status,
                'updated_at' => $p->updated_at?->toISOString(),
            ])),
            'meta' => ['total' => $posts->total(), 'last_page' => $posts->lastPage()],
        ]);
    }

    // POST /api/v1/admin/blog
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'           => ['required', 'string', 'max:255'],
            'content'         => ['required', 'string'],
            'excerpt'         => ['sometimes', 'nullable', 'string', 'max:300'],
            'cover_image_url' => ['sometimes', 'nullable', 'string'],
            'category'        => ['sometimes', 'nullable', 'string', 'max:50'],
            'tags'            => ['sometimes', 'nullable', 'array'],
            'status'          => ['sometimes', 'in:draft,published'],
            'published_at'    => ['sometimes', 'nullable', 'date'],
        ]);

        $post = BlogPost::create(array_merge($data, [
            'author_id'    => $request->user()->id,
            'published_at' => $data['status'] === 'published'
                ? ($data['published_at'] ?? now())
                : null,
        ]));

        return response()->json(['data' => $this->full($post->load('author'))], 201);
    }

    // PUT /api/v1/admin/blog/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        $data = $request->validate([
            'title'           => ['sometimes', 'string', 'max:255'],
            'content'         => ['sometimes', 'string'],
            'excerpt'         => ['sometimes', 'nullable', 'string', 'max:300'],
            'cover_image_url' => ['sometimes', 'nullable', 'string'],
            'category'        => ['sometimes', 'nullable', 'string', 'max:50'],
            'tags'            => ['sometimes', 'nullable', 'array'],
            'status'          => ['sometimes', 'in:draft,published'],
            'published_at'    => ['sometimes', 'nullable', 'date'],
        ]);

        // Auto-set published_at when publishing for the first time
        if (($data['status'] ?? null) === 'published' && !$post->published_at) {
            $data['published_at'] = $data['published_at'] ?? now();
        }

        $post->update($data);

        return response()->json(['data' => $this->full($post->fresh('author'))]);
    }

    // DELETE /api/v1/admin/blog/{id}
    public function destroy(int $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();
        return response()->json(['message' => 'Post deleted.']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function summary(BlogPost $p): array
    {
        return [
            'id'              => $p->id,
            'title'           => $p->title,
            'slug'            => $p->slug,
            'excerpt'         => $p->excerpt,
            'cover_image_url' => $p->cover_image_url,
            'category'        => $p->category,
            'tags'            => $p->tags ?? [],
            'read_time_mins'  => $p->read_time_mins,
            'published_at'    => $p->published_at?->toISOString(),
            'author'          => $p->author ? ['id' => $p->author->id, 'name' => $p->author->name] : null,
        ];
    }

    private function full(BlogPost $p): array
    {
        return array_merge($this->summary($p), ['content' => $p->content]);
    }
}
