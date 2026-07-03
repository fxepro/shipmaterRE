<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrgInvitation;
use App\Models\OrgMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OrgController extends Controller
{
    // GET /api/v1/org
    public function show(Request $request): JsonResponse
    {
        $org = $request->user()->currentOrg;
        abort_if(!$org, 404);

        return response()->json([
            'data' => [
                'id'       => $org->id,
                'name'     => $org->name,
                'slug'     => $org->slug,
                'type'     => $org->type,
                'status'   => $org->status,
                'plan'     => $org->plan,
                'logo_url' => $org->logo_url,
                'phone'    => $org->phone,
                'email'    => $org->email,
                'website'  => $org->website,
            ],
        ]);
    }

    // PUT /api/v1/org
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $org  = $user->currentOrg;
        abort_if(!$org, 404);
        abort_unless($user->isOrgAdmin(), 403);

        $validated = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'phone'    => ['sometimes', 'nullable', 'string', 'max:40'],
            'email'    => ['sometimes', 'nullable', 'email'],
            'website'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'logo_url' => ['sometimes', 'nullable', 'string'],
        ]);

        $org->update($validated);

        return response()->json(['data' => $org->fresh()]);
    }

    // GET /api/v1/org/members
    public function members(Request $request): JsonResponse
    {
        $org = $request->user()->currentOrg;
        abort_if(!$org, 404);

        $members = OrgMember::where('org_id', $org->id)
            ->with('user')
            ->get()
            ->map(fn($m) => [
                'id'        => $m->id,
                'user_id'   => $m->user_id,
                'name'      => $m->user->name,
                'email'     => $m->user->email,
                'role'      => $m->role,
                'status'    => $m->status,
                'joined_at' => $m->joined_at?->toDateString(),
                'is_owner'  => $m->user_id === $org->owner_id,
            ]);

        return response()->json(['data' => $members]);
    }

    // PUT /api/v1/org/members/{id}
    public function updateMember(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isOrgAdmin(), 403);

        $member = OrgMember::where('org_id', $user->current_org_id)
                            ->where('id', $id)
                            ->firstOrFail();

        // Cannot change owner role
        abort_if($member->user_id === $user->currentOrg->owner_id, 403, 'Cannot change org owner role.');

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'dispatcher', 'driver', 'viewer'])],
        ]);

        $member->update($validated);

        return response()->json(['data' => $member->fresh()]);
    }

    // DELETE /api/v1/org/members/{id}
    public function removeMember(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isOrgAdmin(), 403);

        $member = OrgMember::where('org_id', $user->current_org_id)
                            ->where('id', $id)
                            ->firstOrFail();

        abort_if($member->user_id === $user->currentOrg->owner_id, 403, 'Cannot remove org owner.');
        abort_if($member->user_id === $user->id, 403, 'Cannot remove yourself.');

        $member->delete();

        return response()->json(['message' => 'Member removed.']);
    }

    // GET /api/v1/org/invitations
    public function invitations(Request $request): JsonResponse
    {
        $org = $request->user()->currentOrg;
        abort_if(!$org, 404);

        $invitations = OrgInvitation::where('org_id', $org->id)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->get()
            ->map(fn($i) => [
                'id'         => $i->id,
                'email'      => $i->email,
                'role'       => $i->role,
                'expires_at' => $i->expires_at->toDateString(),
            ]);

        return response()->json(['data' => $invitations]);
    }

    // POST /api/v1/org/invitations
    public function invite(Request $request): JsonResponse
    {
        $user = $request->user();
        $org  = $user->currentOrg;
        abort_if(!$org, 404);
        abort_unless($user->isOrgAdmin(), 403);

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role'  => ['required', Rule::in(['admin', 'dispatcher', 'driver', 'viewer'])],
        ]);

        // Delete any existing pending invite for this email
        OrgInvitation::where('org_id', $org->id)
            ->where('email', $validated['email'])
            ->delete();

        $invitation = OrgInvitation::create([
            'org_id'     => $org->id,
            'email'      => $validated['email'],
            'role'       => $validated['role'],
            'token'      => Str::random(64),
            'invited_by' => $user->id,
            'expires_at' => now()->addDays(7),
        ]);

        // TODO: send invitation email

        return response()->json([
            'data' => [
                'id'         => $invitation->id,
                'email'      => $invitation->email,
                'role'       => $invitation->role,
                'expires_at' => $invitation->expires_at->toDateString(),
            ],
        ], 201);
    }

    // DELETE /api/v1/org/invitations/{id}
    public function cancelInvitation(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isOrgAdmin(), 403);

        OrgInvitation::where('org_id', $user->current_org_id)
                     ->where('id', $id)
                     ->firstOrFail()
                     ->delete();

        return response()->json(['message' => 'Invitation cancelled.']);
    }

    // POST /api/v1/org/invitations/accept
    // Authenticated — user must be logged in (or register) before accepting.
    // The invitation token proves intent; email must match.
    public function acceptInvitation(Request $request): JsonResponse
    {
        $user      = $request->user();
        $validated = $request->validate(['token' => ['required', 'string', 'size:64']]);

        $invitation = OrgInvitation::where('token', $validated['token'])
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        abort_unless(
            strtolower($invitation->email) === strtolower($user->email),
            403,
            'This invitation was sent to a different email address.'
        );

        // Upsert membership — idempotent if already a member.
        OrgMember::firstOrCreate(
            ['org_id' => $invitation->org_id, 'user_id' => $user->id],
            ['role' => $invitation->role, 'status' => 'active', 'joined_at' => now()]
        );

        $invitation->update(['accepted_at' => now()]);

        // Switch the user's active org to the one they just joined.
        $user->update(['current_org_id' => $invitation->org_id]);

        return response()->json([
            'message' => 'Invitation accepted.',
            'org_id'  => $invitation->org_id,
        ]);
    }

    // PUT /api/v1/org/switch
    // Allows a user who belongs to multiple orgs to change their active org.
    public function switchOrg(Request $request): JsonResponse
    {
        $user      = $request->user();
        $validated = $request->validate(['org_id' => ['required', 'integer']]);

        // Verify the user is an active member of the target org.
        $member = OrgMember::where('user_id', $user->id)
            ->where('org_id', $validated['org_id'])
            ->where('status', 'active')
            ->firstOrFail();

        $user->update(['current_org_id' => $member->org_id]);

        $org = Organization::find($member->org_id);

        return response()->json([
            'message' => 'Active org switched.',
            'org'     => [
                'id'   => $org->id,
                'name' => $org->name,
                'slug' => $org->slug,
                'type' => $org->type,
            ],
        ]);
    }

    // GET /api/v1/user/organizations
    // Lists all orgs the authenticated user belongs to (for an org-switcher UI).
    public function userOrgs(Request $request): JsonResponse
    {
        $user = $request->user();

        $orgs = OrgMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->with('org')
            ->get()
            ->map(fn($m) => [
                'id'         => $m->org->id,
                'name'       => $m->org->name,
                'slug'       => $m->org->slug,
                'type'       => $m->org->type,
                'plan'       => $m->org->plan,
                'logo_url'   => $m->org->logo_url,
                'org_role'   => $m->role,
                'is_current' => $m->org_id === $user->current_org_id,
            ]);

        return response()->json(['data' => $orgs]);
    }
}
