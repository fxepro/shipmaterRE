<?php

namespace Database\Seeders;

use App\Models\Certification;
use Illuminate\Database\Seeder;

class CertificationSeeder extends Seeder
{
    public function run(): void
    {
        \DB::statement('SET CONSTRAINTS ALL DEFERRED');
        Certification::query()->delete();

        $categories = [
            [
                'key'        => 'medical_healthcare',
                'name'       => 'Medical & Healthcare',
                'icon'       => '🏥',
                'category'   => 'medical',
                'sort_order' => 1,
                'children'   => [
                    ['key' => 'hipaa',             'name' => 'HIPAA Privacy & Security Certification',          'description' => 'Protection of Protected Health Information (PHI) and patient confidentiality.'],
                    ['key' => 'bloodborne_path',   'name' => 'OSHA Bloodborne Pathogens (29 CFR 1910.1030)',   'description' => 'Occupational exposure to blood and infectious materials. Annual renewal required.'],
                    ['key' => 'hazcom',            'name' => 'OSHA Hazard Communication (HazCom)',             'description' => 'Recognizing and handling hazardous materials in a healthcare context.'],
                    ['key' => 'gdp',               'name' => 'Good Distribution Practice (GDP)',               'description' => 'Pharmaceutical supply chain and cold chain compliance certification.'],
                    ['key' => 'temp_management',   'name' => 'Temperature Management / Cold Chain',            'description' => 'Cold chain logistics across ambient, refrigerated, frozen, dry ice, and cryogenic tiers.'],
                    ['key' => 'chain_of_custody',  'name' => 'Chain of Custody Certification',                 'description' => 'Documentation and handling procedures for specimen and sample integrity.'],
                ],
            ],
            [
                'key'        => 'dot_federal',
                'name'       => 'DOT & Federal Compliance',
                'icon'       => '🚦',
                'category'   => 'compliance',
                'sort_order' => 2,
                'children'   => [
                    ['key' => 'dot_medical_cert',  'name' => 'DOT Medical Examiner Certificate',              'description' => 'Physical examination certificate required for safety-sensitive driving positions.'],
                    ['key' => 'dot_drug_alcohol',  'name' => 'DOT Drug & Alcohol Testing Program',            'description' => 'Pre-employment, random, post-accident, and reasonable suspicion testing compliance.'],
                    ['key' => 'fmcsa_cargo_sec',   'name' => 'FMCSA Cargo Securement (49 CFR 393)',           'description' => 'Proper cargo securing and inspection per federal regulations.'],
                    ['key' => 'eld_compliance',    'name' => 'Electronic Logging Device (ELD) Compliance',    'description' => 'Mandatory for most commercial motor vehicles per 49 CFR Part 395.'],
                    ['key' => 'dot_hazmat_cert',   'name' => 'DOT Hazardous Materials (49 CFR 172.704)',      'description' => 'Hazmat regulations, classification, labeling, and packaging. Valid 3 years.'],
                ],
            ],
            [
                'key'        => 'safety_training',
                'name'       => 'Safety Training',
                'icon'       => '🦺',
                'category'   => 'safety',
                'sort_order' => 3,
                'children'   => [
                    ['key' => 'osha_10',           'name' => 'OSHA 10-Hour General Industry',                 'description' => 'Entry-level OSHA safety awareness for general industry workers.'],
                    ['key' => 'osha_30',           'name' => 'OSHA 30-Hour General Industry',                 'description' => 'Advanced OSHA safety training for supervisors and safety personnel.'],
                    ['key' => 'defensive_driving', 'name' => 'Defensive Driving Certification',               'description' => 'Advanced driving techniques to reduce collision risk.'],
                    ['key' => 'load_securement',   'name' => 'Load Securement Training',                      'description' => 'Proper techniques for securing cargo to prevent shifting or loss.'],
                    ['key' => 'forklift',          'name' => 'Forklift Operator Certification',               'description' => 'OSHA-compliant certification for powered industrial truck operation.'],
                ],
            ],
            [
                'key'        => 'specialty_handling',
                'name'       => 'Specialty Handling',
                'icon'       => '🤍',
                'category'   => 'specialty',
                'sort_order' => 4,
                'children'   => [
                    ['key' => 'servsafe',          'name' => 'ServSafe Food Handler Certification',           'description' => 'Standard food safety and handling certification from the National Restaurant Association.'],
                    ['key' => 'tsa_ccsp',          'name' => 'TSA Certified Cargo Screening (CCSP)',          'description' => 'Air and ground cargo security screening and handling authorization.'],
                    ['key' => 'white_glove_cert',  'name' => 'White Glove Carrier Network Certification',    'description' => '23-module program covering safe handling and installation of high-value items.'],
                    ['key' => 'fine_art_handling', 'name' => 'Fine Art Handling & Packing',                  'description' => 'Specialized techniques for packing, handling, and transporting fine art.'],
                    ['key' => 'a4dd',              'name' => 'Home Goods Delivery Certification (A4DD)',      'description' => 'Training qualifying personnel for white-glove work and liability insurance coverage.'],
                ],
            ],
            [
                'key'        => 'security_background',
                'name'       => 'Security & Background',
                'icon'       => '🔒',
                'category'   => 'security',
                'sort_order' => 5,
                'children'   => [
                    ['key' => 'tsa_known_shipper', 'name' => 'TSA Known Shipper Authorization',               'description' => 'Authorization to handle and transport air cargo as a vetted shipper.'],
                    ['key' => 'bg_check_federal',  'name' => 'Federal Background Check',                      'description' => 'FBI-level criminal background check clearance.'],
                    ['key' => 'bg_check_state',    'name' => 'State Background Check',                        'description' => 'State-level criminal background check clearance.'],
                    ['key' => 'mvr_check',         'name' => 'Motor Vehicle Record (MVR) Check',              'description' => 'Verified clean driving history from state DMV records.'],
                ],
            ],
        ];

        foreach ($categories as $cat) {
            $children = $cat['children'];
            unset($cat['children']);

            $parent = Certification::create(array_merge([
                'parent_id'   => null,
                'description' => null,
                'icon'        => null,
                'active'      => true,
            ], $cat));

            foreach ($children as $j => $child) {
                Certification::create(array_merge([
                    'parent_id'   => $parent->id,
                    'icon'        => null,
                    'category'    => $cat['category'],
                    'active'      => true,
                    'sort_order'  => $j + 1,
                ], $child));
            }
        }
    }
}
