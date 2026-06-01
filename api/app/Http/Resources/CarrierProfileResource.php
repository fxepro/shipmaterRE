<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarrierProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'dot_number'               => $this->dot_number,
            'dot_verified'             => $this->dot_verified,
            'mc_number'                => $this->mc_number,
            'insurance_verified'       => $this->insurance_verified,
            'background_check_status'  => $this->background_check_status,
            'rating'                   => (float) $this->rating,
            'total_deliveries'         => $this->total_deliveries,
            'company_name'             => $this->company_name,
            'phone'                    => $this->phone,
        ];
    }
}
