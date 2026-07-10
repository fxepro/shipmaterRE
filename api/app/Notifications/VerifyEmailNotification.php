<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class VerifyEmailNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $token = Str::random(64);
        Cache::put(
            'email_verify:'.$token,
            ['user_id' => $notifiable->getKey(), 'email' => $notifiable->getEmailForVerification()],
            now()->addMinutes(60)
        );

        $frontend = rtrim((string) config('app.frontend_url'), '/');
        $url = $frontend.'/verify-email?token='.$token;

        return (new MailMessage)
            ->subject('Verify your Shipmater email')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Please verify your email address to continue using your account.')
            ->action('Verify email', $url)
            ->line('This link expires in 60 minutes.')
            ->line('If you did not create an account, no action is required.');
    }
}
