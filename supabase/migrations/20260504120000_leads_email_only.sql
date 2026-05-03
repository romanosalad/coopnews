-- Camada 2 simplificada: só email libera o Protocolo. Os outros campos
-- (name, cargo, vertical) viram opcionais — podem ser preenchidos depois
-- via link no welcome email pro perfil completo.
--
-- Decisão do founder: fricção zero. 1 campo = libera. Email vira lead +
-- subscribed_newsletter por default.

alter table public.leads
  alter column name drop not null,
  alter column cargo drop not null,
  alter column vertical drop not null;

-- Check do vertical agora aceita NULL OU enum válido.
alter table public.leads drop constraint if exists leads_vertical_check;
alter table public.leads add constraint leads_vertical_check
  check (vertical is null or vertical in ('credito', 'agro', 'saude', 'consumo', 'outro'));
