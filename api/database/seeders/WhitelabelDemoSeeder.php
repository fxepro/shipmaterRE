<?php

namespace Database\Seeders;

use App\Models\OrgMember;
use App\Models\Organization;
use App\Models\PlatformTenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class WhitelabelDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Clean up any previous run
        $existing = User::where('email', 'tenant@demo.com')->first();
        if ($existing) {
            $existing->tokens()->delete();
            PlatformTenant::where('org_id', $existing->current_org_id)->delete();
            Organization::where('owner_id', $existing->id)->delete();
            $existing->delete();
        }

        $user = User::create([
            'name'     => 'FreightPro Owner',
            'email'    => 'tenant@demo.com',
            'password' => 'password',
            'role'     => 'shipper',
        ]);

        $org = Organization::create([
            'name'               => 'FreightPro',
            'slug'               => 'freightpro',
            'type'               => 'shipper',
            'status'             => 'active',
            'owner_id'           => $user->id,
            'is_platform_tenant' => true,
        ]);

        OrgMember::create([
            'org_id'    => $org->id,
            'user_id'   => $user->id,
            'role'      => 'owner',
            'status'    => 'active',
            'joined_at' => now(),
        ]);

        $user->update(['current_org_id' => $org->id]);

        PlatformTenant::create([
            'org_id'          => $org->id,
            'subdomain'       => 'freightpro',
            'brand_name'      => 'FreightPro',
            'primary_color'   => '#0096C7',
            'secondary_color' => '#0A2E40',
            'hide_powered_by' => false,
            'status'          => 'active',
            'feature_flags'   => ['api_access' => true, 'custom_domain' => false],
            'billing_email'   => 'tenant@demo.com',
        ]);

        $this->command->info('White-label tenant created: tenant@demo.com / password');
        $this->command->info("Org: FreightPro (ID {$org->id}) | Tenant subdomain: freightpro");
    }
}
