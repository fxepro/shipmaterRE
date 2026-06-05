<?php

namespace Database\Seeders;

use App\Models\ServiceType;
use Illuminate\Database\Seeder;

class ServiceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'key'          => 'freight',
                'name'         => 'General Freight',
                'description'  => 'Standard commercial freight and LTL/FTL loads.',
                'icon'         => '🚛',
                'category'     => 'commercial',
                'requires_dot' => true,
                'requires_mc'  => true,
                'requires_cdl' => false,
                'requires_hazmat' => false,
                'sort_order'   => 1,
            ],
            [
                'key'          => 'hotshot',
                'name'         => 'Hotshot',
                'description'  => 'Time-sensitive, expedited loads typically on flatbeds.',
                'icon'         => '⚡',
                'category'     => 'commercial',
                'requires_dot' => true,
                'requires_mc'  => true,
                'requires_cdl' => false,
                'requires_hazmat' => false,
                'sort_order'   => 2,
            ],
            [
                'key'          => 'auto_transport',
                'name'         => 'Auto Transport',
                'description'  => 'Vehicle transport on open or enclosed carriers.',
                'icon'         => '🚗',
                'category'     => 'specialized',
                'requires_dot' => true,
                'requires_mc'  => true,
                'requires_cdl' => false,
                'requires_hazmat' => false,
                'sort_order'   => 3,
            ],
            [
                'key'          => 'heavy_equipment',
                'name'         => 'Heavy Equipment',
                'description'  => 'Oversized and heavy haul loads requiring special permits.',
                'icon'         => '🏗️',
                'category'     => 'specialized',
                'requires_dot' => true,
                'requires_mc'  => true,
                'requires_cdl' => true,
                'requires_hazmat' => false,
                'sort_order'   => 4,
            ],
            [
                'key'          => 'hazmat',
                'name'         => 'Hazardous Materials',
                'description'  => 'Transport of hazardous materials requiring HAZMAT endorsement.',
                'icon'         => '☣️',
                'category'     => 'specialized',
                'requires_dot' => true,
                'requires_mc'  => true,
                'requires_cdl' => true,
                'requires_hazmat' => true,
                'sort_order'   => 5,
            ],
            [
                'key'          => 'refrigerated',
                'name'         => 'Refrigerated / Cold Chain',
                'description'  => 'Temperature-controlled transport for perishables and pharmaceuticals.',
                'icon'         => '❄️',
                'category'     => 'specialized',
                'requires_dot' => true,
                'requires_mc'  => true,
                'requires_cdl' => false,
                'requires_hazmat' => false,
                'sort_order'   => 6,
            ],
            [
                'key'          => 'medical_courier',
                'name'         => 'Medical Courier',
                'description'  => 'Medical specimens, supplies, and non-emergency medical transport.',
                'icon'         => '🏥',
                'category'     => 'medical',
                'requires_dot' => false,
                'requires_mc'  => false,
                'requires_cdl' => false,
                'requires_hazmat' => false,
                'sort_order'   => 7,
            ],
            [
                'key'          => 'white_glove',
                'name'         => 'White Glove',
                'description'  => 'High-value, fragile, or furniture requiring careful handling.',
                'icon'         => '🤍',
                'category'     => 'specialized',
                'requires_dot' => false,
                'requires_mc'  => false,
                'requires_cdl' => false,
                'requires_hazmat' => false,
                'sort_order'   => 8,
            ],
            [
                'key'          => 'last_mile',
                'name'         => 'Last Mile Delivery',
                'description'  => 'Local and regional final-leg delivery, parcels and packages.',
                'icon'         => '📦',
                'category'     => 'local',
                'requires_dot' => false,
                'requires_mc'  => false,
                'requires_cdl' => false,
                'requires_hazmat' => false,
                'sort_order'   => 9,
            ],
            [
                'key'          => 'moving',
                'name'         => 'Moving & Relocation',
                'description'  => 'Residential and commercial moving services.',
                'icon'         => '🏠',
                'category'     => 'local',
                'requires_dot' => false,
                'requires_mc'  => false,
                'requires_cdl' => false,
                'requires_hazmat' => false,
                'sort_order'   => 10,
            ],
        ];

        foreach ($types as $type) {
            ServiceType::updateOrCreate(['key' => $type['key']], $type);
        }
    }
}
