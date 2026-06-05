<?php

namespace Database\Seeders;

use App\Models\ServiceType;
use Illuminate\Database\Seeder;

class ServiceTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Wipe and re-seed cleanly
        \DB::statement('SET CONSTRAINTS ALL DEFERRED');
        ServiceType::query()->delete();

        $categories = [
            [
                'key'      => 'freight_logistics',
                'name'     => 'Freight & Logistics',
                'icon'     => '🚛',
                'category' => 'commercial',
                'sort_order' => 1,
                'children' => [
                    ['key' => 'general_freight',   'name' => 'General Freight (LTL / FTL)',        'requires_dot' => true,  'requires_mc' => true],
                    ['key' => 'hotshot',            'name' => 'Hotshot / Expedited',                'requires_dot' => true,  'requires_mc' => true],
                    ['key' => 'refrigerated',       'name' => 'Refrigerated / Temperature Controlled', 'requires_dot' => true, 'requires_mc' => true],
                    ['key' => 'flatbed',            'name' => 'Flatbed & Step Deck',               'requires_dot' => true,  'requires_mc' => true],
                    ['key' => 'dry_van',            'name' => 'Dry Van',                           'requires_dot' => true,  'requires_mc' => true],
                    ['key' => 'hazmat',             'name' => 'Hazardous Materials (HAZMAT)',       'requires_dot' => true,  'requires_mc' => true, 'requires_cdl' => true, 'requires_hazmat' => true],
                ],
            ],
            [
                'key'      => 'medical_pharma',
                'name'     => 'Medical & Pharmaceutical',
                'icon'     => '🏥',
                'category' => 'medical',
                'sort_order' => 2,
                'children' => [
                    ['key' => 'medical_courier',         'name' => 'Medical Courier Services'],
                    ['key' => 'pharma_courier',          'name' => 'Pharmaceutical Courier Services'],
                    ['key' => 'hospital_courier',        'name' => 'Hospital Courier Services'],
                    ['key' => 'blood_platelets',         'name' => 'Blood & Platelets Courier Services'],
                    ['key' => 'temp_controlled_courier', 'name' => 'Temperature Controlled Courier Services'],
                    ['key' => 'life_science',            'name' => 'Life Science Courier Services'],
                ],
            ],
            [
                'key'      => 'auto_vehicles',
                'name'     => 'Auto & Vehicles',
                'icon'     => '🚗',
                'category' => 'specialized',
                'sort_order' => 3,
                'children' => [
                    ['key' => 'auto_transport_open',     'name' => 'Auto Transport — Open Carrier',   'requires_dot' => true, 'requires_mc' => true],
                    ['key' => 'auto_transport_enclosed', 'name' => 'Auto Transport — Enclosed',       'requires_dot' => true, 'requires_mc' => true],
                    ['key' => 'auto_parts',              'name' => 'Auto Parts Deliveries'],
                    ['key' => 'motorcycle_transport',    'name' => 'Motorcycle Transport'],
                    ['key' => 'rv_boat_powersports',     'name' => 'RV, Boat & Powersports',          'requires_dot' => true],
                ],
            ],
            [
                'key'      => 'art_antiques',
                'name'     => 'Art, Antiques & Specialty',
                'icon'     => '🎨',
                'category' => 'specialized',
                'sort_order' => 4,
                'children' => [
                    ['key' => 'white_glove',       'name' => 'White Glove Delivery'],
                    ['key' => 'fine_art',          'name' => 'Fine Art Transport'],
                    ['key' => 'antiques_estate',   'name' => 'Antiques & Estate Moves'],
                    ['key' => 'fragile_highvalue', 'name' => 'Fragile / High-Value Items'],
                ],
            ],
            [
                'key'      => 'food_beverage',
                'name'     => 'Food & Beverage',
                'icon'     => '🍱',
                'category' => 'commercial',
                'sort_order' => 5,
                'children' => [
                    ['key' => 'restaurant_supply',  'name' => 'Restaurant & Bar Supply'],
                    ['key' => 'grocery_retail',     'name' => 'Grocery & Retail Distribution'],
                    ['key' => 'cold_chain_food',    'name' => 'Cold Chain / Perishables', 'requires_dot' => true],
                    ['key' => 'alcohol_spirits',    'name' => 'Alcohol & Spirits Distribution'],
                ],
            ],
            [
                'key'      => 'construction_equipment',
                'name'     => 'Construction & Equipment',
                'icon'     => '🏗️',
                'category' => 'specialized',
                'sort_order' => 6,
                'children' => [
                    ['key' => 'heavy_equipment',  'name' => 'Heavy Equipment Transport', 'requires_dot' => true, 'requires_mc' => true, 'requires_cdl' => true],
                    ['key' => 'construction_materials', 'name' => 'Construction Materials', 'requires_dot' => true],
                    ['key' => 'oversized_load',   'name' => 'Oversized / Wide Load',     'requires_dot' => true, 'requires_mc' => true, 'requires_cdl' => true],
                    ['key' => 'crane_rigging',    'name' => 'Crane & Rigging',           'requires_dot' => true, 'requires_mc' => true],
                ],
            ],
            [
                'key'      => 'household',
                'name'     => 'Household',
                'icon'     => '🏠',
                'category' => 'local',
                'sort_order' => 7,
                'children' => [
                    ['key' => 'moving_relocation',    'name' => 'Moving & Relocation'],
                    ['key' => 'appliance_delivery',   'name' => 'Appliance Delivery & Removal'],
                    ['key' => 'furniture_delivery',   'name' => 'Furniture Delivery'],
                    ['key' => 'junk_removal',         'name' => 'Junk Removal / Trash Pickup'],
                    ['key' => 'compost_pickup',       'name' => 'Compost Pickup'],
                ],
            ],
            [
                'key'      => 'local_last_mile',
                'name'     => 'Local & Last Mile',
                'icon'     => '📦',
                'category' => 'local',
                'sort_order' => 8,
                'children' => [
                    ['key' => 'same_day_courier',  'name' => 'Same-Day Courier'],
                    ['key' => 'last_mile',         'name' => 'Last Mile Delivery'],
                    ['key' => 'parcel_delivery',   'name' => 'Parcel & Package Delivery'],
                    ['key' => 'b2b_local',         'name' => 'B2B Local Distribution'],
                ],
            ],
        ];

        foreach ($categories as $i => $cat) {
            $children = $cat['children'];
            unset($cat['children']);

            $parent = ServiceType::create(array_merge([
                'parent_id'       => null,
                'description'     => null,
                'requires_dot'    => false,
                'requires_mc'     => false,
                'requires_cdl'    => false,
                'requires_hazmat' => false,
                'active'          => true,
            ], $cat));

            foreach ($children as $j => $child) {
                ServiceType::create(array_merge([
                    'parent_id'       => $parent->id,
                    'description'     => null,
                    'icon'            => null,
                    'category'        => $cat['category'],
                    'requires_dot'    => false,
                    'requires_mc'     => false,
                    'requires_cdl'    => false,
                    'requires_hazmat' => false,
                    'active'          => true,
                    'sort_order'      => $j + 1,
                ], $child));
            }
        }
    }
}
