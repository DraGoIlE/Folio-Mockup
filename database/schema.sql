-- ============================================================
-- UAS Backend Microservices - Database Schema
-- PostgreSQL 16
-- Database ini dipakai bersama oleh Login Service & User Service
-- ============================================================

-- Buat database dulu (jalankan manual di psql / pgAdmin jika belum ada):
-- CREATE DATABASE uas_db;

-- Lalu connect ke database uas_db, baru jalankan script di bawah ini.

-- ============================================================
-- 1. TABEL USERS (dipakai oleh LOGIN SERVICE)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('kandidat', 'hrd')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TABEL BLACKLISTED_TOKENS (untuk fitur LOGOUT JWT)
-- ============================================================
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    blacklisted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blacklisted_token ON blacklisted_tokens (token);

-- ============================================================
-- 3. TABEL KANDIDAT_PROFILES (dipakai oleh USER SERVICE)
-- ============================================================
CREATE TABLE IF NOT EXISTS kandidat_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama VARCHAR(150),
    email VARCHAR(150),
    skill TEXT,
    pengalaman TEXT,
    ekspektasi_gaji NUMERIC(15, 2),
    cv VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. TABEL HRD_PROFILES (dipakai oleh USER SERVICE)
-- ============================================================
CREATE TABLE IF NOT EXISTS hrd_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_perusahaan VARCHAR(150),
    deskripsi_perusahaan TEXT,
    lowongan VARCHAR(255),
    skill_dibutuhkan TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SELESAI
-- ============================================================
