<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

/**
 * Reset demo account passwords to plain "password" (hashed once via User cast).
 * Fixes DBs that were seeded with double-hashed passwords.
 */
class ResetDemoPasswords extends Command
{
    protected $signature = 'demo:reset-passwords {--password=password : Plain password to set}';

    protected $description = 'Reset known demo user passwords (alex@demo.com, admin@demo.com, …)';

    public function handle(): int
    {
        $plain = (string) $this->option('password');
        $emails = [
            'alex@demo.com',
            'jordan@demo.com',
            'casey@demo.com',
            'marcus@demo.com',
            'sam@demo.com',
            'admin@demo.com',
            'tenant@demo.com',
            'carrier@gmail.com',
        ];

        foreach ($emails as $email) {
            $user = User::where('email', $email)->first();
            if (! $user) {
                $this->warn("skip  {$email} (not found)");
                continue;
            }

            // Bypass "already hashed" short-circuit: write a fresh hash via DB then verify.
            $user->forceFill(['password' => $plain])->save();

            $ok = Hash::check($plain, $user->fresh()->getAttributes()['password']);
            $this->line(($ok ? 'ok   ' : 'FAIL ') . $email);
        }

        $this->info('Done. Login with the password you passed (default: password).');

        return self::SUCCESS;
    }
}
