<?php

namespace App\Providers;

use App\Services\TenantMailerService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(TenantMailerService::class);
    }

    public function boot(): void
    {
        //
    }
}
