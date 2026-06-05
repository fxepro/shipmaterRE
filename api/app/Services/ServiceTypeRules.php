<?php

namespace App\Services;

class ServiceTypeRules
{
    /**
     * Per-service-type field requirements.
     * 'required'    — must be filled before profile is considered complete
     * 'recommended' — shown in UI but not blocking
     */
    private const RULES = [
        'freight' => [
            'required'    => ['dot_number', 'mc_number', 'company_name', 'auto_policy_number', 'cargo_policy_number'],
            'recommended' => ['cdl_number', 'usdot_number', 'dot_medical_expiry'],
            'tabs'        => ['dot_commercial', 'insurance'],
        ],
        'hotshot' => [
            'required'    => ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'],
            'recommended' => ['company_name', 'cdl_number'],
            'tabs'        => ['dot_commercial', 'insurance'],
        ],
        'auto_transport' => [
            'required'    => ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'],
            'recommended' => ['company_name'],
            'tabs'        => ['dot_commercial', 'insurance'],
        ],
        'heavy_equipment' => [
            'required'    => ['dot_number', 'mc_number', 'cdl_number', 'cdl_class', 'auto_policy_number', 'cargo_policy_number'],
            'recommended' => ['company_name', 'dot_medical_expiry'],
            'tabs'        => ['dot_commercial', 'insurance', 'medical'],
        ],
        'hazmat' => [
            'required'    => ['dot_number', 'mc_number', 'cdl_number', 'hazmat_endorsement', 'auto_policy_number', 'cargo_policy_number'],
            'recommended' => ['hazmat_expiry_date', 'dot_medical_expiry'],
            'tabs'        => ['dot_commercial', 'insurance', 'medical'],
        ],
        'refrigerated' => [
            'required'    => ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'],
            'recommended' => ['company_name'],
            'tabs'        => ['dot_commercial', 'insurance'],
        ],
        'medical_courier' => [
            'required'    => ['auto_policy_number'],
            'recommended' => ['cargo_policy_number', 'background_check_status'],
            'tabs'        => ['personal', 'insurance'],
        ],
        'white_glove' => [
            'required'    => ['auto_policy_number', 'cargo_policy_number'],
            'recommended' => ['background_check_status'],
            'tabs'        => ['personal', 'insurance'],
        ],
        'last_mile' => [
            'required'    => ['auto_policy_number'],
            'recommended' => ['background_check_status'],
            'tabs'        => ['personal', 'insurance'],
        ],
        'moving' => [
            'required'    => ['auto_policy_number', 'cargo_policy_number'],
            'recommended' => ['background_check_status'],
            'tabs'        => ['personal', 'insurance'],
        ],
    ];

    /**
     * Get merged required fields for a set of selected service type keys.
     */
    public static function requiredFields(array $keys): array
    {
        $required = [];
        foreach ($keys as $key) {
            $required = array_merge($required, self::RULES[$key]['required'] ?? []);
        }
        return array_values(array_unique($required));
    }

    /**
     * Get merged recommended fields.
     */
    public static function recommendedFields(array $keys): array
    {
        $recommended = [];
        foreach ($keys as $key) {
            $recommended = array_merge($recommended, self::RULES[$key]['recommended'] ?? []);
        }
        return array_values(array_unique($recommended));
    }

    /**
     * Get which profile tabs are relevant for the selected service types.
     */
    public static function relevantTabs(array $keys): array
    {
        $tabs = ['personal']; // always shown
        foreach ($keys as $key) {
            $tabs = array_merge($tabs, self::RULES[$key]['tabs'] ?? []);
        }
        return array_values(array_unique($tabs));
    }

    /**
     * Check if any selected type requires DOT.
     */
    public static function requiresDot(array $keys): bool
    {
        foreach ($keys as $key) {
            if (in_array('dot_number', self::RULES[$key]['required'] ?? [])) return true;
        }
        return false;
    }
}
