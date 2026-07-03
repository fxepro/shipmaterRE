--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bids; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bids (
    id bigint NOT NULL,
    shipment_id bigint NOT NULL,
    carrier_id bigint NOT NULL,
    amount numeric(10,2) NOT NULL,
    estimated_pickup_date date NOT NULL,
    estimated_delivery_date date NOT NULL,
    note text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    org_id bigint,
    CONSTRAINT bids_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'withdrawn'::character varying])::text[])))
);


--
-- Name: bids_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bids_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bids_id_seq OWNED BY public.bids.id;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id bigint NOT NULL,
    author_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    content text NOT NULL,
    cover_image_url character varying(255),
    category character varying(255),
    tags json,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    published_at timestamp(0) without time zone,
    read_time_mins integer DEFAULT 3 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT blog_posts_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying])::text[])))
);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: carrier_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrier_documents (
    id bigint NOT NULL,
    carrier_profile_id bigint NOT NULL,
    carrier_vehicle_id bigint,
    type character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    url character varying(255) NOT NULL,
    mime_type character varying(255),
    size bigint,
    policy_number character varying(255),
    insurer_name character varying(255),
    coverage_amount numeric(12,2),
    effective_date date,
    expiry_date date,
    verified_by bigint,
    verified_at timestamp(0) without time zone,
    verification_notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    org_id bigint
);


--
-- Name: carrier_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carrier_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carrier_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carrier_documents_id_seq OWNED BY public.carrier_documents.id;


--
-- Name: carrier_profile_certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrier_profile_certifications (
    id bigint NOT NULL,
    carrier_profile_id bigint NOT NULL,
    certification_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: carrier_profile_certifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carrier_profile_certifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carrier_profile_certifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carrier_profile_certifications_id_seq OWNED BY public.carrier_profile_certifications.id;


--
-- Name: carrier_profile_service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrier_profile_service_types (
    id bigint NOT NULL,
    carrier_profile_id bigint NOT NULL,
    service_type_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: carrier_profile_service_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carrier_profile_service_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carrier_profile_service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carrier_profile_service_types_id_seq OWNED BY public.carrier_profile_service_types.id;


--
-- Name: carrier_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrier_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_name character varying(255),
    phone character varying(255),
    dot_number character varying(255),
    dot_verified boolean DEFAULT false NOT NULL,
    mc_number character varying(255),
    insurance_verified boolean DEFAULT false NOT NULL,
    background_check_status character varying(255) DEFAULT 'not_submitted'::character varying NOT NULL,
    rating numeric(3,2) DEFAULT '5'::numeric NOT NULL,
    total_deliveries integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    carrier_type character varying(255) DEFAULT 'sole_proprietor'::character varying NOT NULL,
    carrier_type_selected_at timestamp(0) without time zone,
    date_of_birth date,
    ssn_last_4 character varying(4),
    photo_url character varying(255),
    cdl_number character varying(20),
    cdl_expiry_date date,
    cdl_class character varying(5),
    usdot_number character varying(20),
    hazmat_endorsement boolean DEFAULT false NOT NULL,
    hazmat_expiry_date date,
    dot_medical_expiry date,
    drug_test_date date,
    drug_test_result character varying(20),
    verification_status character varying(30) DEFAULT 'incomplete'::character varying NOT NULL,
    verification_status_updated_at timestamp(0) without time zone,
    verification_notes text,
    stripe_account_id character varying(255),
    stripe_account_status character varying(30) DEFAULT 'not_connected'::character varying NOT NULL,
    stripe_verification_data json,
    submitted_for_verification_at timestamp(0) without time zone,
    last_verification_at timestamp(0) without time zone,
    next_reverification_at timestamp(0) without time zone,
    cdl_issuing_state character varying(2),
    tanker_endorsement boolean DEFAULT false NOT NULL,
    passenger_endorsement boolean DEFAULT false NOT NULL,
    medical_examiner_name character varying(255),
    auto_policy_number character varying(255),
    auto_insurer_name character varying(255),
    auto_coverage_amount numeric(12,2),
    auto_effective_date date,
    auto_expiry_date date,
    cargo_policy_number character varying(255),
    cargo_insurer_name character varying(255),
    cargo_coverage_amount numeric(12,2),
    cargo_expiry_date date,
    org_id bigint,
    identity_verified boolean DEFAULT false NOT NULL,
    identity_verified_at timestamp(0) without time zone,
    checkr_candidate_id character varying(255),
    checkr_report_id character varying(255),
    street character varying(255),
    city character varying(100),
    state character varying(2),
    zip character varying(10),
    id_type character varying(10),
    dl_number character varying(30),
    dl_state character varying(2),
    dl_expiry date,
    mc_verified boolean DEFAULT false NOT NULL,
    onboarding_fee_paid boolean DEFAULT false NOT NULL,
    onboarding_fee_payment_intent_id character varying(255),
    clearinghouse_query_id character varying(255),
    clearinghouse_query_status character varying(255) DEFAULT 'not_run'::character varying NOT NULL,
    clearinghouse_queried_at timestamp(0) without time zone,
    clearinghouse_completed_at timestamp(0) without time zone,
    clearinghouse_result_data json,
    CONSTRAINT carrier_profiles_background_check_status_check CHECK (((background_check_status)::text = ANY ((ARRAY['not_submitted'::character varying, 'pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: carrier_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carrier_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carrier_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carrier_profiles_id_seq OWNED BY public.carrier_profiles.id;


--
-- Name: carrier_vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrier_vehicles (
    id bigint NOT NULL,
    carrier_profile_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    year character varying(4) NOT NULL,
    make character varying(255) NOT NULL,
    model character varying(255) NOT NULL,
    vin character varying(255),
    license_plate character varying(255),
    license_plate_state character varying(2),
    gvwr numeric(10,2),
    max_payload numeric(10,2),
    cargo_length numeric(8,2),
    cargo_width numeric(8,2),
    cargo_height numeric(8,2),
    liftgate boolean DEFAULT false NOT NULL,
    climate_controlled boolean DEFAULT false NOT NULL,
    enclosed boolean DEFAULT false NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    registration_expiry date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    org_id bigint
);


--
-- Name: carrier_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carrier_vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carrier_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carrier_vehicles_id_seq OWNED BY public.carrier_vehicles.id;


--
-- Name: carrier_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrier_verifications (
    id bigint NOT NULL,
    carrier_profile_id bigint NOT NULL,
    check_type character varying(50) NOT NULL,
    status character varying(30) DEFAULT 'not_started'::character varying NOT NULL,
    result_data json,
    external_id character varying(255),
    admin_notes text,
    reviewed_by bigint,
    reviewed_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    org_id bigint
);


--
-- Name: carrier_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carrier_verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carrier_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carrier_verifications_id_seq OWNED BY public.carrier_verifications.id;


--
-- Name: certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certifications (
    id bigint NOT NULL,
    parent_id bigint,
    key character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    icon character varying(255),
    category character varying(255) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: certifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certifications_id_seq OWNED BY public.certifications.id;


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id bigint NOT NULL,
    shipper_id bigint NOT NULL,
    carrier_id bigint NOT NULL,
    rate_type character varying(20) NOT NULL,
    rate numeric(10,2) NOT NULL,
    fuel_surcharge numeric(8,2),
    detention_rate numeric(8,2),
    free_time_hrs smallint DEFAULT '2'::smallint NOT NULL,
    equipment_type character varying(30),
    max_weight_lbs integer,
    coverage character varying(200) NOT NULL,
    payment_terms character varying(20) DEFAULT 'Net 30'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'Standard'::character varying NOT NULL,
    auto_renew boolean DEFAULT false NOT NULL,
    valid_from date NOT NULL,
    valid_to date NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    shipments_under integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    shipper_org_id bigint,
    carrier_org_id bigint,
    signed_at timestamp(0) without time zone,
    carrier_response_at timestamp(0) without time zone,
    carrier_declined_reason character varying(255),
    title character varying(255),
    payment_schedule character varying(255) DEFAULT 'immediate'::character varying NOT NULL,
    payment_day smallint,
    shipper_signed_at timestamp(0) without time zone,
    terms_snapshot json,
    optimization_mode character varying(255) DEFAULT 'shortest_route'::character varying NOT NULL,
    CONSTRAINT contracts_optimization_mode_check CHECK (((optimization_mode)::text = ANY ((ARRAY['cluster_pickups'::character varying, 'shortest_route'::character varying])::text[]))),
    CONSTRAINT contracts_payment_schedule_check CHECK (((payment_schedule)::text = ANY ((ARRAY['immediate'::character varying, 'daily'::character varying, 'weekly'::character varying, 'bi_weekly'::character varying, 'monthly'::character varying])::text[])))
);


--
-- Name: contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contracts_id_seq OWNED BY public.contracts.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: freight_job_offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.freight_job_offers (
    id bigint NOT NULL,
    freight_job_id bigint NOT NULL,
    carrier_id bigint NOT NULL,
    amount numeric(10,2) NOT NULL,
    note text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    rate_type character varying(20) DEFAULT 'flat'::character varying NOT NULL,
    rate_value numeric(10,2),
    fuel_surcharge numeric(8,2),
    detention_rate numeric(8,2),
    free_time_hrs smallint,
    equipment_type character varying(30),
    max_weight_lbs integer,
    payment_terms character varying(20),
    CONSTRAINT freight_job_offers_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'withdrawn'::character varying])::text[])))
);


--
-- Name: freight_job_offers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.freight_job_offers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: freight_job_offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.freight_job_offers_id_seq OWNED BY public.freight_job_offers.id;


--
-- Name: freight_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.freight_jobs (
    id bigint NOT NULL,
    contract_id bigint,
    shipper_id bigint NOT NULL,
    carrier_id bigint,
    org_id bigint,
    title character varying(255),
    reference_number character varying(255),
    special_instructions text,
    total_weight_lbs integer,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    optimization_mode character varying(255) DEFAULT 'shortest_route'::character varying NOT NULL,
    route_distance_miles numeric(8,2),
    route_duration_minutes integer,
    route_optimized_at timestamp(0) without time zone,
    route_snapshot json,
    payment_amount_cents bigint,
    payment_status character varying(255) DEFAULT 'unpaid'::character varying NOT NULL,
    posted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    cost_breakdown jsonb,
    quote_requirements jsonb,
    CONSTRAINT freight_jobs_optimization_mode_check CHECK (((optimization_mode)::text = ANY ((ARRAY['cluster_pickups'::character varying, 'shortest_route'::character varying])::text[]))),
    CONSTRAINT freight_jobs_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['unpaid'::character varying, 'processing'::character varying, 'paid'::character varying])::text[]))),
    CONSTRAINT freight_jobs_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'posted'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'disputed'::character varying])::text[])))
);


--
-- Name: freight_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.freight_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: freight_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.freight_jobs_id_seq OWNED BY public.freight_jobs.id;


--
-- Name: gps_pings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gps_pings (
    id bigint NOT NULL,
    shipment_id bigint NOT NULL,
    lat numeric(10,8) NOT NULL,
    lng numeric(11,8) NOT NULL,
    speed numeric(5,2),
    eta character varying(255),
    pinged_at timestamp(0) without time zone NOT NULL
);


--
-- Name: gps_pings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gps_pings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gps_pings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gps_pings_id_seq OWNED BY public.gps_pings.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: job_evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_evidence (
    id bigint NOT NULL,
    freight_job_id bigint NOT NULL,
    job_stop_id bigint NOT NULL,
    uploaded_by bigint NOT NULL,
    evidence_type character varying(255) NOT NULL,
    file_key character varying(255) NOT NULL,
    file_url character varying(255) NOT NULL,
    file_size_bytes integer,
    mime_type character varying(50),
    lat numeric(10,7),
    lng numeric(10,7),
    taken_at timestamp(0) without time zone,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT job_evidence_evidence_type_check CHECK (((evidence_type)::text = ANY ((ARRAY['pickup'::character varying, 'dropoff'::character varying, 'damage'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: job_evidence_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_evidence_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_evidence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_evidence_id_seq OWNED BY public.job_evidence.id;


--
-- Name: job_stop_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_stop_items (
    id bigint NOT NULL,
    pickup_stop_id bigint NOT NULL,
    delivery_stop_id bigint NOT NULL,
    description character varying(255) NOT NULL,
    quantity smallint DEFAULT '1'::smallint NOT NULL,
    unit character varying(255) DEFAULT 'pallet'::character varying NOT NULL,
    weight_lbs integer,
    sku character varying(255),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT job_stop_items_unit_check CHECK (((unit)::text = ANY ((ARRAY['pallet'::character varying, 'box'::character varying, 'piece'::character varying, 'bag'::character varying, 'drum'::character varying, 'crate'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: job_stop_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_stop_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_stop_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_stop_items_id_seq OWNED BY public.job_stop_items.id;


--
-- Name: job_stops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_stops (
    id bigint NOT NULL,
    freight_job_id bigint NOT NULL,
    location_id bigint,
    stop_type character varying(255) NOT NULL,
    sequence smallint NOT NULL,
    optimized_sequence smallint,
    contact_name character varying(255),
    contact_phone character varying(255),
    address character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    state character varying(10) NOT NULL,
    zip character varying(20) NOT NULL,
    lat numeric(10,7),
    lng numeric(10,7),
    scheduled_date date,
    window_start time(0) without time zone,
    window_end time(0) without time zone,
    estimated_arrival_at timestamp(0) without time zone,
    weight_lbs integer,
    special_instructions text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    en_route_at timestamp(0) without time zone,
    arrived_at timestamp(0) without time zone,
    completed_at timestamp(0) without time zone,
    carrier_notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    name character varying(255),
    CONSTRAINT job_stops_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'en_route'::character varying, 'arrived'::character varying, 'completed'::character varying])::text[]))),
    CONSTRAINT job_stops_stop_type_check CHECK (((stop_type)::text = ANY ((ARRAY['pickup'::character varying, 'dropoff'::character varying])::text[])))
);


--
-- Name: job_stops_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_stops_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_stops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_stops_id_seq OWNED BY public.job_stops.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id bigint NOT NULL,
    shipper_id bigint NOT NULL,
    org_id bigint,
    type character varying(255) DEFAULT 'pickup'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    contact_name character varying(255),
    contact_phone character varying(255),
    contact_email character varying(255),
    address character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    state character varying(10) NOT NULL,
    zip character varying(20) NOT NULL,
    country character varying(5) DEFAULT 'US'::character varying NOT NULL,
    lat numeric(10,7),
    lng numeric(10,7),
    operating_hours json,
    notes text,
    is_default boolean DEFAULT false NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    last_used_at timestamp(0) without time zone,
    CONSTRAINT locations_type_check CHECK (((type)::text = ANY ((ARRAY['pickup'::character varying, 'delivery'::character varying, 'both'::character varying])::text[])))
);


--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: org_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.org_invitations (
    id bigint NOT NULL,
    org_id bigint NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'viewer'::character varying NOT NULL,
    token character varying(64) NOT NULL,
    invited_by bigint NOT NULL,
    accepted_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT org_invitations_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'dispatcher'::character varying, 'driver'::character varying, 'viewer'::character varying])::text[])))
);


--
-- Name: org_invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.org_invitations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: org_invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.org_invitations_id_seq OWNED BY public.org_invitations.id;


--
-- Name: org_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.org_members (
    id bigint NOT NULL,
    org_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role character varying(255) DEFAULT 'viewer'::character varying NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    joined_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT org_members_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'dispatcher'::character varying, 'driver'::character varying, 'viewer'::character varying])::text[]))),
    CONSTRAINT org_members_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'invited'::character varying, 'suspended'::character varying])::text[])))
);


--
-- Name: org_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.org_members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: org_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.org_members_id_seq OWNED BY public.org_members.id;


--
-- Name: org_service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.org_service_types (
    id bigint NOT NULL,
    org_id bigint NOT NULL,
    service_type_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: org_service_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.org_service_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: org_service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.org_service_types_id_seq OWNED BY public.org_service_types.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    plan character varying(255) DEFAULT 'free'::character varying NOT NULL,
    status character varying(255) DEFAULT 'onboarding'::character varying NOT NULL,
    owner_id bigint NOT NULL,
    phone character varying(255),
    email character varying(255),
    website character varying(255),
    street character varying(255),
    city character varying(255),
    state character varying(2),
    zip character varying(10),
    country character varying(2) DEFAULT 'US'::character varying NOT NULL,
    logo_url character varying(255),
    settings json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    stripe_mode character varying(255) DEFAULT 'platform'::character varying NOT NULL,
    stripe_connect_id character varying(255),
    commission_rate numeric(5,4),
    fmcsa_broker_mc character varying(20),
    is_platform_tenant boolean DEFAULT false NOT NULL,
    CONSTRAINT organizations_plan_check CHECK (((plan)::text = ANY ((ARRAY['free'::character varying, 'pro'::character varying, 'enterprise'::character varying])::text[]))),
    CONSTRAINT organizations_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'onboarding'::character varying])::text[]))),
    CONSTRAINT organizations_stripe_mode_check CHECK (((stripe_mode)::text = ANY ((ARRAY['platform'::character varying, 'connect'::character varying])::text[]))),
    CONSTRAINT organizations_type_check CHECK (((type)::text = ANY ((ARRAY['carrier'::character varying, 'shipper'::character varying])::text[])))
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    brand character varying(30),
    last4 character varying(4) NOT NULL,
    exp_month character varying(2),
    exp_year character varying(2),
    bank_name character varying(100),
    account_type character varying(255),
    is_default boolean DEFAULT false NOT NULL,
    stripe_pm_id character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    org_id bigint,
    CONSTRAINT payment_methods_account_type_check CHECK (((account_type)::text = ANY ((ARRAY['checking'::character varying, 'savings'::character varying])::text[]))),
    CONSTRAINT payment_methods_type_check CHECK (((type)::text = ANY ((ARRAY['card'::character varying, 'bank'::character varying])::text[])))
);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: platform_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_leads (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    role character varying(255),
    plan character varying(255),
    monthly_volume character varying(255),
    current_solution character varying(255),
    timeline character varying(255),
    message text,
    status character varying(255) DEFAULT 'new'::character varying NOT NULL,
    ip_address character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    org_id bigint
);


--
-- Name: platform_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_leads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_leads_id_seq OWNED BY public.platform_leads.id;


--
-- Name: platform_tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_tenants (
    id bigint NOT NULL,
    org_id bigint NOT NULL,
    lead_id bigint,
    subdomain character varying(63),
    custom_domain character varying(255),
    brand_name character varying(255),
    primary_color character(7),
    secondary_color character(7),
    logo_url_dark character varying(255),
    favicon_url character varying(255),
    hide_powered_by boolean DEFAULT false NOT NULL,
    stripe_subscription_id character varying(255),
    billing_email character varying(255),
    fmcsa_broker_mc character varying(20),
    feature_flags json,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT platform_tenants_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'suspended'::character varying])::text[])))
);


--
-- Name: platform_tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_tenants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_tenants_id_seq OWNED BY public.platform_tenants.id;


--
-- Name: preferred_carriers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preferred_carriers (
    id bigint NOT NULL,
    shipper_id bigint NOT NULL,
    carrier_id bigint NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    shipper_org_id bigint,
    carrier_org_id bigint
);


--
-- Name: preferred_carriers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.preferred_carriers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: preferred_carriers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.preferred_carriers_id_seq OWNED BY public.preferred_carriers.id;


--
-- Name: service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_types (
    id bigint NOT NULL,
    key character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    icon character varying(255),
    category character varying(255) NOT NULL,
    requires_dot boolean DEFAULT false NOT NULL,
    requires_mc boolean DEFAULT false NOT NULL,
    requires_cdl boolean DEFAULT false NOT NULL,
    requires_hazmat boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    parent_id bigint
);


--
-- Name: service_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_types_id_seq OWNED BY public.service_types.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipments (
    id bigint NOT NULL,
    shipper_id bigint NOT NULL,
    carrier_id bigint,
    receiver_id bigint,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    item_description character varying(255) NOT NULL,
    item_category character varying(255),
    weight_lbs numeric(10,2),
    handling_requirements json,
    special_notes text,
    pickup_address character varying(255) NOT NULL,
    pickup_city character varying(255),
    pickup_state character varying(255),
    pickup_lat numeric(10,8),
    pickup_lng numeric(11,8),
    pickup_contact_name character varying(255),
    pickup_contact_phone character varying(255),
    pickup_date date,
    pickup_time_window character varying(255),
    delivery_address character varying(255) NOT NULL,
    delivery_city character varying(255),
    delivery_state character varying(255),
    delivery_lat numeric(10,8),
    delivery_lng numeric(11,8),
    delivery_contact_name character varying(255),
    delivery_contact_phone character varying(255),
    delivery_date date,
    delivery_time_window character varying(255),
    distance_miles numeric(10,2),
    estimated_duration_mins integer,
    agreed_cost numeric(10,2),
    tracking_token character varying(255),
    delivered_at timestamp(0) without time zone,
    delivery_photo_url character varying(255),
    route_polyline text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    job_type character varying(20) DEFAULT 'open'::character varying NOT NULL,
    contract_id bigint,
    org_id bigint,
    service_type_id bigint,
    required_cert_keys json,
    payment_intent_id character varying(255),
    payment_status character varying(255) DEFAULT 'unpaid'::character varying NOT NULL,
    platform_fee_cents integer DEFAULT 0 NOT NULL,
    transfer_id character varying(255),
    CONSTRAINT shipments_status_check CHECK (((status)::text = ANY (ARRAY['pending'::text, 'bidding'::text, 'offered'::text, 'assigned'::text, 'in_transit'::text, 'delivered'::text, 'disputed'::text, 'cancelled'::text])))
);


--
-- Name: shipments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipments_id_seq OWNED BY public.shipments.id;


--
-- Name: shipper_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipper_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    phone character varying(40),
    street character varying(200),
    city character varying(100),
    state character varying(50),
    zip character varying(20),
    country character varying(100) DEFAULT 'United States'::character varying,
    company_name character varying(200),
    business_type character varying(100),
    ein character varying(30),
    industry character varying(100),
    website character varying(255),
    biz_street character varying(200),
    biz_city character varying(100),
    biz_state character varying(50),
    biz_zip character varying(20),
    notif_email json,
    notif_sms json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    dba character varying(255),
    state_of_incorporation character varying(2),
    year_established character varying(4),
    employee_count character varying(255),
    business_phone character varying(40),
    business_email character varying(255),
    ops_street character varying(200),
    ops_city character varying(100),
    ops_state character varying(50),
    ops_zip character varying(20),
    ops_same_as_biz boolean DEFAULT true NOT NULL,
    verification_status character varying(30) DEFAULT 'incomplete'::character varying NOT NULL,
    email_verified_at timestamp(0) without time zone,
    phone_verified_at timestamp(0) without time zone,
    ein_verified_at timestamp(0) without time zone,
    default_pickup_contact_name character varying(255),
    default_pickup_contact_phone character varying(40),
    internal_ref_format character varying(255),
    preferred_categories json,
    notif_recipients json,
    coi_url character varying(255),
    coi_expiry date,
    hipaa_baa_url character varying(255),
    hipaa_baa_expiry date,
    hazmat_reg_url character varying(255),
    hazmat_reg_expiry date,
    sam_gov_number character varying(255),
    org_id bigint,
    plaid_access_token character varying(255),
    plaid_item_id character varying(255),
    plaid_account_id character varying(255),
    bank_last4 character varying(255),
    bank_name character varying(255),
    bank_institution_name character varying(255),
    plaid_connected_at timestamp(0) without time zone,
    stripe_bank_source_id character varying(255)
);


--
-- Name: shipper_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipper_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipper_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipper_profiles_id_seq OWNED BY public.shipper_profiles.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    shipper_id bigint NOT NULL,
    carrier_id bigint NOT NULL,
    shipment_id bigint,
    payment_method_id bigint,
    invoice_no character varying(30) NOT NULL,
    description character varying(255) NOT NULL,
    category character varying(80),
    pickup character varying(100),
    delivery character varying(100),
    amount numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    due_date date NOT NULL,
    notes text,
    paid_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'shipper'::character varying NOT NULL,
    avatar_url character varying(255),
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    current_org_id bigint,
    stripe_customer_id character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['shipper'::character varying, 'carrier'::character varying, 'receiver'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: bids id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids ALTER COLUMN id SET DEFAULT nextval('public.bids_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: carrier_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_documents ALTER COLUMN id SET DEFAULT nextval('public.carrier_documents_id_seq'::regclass);


--
-- Name: carrier_profile_certifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_certifications ALTER COLUMN id SET DEFAULT nextval('public.carrier_profile_certifications_id_seq'::regclass);


--
-- Name: carrier_profile_service_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_service_types ALTER COLUMN id SET DEFAULT nextval('public.carrier_profile_service_types_id_seq'::regclass);


--
-- Name: carrier_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profiles ALTER COLUMN id SET DEFAULT nextval('public.carrier_profiles_id_seq'::regclass);


--
-- Name: carrier_vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_vehicles ALTER COLUMN id SET DEFAULT nextval('public.carrier_vehicles_id_seq'::regclass);


--
-- Name: carrier_verifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_verifications ALTER COLUMN id SET DEFAULT nextval('public.carrier_verifications_id_seq'::regclass);


--
-- Name: certifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications ALTER COLUMN id SET DEFAULT nextval('public.certifications_id_seq'::regclass);


--
-- Name: contracts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts ALTER COLUMN id SET DEFAULT nextval('public.contracts_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: freight_job_offers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_job_offers ALTER COLUMN id SET DEFAULT nextval('public.freight_job_offers_id_seq'::regclass);


--
-- Name: freight_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_jobs ALTER COLUMN id SET DEFAULT nextval('public.freight_jobs_id_seq'::regclass);


--
-- Name: gps_pings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gps_pings ALTER COLUMN id SET DEFAULT nextval('public.gps_pings_id_seq'::regclass);


--
-- Name: job_evidence id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_evidence ALTER COLUMN id SET DEFAULT nextval('public.job_evidence_id_seq'::regclass);


--
-- Name: job_stop_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_stop_items ALTER COLUMN id SET DEFAULT nextval('public.job_stop_items_id_seq'::regclass);


--
-- Name: job_stops id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_stops ALTER COLUMN id SET DEFAULT nextval('public.job_stops_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: org_invitations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_invitations ALTER COLUMN id SET DEFAULT nextval('public.org_invitations_id_seq'::regclass);


--
-- Name: org_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members ALTER COLUMN id SET DEFAULT nextval('public.org_members_id_seq'::regclass);


--
-- Name: org_service_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_service_types ALTER COLUMN id SET DEFAULT nextval('public.org_service_types_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: platform_leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_leads ALTER COLUMN id SET DEFAULT nextval('public.platform_leads_id_seq'::regclass);


--
-- Name: platform_tenants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_tenants ALTER COLUMN id SET DEFAULT nextval('public.platform_tenants_id_seq'::regclass);


--
-- Name: preferred_carriers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_carriers ALTER COLUMN id SET DEFAULT nextval('public.preferred_carriers_id_seq'::regclass);


--
-- Name: service_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types ALTER COLUMN id SET DEFAULT nextval('public.service_types_id_seq'::regclass);


--
-- Name: shipments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments ALTER COLUMN id SET DEFAULT nextval('public.shipments_id_seq'::regclass);


--
-- Name: shipper_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipper_profiles ALTER COLUMN id SET DEFAULT nextval('public.shipper_profiles_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: bids bids_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_pkey PRIMARY KEY (id);


--
-- Name: bids bids_shipment_id_carrier_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_shipment_id_carrier_id_unique UNIQUE (shipment_id, carrier_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: carrier_profile_certifications carrier_cert_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_certifications
    ADD CONSTRAINT carrier_cert_unique UNIQUE (carrier_profile_id, certification_id);


--
-- Name: carrier_documents carrier_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_documents
    ADD CONSTRAINT carrier_documents_pkey PRIMARY KEY (id);


--
-- Name: carrier_profile_certifications carrier_profile_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_certifications
    ADD CONSTRAINT carrier_profile_certifications_pkey PRIMARY KEY (id);


--
-- Name: carrier_profile_service_types carrier_profile_service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_service_types
    ADD CONSTRAINT carrier_profile_service_types_pkey PRIMARY KEY (id);


--
-- Name: carrier_profiles carrier_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profiles
    ADD CONSTRAINT carrier_profiles_pkey PRIMARY KEY (id);


--
-- Name: carrier_profiles carrier_profiles_stripe_account_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profiles
    ADD CONSTRAINT carrier_profiles_stripe_account_id_unique UNIQUE (stripe_account_id);


--
-- Name: carrier_profile_service_types carrier_service_type_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_service_types
    ADD CONSTRAINT carrier_service_type_unique UNIQUE (carrier_profile_id, service_type_id);


--
-- Name: carrier_vehicles carrier_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_vehicles
    ADD CONSTRAINT carrier_vehicles_pkey PRIMARY KEY (id);


--
-- Name: carrier_verifications carrier_verifications_carrier_profile_id_check_type_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_verifications
    ADD CONSTRAINT carrier_verifications_carrier_profile_id_check_type_unique UNIQUE (carrier_profile_id, check_type);


--
-- Name: carrier_verifications carrier_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_verifications
    ADD CONSTRAINT carrier_verifications_pkey PRIMARY KEY (id);


--
-- Name: certifications certifications_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_key_unique UNIQUE (key);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: freight_job_offers freight_job_offers_freight_job_id_carrier_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_job_offers
    ADD CONSTRAINT freight_job_offers_freight_job_id_carrier_id_unique UNIQUE (freight_job_id, carrier_id);


--
-- Name: freight_job_offers freight_job_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_job_offers
    ADD CONSTRAINT freight_job_offers_pkey PRIMARY KEY (id);


--
-- Name: freight_jobs freight_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_jobs
    ADD CONSTRAINT freight_jobs_pkey PRIMARY KEY (id);


--
-- Name: gps_pings gps_pings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gps_pings
    ADD CONSTRAINT gps_pings_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: job_evidence job_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_evidence
    ADD CONSTRAINT job_evidence_pkey PRIMARY KEY (id);


--
-- Name: job_stop_items job_stop_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_stop_items
    ADD CONSTRAINT job_stop_items_pkey PRIMARY KEY (id);


--
-- Name: job_stops job_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_stops
    ADD CONSTRAINT job_stops_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: org_invitations org_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_invitations
    ADD CONSTRAINT org_invitations_pkey PRIMARY KEY (id);


--
-- Name: org_invitations org_invitations_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_invitations
    ADD CONSTRAINT org_invitations_token_unique UNIQUE (token);


--
-- Name: org_members org_members_org_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_org_id_user_id_unique UNIQUE (org_id, user_id);


--
-- Name: org_members org_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_pkey PRIMARY KEY (id);


--
-- Name: org_service_types org_service_types_org_id_service_type_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_service_types
    ADD CONSTRAINT org_service_types_org_id_service_type_id_unique UNIQUE (org_id, service_type_id);


--
-- Name: org_service_types org_service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_service_types
    ADD CONSTRAINT org_service_types_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_key UNIQUE (token);


--
-- Name: platform_leads platform_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_leads
    ADD CONSTRAINT platform_leads_pkey PRIMARY KEY (id);


--
-- Name: platform_tenants platform_tenants_custom_domain_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_tenants
    ADD CONSTRAINT platform_tenants_custom_domain_unique UNIQUE (custom_domain);


--
-- Name: platform_tenants platform_tenants_org_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_tenants
    ADD CONSTRAINT platform_tenants_org_id_unique UNIQUE (org_id);


--
-- Name: platform_tenants platform_tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_tenants
    ADD CONSTRAINT platform_tenants_pkey PRIMARY KEY (id);


--
-- Name: platform_tenants platform_tenants_subdomain_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_tenants
    ADD CONSTRAINT platform_tenants_subdomain_unique UNIQUE (subdomain);


--
-- Name: preferred_carriers preferred_carriers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_carriers
    ADD CONSTRAINT preferred_carriers_pkey PRIMARY KEY (id);


--
-- Name: preferred_carriers preferred_carriers_shipper_id_carrier_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_carriers
    ADD CONSTRAINT preferred_carriers_shipper_id_carrier_id_unique UNIQUE (shipper_id, carrier_id);


--
-- Name: service_types service_types_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_key_unique UNIQUE (key);


--
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- Name: shipments shipments_tracking_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_tracking_token_unique UNIQUE (tracking_token);


--
-- Name: shipper_profiles shipper_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipper_profiles
    ADD CONSTRAINT shipper_profiles_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_invoice_no_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_invoice_no_unique UNIQUE (invoice_no);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_status_published_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_status_published_at_index ON public.blog_posts USING btree (status, published_at);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- Name: freight_jobs_carrier_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX freight_jobs_carrier_id_status_index ON public.freight_jobs USING btree (carrier_id, status);


--
-- Name: freight_jobs_contract_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX freight_jobs_contract_id_index ON public.freight_jobs USING btree (contract_id);


--
-- Name: freight_jobs_shipper_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX freight_jobs_shipper_id_status_index ON public.freight_jobs USING btree (shipper_id, status);


--
-- Name: job_evidence_freight_job_id_job_stop_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_evidence_freight_job_id_job_stop_id_index ON public.job_evidence USING btree (freight_job_id, job_stop_id);


--
-- Name: job_stop_items_delivery_stop_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_stop_items_delivery_stop_id_index ON public.job_stop_items USING btree (delivery_stop_id);


--
-- Name: job_stop_items_pickup_stop_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_stop_items_pickup_stop_id_index ON public.job_stop_items USING btree (pickup_stop_id);


--
-- Name: job_stops_freight_job_id_optimized_sequence_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_stops_freight_job_id_optimized_sequence_index ON public.job_stops USING btree (freight_job_id, optimized_sequence);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: locations_shipper_id_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX locations_shipper_id_type_index ON public.locations USING btree (shipper_id, type);


--
-- Name: pat_tokenable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pat_tokenable_idx ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: payment_methods_stripe_pm_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_methods_stripe_pm_id_index ON public.payment_methods USING btree (stripe_pm_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: bids bids_carrier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_carrier_id_foreign FOREIGN KEY (carrier_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bids bids_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: bids bids_shipment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_shipment_id_foreign FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_author_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_foreign FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: carrier_documents carrier_documents_carrier_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_documents
    ADD CONSTRAINT carrier_documents_carrier_profile_id_foreign FOREIGN KEY (carrier_profile_id) REFERENCES public.carrier_profiles(id) ON DELETE CASCADE;


--
-- Name: carrier_documents carrier_documents_carrier_vehicle_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_documents
    ADD CONSTRAINT carrier_documents_carrier_vehicle_id_foreign FOREIGN KEY (carrier_vehicle_id) REFERENCES public.carrier_vehicles(id) ON DELETE SET NULL;


--
-- Name: carrier_documents carrier_documents_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_documents
    ADD CONSTRAINT carrier_documents_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: carrier_documents carrier_documents_verified_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_documents
    ADD CONSTRAINT carrier_documents_verified_by_foreign FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: carrier_profile_certifications carrier_profile_certifications_carrier_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_certifications
    ADD CONSTRAINT carrier_profile_certifications_carrier_profile_id_foreign FOREIGN KEY (carrier_profile_id) REFERENCES public.carrier_profiles(id) ON DELETE CASCADE;


--
-- Name: carrier_profile_certifications carrier_profile_certifications_certification_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_certifications
    ADD CONSTRAINT carrier_profile_certifications_certification_id_foreign FOREIGN KEY (certification_id) REFERENCES public.certifications(id) ON DELETE CASCADE;


--
-- Name: carrier_profile_service_types carrier_profile_service_types_carrier_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_service_types
    ADD CONSTRAINT carrier_profile_service_types_carrier_profile_id_foreign FOREIGN KEY (carrier_profile_id) REFERENCES public.carrier_profiles(id) ON DELETE CASCADE;


--
-- Name: carrier_profile_service_types carrier_profile_service_types_service_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profile_service_types
    ADD CONSTRAINT carrier_profile_service_types_service_type_id_foreign FOREIGN KEY (service_type_id) REFERENCES public.service_types(id) ON DELETE CASCADE;


--
-- Name: carrier_profiles carrier_profiles_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profiles
    ADD CONSTRAINT carrier_profiles_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: carrier_profiles carrier_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_profiles
    ADD CONSTRAINT carrier_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: carrier_vehicles carrier_vehicles_carrier_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_vehicles
    ADD CONSTRAINT carrier_vehicles_carrier_profile_id_foreign FOREIGN KEY (carrier_profile_id) REFERENCES public.carrier_profiles(id) ON DELETE CASCADE;


--
-- Name: carrier_vehicles carrier_vehicles_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_vehicles
    ADD CONSTRAINT carrier_vehicles_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: carrier_verifications carrier_verifications_carrier_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_verifications
    ADD CONSTRAINT carrier_verifications_carrier_profile_id_foreign FOREIGN KEY (carrier_profile_id) REFERENCES public.carrier_profiles(id) ON DELETE CASCADE;


--
-- Name: carrier_verifications carrier_verifications_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_verifications
    ADD CONSTRAINT carrier_verifications_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: carrier_verifications carrier_verifications_reviewed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrier_verifications
    ADD CONSTRAINT carrier_verifications_reviewed_by_foreign FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: certifications certifications_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.certifications(id) ON DELETE SET NULL;


--
-- Name: contracts contracts_carrier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_carrier_id_foreign FOREIGN KEY (carrier_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contracts contracts_carrier_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_carrier_org_id_foreign FOREIGN KEY (carrier_org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: contracts contracts_shipper_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_shipper_id_foreign FOREIGN KEY (shipper_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contracts contracts_shipper_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_shipper_org_id_foreign FOREIGN KEY (shipper_org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: freight_job_offers freight_job_offers_carrier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_job_offers
    ADD CONSTRAINT freight_job_offers_carrier_id_foreign FOREIGN KEY (carrier_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: freight_job_offers freight_job_offers_freight_job_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_job_offers
    ADD CONSTRAINT freight_job_offers_freight_job_id_foreign FOREIGN KEY (freight_job_id) REFERENCES public.freight_jobs(id) ON DELETE CASCADE;


--
-- Name: freight_jobs freight_jobs_carrier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_jobs
    ADD CONSTRAINT freight_jobs_carrier_id_foreign FOREIGN KEY (carrier_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: freight_jobs freight_jobs_contract_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_jobs
    ADD CONSTRAINT freight_jobs_contract_id_foreign FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- Name: freight_jobs freight_jobs_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_jobs
    ADD CONSTRAINT freight_jobs_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: freight_jobs freight_jobs_shipper_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_jobs
    ADD CONSTRAINT freight_jobs_shipper_id_foreign FOREIGN KEY (shipper_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: gps_pings gps_pings_shipment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gps_pings
    ADD CONSTRAINT gps_pings_shipment_id_foreign FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- Name: job_evidence job_evidence_freight_job_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_evidence
    ADD CONSTRAINT job_evidence_freight_job_id_foreign FOREIGN KEY (freight_job_id) REFERENCES public.freight_jobs(id) ON DELETE CASCADE;


--
-- Name: job_evidence job_evidence_job_stop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_evidence
    ADD CONSTRAINT job_evidence_job_stop_id_foreign FOREIGN KEY (job_stop_id) REFERENCES public.job_stops(id) ON DELETE CASCADE;


--
-- Name: job_evidence job_evidence_uploaded_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_evidence
    ADD CONSTRAINT job_evidence_uploaded_by_foreign FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_stop_items job_stop_items_delivery_stop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_stop_items
    ADD CONSTRAINT job_stop_items_delivery_stop_id_foreign FOREIGN KEY (delivery_stop_id) REFERENCES public.job_stops(id) ON DELETE CASCADE;


--
-- Name: job_stop_items job_stop_items_pickup_stop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_stop_items
    ADD CONSTRAINT job_stop_items_pickup_stop_id_foreign FOREIGN KEY (pickup_stop_id) REFERENCES public.job_stops(id) ON DELETE CASCADE;


--
-- Name: job_stops job_stops_freight_job_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_stops
    ADD CONSTRAINT job_stops_freight_job_id_foreign FOREIGN KEY (freight_job_id) REFERENCES public.freight_jobs(id) ON DELETE CASCADE;


--
-- Name: job_stops job_stops_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_stops
    ADD CONSTRAINT job_stops_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: locations locations_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: locations locations_shipper_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_shipper_id_foreign FOREIGN KEY (shipper_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: org_invitations org_invitations_invited_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_invitations
    ADD CONSTRAINT org_invitations_invited_by_foreign FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: org_invitations org_invitations_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_invitations
    ADD CONSTRAINT org_invitations_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: org_members org_members_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: org_members org_members_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: org_service_types org_service_types_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_service_types
    ADD CONSTRAINT org_service_types_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: org_service_types org_service_types_service_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_service_types
    ADD CONSTRAINT org_service_types_service_type_id_foreign FOREIGN KEY (service_type_id) REFERENCES public.service_types(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_owner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payment_methods payment_methods_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: payment_methods payment_methods_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: platform_leads platform_leads_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_leads
    ADD CONSTRAINT platform_leads_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: platform_tenants platform_tenants_lead_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_tenants
    ADD CONSTRAINT platform_tenants_lead_id_foreign FOREIGN KEY (lead_id) REFERENCES public.platform_leads(id) ON DELETE SET NULL;


--
-- Name: platform_tenants platform_tenants_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_tenants
    ADD CONSTRAINT platform_tenants_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: preferred_carriers preferred_carriers_carrier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_carriers
    ADD CONSTRAINT preferred_carriers_carrier_id_foreign FOREIGN KEY (carrier_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: preferred_carriers preferred_carriers_carrier_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_carriers
    ADD CONSTRAINT preferred_carriers_carrier_org_id_foreign FOREIGN KEY (carrier_org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: preferred_carriers preferred_carriers_shipper_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_carriers
    ADD CONSTRAINT preferred_carriers_shipper_id_foreign FOREIGN KEY (shipper_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: preferred_carriers preferred_carriers_shipper_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_carriers
    ADD CONSTRAINT preferred_carriers_shipper_org_id_foreign FOREIGN KEY (shipper_org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: service_types service_types_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.service_types(id) ON DELETE SET NULL;


--
-- Name: shipments shipments_carrier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_carrier_id_foreign FOREIGN KEY (carrier_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shipments shipments_contract_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_contract_id_foreign FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;


--
-- Name: shipments shipments_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: shipments shipments_receiver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_receiver_id_foreign FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shipments shipments_service_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_service_type_id_foreign FOREIGN KEY (service_type_id) REFERENCES public.service_types(id) ON DELETE SET NULL;


--
-- Name: shipments shipments_shipper_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_shipper_id_foreign FOREIGN KEY (shipper_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shipper_profiles shipper_profiles_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipper_profiles
    ADD CONSTRAINT shipper_profiles_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: shipper_profiles shipper_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipper_profiles
    ADD CONSTRAINT shipper_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_carrier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_carrier_id_foreign FOREIGN KEY (carrier_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_payment_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payment_method_id_foreign FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_shipment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_shipment_id_foreign FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_shipper_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_shipper_id_foreign FOREIGN KEY (shipper_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_current_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_current_org_id_foreign FOREIGN KEY (current_org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_01_01_100000_create_carrier_profiles_table	1
5	2025_01_01_100001_create_shipments_table	1
6	2025_01_01_100002_create_gps_pings_table	1
7	2025_05_31_100000_create_payment_methods_table	2
8	2025_06_01_000001_create_transactions_table	3
9	2025_06_01_000002_create_preferred_carriers_table	3
10	2025_06_01_000003_create_contracts_table	3
11	2025_06_01_000004_create_shipper_profiles_table	4
12	2025_06_01_000005_add_job_fields_to_shipments	5
13	2025_06_01_000006_create_bids_table	5
14	2026_06_04_000001_add_carrier_verification_columns	6
15	2026_06_03_045352_create_personal_access_tokens_table	7
16	2026_06_04_000002_add_missing_carrier_profile_columns	7
17	2026_06_04_000003_create_carrier_vehicles_table	7
18	2026_06_04_000004_create_carrier_documents_table	7
19	2026_06_04_000005_create_carrier_verifications_table	7
20	2026_06_04_000006_add_missing_shipper_profile_columns	8
21	2026_06_04_000007_add_insurance_fields_to_carrier_profiles	9
22	2026_06_05_000001_create_service_types_tables	10
23	2026_06_05_000002_add_parent_id_to_service_types	11
24	2026_06_05_000003_create_certifications_tables	12
25	2026_06_05_000004_create_organizations_table	13
26	2026_06_05_000005_create_org_members_table	13
27	2026_06_05_000006_create_org_invitations_table	13
28	2026_06_05_000007_add_org_to_users	13
29	2026_06_05_000008_add_org_id_to_core_tables	13
30	2026_06_05_000009_create_org_service_types_table	13
31	2026_06_05_000010_add_org_id_to_carrier_assets	13
32	2026_06_05_000011_create_blog_posts_table	14
33	2026_06_06_000001_add_identity_columns_to_carrier_profiles	15
34	2026_06_06_000002_add_location_to_carrier_profiles	16
35	2026_06_06_000003_add_mc_verified_to_carrier_profiles	17
36	2026_06_07_144545_add_onboarding_fee_to_carrier_profiles	18
37	2026_06_07_171552_add_clearinghouse_to_carrier_profiles	19
38	2026_06_07_200001_add_payment_fields_to_shipments	20
39	2026_06_07_200002_add_stripe_customer_to_users	20
40	2026_06_07_200003_add_plaid_to_shipper_profiles	20
41	2026_06_07_210001_add_signature_fields_to_contracts	21
42	2026_06_08_100001_create_locations_table	22
43	2026_06_08_100002_create_freight_jobs_table	22
44	2026_06_08_100003_create_job_stops_table	22
45	2026_06_08_100004_create_job_stop_items_table	22
46	2026_06_08_100005_create_job_evidence_table	22
47	2026_06_08_100006_add_job_fields_to_contracts	22
48	2026_06_08_110001_add_last_used_at_to_locations	23
49	2026_06_09_010117_add_name_to_job_stops_table	24
50	2026_06_09_020000_add_cost_breakdown_to_freight_jobs_table	25
51	2026_06_11_100001_make_contract_carrier_nullable_on_freight_jobs	26
52	2026_06_11_200001_create_freight_job_offers_table	27
53	2026_06_11_200002_add_quote_requirements_to_freight_jobs	27
54	2026_06_11_200003_add_rate_fields_to_freight_job_offers	27
55	2026_06_13_000001_create_platform_leads_table	28
56	2026_07_02_000001_add_tenant_fields_to_organizations	29
57	2026_07_02_000002_create_platform_tenants_table	29
58	2026_07_02_000003_add_org_id_to_platform_leads	29
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 58, true);


--
-- PostgreSQL database dump complete
--

