# 🏢 Coworking Space Manager
> Plateforme Fullstack de gestion et réservation d'espaces de coworking.

Ce projet est une application web moderne permettant aux utilisateurs de visualiser des espaces de travail, de vérifier les équipements disponibles et d'effectuer des réservations en temps réel.

## 🚀 Technologies utilisées
* **Backend :** Laravel 11 (PHP 8.2+)
* **Frontend :** React 18 avec Vite & Tailwind CSS
* **Base de données :** MySQL (via XAMPP)
* **Communication :** REST API / Inertia.js (selon ton choix)
* **Authentification :** Laravel Sanctum / Breeze

## 📂 Structure du projet
Le dépôt est organisé en **Monorepo** :
* `/Coworking-api` : Le cœur de l'application (Logique métier, API, Base de données).
* `/coworking-app` : L'interface utilisateur réactive en React.

## ⚙️ Installation et Configuration

### 1. Prérequis
* PHP >= 8.2
* Composer
* Node.js & NPM
* XAMPP (pour MySQL)

### 2. Configuration du Backend (Laravel)
```bash
cd Coworking-api
composer install
cp .env.example .env
php artisan key:generate
# Configurez votre DB_DATABASE=coworking_db dans le .env
php artisan migrate --seed
php artisan serve

### . Configuration du Frontend (React)
cd coworking-app
npm install
npm run dev

