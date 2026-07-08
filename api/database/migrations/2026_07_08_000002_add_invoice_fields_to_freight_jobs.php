<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->string('invoice_number')->nullable()->after('payment_status');
            $table->date('invoice_date')->nullable()->after('invoice_number');
            $table->date('invoice_due_date')->nullable()->after('invoice_date');
            $table->string('invoice_pdf_key')->nullable()->after('invoice_due_date');
            $table->string('invoice_pdf_url')->nullable()->after('invoice_pdf_key');
            $table->timestamp('invoice_generated_at')->nullable()->after('invoice_pdf_url');
        });
    }

    public function down(): void
    {
        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->dropColumn([
                'invoice_number', 'invoice_date', 'invoice_due_date',
                'invoice_pdf_key', 'invoice_pdf_url', 'invoice_generated_at',
            ]);
        });
    }
};
