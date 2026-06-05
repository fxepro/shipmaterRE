FROM php:8.3-cli

# System libs + PHP extensions
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpq-dev libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install \
        pdo pdo_pgsql pgsql \
        mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Storage / cache must be writable
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8080

# Cache config+routes, run migrations, seed reference data, then serve.
# Shell form so ${PORT:-8080} expands correctly.
CMD php artisan config:cache \
    && php artisan route:cache \
    && php artisan migrate --force \
    && php artisan db:seed --class=ServiceTypeSeeder --force \
    && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
