# Shipmater — Database Field Mapping
> Carrier Profile: all UI fields mapped to their table and column.
> Last updated: 2026-06-06

---

## TAB: Personal

| Field | Table | Column |
|---|---|---|
| First / Middle / Last / Suffix | `users` | `name` (stored combined) |
| Email | `users` | `email` |
| Phone | `carrier_profiles` | `phone` |
| Street Address | `carrier_profiles` | `street` |
| City | `carrier_profiles` | `city` |
| State | `carrier_profiles` | `state` |
| ZIP | `carrier_profiles` | `zip` |
| ID Type (DL / Passport) | `carrier_profiles` | `id_type` |
| DL Number | `carrier_profiles` | `dl_number` |
| DL Issuing State | `carrier_profiles` | `dl_state` |
| DL Expiry | `carrier_profiles` | `dl_expiry` |
| Date of Birth | `carrier_profiles` | `date_of_birth` |
| SSN Last 4 | `carrier_profiles` | `ssn_last_4` |
| Photo / Avatar URL | `carrier_profiles` | `photo_url` |
| DL Front (upload) | `carrier_documents` | `type = 'dl_front'` |
| DL Back (upload) | `carrier_documents` | `type = 'dl_back'` |
| Passport (upload) | `carrier_documents` | `type = 'passport'` |
| Selfie (upload) | `carrier_documents` | `type = 'selfie'` |
| Identity Verified | `carrier_profiles` | `identity_verified` |
| Identity Verified At | `carrier_profiles` | `identity_verified_at` |

---

## TAB: Services

| Field | Table | Column |
|---|---|---|
| Service type selections | `carrier_profile_service_types` | `carrier_profile_id`, `service_type_id` |
| Service type definitions | `service_types` | `id`, `key`, `name`, `icon`, `parent_id` |

---

## TAB: Certifications

| Field | Table | Column |
|---|---|---|
| Certification selections | `carrier_profile_certifications` | `carrier_profile_id`, `certification_id` |
| Certification definitions | `certifications` | `id`, `key`, `name`, `description`, `parent_id` |

---

## TAB: Commercial (DOT)

| Field | Table | Column |
|---|---|---|
| CDL Number | `carrier_profiles` | `cdl_number` |
| CDL Issuing State | `carrier_profiles` | `cdl_issuing_state` |
| CDL Class | `carrier_profiles` | `cdl_class` |
| CDL Expiry | `carrier_profiles` | `cdl_expiry_date` |
| CDL Front (upload) | `carrier_documents` | `type = 'cdl_front'` |
| CDL Back (upload) | `carrier_documents` | `type = 'cdl_back'` |
| HazMat Endorsement | `carrier_profiles` | `hazmat_endorsement` |
| HazMat Expiry | `carrier_profiles` | `hazmat_expiry_date` |
| Tanker Endorsement | `carrier_profiles` | `tanker_endorsement` |
| Passenger Endorsement | `carrier_profiles` | `passenger_endorsement` |
| USDOT Number | `carrier_profiles` | `usdot_number` |
| MC Number | `carrier_profiles` | `mc_number` |
| DOT Verified (FMCSA) | `carrier_profiles` | `dot_verified` |
| FMCSA Result Data | `carrier_verifications` | `check_type = 'fmcsa'`, `result_data` |
| FMCSA Checked At | `carrier_verifications` | `check_type = 'fmcsa'`, `updated_at` |
| FMCSA Expires At | `carrier_verifications` | `check_type = 'fmcsa'`, `expires_at` |

---

## TAB: Insurance

| Field | Table | Column |
|---|---|---|
| Auto Policy Number | `carrier_profiles` | `auto_policy_number` |
| Auto Insurer Name | `carrier_profiles` | `auto_insurer_name` |
| Auto Coverage Amount | `carrier_profiles` | `auto_coverage_amount` |
| Auto Effective Date | `carrier_profiles` | `auto_effective_date` |
| Auto Expiry Date | `carrier_profiles` | `auto_expiry_date` |
| Auto COI (upload) | `carrier_documents` | `type = 'insurance_auto'` |
| Cargo Policy Number | `carrier_profiles` | `cargo_policy_number` |
| Cargo Insurer Name | `carrier_profiles` | `cargo_insurer_name` |
| Cargo Coverage Amount | `carrier_profiles` | `cargo_coverage_amount` |
| Cargo Expiry Date | `carrier_profiles` | `cargo_expiry_date` |
| Cargo COI (upload) | `carrier_documents` | `type = 'insurance_cargo'` |
| Insurance Verified | `carrier_profiles` | `insurance_verified` |

---

## TAB: Medical

| Field | Table | Column |
|---|---|---|
| Medical Examiner Name | `carrier_profiles` | `medical_examiner_name` |
| DOT Medical Expiry | `carrier_profiles` | `dot_medical_expiry` |
| Medical Cert (upload) | `carrier_documents` | `type = 'medical_cert'` |
| Drug Test Date | `carrier_profiles` | `drug_test_date` |
| Drug Test Result | `carrier_profiles` | `drug_test_result` |

---

## TAB: Financial

| Field | Table | Column |
|---|---|---|
| Stripe Account ID | `carrier_profiles` | `stripe_account_id` |
| Stripe Account Status | `carrier_profiles` | `stripe_account_status` |
| Stripe Verification Data (JSON) | `carrier_profiles` | `stripe_verification_data` |

---

## TAB: Background

| Field | Table | Column |
|---|---|---|
| Background Check Status | `carrier_profiles` | `background_check_status` |
| Checkr Candidate ID | `carrier_profiles` | `checkr_candidate_id` |
| Checkr Report ID | `carrier_profiles` | `checkr_report_id` |
| Background Check Result | `carrier_verifications` | `check_type = 'background'`, `result_data` |
| MVR Result | `carrier_verifications` | `check_type = 'mvr'`, `result_data` |

---

## TAB: Vehicles

| Field | Table | Column |
|---|---|---|
| Type | `carrier_vehicles` | `type` |
| Year | `carrier_vehicles` | `year` |
| Make | `carrier_vehicles` | `make` |
| Model | `carrier_vehicles` | `model` |
| VIN | `carrier_vehicles` | `vin` |
| License Plate | `carrier_vehicles` | `license_plate` |
| License Plate State | `carrier_vehicles` | `license_plate_state` |
| GVWR (lbs) | `carrier_vehicles` | `gvwr` |
| Max Payload (lbs) | `carrier_vehicles` | `max_payload` |
| Cargo Length (in) | `carrier_vehicles` | `cargo_length` |
| Cargo Width (in) | `carrier_vehicles` | `cargo_width` |
| Cargo Height (in) | `carrier_vehicles` | `cargo_height` |
| Liftgate | `carrier_vehicles` | `liftgate` |
| Climate Controlled | `carrier_vehicles` | `climate_controlled` |
| Enclosed | `carrier_vehicles` | `enclosed` |
| Primary Vehicle | `carrier_vehicles` | `is_primary` |
| Registration Expiry | `carrier_vehicles` | `registration_expiry` |
| Vehicle Registration (upload) | `carrier_documents` | `type = 'vehicle_registration'` |
| Vehicle Photo Front (upload) | `carrier_documents` | `type = 'vehicle_photo_front'` |
| Vehicle Photo Rear (upload) | `carrier_documents` | `type = 'vehicle_photo_rear'` |
| Vehicle Photo Cargo (upload) | `carrier_documents` | `type = 'vehicle_photo_cargo'` |

---

## System / Verification Fields (internal — not on a tab)

| Field | Table | Column |
|---|---|---|
| Carrier Type | `carrier_profiles` | `carrier_type` |
| Org ID | `carrier_profiles` | `org_id` |
| Verification Status | `carrier_profiles` | `verification_status` |
| Verification Notes | `carrier_profiles` | `verification_notes` |
| Submitted For Verification | `carrier_profiles` | `submitted_for_verification_at` |
| Last Verification | `carrier_profiles` | `last_verification_at` |
| Next Re-verification | `carrier_profiles` | `next_reverification_at` |
| Rating | `carrier_profiles` | `rating` |
| Total Deliveries | `carrier_profiles` | `total_deliveries` |
| All Verification Records | `carrier_verifications` | `check_type`, `status`, `result_data`, `expires_at` |

---

## Supporting Tables (reference)

| Table | Purpose |
|---|---|
| `users` | Auth + name + email + role |
| `carrier_profiles` | All profile data, one row per carrier |
| `carrier_vehicles` | Fleet — one row per vehicle |
| `carrier_documents` | Uploaded files — one row per document |
| `carrier_verifications` | Verification results (FMCSA, Checkr, identity, MVR) — one row per check_type |
| `carrier_profile_service_types` | Pivot — which service types a carrier offers |
| `carrier_profile_certifications` | Pivot — which certifications a carrier holds |
| `service_types` | Service type definitions (hierarchical via parent_id) |
| `certifications` | Certification definitions (hierarchical via parent_id) |
| `organizations` | Multi-org — carrier's company |
| `org_members` | Pivot — users in an org |
