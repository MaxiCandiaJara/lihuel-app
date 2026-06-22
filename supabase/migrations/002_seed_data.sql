-- ============================================================
-- LIHUEL APP — Seed Data Migration 002
-- Run AFTER 001_initial_schema.sql
-- Run in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- CHECKLIST TEMPLATES (global per stage)
-- ============================================================

-- Obra Gruesa (6 items)
insert into public.checklist_templates (stage_type, description, order_index) values
  ('obra_gruesa', 'Verificar nivelación y replanteo del terreno', 1),
  ('obra_gruesa', 'Revisión de fundaciones y cimientos', 2),
  ('obra_gruesa', 'Instalación de estructura prefabricada principal', 3),
  ('obra_gruesa', 'Control de uniones y anclajes estructurales', 4),
  ('obra_gruesa', 'Impermeabilización de losa y cubierta', 5),
  ('obra_gruesa', 'Inspección de muros portantes y tabiques', 6),
  ('obra_gruesa', 'Verificar plomada y alineación de fachadas', 7);

-- Instalaciones Eléctricas (7 items)
insert into public.checklist_templates (stage_type, description, order_index) values
  ('instalaciones_electricas', 'Tendido de cañería eléctrica embutida', 1),
  ('instalaciones_electricas', 'Instalación de tablero eléctrico principal', 2),
  ('instalaciones_electricas', 'Cableado de circuitos de iluminación', 3),
  ('instalaciones_electricas', 'Cableado de circuitos de tomacorrientes', 4),
  ('instalaciones_electricas', 'Instalación de puesta a tierra (tierra física)', 5),
  ('instalaciones_electricas', 'Prueba de continuidad y aislación de cables', 6),
  ('instalaciones_electricas', 'Verificación de polaridad en todos los circuitos', 7);

-- Instalaciones Sanitarias (7 items)
insert into public.checklist_templates (stage_type, description, order_index) values
  ('instalaciones_sanitarias', 'Instalación de cañerías de agua fría', 1),
  ('instalaciones_sanitarias', 'Instalación de cañerías de agua caliente', 2),
  ('instalaciones_sanitarias', 'Tendido de cañerías cloacales y pluviales', 3),
  ('instalaciones_sanitarias', 'Prueba hidráulica de presión (30 min)', 4),
  ('instalaciones_sanitarias', 'Instalación de calefón o termotanque', 5),
  ('instalaciones_sanitarias', 'Conexión a red municipal o cisterna', 6),
  ('instalaciones_sanitarias', 'Verificación de pendientes en desagüe cloacal', 7);

-- Terminaciones (8 items)
insert into public.checklist_templates (stage_type, description, order_index) values
  ('terminaciones', 'Colocación de revestimientos cerámicos en baños', 1),
  ('terminaciones', 'Colocación de pisos flotantes o porcellanato', 2),
  ('terminaciones', 'Instalación de puertas interiores y exteriores', 3),
  ('terminaciones', 'Colocación de ventanas y carpinterías de aluminio', 4),
  ('terminaciones', 'Aplicación de pintura interior (2 manos)', 5),
  ('terminaciones', 'Aplicación de pintura exterior (acabado final)', 6),
  ('terminaciones', 'Instalación de artefactos sanitarios (inodoro, ducha, pileta)', 7),
  ('terminaciones', 'Colocación de zócalos y molduras de terminación', 8);

-- Paisajismo y Exteriores (6 items)
insert into public.checklist_templates (stage_type, description, order_index) values
  ('paisajismo_exteriores', 'Preparación y nivelación de suelo exterior', 1),
  ('paisajismo_exteriores', 'Construcción de veredas y accesos pavimentados', 2),
  ('paisajismo_exteriores', 'Instalación de cerco perimetral o rejas', 3),
  ('paisajismo_exteriores', 'Plantación de césped y especies vegetales', 4),
  ('paisajismo_exteriores', 'Instalación de iluminación exterior', 5),
  ('paisajismo_exteriores', 'Construcción de cochera o garaje (si aplica)', 6);

-- Inspección Final (6 items)
insert into public.checklist_templates (stage_type, description, order_index) values
  ('inspeccion_final', 'Revisión integral de instalaciones eléctricas', 1),
  ('inspeccion_final', 'Revisión integral de instalaciones sanitarias', 2),
  ('inspeccion_final', 'Verificación de terminaciones y acabados', 3),
  ('inspeccion_final', 'Limpieza general de obra y retiro de escombros', 4),
  ('inspeccion_final', 'Gestión de planos conforme a obra (as built)', 5),
  ('inspeccion_final', 'Firma de acta de recepción definitiva', 6);

-- ============================================================
-- SEED USERS (create via Supabase Auth UI or API)
-- ============================================================
-- Enable pgcrypto for password hashing
create extension if not exists "pgcrypto";

-- Insert demo users into auth.users
-- This will trigger public.handle_new_user() to populate public.profiles
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-000000000001', 'carlos@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Carlos Rodríguez", "role": "gerencia"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', 'ana@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Ana Martínez", "role": "gerencia"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'diego@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Diego Fernández", "role": "gerencia"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000004', 'miguel@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Miguel Ángel Torres", "role": "supervisor"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000005', 'laura@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Laura Gómez", "role": "supervisor"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000006', 'roberto@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Roberto Silva", "role": "supervisor"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000007', 'juan@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Juan Pablo López", "role": "maestro"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000008', 'sergio@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Sergio Díaz", "role": "maestro"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000009', 'marcelo@lihuel.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Marcelo Ruiz", "role": "maestro"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- Link identities for each user so they can log in
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"sub": "00000000-0000-0000-0000-000000000001", "email": "carlos@lihuel.com"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '{"sub": "00000000-0000-0000-0000-000000000002", "email": "ana@lihuel.com"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '{"sub": "00000000-0000-0000-0000-000000000003", "email": "diego@lihuel.com"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '{"sub": "00000000-0000-0000-0000-000000000004", "email": "miguel@lihuel.com"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '{"sub": "00000000-0000-0000-0000-000000000005", "email": "laura@lihuel.com"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '{"sub": "00000000-0000-0000-0000-000000000006", "email": "roberto@lihuel.com"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', '{"sub": "00000000-0000-0000-0000-000000000007", "email": "juan@lihuel.com"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', '{"sub": "00000000-0000-0000-0000-000000000008", "email": "sergio@lihuel.com"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009', '{"sub": "00000000-0000-0000-0000-000000000009", "email": "marcelo@lihuel.com"}', 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

-- Ensure profiles exist and are updated correctly
insert into public.profiles (id, full_name, role)
values
  ('00000000-0000-0000-0000-000000000001', 'Carlos Rodríguez', 'gerencia'),
  ('00000000-0000-0000-0000-000000000002', 'Ana Martínez', 'gerencia'),
  ('00000000-0000-0000-0000-000000000003', 'Diego Fernández', 'gerencia'),
  ('00000000-0000-0000-0000-000000000004', 'Miguel Ángel Torres', 'supervisor'),
  ('00000000-0000-0000-0000-000000000005', 'Laura Gómez', 'supervisor'),
  ('00000000-0000-0000-0000-000000000006', 'Roberto Silva', 'supervisor'),
  ('00000000-0000-0000-0000-000000000007', 'Juan Pablo López', 'maestro'),
  ('00000000-0000-0000-0000-000000000008', 'Sergio Díaz', 'maestro'),
  ('00000000-0000-0000-0000-000000000009', 'Marcelo Ruiz', 'maestro')
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role;

-- ============================================================
-- DEMO SEED DATA (with placeholder UUIDs for testing)
-- Uses Supabase's built-in RLS bypass for seed scripts
-- ============================================================

-- Create demo profiles (use real auth user IDs in production)
do $$
declare
  v_gerencia_1 uuid := '00000000-0000-0000-0000-000000000001';
  v_gerencia_2 uuid := '00000000-0000-0000-0000-000000000002';
  v_gerencia_3 uuid := '00000000-0000-0000-0000-000000000003';
  v_supervisor_1 uuid := '00000000-0000-0000-0000-000000000004';
  v_supervisor_2 uuid := '00000000-0000-0000-0000-000000000005';
  v_supervisor_3 uuid := '00000000-0000-0000-0000-000000000006';
  v_maestro_1 uuid := '00000000-0000-0000-0000-000000000007';
  v_maestro_2 uuid := '00000000-0000-0000-0000-000000000008';
  v_maestro_3 uuid := '00000000-0000-0000-0000-000000000009';

  v_obra_1 uuid;
  v_obra_2 uuid;
  v_obra_3 uuid;
  v_obra_4 uuid;
  v_obra_5 uuid;
begin
  -- Insert obras (trigger will auto-create stages and populate checklist from templates)
  insert into public.obras (id, name, location, start_date, estimated_end_date, status, created_by)
  values
    (uuid_generate_v4(), 'Residencia Los Álamos', 'Av. San Martín 1450, Mendoza', '2026-01-10', '2026-07-30', 'active', v_gerencia_1),
    (uuid_generate_v4(), 'Casa Familiar Belgrano', 'Calle Belgrano 340, Córdoba', '2025-11-01', '2026-05-30', 'active', v_gerencia_1),
    (uuid_generate_v4(), 'Duplex Valle Verde', 'Ruta 7 km 12, San Juan', '2026-03-01', '2026-10-15', 'active', v_gerencia_2),
    (uuid_generate_v4(), 'Vivienda Social Barrio Norte', 'Calle Las Flores 88, Rosario', '2025-08-01', '2026-02-28', 'paused', v_gerencia_2),
    (uuid_generate_v4(), 'Casa Prefabricada Premium', 'Av. Libertad 2200, Buenos Aires', '2025-06-01', '2025-12-31', 'completed', v_gerencia_3);

  -- Get all obra IDs
  select id into v_obra_1 from public.obras where name = 'Residencia Los Álamos';
  select id into v_obra_2 from public.obras where name = 'Casa Familiar Belgrano';
  select id into v_obra_3 from public.obras where name = 'Duplex Valle Verde';
  select id into v_obra_4 from public.obras where name = 'Vivienda Social Barrio Norte';
  select id into v_obra_5 from public.obras where name = 'Casa Prefabricada Premium';

  -- Assign supervisors and maestros to obras
  insert into public.obra_assignments (obra_id, user_id, role) values
    (v_obra_1, v_supervisor_1, 'supervisor'),
    (v_obra_1, v_maestro_1, 'maestro'),
    (v_obra_1, v_maestro_2, 'maestro'),
    (v_obra_2, v_supervisor_2, 'supervisor'),
    (v_obra_2, v_maestro_2, 'maestro'),
    (v_obra_3, v_supervisor_1, 'supervisor'),
    (v_obra_3, v_maestro_3, 'maestro'),
    (v_obra_4, v_supervisor_3, 'supervisor'),
    (v_obra_4, v_maestro_1, 'maestro'),
    (v_obra_5, v_supervisor_2, 'supervisor'),
    (v_obra_5, v_maestro_3, 'maestro');

  -- Update stage statuses to simulate progress on obras
  -- Obra 1: Obra Gruesa approved, Instalaciones Electricas in review
  update public.stages set status = 'approved', submitted_at = now() - interval '20 days', reviewed_at = now() - interval '15 days'
    where obra_id = v_obra_1 and stage_type = 'obra_gruesa';
  update public.stages set status = 'in_review', submitted_at = now() - interval '5 days'
    where obra_id = v_obra_1 and stage_type = 'instalaciones_electricas';

  -- Obra 2: First 3 stages approved, Terminaciones in review
  update public.stages set status = 'approved', submitted_at = now() - interval '60 days', reviewed_at = now() - interval '55 days'
    where obra_id = v_obra_2 and stage_type = 'obra_gruesa';
  update public.stages set status = 'approved', submitted_at = now() - interval '45 days', reviewed_at = now() - interval '40 days'
    where obra_id = v_obra_2 and stage_type = 'instalaciones_electricas';
  update public.stages set status = 'approved', submitted_at = now() - interval '30 days', reviewed_at = now() - interval '25 days'
    where obra_id = v_obra_2 and stage_type = 'instalaciones_sanitarias';
  update public.stages set status = 'in_review', submitted_at = now() - interval '3 days'
    where obra_id = v_obra_2 and stage_type = 'terminaciones';

  -- Obra 3: Just started, Obra Gruesa pending
  -- No status updates needed (all pending by default)

  -- Obra 4: Rejected stage (paused project)
  update public.stages set status = 'approved', submitted_at = now() - interval '90 days', reviewed_at = now() - interval '85 days'
    where obra_id = v_obra_4 and stage_type = 'obra_gruesa';
  update public.stages set status = 'rejected', submitted_at = now() - interval '40 days', reviewed_at = now() - interval '35 days',
    rejection_comment = 'Falta terminar el tendido de cañería en baño principal'
    where obra_id = v_obra_4 and stage_type = 'instalaciones_sanitarias';

  -- Obra 5: All stages approved (completed)
  update public.stages set status = 'approved', submitted_at = now() - interval '200 days', reviewed_at = now() - interval '195 days'
    where obra_id = v_obra_5 and stage_type = 'obra_gruesa';
  update public.stages set status = 'approved', submitted_at = now() - interval '180 days', reviewed_at = now() - interval '175 days'
    where obra_id = v_obra_5 and stage_type = 'instalaciones_electricas';
  update public.stages set status = 'approved', submitted_at = now() - interval '160 days', reviewed_at = now() - interval '155 days'
    where obra_id = v_obra_5 and stage_type = 'instalaciones_sanitarias';
  update public.stages set status = 'approved', submitted_at = now() - interval '120 days', reviewed_at = now() - interval '115 days'
    where obra_id = v_obra_5 and stage_type = 'terminaciones';
  update public.stages set status = 'approved', submitted_at = now() - interval '80 days', reviewed_at = now() - interval '75 days'
    where obra_id = v_obra_5 and stage_type = 'paisajismo_exteriores';
  update public.stages set status = 'approved', submitted_at = now() - interval '30 days', reviewed_at = now() - interval '25 days'
    where obra_id = v_obra_5 and stage_type = 'inspeccion_final';

  -- Mark some checklist items as done for demo purposes
  update public.checklist_items set status = 'done'
    where stage_id in (
      select id from public.stages where obra_id = v_obra_1 and stage_type = 'obra_gruesa'
    );

  -- Create 2 open incidents
  insert into public.incidents (obra_id, title, description, severity, status, created_by)
  select
    v_obra_1,
    'Material faltante: vigas de acero',
    'Se detectó falta de vigas de acero tipo HEA-120 para la segunda etapa de instalación de estructura. Proveedor reporta demora de 2 semanas.',
    'medium',
    'open',
    v_supervisor_1;

  insert into public.incidents (obra_id, stage_id, title, description, severity, status, assigned_to, created_by)
  select
    v_obra_2,
    s.id,
    'Accidente laboral — corte en mano derecha',
    'El operario Sergio Díaz sufrió un corte en la mano derecha al manipular una pieza de chapa sin guantes de protección. Se administraron primeros auxilios. Requiere seguimiento médico.',
    'high',
    'assigned',
    v_maestro_2,
    v_supervisor_2
  from public.stages s
  where s.obra_id = v_obra_2 and s.stage_type = 'terminaciones';

end;
$$;
