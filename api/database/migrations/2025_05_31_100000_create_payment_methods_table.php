<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('type', ['card', 'bank']);

            // ── Card fields ──────────────────────────────────────────────
            $table->string('brand', 30)->nullable();       // Visa, Mastercard …
            $table->string('last4', 4);                    // last 4 digits / account digits
            $table->string('exp_month', 2)->nullable();    // 01–12
            $table->string('exp_year',  2)->nullable();    // 25, 26 …

            // ── Bank / ACH fields ────────────────────────────────────────
            $table->string('bank_name', 100)->nullable();
            $table->enum('account_type', ['checking', 'savings'])->nullable();

            // ── Shared ───────────────────────────────────────────────────
            $table->boolean('is_default')->default(false);

            /** Reserved for future Stripe integration.
             *  Card/bank will be tokenised via Stripe.js; only the PM id stored here. */
            $table->string('stripe_pm_id')->nullable()->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
