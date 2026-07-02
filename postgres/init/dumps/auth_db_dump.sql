--
-- PostgreSQL database dump
--

\restrict yxjvGpLoWjiOuVGZLNXuEYNgcfKwa8NbCzqmQ0BYzV5U4SpWK3Ghkaq5QNgPWWB

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: account_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_role AS ENUM (
    'KANDIDAT',
    'HRD'
);


ALTER TYPE public.account_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.account_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: TABLE accounts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.accounts IS 'Tabel utama buat autentikasi. Tidak menyimpan data profil (nama/CV/dll).';


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, email, password_hash, role, created_at) FROM stdin;
11111111-1111-4111-8111-111111111111	budi.santoso@example.com	$2b$10$abcdefghijklmnopqrstuv	KANDIDAT	2026-07-02 09:44:58.498215+00
22222222-2222-4222-8222-222222222222	siti.rahma@example.com	$2b$10$bcdefghijklmnopqrstuvw	KANDIDAT	2026-07-02 09:44:58.498215+00
33333333-3333-4333-8333-333333333333	andi.wijaya@example.com	$2b$10$cdefghijklmnopqrstuvwx	KANDIDAT	2026-07-02 09:44:58.498215+00
44444444-4444-4444-8444-444444444444	hrd@techcorp.com	$2b$10$defghijklmnopqrstuvwxy	HRD	2026-07-02 09:44:58.498215+00
55555555-5555-4555-8555-555555555555	recruiter@financeplus.com	$2b$10$efghijklmnopqrstuvwxyz	HRD	2026-07-02 09:44:58.498215+00
\.


--
-- Name: accounts accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: idx_accounts_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_email ON public.accounts USING btree (email);


--
-- Name: idx_accounts_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_role ON public.accounts USING btree (role);


--
-- PostgreSQL database dump complete
--

\unrestrict yxjvGpLoWjiOuVGZLNXuEYNgcfKwa8NbCzqmQ0BYzV5U4SpWK3Ghkaq5QNgPWWB

