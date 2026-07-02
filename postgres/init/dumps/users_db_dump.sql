--
-- PostgreSQL database dump
--

\restrict rrCg7aUD6HmNEzWu2N2FWVWrdUHOAIpwFQ50VhxfCQvOGn8fgLYYFDNxEKnsIdR

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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    skills text,
    cv_url character varying(500),
    expected_salary integer
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- Name: COLUMN candidates.account_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidates.account_id IS 'Referensi logis ke accounts.id di DB Auth. Bukan Foreign Key (beda database). Divalidasi di service.';


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    company_name character varying(255) NOT NULL,
    industry character varying(255),
    description text
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: COLUMN companies.account_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.companies.account_id IS 'Referensi logis ke accounts.id di DB Auth. Bukan Foreign Key (beda database). Divalidasi di service.';


--
-- Name: job_postings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_postings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    requirements text,
    status character varying(50) DEFAULT 'Buka'::character varying NOT NULL,
    CONSTRAINT job_postings_status_check CHECK (((status)::text = ANY ((ARRAY['Buka'::character varying, 'Tutup'::character varying])::text[])))
);


ALTER TABLE public.job_postings OWNER TO postgres;

--
-- Name: COLUMN job_postings.company_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.job_postings.company_id IS 'Foreign Key ke companies.id, masih satu database jadi FK asli dipakai.';


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, account_id, full_name, skills, cv_url, expected_salary) FROM stdin;
5ded4764-5ab7-4644-acc7-90208a904f8c	11111111-1111-4111-8111-111111111111	Budi Santoso	Golang, PostgreSQL, Docker	https://storage.example.com/cv/budi.pdf	12000000
1c8f883a-6e82-4ef1-96b5-54bafacdc442	22222222-2222-4222-8222-222222222222	Siti Rahma	React, TypeScript, Figma	https://storage.example.com/cv/siti.pdf	10000000
958a7f0d-189c-4d0d-9775-88d5666f5d5c	33333333-3333-4333-8333-333333333333	Andi Wijaya	Python, Django, Redis, AWS	https://storage.example.com/cv/andi.pdf	15000000
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, account_id, company_name, industry, description) FROM stdin;
aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa	44444444-4444-4444-8444-444444444444	TechCorp Indonesia	Tech	Perusahaan software house yang fokus di produk fintech dan e-commerce.
bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb	55555555-5555-4555-8555-555555555555	FinancePlus	Finance	Perusahaan jasa keuangan digital dengan fokus investasi ritel.
\.


--
-- Data for Name: job_postings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_postings (id, company_id, title, description, requirements, status) FROM stdin;
ed5bea9f-fca1-4f7d-8e06-e5544d580250	aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa	Backend Engineer	Bangun dan maintain REST API untuk platform e-commerce kami.	Minimal 2 tahun pengalaman Golang atau Node.js, familiar dengan PostgreSQL.	Buka
92d9fa78-5ab8-4a4d-a4af-f72d8ee3c59f	aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa	Frontend Developer	Develop UI untuk dashboard internal perusahaan.	Menguasai React dan TypeScript, punya portfolio project.	Buka
a0898363-7dd3-4e83-b562-1aa1cddd62e3	bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb	Data Analyst	Analisis data transaksi nasabah untuk insight bisnis.	Menguasai SQL dan Python, pengalaman dengan tools BI.	Tutup
\.


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: job_postings job_postings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT job_postings_pkey PRIMARY KEY (id);


--
-- Name: idx_candidates_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_candidates_account_id ON public.candidates USING btree (account_id);


--
-- Name: idx_companies_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_companies_account_id ON public.companies USING btree (account_id);


--
-- Name: idx_job_postings_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_postings_company_id ON public.job_postings USING btree (company_id);


--
-- Name: idx_job_postings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_postings_status ON public.job_postings USING btree (status);


--
-- Name: job_postings job_postings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT job_postings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict rrCg7aUD6HmNEzWu2N2FWVWrdUHOAIpwFQ50VhxfCQvOGn8fgLYYFDNxEKnsIdR

