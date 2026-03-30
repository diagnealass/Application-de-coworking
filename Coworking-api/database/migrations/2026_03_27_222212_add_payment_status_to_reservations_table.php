<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])
                  ->default('unpaid')
                  ->after('total_price');
            $table->string('payment_reference')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'payment_reference']);
        });
    }
};
