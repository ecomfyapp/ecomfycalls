-- ============================================================================
-- CALL HISTORY
-- Historial completo de llamadas provenientes de FreePBX.
-- Una fila representa una llamada completa.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.call_history (

    -- ID interno generado automáticamente
    id uuid primary key default gen_random_uuid(),

    -- Lead relacionado (opcional)
    lead_id uuid,

    -- UUID del usuario (agente) en Supabase
    agent_user_id uuid references public.user_profiles(id) on delete set null,

    -- IDs únicos de Asterisk
    uniqueid text not null unique,
    linkedid text not null,

    -- Estado general de la llamada
    -- completed | missed | abandoned | failed | voicemail
    call_status text not null default 'completed'
        check (
            call_status in (
                'completed',
                'missed',
                'abandoned',
                'failed',
                'voicemail'
            )
        ),

    -- Dirección de la llamada
    -- inbound | outbound | internal
    call_direction text not null
        check (
            call_direction in (
                'inbound',
                'outbound',
                'internal'
            )
        ),

    -- Trunk por donde ingresó la llamada
    source_trunk text,

    -- Número del cliente
    customer_phone text not null,

    -- DID marcado
    did_called text,

    -- Cola que atendió la llamada
    queue_id text,

    -- Agente que respondió
    agent_extension text,
    agent_name text,

    -- Fechas importantes
    started_at timestamptz not null,
    answered_at timestamptz,
    ended_at timestamptz,

    -- Duraciones (segundos)
    ring_seconds integer not null default 0
        check (ring_seconds >= 0),

    talk_seconds integer not null default 0
        check (talk_seconds >= 0),

    total_seconds integer not null default 0
        check (total_seconds >= 0),

    -- Quién colgó
    -- customer | agent | system | unknown
    hangup_by text
        check (
            hangup_by in (
                'customer',
                'agent',
                'system',
                'unknown'
            )
        ),

    -- Resultado final
    disposition text
        check (
            disposition in (
                'ANSWERED',
                'NO ANSWER',
                'BUSY',
                'FAILED',
                'CONGESTION',
                'CANCEL',
                'CHANUNAVAIL'
            )
        ),

    -- Información de finalización
    hangup_code integer,
    hangup_cause text,

    -- SIP Call-ID (útil para depuración)
    sip_call_id text,

    -- Grabación
    recording_file text,
    recording_path text,

    -- ===========================
    -- Información Ringba
    -- ===========================

    ringba_call_id text,
    ringba_campaign_id text,
    ringba_target_id text,
    ringba_buyer_id text,

    -- ===========================
    -- Información de Marketing
    -- ===========================

    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_content text,
    utm_term text,

    fbclid text,
    gclid text,

    -- ===========================
    -- Información técnica
    -- ===========================

    ip inet,
    user_agent text,

    -- Información adicional para futuras integraciones
    metadata jsonb not null default '{}'::jsonb,

    -- Auditoría
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================================
-- Actualizar automáticamente updated_at
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_call_history_updated_at on public.call_history;

create trigger trg_call_history_updated_at
before update on public.call_history
for each row
execute function public.set_updated_at();

-- ============================================================================
-- Índices
-- ============================================================================

create index if not exists idx_call_history_started_at
on public.call_history(started_at desc);

create index if not exists idx_call_history_customer_phone
on public.call_history(customer_phone);

create index if not exists idx_call_history_agent_user_id
on public.call_history(agent_user_id);

create index if not exists idx_call_history_lead_id
on public.call_history(lead_id);

create index if not exists idx_call_history_linkedid
on public.call_history(linkedid);

create index if not exists idx_call_history_disposition
on public.call_history(disposition);

create index if not exists idx_call_history_call_status
on public.call_history(call_status);

create index if not exists idx_call_history_ringba_call_id
on public.call_history(ringba_call_id);

create index if not exists idx_call_history_ringba_campaign_id
on public.call_history(ringba_campaign_id);

create index if not exists idx_call_history_ringba_target_id
on public.call_history(ringba_target_id);

create index if not exists idx_call_history_ringba_buyer_id
on public.call_history(ringba_buyer_id);

create index if not exists idx_call_history_sip_call_id
on public.call_history(sip_call_id);